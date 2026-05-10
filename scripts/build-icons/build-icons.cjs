'use strict';

const fs = require('fs');
const path = require('path');
const csso = require('csso');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(ROOT, 'dist');
const SVG_DIR = path.join(ROOT, 'src/assets/images/svg');

function collectSVGs(dir) {
	const files = [];
	if (!fs.existsSync(dir)) return files;

	function walk(d) {
		for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
			const fullPath = path.join(d, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
			} else if (entry.isFile() && entry.name.endsWith('.svg')) {
				files.push(fullPath);
			}
		}
	}

	walk(dir);
	return files;
}

function buildName(file) {
	const rel = path.relative(SVG_DIR, file);
	const noExt = rel.slice(0, -'.svg'.length);
	return noExt
		.replace(/[\\/]/g, '-')
		.toLowerCase()
		.replace(/[^a-z0-9-_]/g, '');
}

function encodeSVG(content) {
	return content
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/'/g, "\"")
		// .replace(/%/g, '%25')
		.replace(/#/g, '%23')
		.replace(/&/g, '%26')
		// .replace(/</g, '%3C')
		// .replace(/>/g, '%3E');
}

function main() {
	console.log('Building icons CSS...');

	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	const svgFiles = collectSVGs(SVG_DIR);
	const seen = new Map();
	const vars = [];

	for (const file of svgFiles) {
		const name = buildName(file);
		if (!name) continue;

		if (seen.has(name)) {
			console.warn(`Collision: "${name}" (${file})`);
		}
		seen.set(name, true);

		const content = fs.readFileSync(file, 'utf8');
		const encoded = encodeSVG(content);
		vars.push(`\t--severitium-${name}-icon: url('data:image/svg+xml,${encoded}');`);
	}

	const css = `:root {\n${vars.join('\n')}\n}\n`;

	const outCSS = path.join(OUTPUT_DIR, 'icons.release.css');
	const outMin = path.join(OUTPUT_DIR, 'icons.release.min.css');

	fs.writeFileSync(outCSS, css, 'utf8');
	console.log(`Written: ${path.relative(ROOT, outCSS)}`);

	const minified = csso.minify(css).css;
	fs.writeFileSync(outMin, minified, 'utf8');
	console.log(`Written: ${path.relative(ROOT, outMin)}`);

	console.log(`Icons build complete. ${vars.length} icons processed.`);
}

try {
	main();
} catch (err) {
	console.error('Error:', err.message);
	process.exit(1);
}
