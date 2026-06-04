// RSS 2.0 feed for the blog. Includes the fully-rendered HTML of each post in
// <content:encoded> so a reader (or agent) gets the whole post, not just a blurb.

import { getBlogPosts, getBlogPost } from "$lib/content/blog";
import { site, abs } from "$lib/site";
import type { RequestHandler } from "./$types";

const xmlEscape = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** YYYY-MM-DD -> RFC-822 date string required by RSS. */
const rfc822 = (date: string) => new Date(`${date}T00:00:00Z`).toUTCString();

export const GET: RequestHandler = () => {
	const items = getBlogPosts()
		.map((summary) => getBlogPost(summary.slug))
		.filter((p): p is NonNullable<typeof p> => Boolean(p));

	const lastBuild = items[0]?.lastEdited ?? items[0]?.published;

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(site.author)} — blog</title>
    <link>${abs("/blog")}</link>
    <description>${xmlEscape(site.tagline)}</description>
    <language>en</language>
    <atom:link href="${abs("/blog/feed.xml")}" rel="self" type="application/rss+xml" />
${lastBuild ? `    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>` : ""}
${items
	.map(
		(post) => `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${abs(`/blog/${post.slug}`)}</link>
      <guid isPermaLink="true">${abs(`/blog/${post.slug}`)}</guid>
      <pubDate>${rfc822(post.published)}</pubDate>
      <description>${xmlEscape(post.description)}</description>
      <content:encoded><![CDATA[${post.html}]]></content:encoded>
    </item>`,
	)
	.join("\n")}
  </channel>
</rss>
`;

	return new Response(body, {
		headers: {
			"content-type": "application/rss+xml; charset=utf-8",
			"cache-control": "public, max-age=3600",
		},
	});
};
