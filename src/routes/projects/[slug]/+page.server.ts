import { env } from "$env/dynamic/private";
import { getCuratedProject, projectSlugs } from "$lib/content/projects";
import { softwareSourceCodeJsonLd } from "$lib/jsonld";
import { error } from "@sveltejs/kit";
import type { EntryGenerator, PageServerLoad } from "./$types";

// Baked to static HTML at build time alongside the /projects index. `entries`
// enumerates every slug explicitly so the build doesn't lean on the crawler
// finding each card's link (a hidden draft or a layout change could drop one).
export const prerender = true;

export const entries: EntryGenerator = () => projectSlugs().map((slug) => ({ slug }));

export const load: PageServerLoad = async ({ params, fetch }) => {
	const project = await getCuratedProject(params.slug, fetch, env.GITHUB_TOKEN);

	if (!project) {
		error(404, "Project not found");
	}

	return {
		project,
		jsonLd: softwareSourceCodeJsonLd(project),
	};
};
