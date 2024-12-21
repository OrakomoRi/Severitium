const SeveritiumImages = (function () {
	/**
	 * Removes all injected CSS styles with the attribute `data-resource="SeveritiumCSS"`.
	 * This ensures that previously applied styles do not interfere with new ones.
	 */
	function removeInjectedCSS() {
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
	function injectCSS(url, attributes = []) {
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
	function _applySeveritiumCSS(links) {
		// Remove existing Severitium-injected styles
		removeInjectedCSS();

		// Default attribute to identify Severitium-injected styles
		const defaultAttributes = { name: 'data-resource', value: 'SeveritiumCSS' };

		// Process each link and inject CSS
		for (const { url, attributes = [] } of links) {
			// Ensure the `data-resource` attribute is included
			const updatedAttributes = attributes.some(attr => attr.name === 'data-resource')
				? attributes
				: [defaultAttributes, ...attributes];
			injectCSS(url, updatedAttributes);
		}
	}

	// Public API exposing the _applySeveritiumCSS method
	return {
		/**
		 * Applies Severitium-specific CSS styles by removing old ones and injecting new styles.
		 * 
		 * @param {Array<{ url: string, attributes?: Array<{ name: string, value: string }> }>} links - 
		 *        An array of objects containing the URL key to retrieve CSS content and optional attributes for the <style> element.
		 */
		_applySeveritiumCSS: _applySeveritiumCSS
	};
})();