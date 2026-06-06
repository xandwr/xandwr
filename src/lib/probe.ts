// PROBE: Provable Resource & Behavior Endpoints. The verification engine,
// shared by the in-browser /probe page and conceptually mirrored by the
// standalone CLI verifier (static/.well-known/probe/verify.mjs). Keeping the
// logic here means the page can't drift from the published spec.
//
// Spec: /.well-known/probe/SPEC.md

export type Check = Record<string, unknown>;

export type Assertion = {
	id: string;
	describe: string;
	request: { method?: string; path: string; headers?: Record<string, string>; body?: string };
	expect: Check[];
};

export type Affordance = {
	id: string;
	describe: string;
	requires: string[];
	via: { method?: string; path: string; params?: Record<string, string> };
	returns?: string;
};

export type Manifest = {
	probe: string;
	subject: string;
	spec?: string;
	verifier?: string;
	assertions: Assertion[];
	affordances?: Affordance[];
};

export type Verdict = "pass" | "fail" | "error";
export type CheckResult = { ok: boolean; detail: string };
export type AssertionResult = { id: string; describe: string; verdict: Verdict; url: string; checks: CheckResult[] };
export type AffordanceResult = { id: string; describe: string; available: boolean; requires: string[]; missing: string[]; via: Affordance["via"] };
export type Report = {
	subject: string;
	probe: string;
	verdict: "pass" | "fail";
	counts: Record<Verdict, number>;
	results: AssertionResult[];
	affordances: AffordanceResult[];
};

// ── tiny JSONPath subset: `$`, dot keys, [n] indices. Deterministic on purpose.
export function jsonPath(root: unknown, path: string): { found: boolean; value?: unknown } {
	if (path === "$" || path === "") return { found: true, value: root };
	const p = path.replace(/^\$\.?/, "");
	const tokens: (string | number)[] = [];
	for (const part of p.split(".")) {
		for (const g of part.matchAll(/([^[\]]+)|\[(\d+)\]/g)) {
			tokens.push(g[2] !== undefined ? Number(g[2]) : g[1]);
		}
	}
	let cur: unknown = root;
	for (const t of tokens) {
		if (cur == null || typeof cur !== "object") return { found: false };
		if (!(t in (cur as Record<string | number, unknown>))) return { found: false };
		cur = (cur as Record<string | number, unknown>)[t];
	}
	return { found: true, value: cur };
}

function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (typeof a !== typeof b || a == null || b == null || typeof a !== "object") return false;
	const ka = Object.keys(a as object), kb = Object.keys(b as object);
	if (ka.length !== kb.length) return false;
	return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

function jsonType(v: unknown): string {
	if (v === null) return "null";
	if (Array.isArray(v)) return "array";
	return typeof v;
}

function lengthOf(v: unknown): number | undefined {
	if (typeof v === "string" || Array.isArray(v)) return v.length;
	if (v && typeof v === "object") return Object.keys(v).length;
	return undefined;
}

type Ctx = { status: number; headers: Headers; text: string; json: unknown; jsonError: string | null };

