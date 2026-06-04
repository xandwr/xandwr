// Machine-readable resume in the JSON Resume standard (jsonresume.org).
// `?preset=<id>` returns the same tailored view the /resume page renders, so a
// shared link round-trips to JSON. No param returns the full resume.

import { getPreset, tailorResume } from "$lib/content/resume-presets";
import { toJsonResume } from "$lib/content/resume-export";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
	const preset = getPreset(url.searchParams.get("preset"));
	const doc = tailorResume(preset);

	return json(toJsonResume(doc), {
		headers: { "cache-control": "public, max-age=3600" },
	});
};
