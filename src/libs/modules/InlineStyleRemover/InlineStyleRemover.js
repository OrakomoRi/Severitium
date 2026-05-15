import { watchElement } from '../MutationHandler/MutationHandler.js';

/**
 * Remove specific inline style properties from elements matching a selector,
 * both on appearance and whenever the game re-applies them via the style attribute.
 *
 * @param {string} selector - CSS selector for target elements
 * @param {string[]} properties - Inline style property names to remove (e.g. ['background', 'color'])
 */
export function clearInlineStyle(selector, properties) {
	function clear(el) {
		for (const prop of properties) el.style.removeProperty(prop);
	}
	watchElement(selector, clear, { attributeFilter: ['class', 'style'] });
}

/**
 * Remove the entire inline style attribute from elements matching a selector,
 * both on appearance and whenever the game re-applies it via the style attribute.
 *
 * @param {string} selector - CSS selector for target elements
 */
export function clearAllInlineStyle(selector) {
	watchElement(selector, el => el.removeAttribute('style'), { attributeFilter: ['class', 'style'] });
}
