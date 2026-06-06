#!/usr/bin/env node
// PROBE verifier — Provable Resource & Behavior Endpoints, v0.1
// Spec: https://xandwr.com/.well-known/probe/SPEC.md
//
// The whole point of PROBE: a site's manifest is a list of *testable* claims,
// and the checker is NOT owned by the site. This is that checker. Run it
// against any PROBE domain and it computes a verdict from public inputs alone —
// the manifest plus the live responses. Nothing to trust, everything to check.
//
//   node verify.mjs https://xandwr.com
//   node verify.mjs https://xandwr.com --json     # machine-readable verdict
//
// Zero dependencies. Reimplement it in any language; same inputs, same verdict.

const PROBE_PATH = "/.well-known/probe.json";

// ── tiny JSONPath subset: `$`, dot keys, [n] indices. Deterministic on purpose.
function jsonPath(root, path) {
	if (path === "$" || path === "") return { found: true, value: root };
	let p = path.replace(/^\$\.?/, "");
	const tokens = [];
	for (const part of p.split(".")) {
		const m = [...part.matchAll(/([^[\]]+)|\[(\d+)\]/g)];
		for (const g of m) tokens.push(g[2] !== undefined ? Number(g[2]) : g[1]);
	}
	let cur = root;
	for (const t of tokens) {
		if (cur == null || typeof cur !== "object") return { found: false };
		if (!(t in cur)) return { found: false };
		cur = cur[t];
	}
	return { found: true, value: cur };
}

function deepEqual(a, b) {
	if (a === b) return true;
	if (typeof a !== typeof b || a == null || b == null) return false;
	if (typeof a !== "object") return false;
	const ka = Object.keys(a), kb = Object.keys(b);
	if (ka.length !== kb.length) return false;
	return ka.every((k) => deepEqual(a[k], b[k]));
}

function jsonType(v) {
	if (v === null) return "null";
	if (Array.isArray(v)) return "array";
	return typeof v; // string | number | boolean | object
}

function lengthOf(v) {
	if (typeof v === "string" || Array.isArray(v)) return v.length;
	if (v && typeof v === "object") return Object.keys(v).length;
	return undefined;
}

// Evaluate one check against a fetched response context.
// Returns { ok: boolean } on a clean pass/fail, or throws to signal `error`
// (e.g. unknown check, unparseable JSON) — per spec, error is never pass.
function evalCheck(check, ctx) {
	if ("status" in check) {
		const want = check.status;
		const ok = Array.isArray(want) ? want.includes(ctx.status) : ctx.status === want;
		return { ok, detail: `status ${ctx.status} vs ${JSON.stringify(want)}` };
	}
	if ("header" in check) {
		const got = ctx.headers.get(check.header);
		if ("present" in check) return { ok: (got != null) === check.present, detail: `header ${check.header} present=${got != null}` };
		if (got == null) return { ok: false, detail: `header ${check.header} absent` };
		if ("contains" in check) return { ok: got.toLowerCase().includes(String(check.contains).toLowerCase()), detail: `header ${check.header}: "${got}" ⊇ "${check.contains}"` };
		if ("equals" in check) return { ok: got === check.equals, detail: `header ${check.header}: "${got}" == "${check.equals}"` };
		throw new Error(`unknown header check: ${JSON.stringify(check)}`);
	}
	if ("json" in check) {
		if (ctx.jsonError) throw new Error(`body is not JSON: ${ctx.jsonError}`);
		const { found, value } = jsonPath(ctx.json, check.json);
		if (!found) return { ok: false, detail: `${check.json} not found` };
		if ("equals" in check) return { ok: deepEqual(value, check.equals), detail: `${check.json} == ${JSON.stringify(check.equals)}` };
		if ("type" in check) return { ok: jsonType(value) === check.type, detail: `${check.json} is ${jsonType(value)}, want ${check.type}` };
		if ("nonEmpty" in check) { const l = lengthOf(value); return { ok: (l ?? 0) > 0 === check.nonEmpty, detail: `${check.json} length=${l}` }; }
		if ("minLength" in check) { const l = lengthOf(value); return { ok: (l ?? -1) >= check.minLength, detail: `${check.json} length=${l} ≥ ${check.minLength}` }; }
		if ("present" in check) return { ok: found === check.present, detail: `${check.json} present=${found}` };
		throw new Error(`unknown json check: ${JSON.stringify(check)}`);
	}
	if ("body" in check) {
		if (check.body === "contains") return { ok: ctx.text.includes(check.value), detail: `body ⊇ "${check.value}"` };
		throw new Error(`unknown body check: ${JSON.stringify(check)}`);
	}
	throw new Error(`unknown check: ${JSON.stringify(check)}`);
}

