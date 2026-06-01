<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { phrases } from "$lib/phrases";
	import { page } from "$app/state";
	import "../global.css";

	let { children } = $props();
	const title = phrases[Math.floor(Math.random() * phrases.length)];

	const navItems = [
		{ label: "projects", href: "/" },
		{ label: "blog", href: "/" },
		{ label: "photography", href: "/" },
		{ label: "music", href: "/" },
		{ label: "resume", href: "/" },
		{ label: "other", href: "/" },
	];

	let expanded = $state(false);

	// Label shown when the mobile nav is collapsed: the current page, or "home" on /.
	const currentLabel = $derived(
		page.url.pathname === "/"
			? "home"
			: (navItems.find((item) => item.href === page.url.pathname)?.label ??
				"home"),
	);

	// Collapse the menu after navigating.
	function navigate() {
		expanded = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Persistent full-viewport Win98 window that wraps every page. -->
<div class="w-screen h-screen p-2 bg-black">
	<div class="window flex h-full w-full flex-col">
		<div class="title-bar">
			<div
				class="title-bar-text flex flex-col md:flex-row justify-between m-auto w-full px-2"
			>
				<!-- Title + (mobile-only) collapse toggle -->
				<div
					class="flex flex-row gap-4"
				>
					<div class="flex flex-row gap-2 items-center justify-between">
						<a href="/" class="text-white" onclick={navigate}
							>xandwr.com</a
						>
						<hr class="h-full border border-white/20" />
						<p class="font-light opacity-50">
							<span class="md:hidden">{currentLabel}</span>
							<span class="hidden md:inline">{title}</span>
						</p>
					</div>

					<!-- Win98 toggle button, mobile only -->
					<button
						class="md:hidden w-full text-nowrap"
						aria-expanded={expanded}
						aria-label="Toggle navigation menu"
						onclick={() => (expanded = !expanded)}
					>
						{expanded ? "▲" : "Site Directory"}
					</button>
				</div>

				<nav
					class="flex-col md:flex md:flex-row gap-2 md:gap-4 {expanded
						? 'flex'
						: 'hidden'}"
				>
					{#each navItems as item, i}
						{#if i > 0}
							<hr
								class="hidden md:block h-full border border-white/20"
							/>
						{/if}
						<a href={item.href} class="text-white" onclick={navigate}
							>{item.label}</a
						>
					{/each}
				</nav>
			</div>
		</div>
		<div class="window-body flex-1 overflow-auto">
			{@render children()}
		</div>
	</div>
</div>
