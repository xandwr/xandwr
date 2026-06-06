import { env } from "$env/dynamic/private";
import { curatedRepoSlugs, getCuratedProjects } from "$lib/content/projects";
import { fetchRepos, type Repo } from "$lib/github";
import { site } from "$lib/site";
import type { PageServerLoad } from "./$types";

/** Derives a lowercase "owner/name" slug from a repo's html_url for dedup. */
function repoSlug(url: string): string {
	return url
		.replace(/^https?:\/\/github\.com\//i, "")
		.replace(/\/$/, "")
		.toLowerCase();
}

export const load: PageServerLoad = async ({ fetch }) => {
	// The loader never throws on a single bad repo — each project falls back to
	// its local PROJECT.md cache — so there's no page-level error path to model.
	const projects = await getCuratedProjects(fetch, env.GITHUB_TOKEN);

	// The full public GitHub corpus, minus anything already in the Showcase, so
	// the two sections never list the same repo twice. A GitHub outage degrades
	// to an empty corpus rather than failing the page.
	const curated = curatedRepoSlugs();
	let repos: Repo[] = [];
	try {
		repos = (await fetchRepos(site.githubUser, fetch, { token: env.GITHUB_TOKEN })).filter(
			(r) => !curated.has(repoSlug(r.url))
		);
	} catch (e) {
		console.warn("[projects] GitHub corpus fetch failed; showing Showcase only.", e);
	}

	return { projects, repos };
};
