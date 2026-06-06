import { getSkill } from "$lib/content/skills";
import { error } from "@sveltejs/kit";

export function load({ params }) {
	const skill = getSkill(params.slug);

	if (!skill) {
		error(404, "Skill not found");
	}

	return { skill };
}
