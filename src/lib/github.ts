/**
 * Fetches a single public repository by `owner/name` via the GitHub REST API.
 *
 * Intended to be called from a server load function: it reads an optional
 * GITHUB_TOKEN (raising the rate limit from 60 to 5000 req/hr) and passes the
 * SvelteKit `fetch` so the request participates in SSR caching/dedup.
 */

/** The trimmed-down repo shape the project cards actually render. */
export interface Repo {
	name: string;
	description: string;
	language: string;
	/** Up to the top 3 languages by bytes, most-used first. May be empty. */
	languages: string[];
	stars: number;
	forks: number;
	url: string;
}

/** Subset of the GitHub `/repos/:owner/:name` response we read. */
interface GithubRepo {
	name: string;
	description: string | null;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	html_url: string;
}

/** Shared request headers for the GitHub REST API. */
function ghHeaders(token?: string): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		// GitHub rejects API requests without a User-Agent (403 "Request
		// forbidden by administrative rules"). Cloudflare Workers don't set a
		// default one, so we must provide it explicitly.
		"User-Agent": "xandwr.com",
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

/** Maps a raw GitHub repo payload to the trimmed shape the UI renders. */
function toRepo(r: GithubRepo, languages: string[] = []): Repo {
	return {
		name: r.name,
		description: r.description ?? "No description provided.",
		language: r.language ?? "—",
		languages,
		stars: r.stargazers_count,
		forks: r.forks_count,
		url: r.html_url,
	};
}

/**
 * Fetches the language breakdown for a repo and returns the top 3 by bytes,
 * most-used first. The `/languages` endpoint returns a `{ name: bytes }` map.
 * Failures (rate limit, network) degrade to an empty list: the card still
 * renders its primary `language`, so this is best-effort enrichment only.
 */
async function fetchLanguages(
	owner: string,
	name: string,
	fetchFn: typeof fetch,
	token?: string
): Promise<string[]> {
	try {
		const res = await fetchFn(
			`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/languages`,
			{ headers: ghHeaders(token) }
		);
		if (!res.ok) return [];
		const byBytes = (await res.json()) as Record<string, number>;
		return Object.entries(byBytes)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([lang]) => lang);
	} catch {
		return [];
	}
}

/**
 * Fetches a single repo by `owner/name` slug: the lookup behind the curated
 * projects page. Returns `null` when the repo is missing or private (404), so
 * callers can fall back to locally-cached frontmatter; throws on other
 * non-OK responses (e.g. a 403 rate-limit) so they can be surfaced/cached.
 */
export async function fetchRepo(
	slug: string,
	fetchFn: typeof fetch,
	{ token }: { token?: string } = {}
): Promise<Repo | null> {
	const [owner, name] = slug.split("/");
	if (!owner || !name) {
		throw new Error(`Invalid repo slug "${slug}" (expected "owner/name").`);
	}

	const res = await fetchFn(
		`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
		{ headers: ghHeaders(token) }
	);

	// A private or non-existent repo reads as 404: the signal that a curated
	// PROJECT.md points at something that isn't a public repo.
	if (res.status === 404) return null;

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`GitHub API ${res.status} for "${slug}": ${body.slice(0, 200)}`);
	}

	const languages = await fetchLanguages(owner, name, fetchFn, token);
	return toRepo((await res.json()) as GithubRepo, languages);
}

/** A single recently-pushed repo, for the landing "currently pushing" strip. */
export interface ActiveRepo {
	name: string;
	url: string;
	/** ISO timestamp of the last push, for computing "last shipped Nd ago". */
	pushedAt: string;
}

/** The landing strip's payload: the freshest repos, newest push first. */
export interface RecentActivity {
	repos: ActiveRepo[];
	/** ISO timestamp of the single most recent push across all repos. */
	lastPushedAt: string;
}

/** Subset of the GitHub `/users/:user/repos` response we read. */
interface GithubUserRepo {
	name: string;
	html_url: string;
	pushed_at: string;
	fork: boolean;
	private: boolean;
}

/**
 * Fetches a user's most recently *pushed* public, non-fork repos: the live
 * signal behind the landing "currently pushing" strip. Sorted newest-first by
 * GitHub, we trim to `limit` and surface the freshest push timestamp.
 *
 * Best-effort: any failure (rate limit, network, non-OK) returns `null` so the
 * caller can render nothing rather than break the page. Never throws.
 */
export async function fetchRecentActivity(
	user: string,
	fetchFn: typeof fetch,
	{
		token,
		limit = 3,
		exclude = [],
	}: { token?: string; limit?: number; exclude?: string[] } = {}
): Promise<RecentActivity | null> {
	try {
		const res = await fetchFn(
			`https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=pushed&direction=desc&type=owner&per_page=30`,
			{ headers: ghHeaders(token) }
		);
		if (!res.ok) return null;

		// Case-insensitive name denylist (e.g. this site's own repo).
		const denied = new Set(exclude.map((n) => n.toLowerCase()));
		const repos = ((await res.json()) as GithubUserRepo[])
			.filter((r) => !r.fork && !r.private && !denied.has(r.name.toLowerCase()))
			.slice(0, limit)
			.map((r) => ({ name: r.name, url: r.html_url, pushedAt: r.pushed_at }));

		if (repos.length === 0) return null;
		return { repos, lastPushedAt: repos[0].pushedAt };
	} catch {
		return null;
	}
}
