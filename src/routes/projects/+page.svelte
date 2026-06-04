<script lang="ts">
    import GithubProjectCard from "$lib/components/GithubProjectCard.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Structured data (schema.org ItemList) so agents and search engines can
    // parse the project list without scraping the visual markup. Mirrors the
    // human-visible cards below.
    const jsonLd = $derived(
        !data.error && data.repos.length > 0
            ? {
                  "@context": "https://schema.org",
                  "@type": "ItemList",
                  name: "GitHub Projects",
                  itemListElement: data.repos.map((project, i) => ({
                      "@type": "ListItem",
                      position: i + 1,
                      item: {
                          "@type": "SoftwareSourceCode",
                          name: project.name,
                          description: project.description,
                          programmingLanguage: project.language,
                          codeRepository: project.url
                      }
                  }))
              }
            : null
    );
</script>

<svelte:head>
    {#if jsonLd}
        {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>`}
    {/if}
</svelte:head>

<main aria-labelledby="projects-heading">
    <h1 id="projects-heading" class="sr-only">GitHub Projects</h1>

    {#if data.error}
        <div class="window m-2" role="alert">
            <div class="title-bar [--title-bar-from:#aa0000] [--title-bar-to:#cc6666]">
                <div class="title-bar-text">Error</div>
            </div>
            <div class="window-body">
                <p class="m-0">Couldn't load repositories.</p>
                <p class="m-0 opacity-50">{data.error}</p>
            </div>
        </div>
    {:else if data.repos.length === 0}
        <div class="window m-2">
            <div class="window-body">
                <p class="m-0 opacity-50">No public repositories found.</p>
            </div>
        </div>
    {:else}
        <ul
            class="grid w-full list-none grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3"
            aria-label="GitHub repositories"
        >
            {#each data.repos as project (project.name)}
                <li class="contents">
                    <GithubProjectCard {...project} />
                </li>
            {/each}
        </ul>
    {/if}
</main>
