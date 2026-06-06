import { getSkills } from "$lib/content/skills";

export function load() {
	return {
		skills: getSkills(),
	};
}
