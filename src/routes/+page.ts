import { renderMarkdown } from "$lib/content/markdown";
import { profilePageJsonLd } from "$lib/jsonld";
import readme from "../../README.md?raw";

// The README has a standalone `...` line that marks the boundary between the
// always-visible intro and the hidden "schizo ramblings" easter egg. Split on
// it so the page can render the intro normally and gate the rest behind a click
// on the ellipsis. If the marker ever goes missing, `rest` is empty and the
// whole README just renders as the intro.
const ELLIPSIS_MARKER = /^\.\.\.$/m;

export async function load() {
	const markerMatch = readme.match(ELLIPSIS_MARKER);
	const splitIndex = markerMatch?.index ?? readme.length;
	const intro = readme.slice(0, splitIndex).trimEnd();
	const rest = markerMatch
		? readme.slice(splitIndex + markerMatch[0].length).trimStart()
		: "";

	return {
		introHtml: await renderMarkdown(intro),
		restHtml: rest ? await renderMarkdown(rest) : "",
		jsonLd: profilePageJsonLd(),
	};
}
