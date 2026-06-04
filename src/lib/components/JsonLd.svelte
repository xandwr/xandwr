<script lang="ts">
	// Renders a schema.org JSON-LD object into a <script type="application/ld+json">
	// tag in <head>, so search engines and agents can read structured facts
	// without scraping the visual markup. The `<\/script>` escape prevents the
	// serialized string from prematurely closing the tag.
	let { data }: { data: unknown } = $props();
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(data)}<\/script>`}
</svelte:head>
