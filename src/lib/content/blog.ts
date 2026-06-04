import { marked } from "marked";
import markedShiki from "marked-shiki";
import { createHighlighter } from "shiki";

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

const highlighter = await createHighlighter({
	themes: ["github-dark"],
	langs: ["python", "typescript", "javascript", "bash", "json", "html", "css"],
});

marked.use({
	gfm: true,
});

marked.use(
	markedShiki({
		highlight(code, lang) {
			const language = highlighter
				.getLoadedLanguages()
				.includes(lang as never)
				? lang
				: "text";

			return highlighter.codeToHtml(code, {
				lang: language,
				theme: "github-dark",
			});
		},
	}),
);

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

async function parsePost(
	source: (typeof postSources)[number],
): Promise<BlogPost> {
	const { frontmatter, content } = parseFrontmatter(source.raw);

	return {
		slug: source.slug,
		title: frontmatter.title,
		description: frontmatter.description,
		published: frontmatter.published,
		lastEdited: frontmatter["last-edited"] ?? frontmatter.published,
		content,
		html: await marked.parse(content),
	};
}

const posts = (await Promise.all(postSources.map(parsePost))).sort((a, b) =>
	b.published.localeCompare(a.published),
);

export function getBlogPosts(): BlogPostSummary[] {
	return posts.map(({ content, html, ...summary }) => summary);
}

export function getBlogPost(slug: string): BlogPost | undefined {
	return posts.find((post) => post.slug === slug);
}
