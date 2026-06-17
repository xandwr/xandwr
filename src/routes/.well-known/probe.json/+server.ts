// /.well-known/probe.json: a PROBE manifest (Provable Resource & Behavior
// Endpoints). See /.well-known/probe/SPEC.md for the full spec.
//
// Unlike a hand-written agent manifest, this is GENERATED from the same site
// facts every other machine surface uses, so it can't drift from what the site
// claims elsewhere. And unlike every other manifest, every entry here is a
// *testable assertion*: anyone can run the verifier
// (/.well-known/probe/verify.mjs) against this domain and independently confirm
//: or refute: each claim. One declaration, external proof.

import { site, abs } from "$lib/site";
import type { Assertion, Affordance } from "$lib/probe";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Assertion / Affordance types live in $lib/probe alongside the verification
// engine, so this manifest and the in-browser /probe checker share one
// definition and can't drift. An affordance is NOT a claim: it's a capability
// *derived* from assertions that pass: a verifier marks it `available` only
// while every id in `requires` is green, so a broken endpoint withdraws the
// affordance instead of falsely advertising it.

const assertions: Assertion[] = [
	{
		id: "llms-txt",
		describe: "An llms.txt site map is served as plain text and names the author",
		request: { path: "/llms.txt" },
		expect: [
			{ status: 200 },
			{ header: "content-type", contains: "text/plain" },
			{ body: "contains", value: site.author },
		],
	},
	{
		id: "resume-json",
		describe: "The resume is served as valid JSON Resume with a non-empty name",
		request: { path: "/resume.json" },
		expect: [
			{ status: 200 },
			{ header: "content-type", contains: "application/json" },
			{ json: "$.basics.name", type: "string", nonEmpty: true },
		],
	},
	{
		id: "resume-json-preset",
		describe: "The resume honors ?preset= and still returns valid JSON Resume",
		request: { path: "/resume.json?preset=software" },
		expect: [
			{ status: 200 },
			{ json: "$.basics.name", type: "string", nonEmpty: true },
		],
	},
	{
		id: "projects-json",
		describe: "Projects are a schema.org ItemList with at least one item",
		request: { path: "/projects.json" },
		expect: [
			{ status: 200 },
			{ header: "content-type", contains: "application/json" },
			{ json: "$.@type", equals: "ItemList" },
			{ json: "$.itemListElement", type: "array", minLength: 1 },
			{ json: "$.itemListElement[0].item.codeRepository", type: "string", nonEmpty: true },
		],
	},
	{
		id: "blog-json",
		describe: "The blog index is served as JSON",
		request: { path: "/blog.json" },
		expect: [
			{ status: 200 },
			{ header: "content-type", contains: "application/json" },
		],
	},
	{
		id: "sitemap",
		describe: "A sitemap is served as XML",
		request: { path: "/sitemap.xml" },
		expect: [
			{ status: 200 },
			{ header: "content-type", contains: "xml" },
			{ body: "contains", value: "<urlset" },
		],
	},
	{
		id: "feed",
		describe: "An RSS feed is served as XML",
		request: { path: "/blog/feed.xml" },
		expect: [
			{ status: 200 },
			{ header: "content-type", contains: "xml" },
		],
	},
	{
		id: "probe-self",
		describe: "This very manifest is served as JSON and declares the PROBE version",
		request: { path: "/.well-known/probe.json" },
		expect: [
			{ status: 200 },
			{ header: "content-type", contains: "application/json" },
			{ json: "$.probe", type: "string", nonEmpty: true },
		],
	},
];

const affordances: Affordance[] = [
	{
		id: "fetch-resume",
		describe: "Retrieve a structured résumé in JSON Resume (jsonresume.org) format, optionally tailored to a role.",
		requires: ["resume-json", "resume-json-preset"],
		via: { method: "GET", path: "/resume.json", params: { preset: "software | embedded | it | content" } },
		returns: "application/json (jsonresume.org schema)",
	},
	{
		id: "list-projects",
		describe: "Enumerate the author's live source projects as schema.org SoftwareSourceCode.",
		requires: ["projects-json"],
		via: { method: "GET", path: "/projects.json" },
		returns: "application/json (schema.org ItemList)",
	},
	{
		id: "read-writing",
		describe: "Discover blog posts and fetch their raw markdown for ingestion.",
		requires: ["blog-json", "feed"],
		via: { method: "GET", path: "/blog.json" },
		returns: "application/json (post metadata + links to raw markdown)",
	},
	{
		id: "site-map-for-llms",
		describe: "Get a concise, link-rich map of the entire site written for LLMs.",
		requires: ["llms-txt"],
		via: { method: "GET", path: "/llms.txt" },
		returns: "text/plain (llmstxt.org)",
	},
	{
		id: "self-verify",
		describe: "Independently confirm every capability on this domain by re-running this manifest's assertions.",
		requires: ["probe-self"],
		via: { method: "GET", path: "/.well-known/probe.json" },
		returns: "application/json (this PROBE manifest)",
	},
];

export const GET: RequestHandler = ({ url }) => {
	// `generated` would normally be a build timestamp; we use the request's own
	// origin so the manifest is correct whether served from prod or a preview.
	const subject = `${url.protocol}//${url.host}`;

	return json(
		{
			probe: "0.1",
			subject: subject === site.url ? site.url : subject,
			spec: abs("/.well-known/probe/SPEC.md"),
			verifier: abs("/.well-known/probe/verify.mjs"),
			assertions,
			affordances,
		},
		{
			headers: {
				"cache-control": "public, max-age=600",
				// Belt-and-suspenders: some hosts special-case dotfile paths.
				"x-probe-version": "0.1",
			},
		},
	);
};
