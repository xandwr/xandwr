<script lang="ts">
	// Per-page title + social meta. Owns the page-variable half of the head:
	// <title>, description, and the og/twitter title+description. The layout
	// keeps the site-wide constants (og:type, og:site_name, og:url, og:locale,
	// twitter:card) so these never appear twice. Drop one of these on every
	// route — a shared link then previews as the page, not the bare site.
	import { site } from "$lib/site";

	let {
		// Page name shown before the brand. Omit on the homepage so the title
		// reads as just the brand.
		title,
		description = site.description,
	}: { title?: string; description?: string } = $props();

	const fullTitle = $derived(title ? `${title} | ${site.name}` : site.name);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />

	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />

	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
</svelte:head>
