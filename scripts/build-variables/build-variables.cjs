'use strict';

const fs = require('fs');
const path = require('path');
const csso = require('csso');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(ROOT, 'dist');
const VERSION = process.env.VERSION || require(path.join(ROOT, 'package.json')).version || '';

const VARIABLES_CSS = path.join(ROOT, 'src/modules/_variables/variables.css');

function parseVariables(css) {
	const variables = {};
	const rootMatch = css.match(/:root\s*\{([^}]*)\}/);
	if (rootMatch) {
		const varMatches = rootMatch[1].match(/--[^:;]+:[^;]+;/g);
		if (varMatches) {
			for (const match of varMatches) {
				const [prop, val] = match.split(':').map(s => s.trim());
				if (prop && val) variables[prop] = val.replace(';', '').trim();
			}
		}
	}
	return variables;
}

function main() {
	if (!fs.existsSync(VARIABLES_CSS)) {
		console.log('No variables.css found, skipping.');
		return;
	}

	console.log('Building variables...');

	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	const css = fs.readFileSync(VARIABLES_CSS, 'utf8');

	const outCSS = path.join(OUTPUT_DIR, 'variables.css');
	const outMin = path.join(OUTPUT_DIR, 'variables.min.css');
	const outJSON = path.join(OUTPUT_DIR, 'variables.json');

	fs.writeFileSync(outCSS, css, 'utf8');
	console.log(`Written: ${path.relative(ROOT, outCSS)}`);

	const minified = csso.minify(css).css;
	fs.writeFileSync(outMin, minified, 'utf8');
	console.log(`Written: ${path.relative(ROOT, outMin)}`);

	const variables = parseVariables(css);
	fs.writeFileSync(outJSON, JSON.stringify({
		version: VERSION,
		timestamp: new Date().toISOString(),
		variables,
	}, null, 2), 'utf8');
	console.log(`Written: ${path.relative(ROOT, outJSON)}`);

	console.log('Variables build complete.');
}

try {
	main();
} catch (err) {
	console.error('Error:', err.message);
	process.exit(1);
}
