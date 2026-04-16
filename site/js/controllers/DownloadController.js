const STABLE_API = 'https://severitium-builds.vercel.app/stable.json';
const STATICALLY_BASE = 'https://cdn.statically.io/gh/OrakomoRi/Severitium';
const GITHUB_BASE = 'https://github.com/OrakomoRi/Severitium';
const WEBSITE_BASE = 'https://orakomori.github.io/Severitium';
const VIBETO_API = 'https://api.github.com/repos/OrakomoRi/VibeTO/releases/latest';
const VIBETO_RELEASES = 'https://github.com/OrakomoRi/VibeTO/releases/latest';

export default class DownloadController {
	constructor() {
		this._hash = null;
		this._version = null;
		this._vibeTOVersion = null;
		this._vibeTOAssets = null;
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

		for (const el of document.querySelectorAll('[data-download="vibeto"]')) {
			const file = el.getAttribute('data-file');
			if (!file) continue;

			el.addEventListener('click', async e => {
				e.preventDefault();
				await this._fetchVibeTO();
				window.open(this._vibeTOUrl(file), '_blank');
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

	async _fetchVibeTO() {
		try {
			const res = await fetch(`${VIBETO_API}?t=${Date.now()}`);
			if (!res.ok) throw new Error(res.status);
			const data = await res.json();
			this._vibeTOVersion = data.tag_name ?? null;
			this._vibeTOAssets = data.assets ?? [];
		} catch {
			// fall through to fallback
		}
	}

	_vibeTOUrl(filename) {
		if (!this._vibeTOVersion) return VIBETO_RELEASES;
		const asset = this._vibeTOAssets?.find(a => a.name === filename);
		if (asset) return asset.browser_download_url;
		return `https://github.com/OrakomoRi/VibeTO/releases/download/${this._vibeTOVersion}/${filename}`;
	}
}
