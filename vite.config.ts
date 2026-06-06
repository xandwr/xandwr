import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { buildSkillsIndex } from './scripts/build-skills-index.mjs';

// Regenerate the agent-skills discovery index from the SKILL.md files before
// every dev/build. The index — including the sha256 digests that `npx skills`
// verifies — is a derived artifact, so it can never go stale relative to the
// skills on disk.
function skillsIndexPlugin() {
	return {
		name: 'skills-index',
		buildStart() {
			const n = buildSkillsIndex();
			this.info?.(`regenerated .well-known/skills/index.json (${n} skill${n === 1 ? '' : 's'})`);
		}
	};
}

export default defineConfig({
	plugins: [skillsIndexPlugin(), sveltekit(), tailwindcss()]
});
