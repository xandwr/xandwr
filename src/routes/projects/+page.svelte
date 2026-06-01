<script lang="ts">
    import GithubProjectCard from "$lib/components/GithubProjectCard.svelte";

    const projects = [
        {
            name: "personal-website",
            description: "sveltekit + 98.css personal site.",
            language: "Svelte",
            stars: 0,
            forks: 0,
            url: "https://github.com/xandwr/xandwr",
        },
    ];
</script>

<div class="flex w-full gap-4 p-2">
    {#each projects as project (project.name)}
        <GithubProjectCard {...project} />
    {/each}
</div>
