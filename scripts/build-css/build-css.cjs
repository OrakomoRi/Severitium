'use strict';

const fs = require('fs');
const path = require('path');
const csso = require('csso');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(ROOT, 'dist');

const BASE_DIRS = ['src/libs', 'src/core', 'src/utils'];
const MODULES_DIR = 'src/modules';
const EXCLUDE_SUBDIR = '_variables';

function collectCSS(dirPath, excludeDir) {
	const files = [];
	if (!fs.existsSync(dirPath)) return files;

	function walk(dir) {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				if (excludeDir && entry.name === excludeDir) continue;
				walk(fullPath);
			} else if (entry.isFile() && entry.name.endsWith('.css') && !entry.name.endsWith('.min.css')) {
				files.push(fullPath);
			}
		}
	}

	walk(dirPath);
	return files;
}

function main() {
	console.log('Building CSS...');

	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	const basePaths = BASE_DIRS
		.flatMap(dir => collectCSS(path.join(ROOT, dir)))
		.sort();

	const modulePaths = collectCSS(path.join(ROOT, MODULES_DIR), EXCLUDE_SUBDIR)
		.sort();

	const combined = [...basePaths, ...modulePaths]
		.map(f => fs.readFileSync(f, 'utf8'))
		.join('\n');

	const outCSS = path.join(OUTPUT_DIR, 'style.release.css');
	const outMin = path.join(OUTPUT_DIR, 'style.release.min.css');

	fs.writeFileSync(outCSS, combined, 'utf8');
	console.log(`Written: ${path.relative(ROOT, outCSS)}`);

	const minified = csso.minify(combined).css;
	fs.writeFileSync(outMin, minified, 'utf8');
	console.log(`Written: ${path.relative(ROOT, outMin)}`);

	console.log('CSS build complete.');
}

try {
	main();
} catch (err) {
	console.error('Error:', err.message);
	process.exit(1);
}
