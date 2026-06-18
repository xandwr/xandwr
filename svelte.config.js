import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Deployed to Cloudflare Workers. See wrangler.jsonc for the Worker name,
		// static-assets binding, and the xandwr.com route.
		adapter: adapter(),
		prerender: {
			// Project card bodies are rendered from each repo's README, which
			// routinely carries repo-relative links (e.g. `(LICENSE-APACHE)`).
			// The crawler resolves those against /projects/<slug>/ and 404s. Warn
			// on those instead of failing the build, but keep every other broken
			// internal link fatal so a genuinely dead route still surfaces.
			handleHttpError: ({ path, referrer, message }) => {
				if (referrer?.startsWith('/projects/') && path.startsWith('/projects/')) {
					console.warn(`[prerender] ignored repo-relative link: ${message}`);
					return;
				}
				throw new Error(message);
			}
		}
	}
};

export default config;
