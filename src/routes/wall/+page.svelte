<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";

    // Frontend stub for the guestbook "wall". No backend yet: the sign-in
    // button is inert and the list renders its empty state. When wiring up:
    //   - Google OIDC handshake + signed session cookie -> `signedIn` / `me`
    //   - D1-backed entries -> `entries`
    //   - post / edit / delete / hide routes
    // See the data model: one row per google_sub (public name + avatar_url,
    // optional context, message, timestamps, hidden flag); re-posting upserts.

    type Entry = {
        name: string;
        avatarUrl: string;
        context?: string;
        message: string;
        createdAt: number;
    };

    // Placeholder data lives empty until the backend is wired.
    const entries: Entry[] = [];
    const signedIn = false;
</script>

<Seo
    title="wall"
    description="A wall of real people who signed in to say something about me or my work."
/>

<div class="flex h-full w-full flex-col gap-2 p-2">
    <!-- Sign-in / post box (top, natural height) -->
    <div class="window">
        <div class="title-bar [--title-bar-from:#005500] [--title-bar-to:#22aa55]">
            <div class="title-bar-text">leave something</div>
        </div>
        <div class="window-body">
            {#if signedIn}
                <!-- TODO: post / edit form for the signed-in user -->
                <p class="m-0 opacity-50">Post box goes here.</p>
            {:else}
                <p class="m-0 mb-3">
                    Trust is a two-way street, and I need your identity before I know who to credit for this post!
                </p>

                <!-- Inert until the Google OIDC route exists. -->
                <button disabled>sign in with google</button>

                <p class="m-0 mt-3 opacity-50">
                    When logged in you can edit or delete your posts at any time
                </p>
            {/if}
        </div>
    </div>

    <!-- The wall (fills remaining space, scrolls when it overflows) -->
    <div class="window flex min-h-0 flex-1 flex-col">
        <div class="title-bar [--title-bar-from:#0044aa] [--title-bar-to:#aaaacc]">
            <div class="title-bar-text">the wall</div>
        </div>
        <div class="window-body flex-1 overflow-auto">
            <p class="m-0 mb-3">
                No moderation. Whatever is here is from a real person who had something to say about me!
            </p>

            {#if entries.length === 0}
                <p class="m-0 opacity-50">Nobody's signed the wall yet.</p>
            {:else}
                <ul class="tree-view">
                    {#each entries as entry (entry.name + entry.createdAt)}
                        <li class="flex items-start gap-2">
                            <img
                                src={entry.avatarUrl}
                                alt=""
                                width="32"
                                height="32"
                                class="shrink-0 border border-black"
                            />
                            <div>
                                <strong>{entry.name}</strong>
                                {#if entry.context}
                                    <span class="opacity-50"
                                        >· {entry.context}</span
                                    >
                                {/if}
                                <p class="m-0 mt-1">{entry.message}</p>
                            </div>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
</div>
