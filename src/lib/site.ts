// Canonical, machine-facing facts about the site, kept in one place so every
// scrapeable surface (JSON-LD, OG/Twitter meta, sitemap, llms.txt, feeds)
// agrees. The human-facing resume copy still lives in ./content/resume.ts;
// this is the metadata layer wrapped around it.

import { resume } from "./content/resume";

export const site = {
	url: "https://xandwr.com",
	name: "xandwr.com",
	author: "Xander Pickering",
	legalName: "Alexander Pickering",
	githubUser: "xandwr",
	tagline: "my little corners of digital real-estate",
	description:
		`${resume.headline}, dev based in ${resume.location} - see ${resume.about}`,
	locale: "en_US",
} as const;

/** Joins a path onto the canonical origin, yielding an absolute URL. */
export function abs(path: string): string {
	return new URL(path, site.url).href;
}
