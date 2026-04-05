/**
 * Check whether any stylesheet rule matching the given element declares
 * one of the specified properties with a value that satisfies the match condition.
 * Reads raw CSS declarations, bypassing the cascade — so overrides from other
 * sources (e.g. Severitium) that change computed values do not interfere.
 *
 * @param {HTMLElement} element - The element to check
 * @param {object} options
 * @param {string[]} [options.properties=['background', 'background-color']] - CSS property names to check
 * @param {'like'|'exact'} [options.match='like'] - Matching mode: 'like' = includes, 'exact' = strict equality
 * @param {string} options.value - The value to search for
 * @returns {boolean} Whether a matching rule was found
 */
export function elementHasStyleRule(element, {
	properties = ['background', 'background-color'],
	match = 'like',
	value = ''
}) {
	for (const sheet of document.styleSheets) {
		let rules;
		try {
			rules = sheet.cssRules;
		} catch (e) {
			continue;
		}

		for (const rule of rules) {
			if (!rule.selectorText || !rule.style) continue;
			try {
				if (!element.matches(rule.selectorText)) continue;
			} catch (e) {
				continue;
			}

			const hasMatch = properties.some(prop => {
				const val = rule.style.getPropertyValue(prop).trim();
				if (!val) return false;
				return match === 'exact' ? val === value : val.includes(value);
			});

			if (hasMatch) return true;
		}
	}
	return false;
}

/**
 * Find all elements within a scope whose matching stylesheet rules declare
 * one of the specified properties with a value satisfying the match condition.
 * Reads raw CSS declarations, bypassing the cascade — so overrides from other
 * sources (e.g. Severitium) that change computed values do not interfere.
 *
 * @param {object} options
 * @param {string} [options.scope='*'] - CSS selector limiting which elements to consider
 * @param {string[]} [options.properties=['background']] - CSS property names to check
 * @param {'like'|'exact'} [options.match='like'] - Matching mode: 'like' = includes, 'exact' = strict equality
 * @param {string} options.value - The value to search for
 * @param {function(HTMLElement): void} options.callback - Called for each matched element
 */
export function findElementsByStyleRule({
	scope = '*',
	properties = ['background'],
	match = 'like',
	value = '',
	callback
}) {
	const targets = new Set(document.querySelectorAll(scope));
	const matchedElements = new Set();

	for (const sheet of document.styleSheets) {
		let rules;
		try {
			rules = sheet.cssRules;
		} catch (e) {
			continue;
		}

		for (const rule of rules) {
			if (!rule.selectorText || !rule.style) continue;

			const hasMatch = properties.some(prop => {
				const val = rule.style.getPropertyValue(prop).trim();
				if (!val) return false;
				return match === 'exact' ? val === value : val.includes(value);
			});

			if (!hasMatch) continue;

			let elements;
			try {
				elements = document.querySelectorAll(rule.selectorText);
			} catch (e) {
				continue;
			}

			elements.forEach(el => {
				if (targets.has(el)) matchedElements.add(el);
			});
		}
	}

	matchedElements.forEach(el => callback(el));
}
