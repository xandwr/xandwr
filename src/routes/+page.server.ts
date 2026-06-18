import { env } from "$env/dynamic/private";
import { fetchRecentActivity } from "$lib/github";
import { site } from "$lib/site";
import type { PageServerLoad } from "./$types";

// Not prerendered: the "currently pushing" strip is a live signal, so it has to
// resolve at request time against GitHub rather than freeze at deploy. The
// markdown intro still renders in the universal +page.ts; SvelteKit merges both
// loads' data. The strip is best-effort — `activity` is null on any failure and
// the page just omits it.
export const load: PageServerLoad = async ({ fetch }) => {
	const activity = await fetchRecentActivity(site.githubUser, fetch, {
		token: env.GITHUB_TOKEN,
		// Don't advertise "currently pushing: my own website" — exclude this repo.
		exclude: [site.githubUser],
	});
	return { activity };
};
