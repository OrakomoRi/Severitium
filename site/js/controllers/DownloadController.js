const STABLE_API = 'https://severitium-builds.vercel.app/stable.json';
const STATICALLY_BASE = 'https://cdn.statically.io/gh/OrakomoRi/Severitium';
const GITHUB_BASE = 'https://github.com/OrakomoRi/Severitium';
const WEBSITE_BASE = 'https://orakomori.github.io/Severitium';

export default class DownloadController {
	constructor() {
		this._hash = null;
		this._version = null;
	}

	init() {
		for (const el of document.querySelectorAll('[data-download="stable"]')) {
			const file = el.getAttribute('data-file');
			const platform = el.getAttribute('data-platform');
			if (!file) continue;

			if (platform === 'client') {
				el.addEventListener('click', async e => {
					e.preventDefault();
					await this._fetchStable();
					window.open(this._clientUrl(file), '_blank');
				});
			} else {
				el.addEventListener('click', async e => {
					e.preventDefault();
					await this._fetchStable();
					window.open(this._stableUrl(file), '_blank');
				});
			}
		}

		for (const el of document.querySelectorAll('[data-download="latest"]')) {
			const file = el.getAttribute('data-file');
			if (!file) continue;

			el.addEventListener('mouseenter', () => {
				el.href = `${WEBSITE_BASE}/${file}?t=${Date.now()}`;
			});
			el.addEventListener('click', e => {
				e.preventDefault();
				window.open(`${WEBSITE_BASE}/${file}?t=${Date.now()}`, '_blank');
			});
		}
	}

	async _fetchStable() {
		try {
			const res = await fetch(`${STABLE_API}?t=${Date.now()}`);
			if (!res.ok) throw new Error(res.status);
			const data = await res.json();
			const versions = data?.versions;
			if (Array.isArray(versions) && versions.length > 0) {
				const latest = versions[versions.length - 1];
				this._hash = latest.hash ?? null;
				this._version = latest.version ?? null;
			}
		} catch {
			// fall through to fallback
		}
	}

	_stableUrl(file) {
		if (!this._hash) return `${WEBSITE_BASE}/${file}?t=${Date.now()}`;
		return `${STATICALLY_BASE}@${this._hash}/${file}`;
	}

	_clientUrl(file) {
		const filename = file.split('/').pop();
		if (!this._version) return `${WEBSITE_BASE}/${file}?t=${Date.now()}`;
		return `${GITHUB_BASE}/releases/download/${this._version}/${filename}`;
	}
}
