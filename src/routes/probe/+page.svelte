<script lang="ts">
	import Seo from "$lib/components/Seo.svelte";
	import {
		verifyManifest,
		type Manifest,
		type AssertionResult,
		type Report,
	} from "$lib/probe";

	// Live state, streamed as each assertion resolves.
	let running = $state(false);
	let manifest = $state<Manifest | null>(null);
	let results = $state<AssertionResult[]>([]);
	let report = $state<Report | null>(null);
	let error = $state<string | null>(null);

	const mark: Record<string, string> = { pass: "✔", fail: "✗", error: "⚠" };

	async function run() {
		running = true;
		error = null;
		results = [];
		report = null;
		manifest = null;
		try {
			// Fetch THIS origin's manifest, then check it against THIS origin's
			// live endpoints — same-origin, so the browser can do it directly.
			const res = await fetch("/.well-known/probe.json", { cache: "no-store" });
			if (!res.ok) throw new Error(`no manifest (HTTP ${res.status})`);
			manifest = (await res.json()) as Manifest;
			// The published subject is the prod origin; rebind to wherever we're
			// actually running so the demo works on previews/localhost too.
			manifest = { ...manifest, subject: window.location.origin };

			report = await verifyManifest(manifest, {
				onAssertion: (r) => { results = [...results, r]; },
			});
		} catch (e) {
			error = (e as Error).message;
		} finally {
			running = false;
		}
	}

	const availableCount = $derived(
		report ? report.affordances.filter((a) => a.available).length : 0,
	);
</script>

<Seo
	title="PROBE"
	description="A live, independently-verifiable manifest of this site's capabilities. Every claim is checked against the real endpoints, in your browser, right now."
/>

<div class="p-2">
	<article class="window">
		<div class="title-bar [--title-bar-from:#005500] [--title-bar-to:#55cc55]">
			<div class="title-bar-text">probe.exe — live conformance check</div>
		</div>

		<div class="window-body flex flex-col gap-3">
			<p class="m-0">
				This site publishes a <strong>PROBE</strong> manifest — a list of
				<em>testable claims</em> about what it can do. Unlike every other agent
				manifest, the claims aren't promises: they're checked against the live
				endpoints, and <strong>the checker isn't ours</strong>. The button below
				runs that check <em>in your browser</em>, against this very origin.
			</p>

			<div class="status-bar no-print">
				<p class="status-bar-field">
					<a href="/.well-known/probe.json">probe.json</a>
				</p>
				<p class="status-bar-field"><a href="/.well-known/probe/SPEC.md">spec</a></p>
				<p class="status-bar-field">
					<a href="/.well-known/probe/verify.mjs">verify.mjs</a>
				</p>
				<button onclick={run} disabled={running}>
					{running ? "▣ verifying…" : "▶ Run verification"}
				</button>
			</div>

			{#if error}
				<p class="m-0" style="color:#aa0000"><strong>error:</strong> {error}</p>
			{/if}

			{#if results.length}
				<fieldset>
					<legend>assertions — checked against live endpoints</legend>
					<ul class="probe-list">
						{#each results as r (r.id)}
							<li class="probe-row probe-{r.verdict}">
								<span class="probe-mark">{mark[r.verdict]}</span>
								<div class="probe-body">
									<div><strong>{r.id}</strong> — {r.describe}</div>
									<a class="probe-url" href={r.url}>{r.url}</a>
									{#each r.checks as c}
										{#if !c.ok}
											<div class="probe-detail">↳ {c.detail}</div>
										{/if}
									{/each}
								</div>
							</li>
						{/each}
					</ul>
				</fieldset>
			{/if}

			{#if report}
				<fieldset>
					<legend>
						affordances — capabilities (available only while their assertions
						pass)
					</legend>
					<ul class="probe-list">
						{#each report.affordances as a (a.id)}
							<li class="probe-row {a.available ? 'probe-pass' : 'probe-withdrawn'}">
								<span class="probe-mark">{a.available ? "●" : "○"}</span>
								<div class="probe-body">
									<div>
										<strong>{a.id}</strong>
										{#if !a.available}<em>(withdrawn)</em>{/if} — {a.describe}
									</div>
									{#if a.available}
										<code class="probe-url">
											{a.via.method ?? "GET"}
											{a.via.path}
										</code>
									{:else}
										<div class="probe-detail">↳ blocked by: {a.missing.join(", ")}</div>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</fieldset>

				<div
					class="probe-verdict {report.verdict === 'pass'
						? 'probe-pass'
						: 'probe-fail'}"
				>
					<strong>{report.verdict.toUpperCase()}</strong>
					— {report.counts.pass} pass · {report.counts.fail} fail · {report
						.counts.error} error · {availableCount}/{report.affordances.length}
					affordances live
				</div>

				<p class="m-0" style="font-size:0.9em;opacity:0.7">
					Don't take this page's word for it — that would defeat the point. Run
					the verifier yourself:
					<code>node verify.mjs {report.subject}</code>. Same inputs, same
					verdict, no trust required.
				</p>
			{/if}
		</div>
	</article>
</div>

<style>
	.probe-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.probe-row {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
	}
	.probe-mark {
		font-weight: bold;
		min-width: 1.2em;
		text-align: center;
	}
	.probe-pass .probe-mark { color: #008000; }
	.probe-fail .probe-mark { color: #cc0000; }
	.probe-error .probe-mark { color: #b8860b; }
	.probe-withdrawn { opacity: 0.55; }
	.probe-body { flex: 1; min-width: 0; }
	.probe-url {
		font-size: 0.85em;
		opacity: 0.7;
		word-break: break-all;
	}
	.probe-detail {
		font-size: 0.85em;
		opacity: 0.75;
		font-style: italic;
	}
	.probe-verdict {
		padding: 0.4rem 0.6rem;
		border: 2px solid;
		text-align: center;
	}
	.probe-verdict.probe-pass { border-color: #008000; color: #006000; }
	.probe-verdict.probe-fail { border-color: #cc0000; color: #aa0000; }
</style>
