// Machine-readable mirror of the /projects page: the curated projects as a
// schema.org ItemList of SoftwareSourceCode. Driven by the same loader as the
// page, so the human and machine views can't drift.

import { env } from "$env/dynamic/private";
import { getCuratedProjects } from "$lib/content/projects";
import { abs } from "$lib/site";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Baked at build time off the same loader as the page, so the machine mirror
// ships as a static asset and can never drift from the prerendered /projects.
export const prerender = true;

export const GET: RequestHandler = async ({ fetch }) => {
	const projects = await getCuratedProjects(fetch, env.GITHUB_TOKEN);

	return json(
		{
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: "Projects",
			url: abs("/projects"),
			numberOfItems: projects.length,
			itemListElement: projects.map((p, i) => ({
				"@type": "ListItem",
				position: i + 1,
				item: {
					"@type": "SoftwareSourceCode",
					name: p.name,
					description: p.description,
					programmingLanguage: p.language,
					codeRepository: p.url,
					...(p.writeup ? { url: abs(`/blog/${p.writeup}`) } : {}),
					...(p.demo ? { discussionUrl: p.demo } : {}),
					// Non-standard but handy extras for scrapers.
					tags: p.tags,
					stars: p.stars,
					forks: p.forks,
				},
			})),
			projects,
		},
		{ headers: { "cache-control": "public, max-age=1800" } },
	);
};
