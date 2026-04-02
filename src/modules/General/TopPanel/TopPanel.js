(function () {
	const nicknameSelector = '.UserInfoContainerStyle-containerProgressMainScreen > div:nth-child(1) span';

	let lastNick = null;

	/**
	 * Reads the nickname from the span and dispatches a custom event if it changed.
	 *
	 * @param {HTMLElement} span - The nickname span element
	 */
	function handleNickname(span) {
		const nick = span.textContent.trim();
		if (!nick || nick === lastNick) return;
		lastNick = nick;
		window.dispatchEvent(new CustomEvent('severitium:nickname', { detail: { nick } }));
	}

	/**
	 * Queries the nickname element in the DOM and handles it if found.
	 */
	function checkNickname() {
		const span = document.querySelector(nicknameSelector);
		if (span) handleNickname(span);
	}

	const observer = new MutationObserver((mutations) => {
		const process = () => {
			mutations.forEach(({ addedNodes }) => {
				addedNodes.forEach(node => {
					if (node.nodeType !== Node.ELEMENT_NODE) return;
					if (node.matches(nicknameSelector) || node.querySelector(nicknameSelector)) {
						checkNickname();
					}
				});
			});
		};

		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(process);
		} else {
			process();
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });

	checkNickname();
})();
