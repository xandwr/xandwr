// Machine-readable mirror of the /projects page: the public GitHub repos as a
// schema.org ItemList of SoftwareSourceCode, plus the raw list for convenience.

import { env } from "$env/dynamic/private";
import { fetchRepos } from "$lib/github";
import { site, abs } from "$lib/site";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const repos = await fetchRepos(site.githubUser, fetch, { token: env.GITHUB_TOKEN });
		return json(
			{
				"@context": "https://schema.org",
				"@type": "ItemList",
				name: "GitHub Projects",
				url: abs("/projects"),
				numberOfItems: repos.length,
				itemListElement: repos.map((repo, i) => ({
					"@type": "ListItem",
					position: i + 1,
					item: {
						"@type": "SoftwareSourceCode",
						name: repo.name,
						description: repo.description,
						programmingLanguage: repo.language,
						codeRepository: repo.url,
						// Non-standard but handy extras for scrapers.
						stars: repo.stars,
						forks: repo.forks,
					},
				})),
				repos,
			},
			{ headers: { "cache-control": "public, max-age=1800" } },
		);
	} catch (e) {
		const message = e instanceof Error ? e.message : "Failed to load repositories.";
		return json({ error: message, repos: [] }, { status: 502 });
	}
};
