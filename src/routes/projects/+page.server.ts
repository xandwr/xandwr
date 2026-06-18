import { env } from "$env/dynamic/private";
import { getCuratedProjects } from "$lib/content/projects";
import type { PageServerLoad } from "./$types";

// Prerendered at build time: the curated GitHub data is baked into static HTML
// and served straight from the edge, so visitors never wait on a GitHub
// round-trip. Stars/forks/language refresh on each deploy. The build needs
// GITHUB_TOKEN in its env (see .env) to dodge the 60 req/hr anon rate limit.
export const prerender = true;

export const load: PageServerLoad = async ({ fetch }) => {
	// The loader never throws on a single bad repo: each project falls back to
	// its local PROJECT.md cache, so there's no page-level error path to model.
	const projects = await getCuratedProjects(fetch, env.GITHUB_TOKEN);
	return { projects };
};
