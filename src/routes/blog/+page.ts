import { getBlogPosts } from "$lib/content/blog";
import { blogJsonLd } from "$lib/jsonld";

export function load() {
	const posts = getBlogPosts();
	return {
		posts,
		jsonLd: blogJsonLd(posts),
	};
}
