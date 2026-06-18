<script lang="ts">
    import GithubProjectCard from "$lib/components/GithubProjectCard.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import { site } from "$lib/site";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Mirrors the human-visible Showcase cards below
    const jsonLd = $derived(
        data.projects.length > 0
            ? {
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  name: "Projects",
                  itemListElement: data.projects.map((project, i) => ({
                      "@type": "ListItem",
                      position: i + 1,
                      item: {
                          "@type": "SoftwareSourceCode",
                          name: project.name,
                          description: project.description,
                          programmingLanguage: project.language,
                          codeRepository: project.url,
                      },
                  })),
              }
            : null,
    );
</script>

<Seo
    title="projects"
    description="Things I've built: a curated set of {site.author}'s projects."
/>

<svelte:head>
    {#if jsonLd}
        {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>`}
    {/if}
</svelte:head>

<main aria-labelledby="projects-heading">
    <h1 id="projects-heading" class="sr-only">Projects</h1>

    <details class="m-2" open>
        <summary
            class="title-bar cursor-pointer list-none px-2 [--title-bar-from:#005500] [--title-bar-to:#22aa55]"
        >
            <span class="title-bar-text m-0 text-sm font-inherit">Showcase</span>
            <span class="title-bar-text m-0 text-xs font-inherit opacity-80">
                {data.projects.length}
                {data.projects.length === 1 ? "project" : "projects"}
            </span>
        </summary>

        <div class="border-2 border-t-0 border-[#dfdfdf] p-2">
            {#if data.projects.length === 0}
                <p class="m-0 opacity-50">No projects yet.</p>
            {:else}
                <ul
                    class="grid w-full list-none grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    aria-label="Showcase projects"
                >
                    {#each data.projects as project (project.slug)}
                        <li class="contents">
                            <GithubProjectCard {...project} />
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </details>
</main>

