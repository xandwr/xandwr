<script lang="ts">
    import JsonLd from "$lib/components/JsonLd.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<Seo />

<JsonLd data={data.jsonLd} />

<div class="flex w-full h-full m-auto flex-col gap-2 p-2">
    <main>
        <article class="window">
            <div
                class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]"
            >
                <div class="title-bar-text">README.md</div>
            </div>
            <div class="window-body">
                <div class="blog-post text-lg">
                    {@html data.introHtml}
                </div>
            </div>
        </article>
    </main>
</div>
