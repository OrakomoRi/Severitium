#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');

function run(cmd) {
	return execSync(cmd, { encoding: 'utf8' }).trim();
}

function latestTag() {
	try {
		return run('git describe --tags --abbrev=0');
	} catch {
		return null;
	}
}

function lsFiles(ref, prefix) {
	try {
		const out = run(`git ls-tree -r --name-only ${ref} -- ${prefix}`);
		return out ? out.split('\n').filter(Boolean) : [];
	} catch {
		return [];
	}
}

function matchedKeys(files, re, keyFn) {
	const keys = new Set();
	for (const f of files) {
		const m = f.match(re);
		if (m) keys.add(keyFn(m));
	}
	return keys;
}

function classify(key, fromSet, toSet) {
	if (!fromSet.has(key) && toSet.has(key)) return 'Added';
	if (fromSet.has(key) && !toSet.has(key)) return 'Removed';
	return 'Changed';
}

const positional = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags = new Set(process.argv.slice(2).filter(a => a.startsWith('--')));
const withLibs = flags.has('--with-libs');

const from = positional[0] ?? latestTag();
const to = positional[1] ?? 'HEAD';

if (!from) {
	console.error('No tags found and no [from] argument provided.');
	process.exit(1);
}

const range = `${from}..${to}`;
console.error(`Scanning: ${range}\n`);

const rawDiff = run(`git diff --name-status ${range}`);
if (!rawDiff) {
	console.error('No changed files found.');
	process.exit(0);
}

const MODULE_RE = /^src\/modules\/([^/]+)\/([^/]+)\//;
const LIB_RE = /^src\/libs\/modules\/([^/]+)\//;

const fromFiles = lsFiles(from, 'src/');
const toFiles = lsFiles(to, 'src/');

const fromModules = matchedKeys(fromFiles, MODULE_RE, m => `${m[1]}/${m[2]}`);
const toModules = matchedKeys(toFiles, MODULE_RE, m => `${m[1]}/${m[2]}`);
const fromLibs = matchedKeys(fromFiles, LIB_RE, m => m[1]);
const toLibs = matchedKeys(toFiles, LIB_RE, m => m[1]);

const touchedModules = new Set();
const touchedLibs = new Set();
const otherFiles = new Set();

for (const line of rawDiff.split('\n').filter(Boolean)) {
	const parts = line.split('\t');
	const path = parts[0].startsWith('R') ? parts[2] : parts[1];

	let m;
	if ((m = path.match(MODULE_RE))) {
		touchedModules.add(`${m[1]}/${m[2]}`);
	} else if ((m = path.match(LIB_RE))) {
		touchedLibs.add(m[1]);
	} else {
		otherFiles.add(path);
	}
}

const SECTIONS = ['Added', 'Changed', 'Removed'];
const emptyBySection = () => Object.fromEntries(SECTIONS.map(s => [s, []]));

const grouped = emptyBySection();
for (const key of [...touchedModules].sort()) {
	const [category, module] = key.split('/');
	grouped[classify(key, fromModules, toModules)].push({ category, module });
}

const groupedLibs = emptyBySection();
for (const lib of [...touchedLibs].sort()) {
	groupedLibs[classify(lib, fromLibs, toLibs)].push(lib);
}

const today = new Date().toISOString().slice(0, 10);
const lines = [`## [MAJOR.MINOR.PATCH] - ${today}`, ''];

for (const section of SECTIONS) {
	const entries = grouped[section];
	const libs = withLibs ? groupedLibs[section] : [];

	if (entries.length === 0 && libs.length === 0) continue;

	lines.push(`### ${section}`, '');

	const byCategory = new Map();
	for (const { category, module } of entries) {
		if (!byCategory.has(category)) byCategory.set(category, []);
		byCategory.get(category).push(module);
	}

	for (const [cat, mods] of byCategory) {
		lines.push(`- ${cat}`);
		for (const mod of mods) lines.push(`  - ${mod}`);
	}

	if (libs.length > 0) {
		lines.push('- Libs');
		for (const lib of libs) lines.push(`  - ${lib}`);
	}

	lines.push('');
}

if (otherFiles.size > 0) {
	lines.push('<!-- other changed files:');
	for (const f of [...otherFiles].sort()) lines.push(`  ${f}`);
	lines.push('-->');
	lines.push('');
}

process.stdout.write(lines.join('\n'));
