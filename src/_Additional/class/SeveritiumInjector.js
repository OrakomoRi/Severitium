class SeveritiumInjector {
	/**
	 * @param {Object} severitium - Main object containing data.
	 */
	constructor(Severitium) {
		this.Severitium = Severitium;
	}

	/**
	 * Updates the Severitium object used by this class.
	 * @param {Object} newSeveritium - The updated Severitium object.
	 */
	updateSeveritium(newSeveritium) {
		this.Severitium = newSeveritium;
	}

	/**
	 * Removes all injected CSS styles with the attribute `data-resource="SeveritiumCSS"`.
	 * This ensures that previously applied styles do not interfere with new ones.
	 */
	removeInjectedCSS() {
		const styles = document.querySelectorAll(
			'style[data-resource="SeveritiumCSS"]'
		);
		for (const el of styles) {
			el.remove();
		}
	}

	/**
	 * Injects CSS into the document using a predefined CSS object and attributes.
	 * 
	 * @param {string} url - The key to retrieve the CSS content from the Severitium.CSS object.
	 * @param {Array<{ name: string, value: string }>} attributes - An array of attribute objects to apply to the injected <style> element.
	 */
	injectCSS(url, attributes = []) {
		const style = document.createElement('style');
		style.textContent = Severitium.CSS[url]; // Assumes Severitium.CSS is a predefined object containing CSS strings.
		for (const attr of attributes) {
			style.setAttribute(attr.name, attr.value);
		}
		document.body.appendChild(style);
		// console.log(`SEVERITIUM: Applied CSS from ${url}`);
	}

	/**
	 * Applies multiple CSS styles to the document.
	 * Removes existing styles injected by Severitium and injects new styles from the provided links.
	 * 
	 * @param {Array<{ url: string, attributes?: Array<{ name: string, value: string }> }>} links - 
	 *        An array of objects containing the URL key to retrieve CSS content and optional attributes for the <style> element.
	 */
	applyCSS(links) {
		// Remove existing Severitium-injected styles
		this.removeInjectedCSS();

		// Default attribute to identify Severitium-injected styles
		const defaultAttributes = { name: 'data-resource', value: 'SeveritiumCSS' };

		// Process each link and inject CSS
		for (const { url, attributes = [] } of links) {
			// Ensure the `data-resource` attribute is included
			const updatedAttributes = attributes.some(attr => attr.name === 'data-resource')
				? attributes
				: [defaultAttributes, ...attributes];
			this.injectCSS(url, updatedAttributes);
		}
	}

	/**
	 * Removes all injected image styles with the attribute `data-resource="SeveritiumImage"`.
	 * This ensures that previously applied image styles do not interfere with new ones.
	 */
	removeInjectedImages() {
		const styles = document.querySelectorAll(
			'style[data-resource="SeveritiumImage"]'
		);
		for (const el of styles) {
			el.remove();
		}
	}

	/**
	 * Injects an image into the document using a style template and attributes.
	 * 
	 * @param {string} url - The key to retrieve the image source from the Severitium.images object.
	 * @param {string} styleTemplate - The CSS template string containing a placeholder for the image URL.
	 * @param {Array<{ name: string, value: string }>} attributes - An array of attribute objects to apply to the injected <style> element.
	 */
	injectImage(url, styleTemplate, attributes = []) {
		// Replace the placeholder in the style template with the actual image URL
		const processedStyle = styleTemplate.replace('SEVERITIUM_PLACEHOLDER', this.Severitium.images[url]);
		const style = document.createElement('style');
		style.textContent = processedStyle;
		for (const attr of attributes) {
			style.setAttribute(attr.name, attr.value);
		}
		document.body.appendChild(style);
		// console.log(`SEVERITIUM: Applied image from ${url}`);
	}

	/**
	 * Applies multiple image styles to the document.
	 * Removes existing image styles injected by Severitium and injects new ones from the provided links.
	 * 
	 * @param {Array<{ url: string, style: string, attributes?: Array<{ name: string, value: string }> }>} links - 
	 *        An array of objects containing the URL key to retrieve the image, the style template, 
	 *        and optional attributes for the <style> element.
	 */
	applyImages(links) {
		// Remove existing Severitium-injected image styles
		this.removeInjectedImages();

		// Default attribute to identify Severitium-injected image styles
		const defaultAttributes = { name: 'data-resource', value: 'SeveritiumImage' };

		// Process each link and inject image styles
		for (const { url, style, attributes = [] } of links) {
			// Replace the season placeholder in the URL if needed
			const formattedUrl = url.replace('SEASON_PLACEHOLDER', _getSeason());
			// Ensure the `data-resource` attribute is included
			const updatedAttributes = attributes.some(attr => attr.name === 'data-resource')
				? attributes
				: [defaultAttributes, ...attributes];
			this.injectImage(formattedUrl, style, updatedAttributes);
		}
	}
}