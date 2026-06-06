#!/usr/bin/env node
// Builds static/.well-known/skills/index.json (agentskills.io discovery v0.2.0)
// from the SKILL.md files on disk, recomputing each sha256 digest — which
// `npx skills` verifies on fetch — from the exact file bytes.
//
// The index is a DERIVED artifact: a vite plugin (see vite.config.ts) runs
// buildSkillsIndex() at the start of every dev/build, so the served index can
// never drift from the SKILL.md files. This file also works standalone:
//
//   node scripts/build-skills-index.mjs
//
// Each skill lives at static/.well-known/skills/<name>/SKILL.md and must have
// YAML frontmatter with `name` and `description`.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const skillsDir = join(root, 'static', '.well-known', 'skills');
const indexPath = join(skillsDir, 'index.json');

const SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';

function parseFrontmatter(text) {
	const m = text.match(/^---\n([\s\S]*?)\n---/);
	if (!m) return {};
	const data = {};
	for (const line of m[1].split('\n')) {
		const i = line.indexOf(':');
		if (i === -1) continue;
		const key = line.slice(0, i).trim();
		let val = line.slice(i + 1).trim();
		val = val.replace(/^["']|["']$/g, '');
		data[key] = val;
	}
	return data;
}

// Compute the discovery index from the SKILL.md files on disk and return it as
// a formatted JSON string (trailing newline included).
export function renderSkillsIndex() {
	const skills = [];
	for (const name of readdirSync(skillsDir).sort()) {
		const skillMd = join(skillsDir, name, 'SKILL.md');
		let bytes;
		try {
			if (!statSync(skillMd).isFile()) continue;
			bytes = readFileSync(skillMd);
		} catch {
			continue;
		}
		const fm = parseFrontmatter(bytes.toString('utf8'));
		if (!fm.name || !fm.description) {
			console.warn(`[skills] skip ${name}: SKILL.md missing name/description frontmatter`);
			continue;
		}
		skills.push({
			name: fm.name,
			description: fm.description,
			type: 'skill-md',
			url: `./${name}/SKILL.md`,
			digest: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
		});
	}
	return JSON.stringify({ $schema: SCHEMA, skills }, null, 2) + '\n';
}

// Regenerate index.json on disk. Returns the number of skills written.
export function buildSkillsIndex() {
	const json = renderSkillsIndex();
	writeFileSync(indexPath, json);
	return JSON.parse(json).skills.length;
}

// Run directly: `node scripts/build-skills-index.mjs`
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
	const n = buildSkillsIndex();
	console.log(`wrote ${indexPath} (${n} skill${n === 1 ? '' : 's'})`);
}
