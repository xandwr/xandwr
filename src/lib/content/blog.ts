import { marked } from "marked";

import piFromMyBirthday from "./blog/pi-from-my-birthday.md?raw";

type BlogFrontmatter = {
	title: string;
	description: string;
	published: string;
	"last-edited"?: string;
};

export type BlogPostSummary = {
	slug: string;
	title: string;
	description: string;
	published: string;
	lastEdited: string;
};

export type BlogPost = BlogPostSummary & {
	content: string;
	html: string;
};

const postSources = [
	{
		slug: "pi-from-my-birthday",
		raw: piFromMyBirthday,
	},
];

marked.use({
	gfm: true,
});

function parseFrontmatter(raw: string): {
	frontmatter: BlogFrontmatter;
	content: string;
} {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

	if (!match) {
		throw new Error("Blog post is missing frontmatter.");
	}

	const values = Object.fromEntries(
		match[1].split("\n").map((line) => {
			const separatorIndex = line.indexOf(":");
			const key = line.slice(0, separatorIndex).trim();
			const value = line.slice(separatorIndex + 1).trim();

			return [key, value];
		}),
	) as BlogFrontmatter;

	return {
		frontmatter: values,
		content: match[2].trim(),
	};
}

function parsePost(source: (typeof postSources)[number]): BlogPost {
	const { frontmatter, content } = parseFrontmatter(source.raw);

	return {
		slug: source.slug,
		title: frontmatter.title,
		description: frontmatter.description,
		published: frontmatter.published,
		lastEdited: frontmatter["last-edited"] ?? frontmatter.published,
		content,
		html: marked.parse(content, { async: false }),
	};
}

const posts = postSources
	.map(parsePost)
	.sort((a, b) => b.published.localeCompare(a.published));

export function getBlogPosts(): BlogPostSummary[] {
	return posts.map(({ content, html, ...summary }) => summary);
}

export function getBlogPost(slug: string): BlogPost | undefined {
	return posts.find((post) => post.slug === slug);
}
