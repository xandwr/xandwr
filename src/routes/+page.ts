import { getBlogPosts, renderMarkdown } from "$lib/content/blog";
import readme from "../../README.md?raw";

export async function load() {
	return {
		readmeHtml: await renderMarkdown(readme),
		posts: getBlogPosts().slice(0, 3),
	};
}
