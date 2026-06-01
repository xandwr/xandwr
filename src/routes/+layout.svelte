<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import "../global.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Persistent full-viewport Win98 window that wraps every page. -->
<div class="window flex h-dvh w-full flex-col">
	<div class="title-bar">
		<div class="title-bar-text">xandwr.com</div>
		<div class="title-bar-controls">
			<button aria-label="Minimize"></button>
			<button aria-label="Maximize"></button>
			<button aria-label="Close"></button>
		</div>
	</div>
	<div class="window-body flex-1 overflow-auto">
		{@render children()}
	</div>
</div>
