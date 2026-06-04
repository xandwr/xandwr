<script lang="ts">
	import JsonLd from "$lib/components/JsonLd.svelte";
	import Seo from "$lib/components/Seo.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	// `doc` is the tailored view; the preset (if any) drives which entries
	// expand and which collapse to a one-line stub.
	const resume = $derived(data.doc);

	function print() {
		window.print();
	}
</script>

<Seo
	title={resume.name}
	description="{resume.name}: {resume.headline}. {resume.location}."
/>

<JsonLd data={data.jsonLd} />

<!-- `resume-page` toggles the print rules in global.css that strip the
     persistent Win98 chrome/nav so the printout is a clean paper resume. -->
<div class="resume-page p-2">
	<article class="window">
		<div
			class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]"
		>
			<div class="title-bar-text">resume.md</div>
		</div>

		<div class="window-body resume-body flex flex-col gap-3">
			<!-- Screen-only toolbar -->
			<div class="status-bar no-print">
				<p class="status-bar-field">
					{#if data.preset}
						Tailored: <strong>{data.preset.label}</strong>
					{:else}
						Full resume
					{/if}
				</p>
				<p class="status-bar-field resume-presets">
					<a href="/resume" class:active={!data.preset}>full</a>
					{#each data.presets as preset}
						<a
							href={`/resume?preset=${preset.id}`}
							class:active={data.preset?.id === preset.id}
							>{preset.label}</a
						>
					{/each}
				</p>
				<button class="status-bar-print" onclick={print}>
					🖨 Print / Save PDF
				</button>
			</div>

			<!-- The actual resume document -->
			<div class="resume-doc">
				<header class="resume-header">
					<h1 class="resume-name">{resume.name}</h1>
					<p class="resume-headline">{resume.headline}</p>
					<p class="resume-contact">
						<span>{resume.location}</span>
						<span aria-hidden="true">·</span>
						<a href="mailto:{resume.email}">{resume.email}</a>
						{#each resume.links as link}
							<span aria-hidden="true">·</span>
							<a href={link.href} target="_blank" rel="noreferrer"
								>{link.label}</a
							>
						{/each}
					</p>
				</header>

				<section class="resume-section about">
					<h2 class="resume-section-heading">About</h2>
					<p class="resume-about">{resume.about}</p>
				</section>

				{#each resume.sections as section}
					<section class="resume-section">
						<h2 class="resume-section-heading">
							{section.heading}
						</h2>
						{#each section.entries as entry}
							<div
								class="resume-entry"
								class:collapsed={entry.collapsed}
							>
								<div class="resume-entry-head">
									<div class="resume-entry-title">
										<strong>{entry.title}</strong>
										<span class="resume-entry-org"
											>{entry.org}{entry.location
												? ` · ${entry.location}`
												: ""}</span
										>
									</div>
									<div class="resume-entry-dates">
										{entry.dates}
									</div>
								</div>
								{#if entry.bullets.length > 0}
									<ul class="resume-bullets">
										{#each entry.bullets as bullet}
											<li>{bullet}</li>
										{/each}
									</ul>
								{/if}
								{#if entry.links.length > 0}
									<ul class="resume-links">
										{#each entry.links as link}
											<li>
												<a
													href={link.href}
													target="_blank"
													rel="noreferrer">{link.label}</a
												>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
						{/each}
					</section>
				{/each}
			</div>
		</div>
	</article>
</div>

<style>
	.resume-doc {
		max-width: 80ch;
		margin: 0 auto;
        list-style: circle;
	}

	/* Reuse the W95FA-style title-bar print button glyph for the toolbar
	   button in the corner; styled minimally to match 98.css controls. */
	.status-bar-print {
		min-width: 0;
		padding: 0 8px;
		margin: 0 1px;
	}

	.resume-header {
		margin-bottom: 14px;
	}

	.resume-name {
		font-size: 22px;
		line-height: 26px;
		margin: 0;
	}

	.resume-headline {
		margin: 2px 0 6px;
		opacity: 0.7;
	}

	.resume-contact {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		font-size: 11px;
	}

	.resume-contact a {
		color: #0044aa;
	}

	.resume-section {
		margin-bottom: 14px;
	}

	.resume-section-heading {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border-bottom: 1px solid currentColor;
		padding-bottom: 2px;
		margin: 0 0 8px;
	}

	.resume-about {
		margin: 0;
	}

	/* Quick preset switcher in the toolbar. */
	.resume-presets {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.resume-presets a {
		color: #0044aa;
	}

	.resume-presets a.active {
		font-weight: 700;
		text-decoration: none;
		color: inherit;
	}

	/* Each entry stays together when paginating. */
	.resume-entry {
		margin-bottom: 10px;
		break-inside: avoid;
		page-break-inside: avoid;
	}

	/* Collapsed (non-matching) entries: kept on screen as a dimmed one-liner
	   so the timeline reads continuous without competing with relevant work. */
	.resume-entry.collapsed {
		margin-bottom: 4px;
		opacity: 0.55;
	}

	.resume-entry-head {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		align-items: baseline;
	}

	.resume-entry-org {
		opacity: 0.7;
		margin-left: 6px;
	}

	.resume-entry-dates {
		opacity: 0.7;
		white-space: nowrap;
		font-size: 11px;
	}

	.resume-bullets {
		margin: 4px 0 0;
		padding-left: 18px;
	}

	.resume-bullets li {
		margin-bottom: 3px;
	}

	/* Citations: clickable labels on screen, raw URLs in print (see @media). */
	.resume-links {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 12px;
		margin: 4px 0 0;
		padding-left: 18px;
		list-style: none;
		font-size: 11px;
	}

	.resume-links a {
		color: #0044aa;
	}

	.resume-links a::before {
		content: "↗ ";
	}

	/* ---- Print: a clean paper resume ---- */
	@media print {
		.resume-doc {
			max-width: none;
		}

		.resume-name {
			font-size: 20pt;
			line-height: 1.1;
		}

		.resume-headline,
		.resume-contact,
		.resume-bullets,
		.resume-about,
		.resume-entry-dates {
			font-size: 10pt;
		}

		.resume-section-heading {
			font-size: 11pt;
		}

		.resume-section {
			break-inside: auto;
		}

		.resume-contact a {
			color: #000;
		}

		/* Citations print as raw URLs (academic-style), independent of the
		   on-screen label: hide the label text and the ↗ glyph, then emit the
		   href via ::after so a renamed label never diverges from the printed
		   link. */
		.resume-links {
			font-size: 10pt;
		}

		.resume-links a {
			color: #000;
			font-size: 0;
		}

		.resume-links a::before {
			content: "";
		}

		.resume-links a::after {
			content: attr(href);
			font-size: 10pt;
		}

		/* On paper the stubs should read as normal timeline entries. */
		.resume-entry.collapsed {
			opacity: 1;
		}
	}
</style>