// Evaluate one check. Returns a clean pass/fail, or throws to signal `error`
// (unknown check, unparseable JSON): per spec, error is never pass.
export function evalCheck(check: Check, ctx: Ctx): CheckResult {
	if ("status" in check) {
		const want = check.status;
		const ok = Array.isArray(want) ? want.includes(ctx.status) : ctx.status === want;
		return { ok, detail: `status ${ctx.status} vs ${JSON.stringify(want)}` };
	}
	if ("header" in check) {
		const name = String(check.header);
		const got = ctx.headers.get(name);
		if ("present" in check) return { ok: (got != null) === check.present, detail: `header ${name} present=${got != null}` };
		if (got == null) return { ok: false, detail: `header ${name} absent` };
		if ("contains" in check) return { ok: got.toLowerCase().includes(String(check.contains).toLowerCase()), detail: `header ${name}: "${got}" ⊇ "${check.contains}"` };
		if ("equals" in check) return { ok: got === check.equals, detail: `header ${name}: "${got}" == "${check.equals}"` };
		throw new Error(`unknown header check: ${JSON.stringify(check)}`);
	}
	if ("json" in check) {
		if (ctx.jsonError) throw new Error(`body is not JSON: ${ctx.jsonError}`);
		const { found, value } = jsonPath(ctx.json, String(check.json));
		if (!found) return { ok: false, detail: `${check.json} not found` };
		if ("equals" in check) return { ok: deepEqual(value, check.equals), detail: `${check.json} == ${JSON.stringify(check.equals)}` };
		if ("type" in check) return { ok: jsonType(value) === check.type, detail: `${check.json} is ${jsonType(value)}, want ${check.type}` };
		if ("nonEmpty" in check) { const l = lengthOf(value); return { ok: ((l ?? 0) > 0) === check.nonEmpty, detail: `${check.json} length=${l}` }; }
		if ("minLength" in check) { const l = lengthOf(value); return { ok: (l ?? -1) >= (check.minLength as number), detail: `${check.json} length=${l} ≥ ${check.minLength}` }; }
		if ("present" in check) return { ok: found === check.present, detail: `${check.json} present=${found}` };
		throw new Error(`unknown json check: ${JSON.stringify(check)}`);
	}
	if ("body" in check) {
		if (check.body === "contains") return { ok: ctx.text.includes(String(check.value)), detail: `body ⊇ "${check.value}"` };
		throw new Error(`unknown body check: ${JSON.stringify(check)}`);
	}
	throw new Error(`unknown check: ${JSON.stringify(check)}`);
}

export async function runAssertion(
	subject: string,
	a: Assertion,
	fetchImpl: typeof fetch = fetch,
): Promise<AssertionResult> {
	const url = new URL(a.request.path, subject).href;
	const method = a.request.method ?? "GET";
	let ctx: Ctx;
	try {
		// `redirect: "follow"` (the default, stated explicitly to mirror verify.mjs):
		// both verifiers must reach the same verdict, and `redirect: "manual"` can't
		// do that across runtimes: in a browser it yields an opaque-redirect response
		// (status 0, no headers/body), in Node it exposes the real 30x. Following
		// redirects gives both the same final response, same checks, same verdict.
		const res = await fetchImpl(url, { method, headers: a.request.headers, body: a.request.body, redirect: "follow" });
		const text = await res.text();
		let json: unknown = null, jsonError: string | null = null;
		try { json = JSON.parse(text); } catch (e) { jsonError = (e as Error).message; }
		ctx = { status: res.status, headers: res.headers, text, json, jsonError };
	} catch (e) {
		return { id: a.id, describe: a.describe, verdict: "error", url, checks: [{ ok: false, detail: `request failed: ${(e as Error).message}` }] };
	}

	const checks: CheckResult[] = [];
	let verdict: Verdict = "pass";
	for (const check of a.expect) {
		try {
			const r = evalCheck(check, ctx);
			checks.push(r);
			if (!r.ok && verdict === "pass") verdict = "fail";
		} catch (e) {
			checks.push({ ok: false, detail: `⚠ ${(e as Error).message}` });
			verdict = "error";
		}
	}
	return { id: a.id, describe: a.describe, verdict, url, checks };
}

// Run a whole manifest. Pass an `onAssertion` callback to stream results to the
// UI as each one resolves.
export async function verifyManifest(
	manifest: Manifest,
	opts: { fetchImpl?: typeof fetch; onAssertion?: (r: AssertionResult) => void } = {},
): Promise<Report> {
	const fetchImpl = opts.fetchImpl ?? fetch;
	const subject = manifest.subject;
	const results: AssertionResult[] = [];
	for (const a of manifest.assertions ?? []) {
		const r = await runAssertion(subject, a, fetchImpl);
		results.push(r);
		opts.onAssertion?.(r);
	}

	const counts: Record<Verdict, number> = { pass: 0, fail: 0, error: 0 };
	for (const r of results) counts[r.verdict]++;
	const verdict = counts.fail === 0 && counts.error === 0 ? "pass" : "fail";

	// Affordances are derived: available only while every required assertion passed.
	const passed = new Set(results.filter((r) => r.verdict === "pass").map((r) => r.id));
	const affordances: AffordanceResult[] = (manifest.affordances ?? []).map((a) => {
		const missing = (a.requires ?? []).filter((id) => !passed.has(id));
		return { id: a.id, describe: a.describe, available: missing.length === 0, requires: a.requires ?? [], missing, via: a.via };
	});

	return { subject, probe: manifest.probe, verdict, counts, results, affordances };
}
