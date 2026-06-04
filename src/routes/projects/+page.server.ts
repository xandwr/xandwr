import { env } from "$env/dynamic/private";
import { getCuratedProjects } from "$lib/content/projects";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
	// The loader never throws on a single bad repo — each project falls back to
	// its local PROJECT.md cache — so there's no page-level error path to model.
	const projects = await getCuratedProjects(fetch, env.GITHUB_TOKEN);
	return { projects };
};
