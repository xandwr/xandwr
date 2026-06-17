<script lang="ts">
    import JsonLd from "$lib/components/JsonLd.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
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
                        <!-- The "rest" of the README ships in the SSR DOM and is
                             read by browser Reader modes, scrapers, and screen
                             readers, but is hidden from sighted users on the
                             rendered page. We use the visually-hidden clip
                             pattern (NOT display:none / visibility:hidden /
                             aria-hidden): those are skipped by Readability's
                             visibility check and by assistive tech, whereas a
                             clipped 1px node stays a counted part of the
                             readable document. No aria-hidden, so it still
                             contributes the prose that pushes the page over
                             Reader mode's content threshold. -->
                        <div class="rest visually-hidden">
                            {@html data.restHtml}
                        </div>
                    {/if}
                </div>
            </div>
        </article>
    </main>

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

    .blog-post {
        max-width: 100%;
    }

    /* The "rest" of the README is present in the document for Reader mode,
       scrapers, and screen readers, but hidden from sighted users on the
       rendered page. This is the standard visually-hidden clip pattern: the
       node keeps a non-zero rendered box (1px, clipped) instead of
       display:none / visibility:hidden, because Readability's visibility check
       and assistive tech both skip those, but treat a clipped node as real,
       readable content. */
    .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        border: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
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
