const _mutationHandlers = [];

new MutationObserver(mutations => {
	requestAnimationFrame(() => {
		for (const handler of _mutationHandlers) handler(mutations);
	});
}).observe(document.body, { childList: true, subtree: true });

export function onMutation(fn) {
	_mutationHandlers.push(fn);
}
