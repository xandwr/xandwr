<script lang="ts">
    import JsonLd from "$lib/components/JsonLd.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // "last shipped 2d ago" — coarse, day-grained relative time. Day granularity
    // keeps SSR and hydration in agreement (a few ms drift can't change the
    // bucket), so there's no flash and no hydration warning.
    function lastShipped(iso: string): string {
        const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
        if (days <= 0) return "today";
        if (days === 1) return "yesterday";
        if (days < 7) return `${days}d ago`;
        if (days < 30) return `${Math.floor(days / 7)}w ago`;
        if (days < 365) return `${Math.floor(days / 30)}mo ago`;
        return `${Math.floor(days / 365)}y ago`;
    }
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
                <div class="prose text-lg">
                    {@html data.introHtml}
                </div>
            </div>

            {#if data.activity}
                <!-- Live signal: most recently pushed repos, pulled from GitHub
                     at request time. Omitted entirely if the lookup failed, so
                     the window never shows an empty or stale strip. -->
                <div class="status-bar">
                    <p class="status-bar-field flex-1">
                        ▸ currently pushing:
                        {#each data.activity.repos as repo, i}<a
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer">{repo.name}</a
                            >{#if i < data.activity.repos.length - 1}, {/if}{/each}
                    </p>
                    <p class="status-bar-field">
                        last shipped {lastShipped(data.activity.lastPushedAt)}
                    </p>
                </div>
            {/if}
        </article>
    </main>
</div>
