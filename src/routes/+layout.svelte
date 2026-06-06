<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { phrases } from "$lib/phrases";
	import { site } from "$lib/site";
	import { lissajous } from "$lib/lissajous.svelte";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import "../global.css";

	// Canonical URL excludes the query string so tailored/filtered variants
	// (e.g. /resume?preset=…) don't fragment into separate canonical pages.
	const canonical = $derived(`${page.url.origin}${page.url.pathname}`);

	let { children } = $props();

	// Pick the random phrase only on the client. If we randomized during SSR,
	// the server would bake one phrase into the HTML and hydration would pick a
	// different one: you'd see the server's phrase flash then get overridden.
	let title = $state("");

	// Animate the two title-bar gradient stops along a Lissajous curve. Each
	// stop's hue is driven by a sine at a different frequency, so the two
	// endpoints sweep the color wheel independently and beat against each other
	//: the gradient never settles into a static pose. Runs client-only via rAF.
	let titleBar = $state<HTMLDivElement | null>(null);

	onMount(() => {
		title = phrases[Math.floor(Math.random() * phrases.length)];
	});

	// The Lissajous color sweep runs only while the homepage easter egg is
	// unlocked (`lissajous.active`). Collapsed/elsewhere → the title bar keeps
	// the static plain Win98 blue from the markup. This effect re-runs whenever
	// `lissajous.active` flips: it starts the rAF loop on activation and, on
	// cleanup, cancels it and strips the inline color overrides so the bar
	// reverts to the markup default.
	$effect(() => {
		if (!lissajous.active || !titleBar) return;

		// Respect users who'd rather not have motion: leave the static colors.
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reduced) return;

		let raf = 0;
		const tick = (now: number) => {
			// `t` in seconds; the frequencies below are an irrational-ish ratio
			// so the pattern takes a long while to repeat.
			const t = now / 1000;
			const fromHue = (200 + 60 * Math.sin(t * 0.13)) % 360;
			const toHue = (320 + 60 * Math.sin(t * 0.23 + 1.5)) % 360;
			titleBar!.style.setProperty(
				"--title-bar-from",
				`hsl(${fromHue} 50% 45%)`,
			);
			titleBar!.style.setProperty(
				"--title-bar-to",
				`hsl(${toHue} 50% 55%)`,
			);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			// Drop the inline overrides so the bar falls back to the markup's
			// plain Win98 blue instead of freezing on the last animated frame.
			titleBar?.style.removeProperty("--title-bar-from");
			titleBar?.style.removeProperty("--title-bar-to");
		};
	});

	const navItems = [
		{ label: "projects", href: "/projects" },
		{ label: "blog", href: "/blog" },
		{ label: "resume", href: "/resume" },
		{ label: "wall", href: "/wall" },
		{ label: "probe", href: "/probe" },
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

	<!-- Each route owns its <title>, description, and og/twitter title+
	     description via <Seo>. The tags below are the site-wide constants
	     that don't change per page. -->
	<meta name="author" content={site.author} />
	<link rel="canonical" href={canonical} />

	<!-- Tell agents where the machine-readable map lives. -->
	<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
	<link
		rel="alternate"
		type="application/rss+xml"
		href="/blog/feed.xml"
		title="{site.author}: blog"
	/>

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={site.locale} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
</svelte:head>

<!-- Persistent full-viewport Win98 window that wraps every page. -->
<div class="w-screen h-screen p-1 bg-black">
	<div class="window flex h-full w-full flex-col">
		<!-- Default is plain Win98 blue (navy → #1084d0). The Lissajous color
		     sweep only runs while the homepage easter egg is unlocked; see the
		     rAF loop gated on `lissajous.active`. -->
		<div
			bind:this={titleBar}
			class="title-bar [--title-bar-from:navy] [--title-bar-to:#1084d0]"
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
								class="flex flex-row items-center gap-2 text-white text-lg drop-shadow-xs drop-shadow-black"
								onclick={navigate}
							>
								<img
									src={favicon}
									alt="Logo"
									class="h-5 w-5 brightness-0 invert"
								/>
								xandwr.com
							</a>
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
