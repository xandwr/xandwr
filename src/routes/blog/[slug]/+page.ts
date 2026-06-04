import { getBlogPost } from "$lib/content/blog";
import { blogPostingJsonLd } from "$lib/jsonld";
import { error } from "@sveltejs/kit";

export function load({ params }) {
	const post = getBlogPost(params.slug);

	if (!post) {
		error(404, "Blog post not found");
	}

	return {
		post,
		jsonLd: blogPostingJsonLd(post),
	};
}
