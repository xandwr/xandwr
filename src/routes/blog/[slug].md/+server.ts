// Raw markdown for a single post, with frontmatter reconstructed, so an agent
// can ingest the source rather than parsing rendered HTML. Mirrors /blog/<slug>.

import { getBlogPost } from "$lib/content/blog";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ params }) => {
	const post = getBlogPost(params.slug);
	if (!post) error(404, "Blog post not found");

	const frontmatter = [
		"---",
		`title: ${post.title}`,
		`description: ${post.description}`,
		`published: ${post.published}`,
		`last-edited: ${post.lastEdited}`,
		"---",
		"",
	].join("\n");

	return new Response(frontmatter + post.content + "\n", {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
			"cache-control": "public, max-age=3600",
		},
	});
};
