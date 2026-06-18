// Agent skills published at /.well-known/skills/<slug>/SKILL.md. Those files
// are the single source of truth: they're what `npx skills` fetches remotely
// (see static/.well-known/skills/index.json, regenerated at build time), and
// they ALSO drive the human-readable /skills pages here. Drop a new
// static/.well-known/skills/<slug>/SKILL.md and it shows up in both places.
//
// The folder name is the slug. Each SKILL.md needs YAML frontmatter with
// `name` and `description` (the same fields the discovery index requires).

import { renderMarkdown } from "./markdown";

export type SkillFrontmatter = {
	name: string;
	description: string;
};

export type SkillSummary = {
	slug: string;
	name: string;
	description: string;
};

export type Skill = SkillSummary & {
	/** Raw markdown body (frontmatter stripped). */
	content: string;
	/** Rendered HTML of the body. */
	html: string;
};

// Build-time discovery: every static/.well-known/skills/<slug>/SKILL.md,
// imported raw. The path is relative to this file (src/lib/content/), reaching
// up into the static dir that gets served verbatim.
const files = import.meta.glob(
	"../../../static/.well-known/skills/*/SKILL.md",
	{ query: "?raw", import: "default", eager: true },
) as Record<string, string>;

/** Pulls the <slug> out of .../skills/<slug>/SKILL.md. */
function slugFromPath(path: string): string {
	const match = path.match(/\/skills\/([^/]+)\/SKILL\.md$/);
	if (!match) throw new Error(`Unexpected skill path: ${path}`);
	return match[1];
}

function parse(slug: string, raw: string): {
	frontmatter: SkillFrontmatter;
	body: string;
} {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) {
		throw new Error(`skills/${slug}/SKILL.md is missing frontmatter.`);
	}

	const values = Object.fromEntries(
		match[1]
			.split("\n")
			.filter((line) => line.includes(":"))
			.map((line) => {
				const i = line.indexOf(":");
				const key = line.slice(0, i).trim();
				const value = line
					.slice(i + 1)
					.trim()
					.replace(/^["']|["']$/g, "");
				return [key, value];
			}),
	) as SkillFrontmatter;

	if (!values.name || !values.description) {
		throw new Error(
			`skills/${slug}/SKILL.md frontmatter must set name and description.`,
		);
	}

	return { frontmatter: values, body: match[2].trim() };
}

async function build(path: string, raw: string): Promise<Skill> {
	const slug = slugFromPath(path);
	const { frontmatter, body } = parse(slug, raw);
	return {
		slug,
		name: frontmatter.name,
		description: frontmatter.description,
		content: body,
		html: await renderMarkdown(body),
	};
}

const skills = (
	await Promise.all(
		Object.entries(files).map(([path, raw]) => build(path, raw)),
	)
).sort((a, b) => a.name.localeCompare(b.name));

export function getSkills(): SkillSummary[] {
	return skills.map(({ content, html, ...summary }) => summary);
}

export function getSkill(slug: string): Skill | undefined {
	return skills.find((skill) => skill.slug === slug);
}
