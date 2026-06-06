// Canonical, machine-facing facts about the site, kept in one place so every
// scrapeable surface (JSON-LD, OG/Twitter meta, sitemap, llms.txt, feeds)
// agrees. The human-facing resume copy still lives in ./content/resume.ts;
// this is the metadata layer wrapped around it.

import { resume } from "./content/resume";

export const site = {
	/** Production origin, no trailing slash. Used to build absolute URLs. */
	url: "https://xandwr.com",
	/** Short brand shown in <title> suffixes and the title bar. */
	name: "xandwr.com",
	/** Canonical, parseable name: the schema.org Person `name` and the author
	 *  shown across every machine surface (meta, JSON Resume, llms.txt, RSS). */
	author: "Xander Pickering",
	/** Legal/alias form, surfaced as `alternateName` to reconcile the mixed
	 *  identity scattered around the web (the resume `name` is the stylized one). */
	legalName: "Alexander Pickering",
	/** GitHub handle whose repos power /projects. */
	githubUser: "xandwr",
	tagline: "my little corners of digital real-estate",
	description:
		`${resume.headline} based in ${resume.location}. ${resume.about}`,
	locale: "en_US",
} as const;

/** Joins a path onto the canonical origin, yielding an absolute URL. */
export function abs(path: string): string {
	return new URL(path, site.url).href;
}
