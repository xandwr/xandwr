<script lang="ts">
    import Icon from "@iconify/svelte";
    import { languageColor, languageIcon } from "$lib/languages";

    // A deliberately tinier, less substantive card than GithubProjectCard: it
    // surfaces a raw public repo (name, blurb, primary language, stars/forks)
    // and links straight out to GitHub. No detail page, no writeup, no demo.
    interface Props {
        name?: string;
        description?: string;
        language?: string;
        stars?: number;
        forks?: number;
        url?: string;
    }

    let {
        name = "repo-name",
        description = "No description provided.",
        language = "—",
        stars = 0,
        forks = 0,
        url = "#",
    }: Props = $props();

    const icon = $derived(language && language !== "—" ? languageIcon(language) : null);
</script>

<article class="window flex flex-col w-full justify-between" aria-labelledby="ghrepo-{name}">
    <div class="title-bar px-2 [--title-bar-from:#3a3a3a] [--title-bar-to:#707070]">
        <h3 id="ghrepo-{name}" class="title-bar-text truncate m-0 text-sm font-inherit">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-white hover:underline">{name}</a
            >
        </h3>
        <div class="title-bar-controls" aria-hidden="true">
            <button tabindex="-1" aria-label="Close"></button>
        </div>
    </div>

    <p class="m-0 px-2 pt-2 pb-1 text-sm">{description}</p>

    <div class="window-body flex flex-wrap items-center gap-2 text-xs mt-1">
        {#if language && language !== "—"}
            <span
                class="flex items-center gap-1 border border-black px-1"
                style="box-shadow: inset -1px -1px #888, inset 1px 1px #fff"
            >
                {#if icon}
                    <Icon icon="devicon:{icon}" width="12" height="12" aria-hidden="true" />
                {:else}
                    <span
                        class="inline-block h-2 w-2 border border-black"
                        style="background:{languageColor(language)}"
                        aria-hidden="true"
                    ></span>
                {/if}
                <span>{language}</span>
            </span>
        {/if}
        <span aria-label="{stars} stars">★ {stars}</span>
        <span aria-label="{forks} forks">⑂ {forks}</span>
    </div>
</article>
