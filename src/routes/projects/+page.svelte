<script lang="ts">
    import GithubProjectCard from "$lib/components/GithubProjectCard.svelte";
    import { abs } from "$lib/site";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Structured data (schema.org ItemList) so agents and search engines can
    // parse the curated project list without scraping the visual markup.
    // Mirrors the human-visible cards below.
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
                          ...(project.writeup
                              ? { url: abs(`/blog/${project.writeup}`) }
                              : {}),
                      },
                  })),
              }
            : null,
    );
</script>

<svelte:head>
    {#if jsonLd}
        {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>`}
    {/if}
</svelte:head>

<main aria-labelledby="projects-heading">
    <h1 id="projects-heading" class="sr-only">Projects</h1>

    {#if data.projects.length === 0}
        <div class="window m-2">
            <div class="window-body">
                <p class="m-0 opacity-50">No projects yet.</p>
            </div>
        </div>
    {:else}
        <ul
            class="grid w-full list-none grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3"
            aria-label="Projects"
        >
            {#each data.projects as project (project.slug)}
                <li class="contents">
                    <GithubProjectCard {...project} />
                </li>
            {/each}
        </ul>
    {/if}
</main>
