import { watchElement } from '../MutationHandler/MutationHandler.js';

/**
 * Remove specific inline style properties from elements matching a selector,
 * both on appearance and whenever the game re-applies them via the style attribute.
 *
 * @param {string} selector - CSS selector for target elements
 * @param {string[]} properties - Inline style property names to remove (e.g. ['background', 'color'])
 */
export function continuousClearInlineStyle(selector, properties) {
	function clear(el) {
		for (const prop of properties) el.style.removeProperty(prop);
		if (!el.style.length) el.removeAttribute('style');
	}
	watchElement(selector, clear, { attributeFilter: ['class', 'style'] });
}

/**
 * Remove the entire inline style attribute from elements matching a selector,
 * both on appearance and whenever the game re-applies it via the style attribute.
 *
 * @param {string} selector - CSS selector for target elements
 */
export function continuousClearAllInlineStyle(selector) {
	watchElement(selector, el => el.removeAttribute('style'), { attributeFilter: ['class', 'style'] });
}

/**
 * Remove all inline styles from an element and all its descendants (one-shot).
 *
 * @param {HTMLElement} el - Root element to clear
 */
export function singleClearAllInlineStyle(el) {
	el.removeAttribute('style');
}
