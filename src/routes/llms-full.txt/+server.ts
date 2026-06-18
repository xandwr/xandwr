// /llms-full.txt: the full-content companion to /llms.txt: the complete resume
// and the curated project list, concatenated into one plaintext document an
// agent can ingest in a single fetch.

import { env } from "$env/dynamic/private";
import { getCuratedProjects } from "$lib/content/projects";
import { fullResumeMarkdown } from "$lib/content/resume-export";
import { site } from "$lib/site";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch }) => {
	const parts: string[] = [];

	parts.push(`# ${site.author}: complete profile`);
	parts.push(`> Generated from ${site.url}. ${site.tagline}.`);

	// Resume
	parts.push("\n---\n", fullResumeMarkdown());

	// Projects: the same curated set as /projects, hydrated from GitHub with a
	// per-project fallback to local frontmatter, so this never fails the page.
	parts.push("\n---\n", "# Projects");
	const projects = await getCuratedProjects(fetch, env.GITHUB_TOKEN);
	for (const project of projects) {
		parts.push(
			`\n## ${project.name}`,
			`*${project.language}* · ★${project.stars} · ⑂${project.forks} · ${project.url}`,
			project.description,
		);
	}

	return new Response(parts.join("\n") + "\n", {
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "public, max-age=1800",
		},
	});
};
