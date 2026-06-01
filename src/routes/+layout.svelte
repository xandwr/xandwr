<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
    import { phrases } from "$lib/phrases";
	import "../global.css";
	
	let { children } = $props();
	var randomSloganIndex = phrases.length - 1;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Persistent full-viewport Win98 window that wraps every page. -->
<div class="window flex h-dvh w-full flex-col">
	<div class="title-bar">
		<div class="title-bar-text flex flex-row justify-between w-full px-2">
			<div class="flex flex-row gap-2 justify-center items-center">
				<a href="/" class="text-white">xandwr.com</a>
				<hr class="h-full border border-white/20" />
				<p class="font-light opacity-50">{phrases[randomSloganIndex]}</p>
			</div>
			

			<nav class="flex flex-row gap-4">
				<a href="/" class="text-white">projects</a>
				<hr class="h-full border border-white/20" />
				<a href="/" class="text-white">blog</a>
				<hr class="h-full border border-white/20" />
				<a href="/" class="text-white">photography</a>
				<hr class="h-full border border-white/20" />
				<a href="/" class="text-white">music</a>
				<hr class="h-full border border-white/20" />
				<a href="/" class="text-white">resume</a>
				<hr class="h-full border border-white/20" />
				<a href="/" class="text-white">other</a>
			</nav>
		</div>
	</div>
	<div class="window-body flex-1 overflow-auto">
		{@render children()}
	</div>
</div>
