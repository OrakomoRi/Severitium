export class SeveritiumInjector {
	/**
	 * @param {Object} Severitium - Main object containing data
	 */
	constructor(Severitium) {
		this.Severitium = Severitium;
	}

	updateSeveritium(newSeveritium) {
		this.Severitium = newSeveritium;
	}

	removeInjectedTheme() {
		document.querySelectorAll('style[data-resource="SeveritiumTheme"]').forEach(el => el.remove());
	}

	injectTheme(attributes = []) {
		const active = this.Severitium.theme.active || 'default';
		const theme = this.Severitium.theme.themes[active].variables || {};

		let css = ':root {\n';
		for (const [key, value] of Object.entries(theme)) {
			const name = key.startsWith('--') ? key : `--${key}`;
			css += `\t${name}: ${value};\n`;
		}
		css += '}';

		const style = document.createElement('style');
		style.textContent = css;
		attributes.forEach(attr => style.setAttribute(attr.name, attr.value));
		document.body.appendChild(style);
	}

	applyTheme() {
		if (!this.Severitium.theme) return;
		this.removeInjectedTheme();
		this.injectTheme([{ name: 'data-resource', value: 'SeveritiumTheme' }]);
	}

	removeInjectedCSS() {
		document.querySelectorAll('style[data-resource="SeveritiumCSS"]').forEach(el => el.remove());
	}

	injectCSS(url, attributes = []) {
		const style = document.createElement('style');
		style.textContent = this.Severitium.CSS[url];
		attributes.forEach(attr => style.setAttribute(attr.name, attr.value));
		document.body.appendChild(style);
	}

	applyCSS(links = null) {
		if (!links) return;
		this.removeInjectedCSS();

		const defaultAttributes = [{ name: 'data-resource', value: 'SeveritiumCSS' }];
		const normalized = Array.isArray(links) ? links : [{ url: links }];

		for (const { url, attributes = [] } of normalized) {
			const attrs = attributes.some(a => a.name === 'data-resource')
				? attributes
				: [...defaultAttributes, ...attributes];
			this.injectCSS(url, attrs);
		}
	}

	removeInjectedJS() {
		document.querySelectorAll('script[data-resource="SeveritiumJS"]').forEach(el => el.remove());
	}

	injectJS(url, attributes = []) {
		const script = document.createElement('script');
		script.textContent = this.Severitium.JS[url];
		attributes.forEach(attr => script.setAttribute(attr.name, attr.value));
		document.body.appendChild(script);
	}

	applyJS(links = null) {
		if (!links) return;
		this.removeInjectedJS();

		const defaultAttributes = [{ name: 'data-resource', value: 'SeveritiumJS' }];
		const normalized = Array.isArray(links) ? links : [{ url: links }];

		for (const { url, attributes = [] } of normalized) {
			const attrs = attributes.some(a => a.name === 'data-resource')
				? attributes
				: [...defaultAttributes, ...attributes];
			this.injectJS(url, attrs);
		}
	}

	removeInjectedImages() {
		document.querySelectorAll('style[data-resource="SeveritiumImage"]').forEach(el => el.remove());
	}

	injectImage(url, styleTemplate, attributes = []) {
		const processedStyle = styleTemplate.replace('SEVERITIUM_PLACEHOLDER', this.Severitium.images[url]);
		const style = document.createElement('style');
		style.textContent = processedStyle;
		attributes.forEach(attr => style.setAttribute(attr.name, attr.value));
		document.body.appendChild(style);
	}

	applyImages(links = null, season = 'Winter') {
		if (!links) return;
		this.removeInjectedImages();

		const defaultAttributes = [{ name: 'data-resource', value: 'SeveritiumImage' }];

		for (const { url, style, attributes = [] } of links) {
			const formattedUrl = url.replace('SEASON_PLACEHOLDER', season);
			const attrs = attributes.some(a => a.name === 'data-resource')
				? attributes
				: [...defaultAttributes, ...attributes];
			this.injectImage(formattedUrl, style, attrs);
		}
	}
}