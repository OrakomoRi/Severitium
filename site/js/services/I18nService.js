import I18n from '../../libs/i18n.js';

export default class I18nService {
	constructor() {
		this._i18n = new I18n({
			locale: 'en',
			fallbacks: ['en'],
			loader: async (locale) => {
				const r = await fetch(`site/lang/${locale}.json`);
				if (!r.ok) throw new Error(`Failed to load locale: ${locale}`);
				return r.json();
			}
		});
	}

	async init() {
		// Detect saved locale or browser preference
		let locale = localStorage.getItem('sev-lang');
		if (!locale) {
			const navLang = (navigator.language || '').toLowerCase();
			locale = navLang.startsWith('ru') ? 'ru' : 'en';
		}

		await this._i18n.load(locale);
		await this._i18n.setLocale(locale);
	}

	t(key) {
		return this._i18n.t(key);
	}

	get locale() {
		return this._i18n.locale;
	}

	async setLocale(locale) {
		await this._i18n.setLocale(locale);
		localStorage.setItem('sev-lang', locale);
		document.dispatchEvent(new CustomEvent('languageChanged', { detail: { locale } }));
	}

	applyToDOM() {
		document.querySelectorAll('[data-i18n]').forEach(el => {
			const key = el.getAttribute('data-i18n');
			const value = this.t(key);
			if (value !== undefined && value !== null) {
				el.textContent = value;
			}
		});

		document.querySelectorAll('[data-i18n-html]').forEach(el => {
			const key = el.getAttribute('data-i18n-html');
			const value = this.t(key);
			if (value !== undefined && value !== null) {
				el.innerHTML = value;
			}
		});
	}
}
