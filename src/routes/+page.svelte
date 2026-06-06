<script lang="ts">
    import JsonLd from "$lib/components/JsonLd.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import type { NowPlaying } from "$lib/spotify";
    import { lissajous } from "$lib/lissajous.svelte";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Spotify "Now Playing": polled client-side so the card updates live while
    // a visitor lingers. Starts null (card hidden) until the first poll lands;
    // any failure leaves it null and the card stays hidden, never breaking the
    // page. The /api/now-playing edge cache (~20s) keeps this cheap.
    let track = $state<NowPlaying | null>(null);

    // The README's "schizo ramblings" easter egg lives below a `...` marker in
    // the source. Hidden until the visitor clicks the ellipsis to UNLOCK it.
    let unlocked = $state(false);

    // Meta layer: unlocking the ramblings also brings the layout's title-bar
    // Lissajous color animation to life (collapsed → plain Win98 blue). The
    // animation lives in +layout.svelte, so we relay the state through a shared
    // rune. Reset it on unmount so leaving the homepage stops the animation.
    $effect(() => {
        lissajous.active = unlocked;
    });
    onMount(() => () => {
        lissajous.active = false;
    });

    onMount(() => {
        let alive = true;

        const poll = async () => {
            try {
                const res = await fetch("/api/now-playing");
                if (!res.ok) return;
                const { nowPlaying } = (await res.json()) as { nowPlaying: NowPlaying | null };
                if (alive) track = nowPlaying;
            } catch {
                // Network blip: keep whatever we last showed; next tick retries.
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
    <!-- root README: the page's primary content. Wrapped in <main>/<article>
         with real heading semantics so browser reader modes (Firefox
         Readability, Safari Reader) recognize it as the dominant article and
         offer their reader view. The auxiliary cards below are marked <aside>
         (complementary) so the readability heuristic doesn't count them as
         body prose competing with the README. -->
    <main>
        <article class="window">
            <div class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]">
                <div class="title-bar-text">README.md</div>
            </div>
            <div class="window-body">
                <div class="blog-post">
                    {@html data.introHtml}

                    {#if data.restHtml}
                        <!-- Always rendered into the SSR DOM (never {#if}-gated)
                             so browser Reader modes and scrapers see the full
                             README prose. The easter egg is purely visual:
                             collapsed by default via CSS (max-height/clip), not
                             removed from the document. -->
                        <div class="rest" class:rest-open={unlocked} aria-hidden={!unlocked}>
                            {@html data.restHtml}
                        </div>

                        <button
                            type="button"
                            class="ellipsis-unlock"
                            onclick={() => (unlocked = !unlocked)}
                            aria-expanded={unlocked}
                            aria-label={unlocked
                                ? "Collapse the rest of the README"
                                : "Reveal the rest of the README"}
                            title="...?"
                        >
                            ...
                        </button>
                    {/if}
                </div>
            </div>
        </article>
    </main>

    <!-- now playing (client-polled; hidden until a track resolves) -->
    {#if track}
        <aside class="window" aria-label="Now playing on Spotify">
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
        </aside>
    {/if}

    <!-- latest posts -->
    <aside class="window" aria-label="Recent activity">
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
    </aside>
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
        max-width: 100%;
    }

    /* The `...` unlock: a big, inviting ellipsis the visitor clicks to reveal
       the hidden ramblings. Styled as bare text (not a chrome button) so it
       reads as part of the prose, with a subtle pulse hinting it's clickable. */
    .ellipsis-unlock {
        display: block;
    }

    .ellipsis-unlock:hover,
    .ellipsis-unlock:focus-visible {
        opacity: 1;
        animation: none;
    }

    /* The "rest" ships in the SSR DOM at all times (for Reader mode / scrapers)
       but is visually collapsed by default. We use max-height + clip rather than
       `display: none` deliberately: Firefox Readability and Safari Reader skip
       display:none/visibility:hidden subtrees when extracting article text, but
       a clipped/zero-height node stays part of the readable document. The text
       is therefore present for reader views even while collapsed on screen. */
    .rest {
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition:
            max-height 0.4s ease-out,
            opacity 0.4s ease-out;
    }

    .rest.rest-open {
        /* Generous upper bound: larger than the content will ever be, so it
           animates open smoothly without measuring height in JS. */
        max-height: 4000px;
        opacity: 1;
    }

    /* Honor reduced-motion: snap open/closed instead of animating. */
    @media (prefers-reduced-motion: reduce) {
        .rest {
            transition: none;
        }
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
