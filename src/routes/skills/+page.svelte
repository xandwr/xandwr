<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Distinct title-bar gradients so each skill window reads as its own
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

<Seo
    title="skills"
    description="Agent skills published from this site — fetchable with npx skills."
/>

<div class="flex w-full flex-col gap-2 p-2">
    <div class="window">
        <div class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]">
            <div class="title-bar-text">Skills</div>
        </div>
        <div class="window-body flex flex-col gap-3">
            <p class="m-0 opacity-60">
                Agent skills served from this domain. Install any of them
                straight from the directory:
            </p>
            <pre class="m-0 p-2 overflow-x-auto"><code
                    >npx skills add https://xandwr.com</code
                ></pre>

            {#if data.skills.length === 0}
                <p class="m-0 opacity-50">No skills yet.</p>
            {:else}
                <div class="flex flex-col gap-3">
                    {#each data.skills as skill, i (skill.slug)}
                        {@const theme = themes[i % themes.length]}
                        <a
                            href={`/skills/${skill.slug}`}
                            class="window block no-underline text-black"
                            style="--title-bar-from:{theme.from};--title-bar-to:{theme.to}"
                        >
                            <div class="title-bar">
                                <div class="title-bar-text">{skill.name}</div>
                                <div class="title-bar-controls">
                                    <button aria-label="Maximize"></button>
                                </div>
                            </div>
                            <div class="window-body">
                                <p class="m-0 mt-1">{skill.description}</p>
                            </div>
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
