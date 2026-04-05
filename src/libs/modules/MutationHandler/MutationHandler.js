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
