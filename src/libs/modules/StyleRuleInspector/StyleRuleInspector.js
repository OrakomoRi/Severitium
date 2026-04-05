// Per-class cache: Map<`${className}::${value}`, boolean>
// Valid for the lifetime of the page — class-to-style mappings never change mid-session.
const _classRuleCache = new Map();

/**
 * Check whether any stylesheet rule for one of the element's own classes declares
 * one of the specified properties with a value that satisfies the match condition.
 * Only considers simple class selectors (e.g. `.ksc-699`) to avoid false positives
 * from compound rules (e.g. Severitium overrides). Results are cached per class name
 * so repeated calls for the same class are O(1).
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
	for (const cls of element.classList) {
		const cacheKey = `${cls}::${value}`;
		if (_classRuleCache.has(cacheKey)) {
			if (_classRuleCache.get(cacheKey)) return true;
			continue;
		}

		let found = false;
		scan: for (const sheet of document.styleSheets) {
			try {
				for (const rule of sheet.cssRules) {
					if (!rule.style || rule.selectorText !== `.${cls}`) continue;
					const hasMatch = properties.some(prop => {
						const val = rule.style.getPropertyValue(prop).trim();
						return val && (match === 'exact' ? val === value : val.includes(value));
					});
					if (hasMatch) { found = true; break scan; }
				}
			} catch (e) {}
		}

		_classRuleCache.set(cacheKey, found);
		if (found) return true;
	}
	return false;
}

/**
 * Find all elements within a scope whose matching stylesheet rules declare
 * one of the specified properties with a value satisfying the match condition.
 * Iterates CSS rules (not elements), so performance scales with rule count,
 * not element count. Reads raw CSS declarations, bypassing the cascade.
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
	if (targets.size === 0) return;

	const matched = new Set();

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
				return val && (match === 'exact' ? val === value : val.includes(value));
			});

			if (!hasMatch) continue;

			let elements;
			try {
				elements = document.querySelectorAll(rule.selectorText);
			} catch (e) {
				continue;
			}

			for (const el of elements) {
				if (targets.has(el)) matched.add(el);
			}
		}
	}

	for (const el of matched) callback(el);
}
