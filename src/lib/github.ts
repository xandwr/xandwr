/**
 * Fetches public repositories for a GitHub user via the REST API.
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
	stars: number;
	forks: number;
	url: string;
}

/** Subset of the GitHub `/users/:user/repos` response we read. */
interface GithubRepo {
	name: string;
	description: string | null;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	html_url: string;
	fork: boolean;
	archived: boolean;
	pushed_at: string;
}

interface FetchOptions {
	/** Personal access token; raises the rate limit when present. */
	token?: string;
	/** Drop forks and archived repos from the result. Defaults to true. */
	excludeForks?: boolean;
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
function toRepo(r: GithubRepo): Repo {
	return {
		name: r.name,
		description: r.description ?? "No description provided.",
		language: r.language ?? "—",
		stars: r.stargazers_count,
		forks: r.forks_count,
		url: r.html_url,
	};
}

/**
 * Fetches a single repo by `owner/name` slug — the lookup behind the curated
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

	// A private or non-existent repo reads as 404 — the signal that a curated
	// PROJECT.md points at something that isn't a public repo.
	if (res.status === 404) return null;

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`GitHub API ${res.status} for "${slug}": ${body.slice(0, 200)}`);
	}

	return toRepo((await res.json()) as GithubRepo);
}

/**
 * Returns the user's public repos, most-recently-pushed first.
 * Throws on a non-OK response so the load function can surface the error.
 */
export async function fetchRepos(
	user: string,
	fetchFn: typeof fetch,
	{ token, excludeForks = true }: FetchOptions = {}
): Promise<Repo[]> {
	// per_page=100 grabs everything in one request for any realistic account.
	const res = await fetchFn(
		`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed`,
		{ headers: ghHeaders(token) }
	);

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`GitHub API ${res.status} for "${user}": ${body.slice(0, 200)}`);
	}

	const repos = (await res.json()) as GithubRepo[];

	return repos
		.filter((r) => (excludeForks ? !r.fork && !r.archived : true))
		.sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
		.map(toRepo);
}