async function runAssertion(subject, a) {
	const url = new URL(a.request.path, subject).href;
	const method = a.request.method ?? "GET";
	let ctx;
	try {
		const res = await fetch(url, { method, headers: a.request.headers, body: a.request.body, redirect: "manual" });
		const text = await res.text();
		let json = null, jsonError = null;
		try { json = JSON.parse(text); } catch (e) { jsonError = e.message; }
		ctx = { status: res.status, headers: res.headers, text, json, jsonError };
	} catch (e) {
		return { id: a.id, describe: a.describe, verdict: "error", url, checks: [{ ok: false, detail: `request failed: ${e.message}` }] };
	}

	const checks = [];
	let verdict = "pass";
	for (const check of a.expect) {
		try {
			const r = evalCheck(check, ctx);
			checks.push(r);
			if (!r.ok && verdict === "pass") verdict = "fail";
		} catch (e) {
			checks.push({ ok: false, detail: `⚠ ${e.message}` });
			verdict = "error"; // unevaluable → error dominates
		}
	}
	return { id: a.id, describe: a.describe, verdict, url, checks };
}

async function verify(domain) {
	const subject = domain.startsWith("http") ? domain : `https://${domain}`;
	const manifestUrl = new URL(PROBE_PATH, subject).href;
	const res = await fetch(manifestUrl, { redirect: "follow" });
	if (!res.ok) throw new Error(`no PROBE manifest at ${manifestUrl} (HTTP ${res.status})`);
	const manifest = await res.json();
	if (!manifest.probe) throw new Error(`manifest at ${manifestUrl} has no "probe" version field`);

	const results = [];
	for (const a of manifest.assertions ?? []) results.push(await runAssertion(manifest.subject ?? subject, a));

	const counts = { pass: 0, fail: 0, error: 0 };
	for (const r of results) counts[r.verdict]++;
	const domainVerdict = counts.fail === 0 && counts.error === 0 ? "pass" : "fail";

	// Affordances are derived, never asserted: an affordance is `available` only
	// while every assertion it `requires` passed. A capability the site can't
	// back up right now simply isn't offered — it withdraws itself.
	const passed = new Set(results.filter((r) => r.verdict === "pass").map((r) => r.id));
	const affordances = (manifest.affordances ?? []).map((a) => {
		const missing = (a.requires ?? []).filter((id) => !passed.has(id));
		return { id: a.id, describe: a.describe, available: missing.length === 0, requires: a.requires ?? [], missing, via: a.via };
	});

	return { subject: manifest.subject ?? subject, probe: manifest.probe, verdict: domainVerdict, counts, results, affordances };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const C = { reset: "\x1b[0m", dim: "\x1b[2m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", bold: "\x1b[1m" };
const mark = { pass: `${C.green}✔${C.reset}`, fail: `${C.red}✗${C.reset}`, error: `${C.yellow}⚠${C.reset}` };

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const domain = args.find((a) => !a.startsWith("--"));

if (!domain) {
	console.error("usage: node verify.mjs <domain> [--json]");
	process.exit(2);
}

try {
	const report = await verify(domain);
	if (asJson) {
		console.log(JSON.stringify(report, null, 2));
	} else {
		console.log(`\n${C.bold}PROBE ${report.probe}${C.reset}  ${report.subject}\n`);
		for (const r of report.results) {
			console.log(`  ${mark[r.verdict]} ${C.bold}${r.id}${C.reset} — ${r.describe}`);
			console.log(`    ${C.dim}${r.url}${C.reset}`);
			for (const c of r.checks) if (!c.ok) console.log(`      ${C.dim}↳ ${c.detail}${C.reset}`);
		}
		if (report.affordances.length) {
			console.log(`\n  ${C.bold}affordances${C.reset} ${C.dim}(derived — available only while their assertions pass)${C.reset}`);
			for (const a of report.affordances) {
				const m = a.available ? `${C.green}●${C.reset}` : `${C.dim}○${C.reset}`;
				const lbl = a.available ? `${C.bold}${a.id}${C.reset}` : `${C.dim}${a.id} (withdrawn)${C.reset}`;
				console.log(`  ${m} ${lbl} — ${a.describe}`);
				if (!a.available) console.log(`      ${C.dim}↳ blocked by: ${a.missing.join(", ")}${C.reset}`);
			}
		}
		const v = report.verdict === "pass" ? `${C.green}${C.bold}PASS${C.reset}` : `${C.red}${C.bold}FAIL${C.reset}`;
		const avail = report.affordances.filter((a) => a.available).length;
		console.log(`\n  ${v}  ${report.counts.pass} pass · ${report.counts.fail} fail · ${report.counts.error} error · ${avail}/${report.affordances.length} affordances live\n`);
	}
	process.exit(report.verdict === "pass" ? 0 : 1);
} catch (e) {
	console.error(`${C.red}error:${C.reset} ${e.message}`);
	process.exit(2);
}
