<script lang="ts">
	import { resume } from "$lib/content/resume";

	function print() {
		window.print();
	}
</script>

<svelte:head>
	<title>{resume.name} | xandwr.com</title>
	<meta
		name="description"
		content="{resume.name}: {resume.headline}. {resume.location}."
	/>
</svelte:head>

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
				<p class="status-bar-field">{resume.location}</p>
				<p class="status-bar-field">
					Tip: print or "Save as PDF" for a clean copy
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
						<span aria-hidden="true">·</span>
						<span>{resume.phone}</span>
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
							<div class="resume-entry">
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
								<ul class="resume-bullets">
									{#each entry.bullets as bullet}
										<li>{bullet}</li>
									{/each}
								</ul>
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

	/* Each entry stays together when paginating. */
	.resume-entry {
		margin-bottom: 10px;
		break-inside: avoid;
		page-break-inside: avoid;
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
	}
</style>
