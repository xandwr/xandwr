<script lang="ts">
    import Icon from "@iconify/svelte";
    import JsonLd from "$lib/components/JsonLd.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import { languageColor, languageIcon } from "$lib/languages";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    const project = $derived(data.project);
    const icon = $derived(languageIcon(project.language));
    const color = $derived(languageColor(project.language));
</script>

<Seo title={project.name} description={project.description} />

<JsonLd data={data.jsonLd} />

<div class="flex flex-col gap-2 p-2">
    <article class="window">
        <div class="title-bar [--title-bar-from:#005500] [--title-bar-to:#22aa55]">
            <div class="title-bar-text text-lg font-light">{project.name}</div>
            <div class="title-bar-controls" aria-hidden="true">
                <button tabindex="-1" aria-label="Minimize"></button>
                <button tabindex="-1" aria-label="Maximize"></button>
                <button tabindex="-1" aria-label="Close"></button>
            </div>
        </div>

        <div class="window-body flex flex-col gap-3">
            {#if project.cover}
                <img
                    src={project.cover}
                    alt=""
                    class="w-full border border-black object-cover"
                    style="aspect-ratio: 16 / 9"
                />
            {/if}

            <p class="m-0 opacity-60">{project.description}</p>

            {#if project.tags.length > 0}
                <div class="flex flex-wrap gap-1" aria-label="Tags">
                    {#each project.tags as tag (tag)}
                        <span
                            class="border border-black px-1 text-xs"
                            style="box-shadow: inset -1px -1px #888, inset 1px 1px #fff"
                            >{tag}</span
                        >
                    {/each}
                </div>
            {/if}

            <div class="flex flex-wrap items-center gap-3 text-sm">
                <span class="flex items-center gap-1">
                    {#if icon}
                        <Icon
                            icon="devicon:{icon}"
                            width="16"
                            height="16"
                            aria-hidden="true"
                        />
                    {:else}
                        <span
                            class="inline-block h-3 w-3 border border-black"
                            style="background:{color}"
                            aria-hidden="true"
                        ></span>
                    {/if}
                    <span>{project.language}</span>
                </span>
                <span>{project.stars} {project.stars === 1 ? "star" : "stars"}</span>
                <span>{project.forks} {project.forks === 1 ? "fork" : "forks"}</span>
            </div>

            {#if project.bodyHtml}
                <div class="prose">
                    {@html project.bodyHtml}
                </div>
            {/if}

            <div class="status-bar">
                <p class="status-bar-field">
                    <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View source <span aria-hidden="true">↗</span>
                    </a>
                </p>
                {#if project.demo}
                    <p class="status-bar-field">
                        <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Demo <span aria-hidden="true">↗</span>
                        </a>
                    </p>
                {/if}
            </div>
        </div>
    </article>

    <a href="/projects" class="opacity-60 hover:opacity-100"
        ><span aria-hidden="true">←</span> all projects</a
    >
</div>

<style>
    .prose :global(h2),
    .prose :global(h3) {
        margin: 22px 0 8px;
    }

    .prose :global(h2) {
        font-size: 22px;
        line-height: 26px;
    }

    .prose :global(p),
    .prose :global(ul),
    .prose :global(blockquote),
    .prose :global(pre) {
        margin: 0 0 12px;
    }

    .prose :global(ul) {
        padding-left: 18px;
    }

    .prose :global(li + li) {
        margin-top: 6px;
    }

    .prose :global(blockquote) {
        border-left: 2px solid gray;
        padding-left: 8px;
    }

    .prose :global(pre) {
        overflow-x: auto;
        white-space: pre;
    }

    .prose :global(pre.shiki) {
        padding: 10px 12px;
        border: 1px solid #000;
        box-shadow: inset -1px -1px #555, inset 1px 1px #fff;
        background: #0d1117 !important;
    }

    .prose :global(pre.shiki code),
    .prose :global(pre.shiki code span) {
        font-family: "BigBlueTerm437", monospace;
    }

    .prose :global(pre.shiki code) {
        display: block;
        background: transparent !important;
        font-size: 14px;
        line-height: 18px;
    }

    .prose :global(hr) {
        border: 0;
        border-top: 1px solid gray;
        margin: 16px 0;
    }
</style>
