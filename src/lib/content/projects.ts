// Curated projects. Unlike a raw dump of every public repo, each project here
// is a deliberate choice: drop a folder under ./projects/<slug>/ containing a
// PROJECT.md, and it shows up. The folder name is the slug.
//
// GitHub is the *base* layer (live stars/forks/language/description) and the
// PROJECT.md frontmatter is the *override + enrichment* layer (curated title,
// tagline, ordering, demo link, writeup, cover). Frontmatter also doubles as a
// fallback cache: if the GitHub API is unreachable or rate-limited, the card
// still renders from whatever local values are present instead of erroring.
//
// The only REQUIRED field is `repo: owner/name`. That requirement is also what
// enforces the house rule — every curated project must be a public GitHub repo
// (a private/missing repo reads as a 404 and degrades to the local fallback).
//
// See ./projects/README.md for the authoring convention and a template.

import { fetchRepo, type Repo } from "$lib/github";
import { renderMarkdown } from "./blog";

/**
 * The PROJECT.md frontmatter schema. Everything except `repo` is optional;
 * unset fields fall back to live GitHub data, then to sensible defaults.
 */
export type ProjectFrontmatter = {
	/** REQUIRED. "owner/name" — the public repo this project is built on. */
	repo: string;
	/** Display name. Defaults to the repo name. */
	title?: string;
	/** One-line pitch shown on the card. Defaults to the GitHub description. */
	tagline?: string;
	/** Promote onto the landing/hero selection. */
	featured?: boolean;
	/** Explicit curation order (ascending). Unset sorts after ordered items. */
	order?: number;
	/** Optional live/demo link (video, deployed app) distinct from the repo. */
	demo?: string;
	/** Hero media. A /static path or absolute URL (keep heavy media in /static). */
	cover?: string;
	/** Free-form tags for grouping/filtering. */
	tags?: string[];
	/** Slug of a long-form build log in /blog, if one exists. */
	writeup?: string;
	/** Hide without deleting the folder (drafts). */
	hidden?: boolean;

	// --- Fallback cache: used only when the GitHub lookup fails. ---
	/** Cached description, shown if GitHub is unreachable and no tagline is set. */
	description?: string;
	/** Primary language. Overrides GitHub's linguist guess when set. */
	language?: string;
	/** Top languages (e.g. [TypeScript, CSS, HTML]). Overrides GitHub when set. */
	languages?: string[];
	/** Cached star count. */
	stars?: number;
	/** Cached fork count. */
	forks?: number;
};

/** The merged shape the project cards and machine surfaces consume. */
export type CuratedProject = {
	slug: string;
	name: string;
	description: string;
	language: string;
	/** Up to the top 3 languages by usage, most-used first. May be empty. */
	languages: string[];
	stars: number;
	forks: number;
	/** Canonical repo URL (from GitHub, or derived from the slug on fallback). */
	url: string;
	demo?: string;
	cover?: string;
	tags: string[];
	writeup?: string;
	featured: boolean;
	/** Rendered HTML of the PROJECT.md body, if it has one below the frontmatter. */
	bodyHtml?: string;
	/** Whether live GitHub data backed this card (false ⇒ local fallback). */
	live: boolean;
};

/** A discovered-but-not-yet-fetched project: parsed frontmatter + raw body. */
type ProjectSource = {
	slug: string;
	frontmatter: ProjectFrontmatter;
	body: string;
};

