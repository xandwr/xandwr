import { env } from "$env/dynamic/private";
import { fetchRepos, type Repo } from "$lib/github";
import type { PageServerLoad } from "./$types";

/** GitHub account whose public repos are listed on this page. */
const GITHUB_USER = "xandwr";

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const repos = await fetchRepos(GITHUB_USER, fetch, { token: env.GITHUB_TOKEN });
		return { repos, error: null as string | null };
	} catch (e) {
		// Surface a friendly message rather than 500-ing the whole page; the
		// most common cause is hitting the 60 req/hr unauthenticated limit.
		const message = e instanceof Error ? e.message : "Failed to load repositories.";
		return { repos: [] as Repo[], error: message };
	}
};
