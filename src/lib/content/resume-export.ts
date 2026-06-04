// Machine-readable projections of the structured resume.
//
// The resume in ./resume.ts is the single source of truth. This module derives
// alternate shapes from it for scrapers and agents:
//   - toJsonResume(): the community-standard JSON Resume schema (jsonresume.org)
//   - resumeToMarkdown(): a clean markdown rendering (powers /llms-full.txt and
//     the .md resume endpoint)
//   - allTags() / TAG_LABELS: the tag vocabulary as human-readable skills
//
// Both projections accept a ResumeView (see ./resume-presets.ts) so a preset's
// tailored copy round-trips through every format too.

import { resume, type Resume, type Tag } from "./resume";
import { tailorResume, type ResumeView } from "./resume-presets";
import { site } from "../site";

/** Human-readable label for each tag — used as schema.org `knowsAbout` /
 *  JSON Resume `skills`, so the closed vocabulary becomes a real skill list. */
export const TAG_LABELS: Record<Tag, string> = {
	general: "General",
	software: "Software Development",
	backend: "Backend Engineering",
	frontend: "Frontend Development",
	embedded: "Embedded Systems",
	firmware: "Firmware Development",
	hardware: "Hardware",
	agile: "Agile / Scrum",
	teamwork: "Teamwork",
	games: "Game Development",
	"it-support": "IT Support",
	infrastructure: "Infrastructure",
	"customer-service": "Customer Service",
	retail: "Retail",
	teaching: "Teaching",
	mentoring: "Mentoring",
	content: "Content Creation",
	media: "Media Production",
	marketing: "Marketing",
	leadership: "Leadership",
};

/** Every tag used anywhere in the resume, in first-encountered order. */
export function allTags(src: Resume = resume): Tag[] {
	const seen = new Set<Tag>();
	for (const section of src.sections) {
		for (const entry of section.entries) {
			for (const tag of entry.tags) seen.add(tag);
			for (const bullet of entry.bullets) {
				if (typeof bullet !== "string") {
					for (const tag of bullet.tags) seen.add(tag);
				}
			}
		}
	}
	return [...seen];
}

/** Human-readable skill labels for the resume's full tag vocabulary. */
export function skillLabels(src: Resume = resume): string[] {
	return allTags(src).map((tag) => TAG_LABELS[tag]);
}

/** Splits "May 2024 – August 2024" / "2025" into best-effort start/end. */
function splitDates(dates: string): { start?: string; end?: string } {
	const parts = dates.split(/\s*[–—-]\s*/);
	if (parts.length >= 2) return { start: parts[0].trim(), end: parts[1].trim() };
	return { start: dates.trim() };
}

function classify(heading: string): "work" | "education" | "projects" | "volunteer" | "other" {
	const h = heading.toLowerCase();
	if (h.includes("education")) return "education";
	if (h.includes("employment") || h.includes("experience") || h.includes("work")) return "work";
	if (h.includes("project")) return "projects";
	if (h.includes("volunteer") || h.includes("community")) return "volunteer";
	return "other";
}

/**
 * Maps a ResumeView onto the JSON Resume schema (jsonresume.org). Free-form
 * date ranges are preserved verbatim under `dateRange` since the source dates
 * aren't all ISO; the standard start/end fields carry the best-effort split.
 */
export function toJsonResume(doc: ResumeView) {
	const profiles = doc.links.map((link) => ({
		network: link.label.includes("linkedin") ? "LinkedIn" : link.label,
		url: link.href,
	}));

	const basics = {
		name: site.author,
		label: doc.headline,
		email: doc.email,
		...(doc.phone ? { phone: doc.phone } : {}),
		url: site.url,
		summary: doc.about,
		location: { city: doc.location.split(",")[0]?.trim(), region: doc.location.split(",")[1]?.trim() },
		profiles,
	};

	const work: unknown[] = [];
	const education: unknown[] = [];
	const projects: unknown[] = [];
	const volunteer: unknown[] = [];

	for (const section of doc.sections) {
		for (const entry of section.entries) {
			const { start, end } = splitDates(entry.dates);
			const base = {
				location: entry.location,
				dateRange: entry.dates,
				...(start ? { startDate: start } : {}),
				...(end ? { endDate: end } : {}),
				highlights: entry.bullets,
			};
			switch (classify(section.heading)) {
				case "education":
					education.push({ institution: entry.org, studyType: entry.title, area: entry.title, courses: entry.bullets, ...base });
					break;
				case "projects":
					projects.push({ name: entry.title, entity: entry.org, description: entry.bullets[0] ?? "", highlights: entry.bullets, dateRange: entry.dates, ...(entry.links[0] ? { url: entry.links[0].href } : {}) });
					break;
				case "volunteer":
					volunteer.push({ organization: entry.org, position: entry.title, ...base });
					break;
				default:
					work.push({ name: entry.org, position: entry.title, ...base });
			}
		}
	}

	return {
		$schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
		basics,
		work,
		education,
		projects,
		volunteer,
		skills: skillLabels().map((name) => ({ name })),
		meta: { canonical: `${site.url}/resume.json`, version: "v1", generatedFrom: "structured resume data" },
	};
}

/** Renders a ResumeView to clean markdown, citing each entry's links (if any)
 *  on a trailing line so the projection round-trips the same sources the web
 *  resume and print view show. */
export function resumeToMarkdown(doc: ResumeView): string {
	const lines: string[] = [];
	lines.push(`# ${site.author}`);
	lines.push("");
	lines.push(`**${doc.headline}** · ${doc.location}`);
	const contacts = [doc.email, ...doc.links.map((l) => l.href)].filter(Boolean);
	if (contacts.length) lines.push("", contacts.join(" · "));
	lines.push("", "## About", "", doc.about);

	for (const section of doc.sections) {
		lines.push("", `## ${section.heading}`);
		for (const entry of section.entries) {
			const org = entry.location ? `${entry.org} · ${entry.location}` : entry.org;
			lines.push("", `### ${entry.title} — ${org}`, `*${entry.dates}*`);
			for (const bullet of entry.bullets) lines.push(`- ${bullet}`);
			if (entry.links.length > 0) {
				lines.push(
					"", "Links: " + entry.links.map((l) => `[${l.label}](${l.href})`).join(" · ")
				);
			}
		}
	}
	return lines.join("\n") + "\n";
}

/** Convenience: the full (untailored) resume as markdown. */
export function fullResumeMarkdown(): string {
	return resumeToMarkdown(tailorResume(null));
}
