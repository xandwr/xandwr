<script lang="ts">
    import GithubProjectCard from "$lib/components/GithubProjectCard.svelte";
    import GithubRepoCard from "$lib/components/GithubRepoCard.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import { abs, site } from "$lib/site";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Structured data (schema.org ItemList) so agents and search engines can
    // parse the curated project list without scraping the visual markup.
    // Mirrors the human-visible Showcase cards below (not the raw GitHub dump).
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

<Seo
    title="projects"
    description="Things I've built — a curated set of {site.author}'s projects and writeups, plus every public repo on GitHub."
/>

<svelte:head>
    {#if jsonLd}
        {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>`}
    {/if}
</svelte:head>

<main aria-labelledby="projects-heading">
    <h1 id="projects-heading" class="sr-only">Projects</h1>

    <!-- Showcase: curated, substantive projects. Open by default. -->
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

    <!-- GitHub: the rest of the public corpus, minus anything in the Showcase.
         Collapsed by default to keep the substantive work up top. -->
    <details class="m-2">
        <summary
            class="title-bar cursor-pointer list-none px-2 [--title-bar-from:#3a3a3a] [--title-bar-to:#707070]"
        >
            <span class="title-bar-text m-0 text-sm font-inherit">GitHub</span>
            <span class="title-bar-text m-0 text-xs font-inherit opacity-80">
                {data.repos.length}
                {data.repos.length === 1 ? "repo" : "repos"}
            </span>
        </summary>

        <div class="border-2 border-t-0 border-[#dfdfdf] p-2">
            <p class="mt-0 mb-2 text-sm opacity-70">
                Everything else public on
                <a
                    href="https://github.com/{site.githubUser}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:text-base"
                >
                    github.com/{site.githubUser} <span aria-hidden="true">↗</span>
                </a>
            </p>

            {#if data.repos.length === 0}
                <p class="m-0 opacity-50">No public repos to show.</p>
            {:else}
                <ul
                    class="grid w-full list-none grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
                    aria-label="Public GitHub repositories"
                >
                    {#each data.repos as repo (repo.url)}
                        <li class="contents">
                            <GithubRepoCard {...repo} />
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </details>
</main>

<style>
    /* Hide the default disclosure triangle; the title-bar styling already
       reads as an interactive Win98 header. */
    summary::-webkit-details-marker {
        display: none;
    }
    summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
</style>
