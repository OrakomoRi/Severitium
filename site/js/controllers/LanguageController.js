export default class LanguageController {
	constructor(i18nService) {
		this._i18n = i18nService;
	}

	async init() {
		// Load locales config
		let locales = [];
		try {
			const r = await fetch('site/config/locales.json');
			const data = await r.json();
			locales = data.locales ?? data;
		} catch {
			locales = [{ code: 'en', name: 'English' }, { code: 'ru', name: 'Русский' }];
		}

		// Wait for BreeziumSelect to be available, then render
		await this._waitForBreeziumSelect();
		this._renderSelector(locales);

		// Apply translations immediately
		this._i18n.applyToDOM();

		// Listen for language changes from other sources
		document.addEventListener('languageChanged', () => {
			this._i18n.applyToDOM();
		});
	}

	_renderSelector(locales) {
		const container = document.querySelector('[data-component="lang-selector"]');
		if (!container) return;

		const options = locales.map(l => ({ value: l.code, name: l.name }));
		const currentLocale = this._i18n.locale;

		const select = new window.BreeziumSelect(
			options,
			async (value) => {
				await this._i18n.setLocale(value);
				this._i18n.applyToDOM();
			},
			currentLocale
		);

		select.render(container);
	}

	_waitForBreeziumSelect(maxAttempts = 20, interval = 100) {
		return new Promise((resolve, reject) => {
			if (window.BreeziumSelect) {
				resolve();
				return;
			}
			let attempts = 0;
			const timer = setInterval(() => {
				attempts++;
				if (window.BreeziumSelect) {
					clearInterval(timer);
					resolve();
				} else if (attempts >= maxAttempts) {
					clearInterval(timer);
					reject(new Error('BreeziumSelect not available'));
				}
			}, interval);
		});
	}
}
