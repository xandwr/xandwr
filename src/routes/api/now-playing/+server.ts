import { env } from "$env/dynamic/private";
import { fetchNowPlaying } from "$lib/spotify";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * Returns the current (or last-played) Spotify track for the landing-page
 * widget, which polls this every ~25s. A short edge cache means Cloudflare
 * absorbs the polling traffic and we hit Spotify at most a few times a minute
 * regardless of visitor count.
 *
 * Returns `{ nowPlaying: null }` whenever credentials are missing or any
 * Spotify call fails: the widget treats that as "hide myself".
 */
export const GET: RequestHandler = async ({ fetch }) => {
	const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = env;

	const nowPlaying =
		SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET && SPOTIFY_REFRESH_TOKEN
			? await fetchNowPlaying(fetch, {
					clientId: SPOTIFY_CLIENT_ID,
					clientSecret: SPOTIFY_CLIENT_SECRET,
					refreshToken: SPOTIFY_REFRESH_TOKEN,
				})
			: null;

	return json(
		{ nowPlaying },
		{
			headers: {
				// Cache at the edge for 20s; serve slightly-stale for another 20s
				// while revalidating so visitors never wait on a Spotify round-trip.
				"Cache-Control": "public, max-age=20, stale-while-revalidate=20",
			},
		}
	);
};
