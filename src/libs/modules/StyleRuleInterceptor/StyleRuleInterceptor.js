let _proxyInstalled = false;
const _watchers = [];

// Wraps CSSStyleSheet.prototype.insertRule once regardless of how many watchers are created.
function _installProxy() {
	if (_proxyInstalled) return;
	_proxyInstalled = true;

	const _orig = CSSStyleSheet.prototype.insertRule;

	CSSStyleSheet.prototype.insertRule = function (rule, index) {
		const insertedIndex = _orig.call(this, rule, index);

		if (_watchers.length > 0) {
			const cssRule = this.cssRules[insertedIndex];
			if (cssRule?.selectorText && cssRule?.style) {
				for (const watcher of _watchers) {
					watcher._process(cssRule.selectorText, cssRule.style);
				}
			}
		}

		return insertedIndex;
	};
}

/**
 * Create a watcher that tracks which CSS selectors carry specific property values,
 * both from rules already in the document and from rules inserted afterwards.
 *
 * Solves the bidirectional timing problem: CSS rules and DOM elements may appear
 * in any order. Use resolveElement() when an element appears to check cached rules,
 * and onInsert() to react when a new matching rule is discovered.
 *
 * @param {object} options
 * @param {string[]} options.values - Substrings to watch for in CSS property values (e.g. color fragments)
 * @param {string[]} [options.properties=['background','background-color']] - CSS properties to inspect
 * @param {string|null} [options.scope=null] - Optional CSS selector. When set, only rules whose selector
 *   matches at least one element within this scope are cached. Prevents unrelated rules (e.g. from other
 *   screens using the same color) from accumulating in the cache.
 *   Warning: only use this when CSS rules are guaranteed to be inserted after the scoped elements are
 *   in the DOM. If the game inserts CSS before rendering DOM (common), scoped elements won't exist yet
 *   and valid selectors will be silently rejected.
 * @returns {{
 *   resolveElement: (element: HTMLElement) => string,
 *   onInsert: (callback: (match: { value: string, selector: string }) => void) => void,
 *   destroy: () => void
 * }}
 */
export function createRuleWatcher({
	values,
	properties = ['background', 'background-color'],
	scope = null,
}) {
	// value → Set<selector>: all known selectors associated with each watched value
	const cache = new Map(values.map(v => [v, new Set()]));
	const insertListeners = [];

	function _matchesScope(selector) {
		if (!scope) return true;
		try {
			return document.querySelector(`${scope}:is(${selector})`) !== null;
		} catch (e) {
			return false;
		}
	}

	function _process(selector, style) {
		const propText = properties.map(p => style.getPropertyValue(p)).join('\n');
		const value = values.find(v => propText.includes(v));
		if (!value) return;

		const selectors = cache.get(value);
		if (selectors.has(selector)) return;

		// When scope is set: only cache selector if it matches at least one scoped element.
		// If scope elements aren't in DOM yet, the caller's onInsert handles late arrivals.
		if (scope && !_matchesScope(selector)) return;

		selectors.add(selector);

		for (const cb of insertListeners) cb({ value, selector });
	}

	const entry = { _process };
	_watchers.push(entry);
	_installProxy();

	// Scan rules already in the document before this watcher was created
	for (const sheet of document.styleSheets) {
		try {
			for (const rule of sheet.cssRules) {
				if (rule.selectorText && rule.style) _process(rule.selectorText, rule.style);
			}
		} catch (e) {
			// cross-origin sheet — skip
		}
	}

	return {
		/**
		 * Check whether any cached selector matches the element and return the associated value.
		 * Returns '' if no match found.
		 *
		 * @param {HTMLElement} element
		 * @returns {string}
		 */
		resolveElement(element) {
			for (const [value, selectors] of cache) {
				for (const selector of selectors) {
					try {
						if (element.matches(selector)) return value;
					} catch (e) {
						// invalid selector — skip
					}
				}
			}
			return '';
		},

		/**
		 * Subscribe to newly discovered selector–value associations.
		 * Called whenever a CSS rule is inserted that matches a watched value
		 * and whose selector has not been seen before.
		 *
		 * @param {(match: { value: string, selector: string }) => void} callback
		 */
		onInsert(callback) {
			insertListeners.push(callback);
		},

		/**
		 * Remove this watcher from the global interceptor.
		 * The insertRule proxy itself remains installed.
		 */
		destroy() {
			const i = _watchers.indexOf(entry);
			if (i !== -1) _watchers.splice(i, 1);
		},
	};
}
