/**
 * Fetches the user's currently-playing (or last-played) Spotify track.
 *
 * Intended to be called from a server endpoint: it reads the app credentials
 * plus a long-lived refresh token (minted once via scripts/spotify-auth.mjs),
 * exchanges the refresh token for a short-lived access token, then reads the
 * now-playing endpoint — falling back to recently-played when nothing is on.
 *
 * Every failure path degrades to `null` rather than throwing, so a Spotify
 * outage or a revoked token quietly hides the widget instead of breaking the
 * page that renders it.
 */

/** The trimmed-down track shape the widget actually renders. */
export interface NowPlaying {
	/** True when this is the live current track; false when it's the fallback. */
	isPlaying: boolean;
	title: string;
	artist: string;
	album: string;
	/** Album art URL (Spotify's mid-size image), or null if unavailable. */
	albumArt: string | null;
	/** Open-in-Spotify URL for the track. */
	url: string;
}

/** App credentials + the one-time-minted refresh token. */
export interface SpotifyCreds {
	clientId: string;
	clientSecret: string;
	refreshToken: string;
}

/** Subset of a Spotify track object we read. */
interface SpotifyTrack {
	name: string;
	artists: { name: string }[];
	album: { name: string; images: { url: string; width: number }[] };
	external_urls: { spotify: string };
}

/** Picks the artwork closest to ~300px, falling back to the first image. */
function pickArt(images: { url: string; width: number }[]): string | null {
	if (!images?.length) return null;
	const mid = images.find((i) => i.width <= 300) ?? images[0];
	return mid.url;
}

/** Maps a raw Spotify track to the trimmed shape the widget renders. */
function toNowPlaying(track: SpotifyTrack, isPlaying: boolean): NowPlaying {
	return {
		isPlaying,
		title: track.name,
		artist: track.artists.map((a) => a.name).join(", "),
		album: track.album.name,
		albumArt: pickArt(track.album.images),
		url: track.external_urls.spotify,
	};
}

/**
 * Exchanges the refresh token for a short-lived access token. Throws on a
 * non-OK response so the caller can degrade to `null`. The access token is
 * only used for the single request that follows, so there's nothing to cache.
 */
async function getAccessToken(fetchFn: typeof fetch, creds: SpotifyCreds): Promise<string> {
	// btoa is a Web API available in Workers — no Node Buffer needed.
	const basic = btoa(`${creds.clientId}:${creds.clientSecret}`);
	const res = await fetchFn("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			Authorization: `Basic ${basic}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: creds.refreshToken,
		}),
	});
	if (!res.ok) {
		throw new Error(`Spotify token exchange ${res.status}: ${(await res.text()).slice(0, 200)}`);
	}
	const { access_token } = (await res.json()) as { access_token: string };
	return access_token;
}

/** Reads the live current track. Returns null on 204 (nothing playing). */
async function fetchCurrent(fetchFn: typeof fetch, accessToken: string): Promise<NowPlaying | null> {
	const res = await fetchFn("https://api.spotify.com/v1/me/player/currently-playing", {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	// 204 No Content = nothing currently playing; 200 with is_playing:false can
	// also mean paused — treat both as "not live" and let the caller fall back.
	if (res.status === 204 || !res.ok) return null;
	const body = (await res.json()) as { is_playing: boolean; item: SpotifyTrack | null };
	if (!body.item || !body.is_playing) return null;
	return toNowPlaying(body.item, true);
}

/** Reads the most-recently-played track as the idle fallback. */
async function fetchRecent(fetchFn: typeof fetch, accessToken: string): Promise<NowPlaying | null> {
	const res = await fetchFn("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) return null;
	const body = (await res.json()) as { items: { track: SpotifyTrack }[] };
	const track = body.items?.[0]?.track;
	return track ? toNowPlaying(track, false) : null;
}

/**
 * Returns the current track (or, when nothing is playing, the last one).
 * Degrades to `null` on any failure so the widget can simply hide itself.
 */
export async function fetchNowPlaying(
	fetchFn: typeof fetch,
	creds: SpotifyCreds
): Promise<NowPlaying | null> {
	try {
		const accessToken = await getAccessToken(fetchFn, creds);
		return (await fetchCurrent(fetchFn, accessToken)) ?? (await fetchRecent(fetchFn, accessToken));
	} catch (e) {
		console.warn("[spotify] now-playing fetch failed; hiding widget.", e);
		return null;
	}
}
