// One-time helper to mint a Spotify refresh token for the "Now Playing" widget.
//
// The now-playing endpoint needs a *user* token, which requires an interactive
// OAuth consent. This script does that dance once: it spins up a throwaway
// localhost server, opens the Spotify consent page, catches the redirect, and
// trades the authorization code for a refresh token: which it prints for you
// to stash as a Cloudflare secret. After that the Worker mints short-lived
// access tokens from the refresh token with no further logins.
//
// Usage:
//   1. In the Spotify dashboard (https://developer.spotify.com/dashboard) for
//      your app, add this exact Redirect URI:
//          http://127.0.0.1:8888/callback
//   2. Run with your client credentials (the same ones in wrangler secrets):
//          SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-auth.mjs
//   3. Approve in the browser. The refresh token prints to the terminal.
//   4. Save it:  wrangler secret put SPOTIFY_REFRESH_TOKEN

import { createServer } from "node:http";
import { exec } from "node:child_process";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
	console.error(
		"Missing SPOTIFY_CLIENT_ID and/or SPOTIFY_CLIENT_SECRET in the environment.\n" +
			"Run: SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-auth.mjs",
	);
	process.exit(1);
}

// 127.0.0.1 (not "localhost") because Spotify requires an explicit loopback IP
// in the redirect URI for new apps. This must match the dashboard exactly.
const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;

// Only what the widget reads: the current track and the recently-played
// fallback. Nothing that can modify the account.
const SCOPES = ["user-read-currently-playing", "user-read-recently-played"].join(" ");

const authorizeUrl =
	"https://accounts.spotify.com/authorize?" +
	new URLSearchParams({
		response_type: "code",
		client_id: CLIENT_ID,
		scope: SCOPES,
		redirect_uri: REDIRECT_URI,
	}).toString();

/** Best-effort cross-platform "open this URL in the browser". */
function openBrowser(url) {
	const cmd =
		process.platform === "darwin"
			? "open"
			: process.platform === "win32"
				? "start"
				: "xdg-open";
	exec(`${cmd} "${url}"`, (err) => {
		if (err) {
			console.log("\nCouldn't open a browser automatically. Visit this URL:\n");
			console.log(url + "\n");
		}
	});
}

/** Trades the authorization code for tokens at the Spotify token endpoint. */
async function exchangeCode(code) {
	const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
	const res = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			Authorization: `Basic ${basic}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "authorization_code",
			code,
			redirect_uri: REDIRECT_URI,
		}),
	});
	if (!res.ok) {
		throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
	}
	return res.json();
}

const server = createServer(async (req, res) => {
	const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
	if (url.pathname !== "/callback") {
		res.writeHead(404).end();
		return;
	}

	const error = url.searchParams.get("error");
	if (error) {
		res.writeHead(400, { "Content-Type": "text/plain" }).end(`Authorization denied: ${error}`);
		console.error(`\nAuthorization denied: ${error}`);
		server.close();
		process.exit(1);
	}

	const code = url.searchParams.get("code");
	if (!code) {
		res.writeHead(400, { "Content-Type": "text/plain" }).end("No code in callback.");
		return;
	}

	try {
		const tokens = await exchangeCode(code);
		res.writeHead(200, { "Content-Type": "text/html" }).end(
			"<h1>Done.</h1><p>Refresh token printed to your terminal. You can close this tab.</p>",
		);
		console.log("\n✅ Success. Your refresh token:\n");
		console.log(tokens.refresh_token + "\n");
		console.log("Save it with:\n  wrangler secret put SPOTIFY_REFRESH_TOKEN");
		console.log("(and add it to your local .env for `vite dev`)\n");
	} catch (e) {
		res.writeHead(500, { "Content-Type": "text/plain" }).end(String(e));
		console.error("\n" + String(e));
	} finally {
		server.close();
	}
});

server.listen(PORT, () => {
	console.log(`Listening on ${REDIRECT_URI}`);
	console.log("Opening the Spotify consent page…\n");
	openBrowser(authorizeUrl);
});
