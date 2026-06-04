import { getBlogPosts } from "$lib/content/blog";

export function load() {
	return {
		posts: getBlogPosts(),
	};
}
