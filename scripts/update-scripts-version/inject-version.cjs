'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '../..');
const { version } = require(path.join(root, 'package.json'));

const clientFile = path.join(root, 'release', 'severitium.client.js');
const userFile = path.join(root, 'release', 'severitium.user.js');

function inject(file, pattern, replacement) {
	const original = fs.readFileSync(file, 'utf8');
	const updated = original.replace(pattern, replacement);
	if (updated !== original) {
		fs.writeFileSync(file, updated, 'utf8');
		console.log(`[inject-version] Updated ${path.basename(file)} → ${version}`);
	}
}

inject(clientFile, /const CLIENT_VERSION = '[^']+';/, `const CLIENT_VERSION = '${version}';`);
inject(userFile,   /\/\/ @version\s+\S+/,             `// @version\t\t\t${version}`);

execSync(`git add "${clientFile}" "${userFile}"`, { stdio: 'inherit' });
