// The site's shared markdown engine: `marked` (gfm) + Shiki highlighting,
// wired once at module load. Used anywhere a markdown string needs rendering
// to HTML (the homepage README, project bodies, skill bodies).

import { marked } from "marked";
import markedShiki from "marked-shiki";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

import githubDark from "shiki/themes/github-dark.mjs";
import python from "shiki/langs/python.mjs";
import typescript from "shiki/langs/typescript.mjs";
import javascript from "shiki/langs/javascript.mjs";
import bash from "shiki/langs/bash.mjs";
import json from "shiki/langs/json.mjs";
import html from "shiki/langs/html.mjs";
import css from "shiki/langs/css.mjs";

// Use Shiki's core API with the JavaScript RegExp engine instead of the
// default WASM (Oniguruma) engine: Cloudflare Workers disallow runtime
// WebAssembly.instantiate, which crashes the WASM engine on every render.
// Themes and languages are imported statically so nothing loads at runtime.
const highlighter = await createHighlighterCore({
	themes: [githubDark],
	langs: [python, typescript, javascript, bash, json, html, css],
	engine: createJavaScriptRegexEngine(),
});

marked.use({ gfm: true });

marked.use(
	markedShiki({
		highlight(code, lang) {
			const language = highlighter.getLoadedLanguages().includes(lang as never)
				? lang
				: "text";

			return highlighter.codeToHtml(code, { lang: language, theme: "github-dark" });
		},
	}),
);

/** Renders a markdown string to HTML via the shared gfm + Shiki pipeline. */
export async function renderMarkdown(markdown: string): Promise<string> {
	return marked.parse(markdown);
}
