/**
 * Check whether any stylesheet rule matching the given element declares
 * one of the specified properties with a value that satisfies the match condition.
 *
 * Two strategies, applied in order per rule:
 *  1. Simple class rules (e.g. `.ksc-699`) — matched via classList.contains(), no DOM query.
 *     Cached per class name.
 *  2. Compound rules (e.g. `.Foo > div > div`) — matched via element.matches().
 *     Cached per selector text.
 *
 * In both cases, value matching is checked first so element matching is only done
 * for rules that could actually be relevant.
 *
 * @param {HTMLElement} element - The element to check
 * @param {object} options
 * @param {string[]} [options.properties=['background', 'background-color']] - CSS property names to check
 * @param {'like'|'exact'} [options.match='like'] - Matching mode: 'like' = includes, 'exact' = strict equality
 * @param {string} options.value - The value to search for
 * @param {boolean} [options.caseInsensitive=false] - Whether to compare values case-insensitively
 * @returns {boolean} Whether a matching rule was found
 */
export function elementHasStyleRule(element, {
	properties = ['background', 'background-color'],
	match = 'like',
	value = '',
	caseInsensitive = false
}) {
	const simpleClassRe = /^\.([\w-]+)$/;

	for (const sheet of document.styleSheets) {
		let rules;
		try {
			rules = sheet.cssRules;
		} catch (e) {
			continue;
		}

		for (const rule of rules) {
			if (!rule.style || !rule.selectorText) continue;

			// Check if the rule's value matches before touching the DOM
			const needle = caseInsensitive ? value.toLowerCase() : value;
			const valueMatches = properties.some(prop => {
				const raw = rule.style.getPropertyValue(prop).trim();
				const val = caseInsensitive ? raw.toLowerCase() : raw;
				return val && (match === 'exact' ? val === needle : val.includes(needle));
			});
			if (!valueMatches) continue;

			const simpleMatch = rule.selectorText.match(simpleClassRe);
			if (simpleMatch) {
				// Simple class rule — no DOM query needed
				if (element.classList.contains(simpleMatch[1])) return true;
			} else {
				// Compound rule — no caching: selectors like `.ksc-176.ksc-176` are
				// element-specific (each element has a unique hash class), so a cached
				// result from one element would incorrectly match another.
				// Value filtering above keeps the number of matches() calls minimal.
				try {
					if (element.matches(rule.selectorText)) return true;
				} catch (e) {
					// invalid selector — skip
				}
			}
		}
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
