<script lang="ts">
    import JsonLd from "$lib/components/JsonLd.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Distinct title-bar gradients so each post window reads as its own
    // identifiable entry rather than a row in a shared list.
    const themes = [
        { from: "#aa0044", to: "#ffaacc" },
        { from: "#0044aa", to: "#aaccff" },
        { from: "#008855", to: "#aaffcc" },
        { from: "#aa6600", to: "#ffddaa" },
        { from: "#6600aa", to: "#ddaaff" },
        { from: "#008888", to: "#aaffff" },
    ];
</script>

<Seo title="blog" description="Notes, writeups, and the occasional deep dive." />

<JsonLd data={data.jsonLd} />

<div class="flex w-full flex-col gap-2 p-2">
    <div class="window">
        <div class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]">
            <div class="title-bar-text">Blog</div>
        </div>
        <div class="window-body">
            {#if data.posts.length === 0}
                <p class="m-0 opacity-50">No posts yet.</p>
            {:else}
                <div class="flex flex-col gap-3">
                    {#each data.posts as post, i (post.slug)}
                        {@const theme = themes[i % themes.length]}
                        <a
                            href={`/blog/${post.slug}`}
                            class="window block no-underline text-black"
                            style="--title-bar-from:{theme.from};--title-bar-to:{theme.to}"
                        >
                            <div class="title-bar">
                                <div class="title-bar-text">{post.title}</div>
                                <div class="title-bar-controls">
                                    <button aria-label="Maximize"></button>
                                </div>
                            </div>
                            <div class="window-body">
                                <p class="m-0 opacity-50">{post.published}</p>
                                <p class="m-0 mt-1">{post.description}</p>
                            </div>
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
