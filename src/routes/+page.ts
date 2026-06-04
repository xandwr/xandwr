import { getBlogPosts } from "$lib/content/blog";

export function load() {
	return {
		posts: getBlogPosts().slice(0, 3),
	};
}
