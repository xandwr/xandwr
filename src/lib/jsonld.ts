// Schema.org JSON-LD builders. Each returns a plain object meant to be
// serialized into a <script type="application/ld+json"> tag (or an endpoint),
// so search engines and agents can read structured facts without scraping the
// visual markup. Everything is derived from the same source data as the pages.

import { resume } from "./content/resume";
import { skillLabels } from "./content/resume-export";
import type { CuratedProject } from "./content/projects";
import { site, abs } from "./site";

/** A schema.org Person assembled from the structured resume. */
export function personJsonLd() {
	const education = resume.sections.find((s) => /education/i.test(s.heading));
	const employment = resume.sections.find((s) => /employment|experience|work/i.test(s.heading));
	const current = employment?.entries.find((e) => /present/i.test(e.dates));

	return {
		"@context": "https://schema.org",
		"@type": "Person",
		"@id": `${site.url}/#person`,
		name: site.author,
		// Every other name this identity goes by, so an agent reading the graph
		// can reconcile "Alexander" / the stylized handle with the canonical name.
		alternateName: [site.legalName, resume.name],
		jobTitle: resume.headline,
		description: resume.about,
		email: `mailto:${resume.email}`,
		url: site.url,
		address: { "@type": "PostalAddress", addressLocality: resume.location },
		knowsAbout: skillLabels(),
		sameAs: resume.links.map((l) => l.href),
		alumniOf: education?.entries.map((e) => ({
			"@type": "EducationalOrganization",
			name: e.org,
		})),
		...(current
			? { worksFor: { "@type": "Organization", name: current.org } }
			: {}),
	};
}

/** ProfilePage wrapping the Person: the recommended type for an "about me". */
export function profilePageJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		"@id": `${site.url}/#profilepage`,
		url: site.url,
		name: `${site.author}: ${site.name}`,
		description: site.description,
		mainEntity: personJsonLd(),
	};
}

/** A single curated project as a schema.org SoftwareSourceCode. */
export function softwareSourceCodeJsonLd(project: CuratedProject) {
	const url = abs(`/projects/${project.slug}`);
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareSourceCode",
		"@id": `${url}#project`,
		name: project.name,
		description: project.description,
		programmingLanguage: project.language,
		codeRepository: project.url,
		url,
		keywords: project.tags.length ? project.tags : undefined,
		author: { "@type": "Person", "@id": `${site.url}/#person`, name: site.author },
	};
}
