<script lang="ts">
    import GithubProjectCard from "$lib/components/GithubProjectCard.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

{#if data.error}
    <div class="window m-2">
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
    <div class="grid w-full grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3">
        {#each data.repos as project (project.name)}
            <GithubProjectCard {...project} />
        {/each}
    </div>
{/if}
