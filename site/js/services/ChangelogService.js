export default class ChangelogService {
	constructor(url = 'https://raw.githubusercontent.com/OrakomoRi/Severitium/main/CHANGELOG.md') {
		this._url = url;
	}

	async fetch() {
		const response = await fetch(this._url);
		if (!response.ok) throw new Error(`Failed to fetch changelog: ${response.status}`);
		const text = await response.text();
		return this.parse(text);
	}

	parse(md) {
		const lines = md.split('\n');
		let html = '', inVersion = false, inSection = false;
		let listDepth = 0;

		const closeLists = (targetDepth = 0) => {
			while (listDepth > targetDepth) {
				html += '</li></ul>';
				listDepth--;
			}
		};

		for (const line of lines) {
			const t = line.trim();
			if (!t || t === '# CHANGELOG') continue;

			if (t.startsWith('## ')) {
				closeLists();
				if (inSection) { html += '</div>'; inSection = false; }
				if (inVersion) { html += '</div>'; }
				const m = t.match(/^## \[?([^\]]+)\]? - (.+)$/);
				if (m) {
					html += `<div class="cl-version"><div class="cl-version-header"><span class="cl-version-num">Version ${m[1].trim()}</span><span class="cl-version-date">${m[2].trim()}</span></div>`;
					inVersion = true;
				}
				continue;
			}

			if (t.startsWith('### ')) {
				closeLists();
				if (inSection) html += '</div>';
				const name = t.replace('### ', '').toLowerCase();
				const icon = name === 'added' ? 'add-circle-outline'
					: name === 'changed' ? 'swap-horizontal-outline'
					: name === 'fixed' ? 'checkmark-circle-outline'
					: 'remove-circle-outline';
				html += `<div class="cl-section"><div class="cl-section-title ${name}"><ion-icon name="${icon}"></ion-icon>${t.replace('### ', '')}</div>`;
				inSection = true;
				continue;
			}

			const listMatch = line.match(/^(\s*)([-*]) (.+)$/);
			if (listMatch) {
				const depth = Math.floor(listMatch[1].length / 2);
				const content = listMatch[3];
				const targetDepth = depth + 1;

				if (targetDepth > listDepth) {
					while (listDepth < targetDepth) {
						html += '<ul class="cl-list">';
						listDepth++;
					}
				} else if (targetDepth === listDepth) {
					html += '</li>';
				} else {
					while (listDepth > targetDepth) {
						html += '</li></ul>';
						listDepth--;
					}
					html += '</li>';
				}

				html += `<li>${content}`;
				continue;
			}

			closeLists();
		}

		closeLists();
		if (inSection) html += '</div>';
		if (inVersion) html += '</div>';

		return html || '<div class="cl-loading">No changelog content found.</div>';
	}
}
