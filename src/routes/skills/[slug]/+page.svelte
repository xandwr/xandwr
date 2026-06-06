<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    const rawPath = $derived(`/.well-known/skills/${data.skill.slug}/SKILL.md`);
</script>

<Seo title={data.skill.name} description={data.skill.description} />

<div class="p-2">
    <article class="window">
        <div class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]">
            <div class="title-bar-text text-lg font-light">{data.skill.name}</div>
        </div>
        <div class="window-body flex flex-col gap-3">
            <p class="m-0 opacity-60">{data.skill.description}</p>

            <pre class="m-0 p-2 overflow-x-auto"><code
                    >npx skills add https://xandwr.com --skill {data.skill
                        .slug}</code
                ></pre>

            <p class="m-0">
                <a href={rawPath}>Raw SKILL.md</a>
            </p>

            <hr class="w-full border-t border-gray-400" />

            <div class="skill-body">
                {@html data.skill.html}
            </div>
        </div>
    </article>
</div>

<style>
    .skill-body {
        max-width: 84ch;
    }

    .skill-body :global(h2),
    .skill-body :global(h3) {
        margin: 22px 0 8px;
    }

    .skill-body :global(h2) {
        font-size: 22px;
        line-height: 26px;
    }

    .skill-body :global(h3) {
        font-size: 11px;
        font-weight: 700;
        line-height: 14px;
        text-transform: uppercase;
    }

    .skill-body :global(p),
    .skill-body :global(ul),
    .skill-body :global(blockquote),
    .skill-body :global(pre) {
        margin: 0 0 12px;
    }

    .skill-body :global(ul) {
        padding-left: 18px;
    }

    .skill-body :global(li + li) {
        margin-top: 6px;
    }

    .skill-body :global(blockquote) {
        border-left: 2px solid gray;
        padding-left: 8px;
    }

    .skill-body :global(pre) {
        overflow-x: auto;
        white-space: pre;
    }

    .skill-body :global(code) {
        font-size: 11px;
        line-height: 14px;
    }

    .skill-body :global(hr) {
        border: 0;
        border-top: 1px solid gray;
        margin: 16px 0;
    }
</style>
