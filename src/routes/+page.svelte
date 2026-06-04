<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

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
                        <li>
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
