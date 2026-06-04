// XML sitemap covering the human pages and the machine endpoints, so crawlers
// discover the JSON/markdown/llms surfaces alongside the rendered pages.

import { getBlogPosts } from "$lib/content/blog";
import { projectSlugs } from "$lib/content/projects";
import { abs } from "$lib/site";
import type { RequestHandler } from "./$types";

const xmlEscape = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: RequestHandler = () => {
	const posts = getBlogPosts();

	const urls: { loc: string; lastmod?: string }[] = [
		{ loc: abs("/") },
		{ loc: abs("/projects") },
		{ loc: abs("/blog") },
		{ loc: abs("/resume") },
		{ loc: abs("/wall") },
		// Machine-readable surfaces.
		{ loc: abs("/llms.txt") },
		{ loc: abs("/llms-full.txt") },
		{ loc: abs("/resume.json") },
		{ loc: abs("/projects.json") },
		{ loc: abs("/blog.json") },
		// Curated project detail pages.
		...projectSlugs().map((slug) => ({ loc: abs(`/projects/${slug}`) })),
		...posts.flatMap((p) => [
			{ loc: abs(`/blog/${p.slug}`), lastmod: p.lastEdited },
			{ loc: abs(`/blog/${p.slug}.md`), lastmod: p.lastEdited },
		]),
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) =>
			`  <url><loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`,
	)
	.join("\n")}
</urlset>
`;

	return new Response(body, {
		headers: {
			"content-type": "application/xml; charset=utf-8",
			"cache-control": "public, max-age=3600",
		},
	});
};
