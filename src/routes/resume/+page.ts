import { getPreset, presets, tailorResume } from "$lib/content/resume-presets";
import type { PageLoad } from "./$types";

// `?preset=<id>` selects a job-tailored, compact resume; no param renders the
// full resume. Derived here so the tailored copy is server-rendered and the
// resulting URL is shareable / printable.
export const load: PageLoad = ({ url }) => {
	const preset = getPreset(url.searchParams.get("preset"));

	return {
		preset,
		presets,
		doc: tailorResume(preset),
	};
};
