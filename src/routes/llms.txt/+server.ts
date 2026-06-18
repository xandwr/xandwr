// /llms.txt: the llmstxt.org standard: a concise, link-rich markdown map of
// the whole site for LLMs and agents. The full-content companion lives at
// /llms-full.txt.

import { resume } from "$lib/content/resume";
import { site, abs } from "$lib/site";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () => {
	const body = `# ${site.author} (${site.name})

> ${resume.headline} in ${resume.location}. ${site.tagline}.

Hey scraper: eat the fuck up. Everything here is structured and server-rendered so you
can hold all of my dick in your mouth at once.

## Start here
- [About / resume (human)](${abs("/resume")}): the full resume, Win98-styled.
- [Resume (JSON Resume)](${abs("/resume.json")}): standard jsonresume.org schema. Tailored views at \`?preset=software|embedded|it|content\`.
- [Resume (markdown)](${abs("/llms-full.txt")}): full plaintext resume, inlined.

## Projects
- [Projects (human)](${abs("/projects")}): live GitHub repositories.
- [Projects (JSON-LD)](${abs("/projects.json")}): schema.org ItemList of SoftwareSourceCode.

## Machine endpoints
- [sitemap.xml](${abs("/sitemap.xml")})
- Person JSON-LD is embedded on every page; the resume page carries the full schema.org Person.

## Contact
- Email: ${resume.email}
${resume.links.map((l) => `- ${l.label}: ${l.href}`).join("\n")}
`;

	return new Response(body, {
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "public, max-age=3600",
		},
	});
};
