<script lang="ts">
    import Icon from "@iconify/svelte";
    import { languageColor, languageIcon } from "$lib/languages";

    interface Props {
        /** Folder slug — links the card title to the /projects/[slug] page. */
        slug?: string;
        name?: string;
        description?: string;
        language?: string;
        stars?: number;
        forks?: number;
        url?: string;
        /** Optional live/demo link (video, deployed app) distinct from the repo. */
        demo?: string;
        /** Hero media: a /static path or absolute URL. */
        cover?: string;
        /** Slug of a long-form build log in /blog, if one exists. */
        writeup?: string;
        /** Free-form tags shown as chips. */
        tags?: string[];
    }

    let {
        slug,
        name = "project-name",
        description = "No description provided.",
        language = "TypeScript",
        stars = 0,
        forks = 0,
        url = "#",
        demo,
        cover,
        writeup,
        tags = [],
    }: Props = $props();

    const icon = $derived(languageIcon(language));
    const color = $derived(languageColor(language));
</script>

<article
    class="window flex flex-col w-full justify-between px-1"
    aria-labelledby="repo-{name}"
>
    <div class="title-bar [--title-bar-from:#005500] [--title-bar-to:#22aa55]">
        <h2
            id="repo-{name}"
            class="title-bar-text truncate m-0 text-sm font-inherit"
        >
            {#if slug}
                <a href="/projects/{slug}" class="text-white hover:underline"
                    >{name}</a
                >
            {:else}
                {name}
            {/if}
        </h2>
        <div class="title-bar-controls" aria-hidden="true">
            <button tabindex="-1" aria-label="Minimize"></button>
            <button tabindex="-1" aria-label="Maximize"></button>
            <button tabindex="-1" aria-label="Close"></button>
        </div>
    </div>

    {#if cover}
        <img
            src={cover}
            alt=""
            loading="lazy"
            class="mt-1 w-full border border-black object-cover"
            style="aspect-ratio: 16 / 9"
        />
    {/if}

    <p class="m-0 mt-1">{description}</p>

    {#if tags.length > 0}
        <div class="mt-1 flex flex-wrap gap-1" aria-label="Tags">
            {#each tags as tag (tag)}
                <span
                    class="border border-black px-1 text-xs"
                    style="box-shadow: inset -1px -1px #888, inset 1px 1px #fff"
                    >{tag}</span
                >
            {/each}
        </div>
    {/if}

    <div>
        <div class="window-body flex flex-col gap-2 h-min">
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
                    <span>Language: {language}</span>
                </span>
                <span>{stars} {stars === 1 ? "star" : "stars"}</span>
                <span>{forks} {forks === 1 ? "fork" : "forks"}</span>
            </div>

            {#if writeup || demo}
                <div class="flex flex-wrap gap-3 text-sm">
                    {#if writeup}
                        <a href="/blog/{writeup}" class="hover:text-base">
                            Read the writeup <span aria-hidden="true">→</span>
                        </a>
                    {/if}
                    {#if demo}
                        <a
                            href={demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="hover:text-base"
                        >
                            Demo <span aria-hidden="true">↗</span>
                        </a>
                    {/if}
                </div>
            {/if}
        </div>

        <div class="status-bar">
            <p
                class="status-bar-field flex-1 transition-all overflow-hidden text-nowrap hover:overflow-auto scroll-m-0 scrollbar-thin"
                aria-hidden="true"
            >
                {url}
            </p>
            <p class="status-bar-field">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm hover:text-base"
                >
                    Open <span aria-hidden="true">↗</span>
                    <span class="sr-only"
                        >{name} on GitHub (opens in a new tab)</span
                    >
                </a>
            </p>
        </div>
    </div>
</article>
