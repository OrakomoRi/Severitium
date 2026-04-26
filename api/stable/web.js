import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
	const data = JSON.parse(readFileSync(join(process.cwd(), 'stable.json'), 'utf-8'));
	const latest = data.versions[data.versions.length - 1];
	const url = `https://cdn.statically.io/gh/OrakomoRi/Severitium@${latest.hash}/release/severitium.user.js`;
	res.redirect(302, url);
}
