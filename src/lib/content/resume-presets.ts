// Job-tailored resume presets.
//
// A preset is a set of relevant tags plus shaping rules. `tailorResume` uses it
// to derive a compact view of the structured resume in ./resume.ts:
//   - An entry "matches" if its own tags — or any of its bullets' tags —
//     overlap the preset's tags.
//   - Matching entries keep their relevant bullets (relevance-first, so the
//     per-entry cap never drops a relevant bullet for an off-topic one).
//   - Non-matching entries collapse to a one-line stub (title/org/dates, no
//     bullets) so the employment timeline stays gap-free.
// Order is always preserved — chronology is never shuffled.

import { bulletParts, resume, type Resume, type Tag } from "./resume";

export type Preset = {
	id: string;
	label: string;
	/** Tags considered relevant to this kind of role. */
	tags: Tag[];
	/** Optional headline/about override for the tailored copy. */
	about?: string;
	/** Cap on bullets shown per matching entry. Omit for no cap. */
	maxBulletsPerEntry?: number;
};

export const presets: Preset[] = [
	{
		id: "software",
		label: "Software Engineering",
		tags: [
			"software",
			"backend",
			"frontend",
			"embedded",
			"firmware",
			"agile",
			"teamwork",
			"games",
		],
		about:
			"Computer Science major at MacEwan University with over a decade of hands-on development experience across embedded systems, full-stack web, and game development. Hungry to learn, with a strong foundation in software design and collaborative, Agile-driven teams.",
		maxBulletsPerEntry: 3,
	},
	{
		id: "embedded",
		label: "Embedded / Hardware",
		tags: ["embedded", "hardware", "firmware", "software"],
		about:
			"Computer Science major at MacEwan University specializing in embedded systems and hardware-software integration — custom firmware, microcontrollers, CAN bus, and real-time signal processing — backed by a decade of hands-on building.",
		maxBulletsPerEntry: 3,
	},
	{
		id: "it",
		label: "IT / Desktop Support",
		tags: [
			"it-support",
			"infrastructure",
			"hardware",
			"customer-service",
			"teamwork",
		],
		about:
			"Computer Science major at MacEwan University with enterprise desktop-support experience — service desk operations, workstation provisioning, Active Directory, SCCM, and ServiceNow — paired with strong, human-first client relations.",
		maxBulletsPerEntry: 3,
	},
	{
		id: "content",
		label: "Content / Media",
		tags: ["content", "media", "marketing", "leadership"],
		about:
			"Content strategist and creator who grew a 19.5K-subscriber channel and lifted organic engagement 200%+, pairing a decade of media production (DaVinci Resolve, Premiere Pro) with a Computer Science background.",
		maxBulletsPerEntry: 3,
	},
];

export function getPreset(id: string | null | undefined): Preset | null {
	if (!id) return null;
	return presets.find((p) => p.id === id) ?? null;
}

/** Tailored view types — a flattened, render-ready shape. */
export type EntryView = {
	title: string;
	org: string;
	location?: string;
	dates: string;
	/** True when the entry didn't match the preset and is shown as a stub. */
	collapsed: boolean;
	bullets: string[];
};

export type SectionView = {
	heading: string;
	entries: EntryView[];
};

export type ResumeView = Omit<Resume, "sections"> & {
	sections: SectionView[];
};

function overlaps(a: Tag[], b: Tag[]): boolean {
	return a.some((tag) => b.includes(tag));
}

/**
 * Derives a tailored ResumeView for the given preset. Passing `null` returns
 * the full resume verbatim (every entry expanded, no caps).
 */
export function tailorResume(preset: Preset | null, src: Resume = resume): ResumeView {
	if (!preset) {
		return {
			...src,
			sections: src.sections.map((section) => ({
				heading: section.heading,
				entries: section.entries.map((entry) => ({
					title: entry.title,
					org: entry.org,
					location: entry.location,
					dates: entry.dates,
					collapsed: false,
					bullets: entry.bullets.map((b) => bulletParts(b).text),
				})),
			})),
		};
	}

	return {
		...src,
		about: preset.about ?? src.about,
		sections: src.sections.map((section) => ({
			heading: section.heading,
			entries: section.entries.map((entry) => {
				const bullets = entry.bullets.map(bulletParts);

				const entryMatches =
					overlaps(entry.tags, preset.tags) ||
					bullets.some((b) => overlaps(b.tags, preset.tags));

				if (!entryMatches) {
					return {
						title: entry.title,
						org: entry.org,
						location: entry.location,
						dates: entry.dates,
						collapsed: true,
						bullets: [],
					};
				}

				// Relevance-first, but keep original order within each tier so the
				// cap drops off-topic bullets rather than relevant ones. Tier 0:
				// bullet tags hit the preset. Tier 1: untagged (always-relevant).
				// Non-matching tagged bullets are dropped.
				const ranked = bullets
					.map((b, index) => ({
						text: b.text,
						index,
						tier:
							b.tags.length === 0
								? 1
								: overlaps(b.tags, preset.tags)
									? 0
									: 2,
					}))
					.filter((b) => b.tier < 2)
					.sort((a, b) => a.tier - b.tier || a.index - b.index)
					.map((b) => b.text);

				const capped =
					preset.maxBulletsPerEntry != null
						? ranked.slice(0, preset.maxBulletsPerEntry)
						: ranked;

				return {
					title: entry.title,
					org: entry.org,
					location: entry.location,
					dates: entry.dates,
					collapsed: false,
					bullets: capped,
				};
			}),
		})),
	};
}
