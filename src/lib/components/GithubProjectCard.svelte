<script lang="ts">
    interface Props {
        name?: string;
        description?: string;
        language?: string;
        stars?: number;
        forks?: number;
        url?: string;
    }

    let {
        name = "project-name",
        description = "No description provided.",
        language = "TypeScript",
        stars = 0,
        forks = 0,
        url = "#",
    }: Props = $props();
</script>

<div class="window flex flex-col w-full">
    <div class="title-bar [--title-bar-from:#005500] [--title-bar-to:#22aa55]">
        <div class="title-bar-text truncate">{name}</div>
        <div class="title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Maximize"></button>
            <button aria-label="Close"></button>
        </div>
    </div>

    <div class="window-body flex flex-col gap-2">
        <p class="m-0">{description}</p>

        <div class="flex flex-wrap items-center gap-3 text-sm">
            <span class="flex items-center gap-1">
                <span class="inline-block h-3 w-3 border border-black" style="background:#3178c6"></span>
                {language}
            </span>
            <span>★ {stars}</span>
            <span>⑂ {forks}</span>
        </div>
    </div>

    <div class="status-bar">
        <p class="status-bar-field flex-1 truncate">{url}</p>
        <p class="status-bar-field">
            <a href={url} target="_blank" rel="noopener noreferrer">Open ↗</a>
        </p>
    </div>
</div>
