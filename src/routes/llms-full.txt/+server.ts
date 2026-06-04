// /llms-full.txt — the full-content companion to /llms.txt: the complete resume,
// the live project list, and every blog post's source, concatenated into one
// plaintext document an agent can ingest in a single fetch.

import { env } from "$env/dynamic/private";
import { getBlogPosts, getBlogPost } from "$lib/content/blog";
import { fullResumeMarkdown } from "$lib/content/resume-export";
import { fetchRepos } from "$lib/github";
import { site } from "$lib/site";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch }) => {
	const parts: string[] = [];

	parts.push(`# ${site.author} — complete profile`);
	parts.push(`> Generated from ${site.url}. ${site.tagline}.`);

	// Resume
	parts.push("\n---\n", fullResumeMarkdown());

	// Projects (best-effort; never fail the whole document on a GitHub hiccup)
	parts.push("\n---\n", "# Projects (live from GitHub)");
	try {
		const repos = await fetchRepos(site.githubUser, fetch, { token: env.GITHUB_TOKEN });
		for (const repo of repos) {
			parts.push(
				`\n## ${repo.name}`,
				`*${repo.language}* · ★${repo.stars} · ⑂${repo.forks} · ${repo.url}`,
				repo.description,
			);
		}
	} catch (e) {
		parts.push(`_(project list temporarily unavailable: ${e instanceof Error ? e.message : "error"})_`);
	}

	// Blog posts (full source)
	parts.push("\n---\n", "# Blog");
	for (const summary of getBlogPosts()) {
		const post = getBlogPost(summary.slug);
		if (!post) continue;
		parts.push(
			`\n## ${post.title}`,
			`*Published ${post.published} · last edited ${post.lastEdited}*`,
			`> ${post.description}`,
			"",
			post.content,
		);
	}

	return new Response(parts.join("\n") + "\n", {
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "public, max-age=1800",
		},
	});
};
