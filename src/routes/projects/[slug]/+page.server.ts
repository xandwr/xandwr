import { env } from "$env/dynamic/private";
import { getCuratedProject } from "$lib/content/projects";
import { softwareSourceCodeJsonLd } from "$lib/jsonld";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

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
