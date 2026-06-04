<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { phrases } from "$lib/phrases";
	import { site } from "$lib/site";
	import { page } from "$app/state";
	import "../global.css";

	// Canonical URL excludes the query string so tailored/filtered variants
	// (e.g. /resume?preset=…) don't fragment into separate canonical pages.
	const canonical = $derived(`${page.url.origin}${page.url.pathname}`);

	let { children } = $props();
	const title = phrases[Math.floor(Math.random() * phrases.length)];

	const navItems = [
		{ label: "projects", href: "/projects" },
		{ label: "blog", href: "/blog" },
		{ label: "resume", href: "/resume" },
		{ label: "wall", href: "/wall" },
	];

	let expanded = $state(false);

	// Label shown when the mobile nav is collapsed: the current page, or "home" on /.
	const currentLabel = $derived(
		page.url.pathname === "/"
			? "home"
			: (navItems.find((item) => item.href === page.url.pathname)
					?.label ?? "home"),
	);

	// Collapse the menu after navigating.
	function navigate() {
		expanded = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- Site-wide defaults. Pages override <title>/description in their own
	     <svelte:head>; later same-named tags win, so these are the fallback. -->
	<meta name="description" content={site.description} />
	<meta name="author" content={site.author} />
	<link rel="canonical" href={canonical} />

	<!-- Tell agents where the machine-readable map lives. -->
	<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
	<link
		rel="alternate"
		type="application/rss+xml"
		href="/blog/feed.xml"
		title="{site.author} — blog"
	/>

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={site.name} />
	<meta property="og:description" content={site.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={site.locale} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={site.name} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<!-- Persistent full-viewport Win98 window that wraps every page. -->
<div class="w-screen h-screen p-1 bg-black">
	<div class="window flex h-full w-full flex-col">
		<div
			class="title-bar [--title-bar-from:#ff4400] [--title-bar-to:#4422ff]"
		>
			<div
				class="title-bar-text flex flex-col md:flex-row justify-between m-auto w-full pl-2"
			>
				<div class="flex flex-row justify-between w-full">
					<!-- Title + (mobile-only) collapse toggle -->
					<div class="flex flex-row gap-4 justify-between w-full">
						<div
							class="flex flex-row gap-2 items-center justify-between"
						>
							<a
								href="/"
								class="text-white text-lg drop-shadow-xs drop-shadow-black"
								onclick={navigate}>xandwr.com</a
							>
							<hr class="h-full border border-black/20" />
							<p class="font-light opacity-50">
								<span class="md:hidden">{currentLabel}</span>
								<span
									class="hidden text-lg md:inline text-black font-bold"
									>{title}</span
								>
							</p>
						</div>
					</div>

					<div class="flex flex-col w-min justify-end">
						<div class="flex">
							<div>
								<!-- Win98 toggle button, mobile only -->
								<button
									class="md:hidden w-min text-nowrap"
									aria-expanded={expanded}
									aria-label="Toggle navigation menu"
									onclick={() => (expanded = !expanded)}
								>
									{expanded ? "▲" : "Site Directory"}
								</button>
							</div>
						</div>
					</div>
				</div>

				<div class="flex gap-4 text-lg">
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
							<a
								href={item.href}
								class={page.url.pathname === item.href
									? "text-blue-400 font-bold"
									: "text-white"}
								onclick={navigate}>{item.label}</a
							>
						{/each}
					</nav>
					<div class="title-bar-controls hidden md:flex">
						<button aria-label="Minimize" class="flex w-7 text-center"></button>
						<button aria-label="Maximize" class="flex w-7 text-center"></button>
					</div>
				</div>
			</div>
		</div>
		<div class="window-body flex-1 overflow-auto">
			{@render children()}
		</div>
	</div>
</div>
