<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const published = $derived(formatDate(data.post.published));
	const lastEdited = $derived(formatDate(data.post.lastEdited));

	function formatDate(date: string) {
		return new Intl.DateTimeFormat("en-US", {
			dateStyle: "medium",
			timeZone: "UTC",
		}).format(new Date(`${date}T00:00:00Z`));
	}
</script>

<svelte:head>
	<title>{data.post.title} | xandwr.com</title>
	<meta name="description" content={data.post.description} />
</svelte:head>

<div class="p-2">
	<article class="window">
		<div class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]">
			<div class="title-bar-text">{data.post.title}</div>
		</div>
		<div class="window-body flex flex-col gap-3">
			<div class="status-bar">
				<p class="status-bar-field">Published: {published}</p>
				<p class="status-bar-field">Last edited: {lastEdited}</p>
			</div>

			<p class="m-0 opacity-60">{data.post.description}</p>

			<div class="blog-post">
				{@html data.post.html}
			</div>
		</div>
	</article>
</div>

<style>
	.blog-post {
		max-width: 84ch;
	}

	.blog-post :global(h2),
	.blog-post :global(h3) {
		margin: 22px 0 8px;
	}

	.blog-post :global(h2) {
		font-size: 22px;
		line-height: 26px;
	}

	.blog-post :global(h3) {
		font-size: 11px;
		font-weight: 700;
		line-height: 14px;
		text-transform: uppercase;
	}

	.blog-post :global(p),
	.blog-post :global(ul),
	.blog-post :global(blockquote),
	.blog-post :global(pre) {
		margin: 0 0 12px;
	}

	.blog-post :global(ul) {
		padding-left: 18px;
	}

	.blog-post :global(li + li) {
		margin-top: 6px;
	}

	.blog-post :global(blockquote) {
		border-left: 2px solid gray;
		padding-left: 8px;
	}

	.blog-post :global(pre) {
		overflow-x: auto;
		white-space: pre;
	}

	.blog-post :global(code) {
		font-size: 11px;
		line-height: 14px;
	}

	/* Shiki-highlighted code blocks */
	.blog-post :global(pre.shiki) {
		padding: 10px 12px;
		border: 1px solid #000;
		box-shadow: inset -1px -1px #555, inset 1px 1px #fff;
		background: #0d1117 !important;
	}

	/* BigBlue Terminal 437 for code blocks — the retro-terminal monospace.
	   `code,code *` in 98.css forces monospace, so set it on the inner spans
	   too. font-feature-settings off keeps the bitmap glyphs literal. */
	.blog-post :global(pre.shiki code),
	.blog-post :global(pre.shiki code span) {
		font-family: "BigBlueTerm437", monospace;
	}

	.blog-post :global(pre.shiki code) {
		display: block;
		background: transparent !important;
		font-size: 14px;
		line-height: 18px;
	}

	.blog-post :global(hr) {
		border: 0;
		border-top: 1px solid gray;
		margin: 16px 0;
	}
</style>
