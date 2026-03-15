const STABLE_API = 'https://severitium-builds.vercel.app/stable.json';
const RAW_BASE = 'https://raw.githubusercontent.com/OrakomoRi/Severitium';
const FALLBACK_BASE = 'https://orakomori.github.io/Severitium/release';

export default class DownloadController {
	constructor() {
		this._hash = null;
	}

	async init() {
		this._hash = await this._fetchHash();

		for (const el of document.querySelectorAll('[data-download="stable"]')) {
			const file = this._filename(el.getAttribute('href'));
			if (!file) continue;

			el.href = this._stableUrl(file);

			el.addEventListener('click', async e => {
				e.preventDefault();
				this._hash = await this._fetchHash();
				window.open(this._stableUrl(file), '_blank');
			});
		}

		for (const el of document.querySelectorAll('[data-download="latest"]')) {
			const file = this._filename(el.getAttribute('href'));
			if (!file) continue;

			el.addEventListener('mouseenter', () => {
				el.href = `${FALLBACK_BASE}/${file}?t=${Date.now()}`;
			});
			el.addEventListener('click', e => {
				e.preventDefault();
				window.open(`${FALLBACK_BASE}/${file}?t=${Date.now()}`, '_blank');
			});
		}
	}

	async _fetchHash() {
		try {
			const res = await fetch(`${STABLE_API}?t=${Date.now()}`);
			if (!res.ok) throw new Error(res.status);
			const data = await res.json();
			const versions = data?.versions;
			if (Array.isArray(versions) && versions.length > 0) {
				return versions[versions.length - 1].hash;
			}
		} catch {
			// fall through to fallback
		}
		return null;
	}

	_stableUrl(file) {
		if (!this._hash) return `${FALLBACK_BASE}/${file}?t=${Date.now()}`;
		return `${RAW_BASE}/${this._hash}/release/${file}`;
	}

	_filename(href) {
		if (!href || href === '#') return null;
		return href.split('/').pop().split('?')[0] || null;
	}
}
