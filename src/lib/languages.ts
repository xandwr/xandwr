import languageColors from "github-language-colors/colors.json";

const colors = languageColors as Record<string, string>;

/**
 * GitHub language names that don't map cleanly to a Devicon slug by
 * lowercasing. Everything not listed here falls back to the normalizer below.
 */
const deviconOverrides: Record<string, string> = {
	"c++": "cplusplus",
	"c#": "csharp",
	"f#": "fsharp",
	"objective-c": "objectivec",
	"objective-c++": "objectivec",
	shell: "bash",
	"jupyter notebook": "jupyter",
	vue: "vuejs",
	html: "html5",
	css: "css3",
	scss: "sass",
	sass: "sass",
	dockerfile: "docker",
	nix: "nixos",
	"vim script": "vim",
	tex: "latex",
	"emacs lisp": "emacs",
};

/** Devicon slug for a GitHub language, or null when there's no known icon. */
export function languageIcon(language: string | null | undefined): string | null {
	if (!language) return null;
	const key = language.toLowerCase();
	if (key in deviconOverrides) return deviconOverrides[key];
	// Devicon slugs are alphanumeric and lowercase (e.g. "go", "rust").
	const slug = key.replace(/[^a-z0-9]/g, "");
	return slug.length > 0 ? slug : null;
}

/** Linguist color for a GitHub language, or a neutral fallback. */
export function languageColor(language: string | null | undefined): string {
	if (!language) return "#8b949e";
	return colors[language] ?? "#8b949e";
}
