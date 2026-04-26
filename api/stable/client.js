import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
	const data = JSON.parse(readFileSync(join(process.cwd(), 'stable.json'), 'utf-8'));
	const latest = data.versions[data.versions.length - 1];
	const url = `https://github.com/OrakomoRi/Severitium/releases/download/${latest.version}/severitium.client.js`;
	res.redirect(302, url);
}
