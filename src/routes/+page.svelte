<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<div class="flex w-full h-full m-auto flex-col gap-2 p-2">
    <!-- latest posts -->
    <div class="window">
        <div class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]">
            <div class="title-bar-text">Recent Activity</div>
        </div>
        <div class="window-body">
            {#if data.posts.length === 0}
                <p class="opacity-50">There's nothing here.</p>
            {:else}
                <ul class="tree-view">
                    {#each data.posts as post (post.slug)}
                        <li>
                            <a href={`/blog/${post.slug}`}>{post.title}</a>
                            <p class="m-0 mt-1 opacity-50">
                                {post.published} · {post.description}
                            </p>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
</div>
