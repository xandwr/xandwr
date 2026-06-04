// Machine-readable blog index: post metadata plus absolute links to each
// post's HTML page and its raw markdown (.md) endpoint.

import { getBlogPosts } from "$lib/content/blog";
import { abs } from "$lib/site";
import { blogJsonLd } from "$lib/jsonld";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () => {
	const posts = getBlogPosts();

	return json(
		{
			...blogJsonLd(posts),
			posts: posts.map((post) => ({
				...post,
				url: abs(`/blog/${post.slug}`),
				markdown: abs(`/blog/${post.slug}.md`),
			})),
		},
		{ headers: { "cache-control": "public, max-age=3600" } },
	);
};