// Build-time discovery: every ./projects/<slug>/PROJECT.md, imported raw. The
// top-level ./projects/README.md is intentionally not matched by the glob.
const files = import.meta.glob("./projects/*/PROJECT.md", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

/** Coerces a frontmatter scalar: booleans, numbers, inline [a, b] arrays. */
function parseValue(raw: string): string | number | boolean | string[] {
	const v = raw.trim();
	if (v === "true") return true;
	if (v === "false") return false;
	if (/^\[.*\]$/.test(v)) {
		return v
			.slice(1, -1)
			.split(",")
			.map((s) => s.trim().replace(/^["']|["']$/g, ""))
			.filter(Boolean);
	}
	if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
	return v.replace(/^["']|["']$/g, "");
}

/** Splits a PROJECT.md into its frontmatter object and markdown body. */
function parse(slug: string, raw: string): ProjectSource {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) {
		throw new Error(`projects/${slug}/PROJECT.md is missing frontmatter.`);
	}

	const frontmatter = Object.fromEntries(
		match[1]
			.split("\n")
			.filter((line) => line.includes(":"))
			.map((line) => {
				const i = line.indexOf(":");
				return [line.slice(0, i).trim(), parseValue(line.slice(i + 1))];
			})
	) as ProjectFrontmatter;

	if (!frontmatter.repo) {
		throw new Error(
			`projects/${slug}/PROJECT.md must declare a "repo: owner/name" in frontmatter.`
		);
	}

	return { slug, frontmatter, body: match[2].trim() };
}

// Parse once at module load. Slug = the folder name in the glob key.
const sources: ProjectSource[] = Object.entries(files)
	.map(([path, raw]) => {
		const slug = path.split("/").at(-2)!;
		return parse(slug, raw);
	})
	.filter((s) => !s.frontmatter.hidden);

/** Merges live repo data over the frontmatter cache into a card-ready project. */
async function merge(src: ProjectSource, repo: Repo | null): Promise<CuratedProject> {
	const { slug, frontmatter: fm, body } = src;
	const [owner, name] = fm.repo.split("/");

	// Language is curatable: linguist often mislabels hardware/embedded repos
	// (e.g. an HTML demo page), so an explicit frontmatter value wins.
	const language = fm.language ?? repo?.language ?? "—";
	// Top languages: curated override, then GitHub's breakdown. Always lead with
	// the primary language and keep it to the top 3, de-duped.
	const top = fm.languages ?? repo?.languages ?? [];
	const languages = [...new Set([language, ...top])]
		.filter((l) => l && l !== "—")
		.slice(0, 3);

	return {
		slug,
		// Curated fields win; volatile fields come from GitHub, then the cache.
		name: fm.title ?? repo?.name ?? name,
		description:
			fm.tagline ?? repo?.description ?? fm.description ?? "No description provided.",
		language,
		languages,
		stars: repo?.stars ?? fm.stars ?? 0,
		forks: repo?.forks ?? fm.forks ?? 0,
		url: repo?.url ?? `https://github.com/${owner}/${name}`,
		demo: fm.demo,
		cover: fm.cover,
		tags: fm.tags ?? [],
		writeup: fm.writeup,
		featured: fm.featured ?? false,
		bodyHtml: body ? await renderMarkdown(body) : undefined,
		live: repo !== null,
	};
}

/**
 * Looks up a project's repo and merges it, falling back to local frontmatter on
 * any lookup failure. Never throws — a bad repo just renders from its cache.
 */
async function hydrate(
	src: ProjectSource,
	fetchFn: typeof fetch,
	token?: string
): Promise<CuratedProject> {
	let repo: Repo | null = null;
	try {
		repo = await fetchRepo(src.frontmatter.repo, fetchFn, { token });
		if (repo === null) {
			// 404 ⇒ not a public repo. Honor the curation by warning, but still
			// render from the local cache rather than dropping it.
			console.warn(
				`[projects] ${src.slug}: "${src.frontmatter.repo}" is private or missing; using local fallback.`
			);
		}
	} catch (e) {
		console.warn(`[projects] ${src.slug}: GitHub lookup failed; using local fallback.`, e);
	}
	return merge(src, repo);
}

/** Featured first, then explicit `order` ascending, then by stars, then name. */
function sort(a: CuratedProject, b: CuratedProject, fm: Map<string, ProjectFrontmatter>): number {
	if (a.featured !== b.featured) return a.featured ? -1 : 1;
	const oa = fm.get(a.slug)?.order ?? Infinity;
	const ob = fm.get(b.slug)?.order ?? Infinity;
	if (oa !== ob) return oa - ob;
	if (a.stars !== b.stars) return b.stars - a.stars;
	return a.name.localeCompare(b.name);
}

/**
 * Resolves every curated project, hydrating each from GitHub and falling back
 * to local frontmatter per-project on any lookup failure. Pass the SvelteKit
 * `fetch` (for SSR dedup/caching) and an optional token (5000 vs 60 req/hr).
 * Never throws on a single bad repo — that project just renders from its cache.
 */
export async function getCuratedProjects(
	fetchFn: typeof fetch,
	token?: string
): Promise<CuratedProject[]> {
	const fmBySlug = new Map(sources.map((s) => [s.slug, s.frontmatter]));
	const projects = await Promise.all(sources.map((src) => hydrate(src, fetchFn, token)));
	return projects.sort((a, b) => sort(a, b, fmBySlug));
}

/**
 * Resolves a single curated project by slug (its folder name), or `undefined`
 * if no such folder exists. Backs the /projects/[slug] detail page.
 */
export async function getCuratedProject(
	slug: string,
	fetchFn: typeof fetch,
	token?: string
): Promise<CuratedProject | undefined> {
	const src = sources.find((s) => s.slug === slug);
	return src ? hydrate(src, fetchFn, token) : undefined;
}

/** Every known project slug — handy for prerender entries / sitemaps. */
export function projectSlugs(): string[] {
	return sources.map((s) => s.slug);
}

/**
 * The set of curated repos as lowercased "owner/name" slugs. Lets the projects
 * page drop these from the raw GitHub corpus so the Showcase and GitHub
 * sections don't double-list the same repo.
 */
export function curatedRepoSlugs(): Set<string> {
	return new Set(sources.map((s) => s.frontmatter.repo.toLowerCase()));
}

/** The curated projects flagged `featured`, for the landing/hero selection. */
export async function getFeaturedProjects(
	fetchFn: typeof fetch,
	token?: string
): Promise<CuratedProject[]> {
	return (await getCuratedProjects(fetchFn, token)).filter((p) => p.featured);
}
