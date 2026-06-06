<script lang="ts">
    import JsonLd from "$lib/components/JsonLd.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import type { NowPlaying } from "$lib/spotify";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Spotify "Now Playing" — polled client-side so the card updates live while
    // a visitor lingers. Starts null (card hidden) until the first poll lands;
    // any failure leaves it null and the card stays hidden, never breaking the
    // page. The /api/now-playing edge cache (~20s) keeps this cheap.
    let track = $state<NowPlaying | null>(null);

    onMount(() => {
        let alive = true;

        const poll = async () => {
            try {
                const res = await fetch("/api/now-playing");
                if (!res.ok) return;
                const { nowPlaying } = (await res.json()) as { nowPlaying: NowPlaying | null };
                if (alive) track = nowPlaying;
            } catch {
                // Network blip — keep whatever we last showed; next tick retries.
            }
        };

        poll();
        const id = setInterval(poll, 25_000);

        return () => {
            alive = false;
            clearInterval(id);
        };
    });
</script>

<Seo />

<JsonLd data={data.jsonLd} />

<div class="flex w-full h-full m-auto flex-col gap-2 p-2">
    <!-- root README -->
    <div class="window">
        <div class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]">
            <div class="title-bar-text">README.md</div>
        </div>
        <div class="window-body">
            <div class="blog-post">
                {@html data.readmeHtml}
            </div>
        </div>
    </div>

    <!-- now playing (client-polled; hidden until a track resolves) -->
    {#if track}
        <div class="window">
            <div
                class="title-bar [--title-bar-from:#1db954] [--title-bar-to:#0a5c2a]"
            >
                <div class="title-bar-text">
                    {track.isPlaying ? "▶ Now Playing" : "⏸ Last Played"}
                </div>
            </div>
            <div class="window-body">
                <a class="now-playing" href={track.url} target="_blank" rel="noopener">
                    {#if track.albumArt}
                        <img
                            class="now-playing-art"
                            src={track.albumArt}
                            alt={`${track.album} album art`}
                            width="64"
                            height="64"
                        />
                    {/if}
                    <div class="now-playing-meta">
                        <span class="now-playing-title">{track.title}</span>
                        <span class="now-playing-artist">{track.artist}</span>
                        <span class="now-playing-album">{track.album}</span>
                    </div>
                </a>
            </div>
        </div>
    {/if}

    <!-- latest posts -->
    <div class="window">
        <div class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]">
            <div class="title-bar-text">Recent Activity</div>
        </div>
        <div class="window-body">
            {#if data.posts.length === 0}
                <p class="opacity-50">There's nothing here.</p>
            {:else}
                <ul class="tree-view">
                    {#each data.posts as post (post.slug)}
                        <li class="recent-post">
                            <a href={`/blog/${post.slug}`}>{post.title}</a>
                            <p class="m-0 mt-1 opacity-50">
                                {post.published} · {post.description}
                            </p>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Recent Activity: highlight a post row on hover. The negative margin +
       matching padding lets the tint bleed to the window-body edges without
       shifting the text. */
    .recent-post {
        margin: 0 -8px;
        padding: 2px 4px;
        margin: 2px 2px;
    }

    .recent-post:hover {
        background: #cce4ff;
    }

    /* Now Playing: album art beside stacked track/artist/album text. */
    .now-playing {
        display: flex;
        gap: 12px;
        align-items: center;
        text-decoration: none;
        color: inherit;
    }

    .now-playing:hover .now-playing-title {
        text-decoration: underline;
    }

    .now-playing-art {
        flex: none;
        border: 1px solid #000;
        box-shadow: inset -1px -1px #555, inset 1px 1px #fff;
        image-rendering: auto;
    }

    .now-playing-meta {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
    }

    .now-playing-title {
        font-weight: bold;
    }

    .now-playing-artist {
        opacity: 0.7;
    }

    .now-playing-album {
        opacity: 0.5;
        font-size: 11px;
    }

    .blog-post {
        max-width: 84ch;
    }

    .blog-post :global(h1) {
        font-size: 26px;
        line-height: 30px;
        margin: 0 0 8px;
    }

    .blog-post :global(h2),
    .blog-post :global(h3) {
        margin: 22px 0 8px;
    }

    .blog-post :global(h2) {
        font-size: 22px;
        line-height: 26px;
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
