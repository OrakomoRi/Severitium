const _mutationHandlers = [];

new MutationObserver(mutations => {
	requestAnimationFrame(() => {
		for (const handler of _mutationHandlers) handler(mutations);
	});
}).observe(document.body, { childList: true, subtree: true });

/**
 * Register a handler that is called on every DOM mutation (childList, subtree).
 * All handlers share a single MutationObserver and are batched via requestAnimationFrame.
 *
 * @param {function(MutationRecord[]): void} fn - The handler to register
 */
export function onMutation(fn) {
	_mutationHandlers.push(fn);
}

/**
 * Watch for elements matching a selector: fires the callback when they first appear in the DOM
 * and whenever their observed attributes change thereafter. Cleans up automatically when
 * the element is removed from the DOM.
 *
 * Uses the shared MutationObserver for DOM additions and removals (no extra observer cost),
 * and one dedicated MutationObserver per element scoped to the specified attributes.
 * Disconnecting per-element on removal avoids memory leaks — MutationObserver has no
 * unobserve(), so a shared observer would keep removed nodes alive indefinitely.
 *
 * @param {string} selector - CSS selector for target elements
 * @param {function(HTMLElement): void} callback - Called on appearance and on each attribute change
 * @param {object} [options]
 * @param {string[]} [options.attributeFilter=['class']] - Attributes to watch for changes
 */
export function watchElement(selector, callback, { attributeFilter = ['class'] } = {}) {
	// Map from element to its dedicated attribute observer for clean disconnect
	const observers = new Map();

	function attach(el) {
		if (observers.has(el)) return;

		const obs = new MutationObserver(mutations => {
			requestAnimationFrame(() => {
				for (const { target } of mutations) callback(target);
			});
		});

		observers.set(el, obs);
		obs.observe(el, { attributes: true, attributeFilter });
		callback(el);
	}

	function detach(el) {
		const obs = observers.get(el);
		if (!obs) return;
		obs.disconnect();
		observers.delete(el);
	}

	function collectTargets(node) {
		if (node.nodeType !== Node.ELEMENT_NODE) return [];
		return node.matches(selector) ? [node] : [...node.querySelectorAll(selector)];
	}

	// Handle elements already present in the DOM at call time
	for (const el of document.querySelectorAll(selector)) attach(el);

	onMutation(mutations => {
		for (const { addedNodes, removedNodes } of mutations) {
			for (const node of addedNodes) for (const el of collectTargets(node)) attach(el);
			for (const node of removedNodes) for (const el of collectTargets(node)) detach(el);
		}
	});
}
