(function () {
	// Defines the active color used to determine the current state of the card
	const activeColor = 'rgb(191, 213, 255)';

	// Card & container selectors:
	// Possible reward container selector
	const containerSelector = '.ContainerInfoComponentStyle-possibleRewardsContainer .ScrollBarStyle-itemsWrapper .ContainerInfoComponentStyle-itemsContainer';
	// Possible reward card selector
	const cardSelector = '.ContainerInfoComponentStyle-possibleRewardsContainer .ScrollBarStyle-itemsWrapper .ContainerInfoComponentStyle-itemsContainer > div > div';

	// Menu selectors:
	// Menu button
	const menuButtonSelector = '.ContainerInfoComponentStyle-rewardsMenu > div:not([class*="hotkey"i])';
	// Hotkey
	const menuFirstHotkeySelector = '.ContainerInfoComponentStyle-rewardsMenu > div[class*="hotkey"i]:first-of-type';
	const menuLastHotkeySelector = '.ContainerInfoComponentStyle-rewardsMenu > div[class*="hotkey"i]:last-of-type';

	/**
	 * Handle click event on an element
	 * 
	 * @param {MouseEvent} event - The click event
	 */
	function handleClick(event) {
		if (event.target.closest(menuButtonSelector) ||
			event.target.closest(menuFirstHotkeySelector) ||
			event.target.closest(menuLastHotkeySelector)) {
			updateToZeroState();
			return;
		}

		const clickedElement = event.target.closest(cardSelector);
		if (!clickedElement) return;

		// Update state for all elements
		for (const element of document.querySelectorAll(cardSelector)) {
			element.setAttribute('data-state', element === clickedElement ? 'active' : 'inactive');
		};
	}

	/**
	 * Keystroke handler
	 * @param {KeyboardEvent} event - Keystroke event
	 */
	function handleKeydown(event) {
		if (event.code === 'KeyE' || event.code === 'KeyQ') {
			updateToZeroState();
			return;
		}
	}

	/**
	 * Resets the state of the items, making the first one active
	 */
	function updateToZeroState() {
		setTimeout(() => {
			const elements = document.querySelectorAll(cardSelector);
			if (elements.length === 0) return;

			elements[0].click();

			for (i = 0; i < elements.length; i++) {
				elements[i].setAttribute('data-state', i === 0 ? 'active' : 'inactive');
			}
		}, 100); // Delay for correct rendering of elements
	}

	/**
	 * Sets the initial state: the first element is active, the others are inactive
	 */
	function setInitialState() {
		const elements = document.querySelectorAll(cardSelector);
		if (elements.length === 0) return;

		for (const element of elements) {
			// Check if the element is active based on its box-shadow
			const isActive = window.getComputedStyle(element).boxShadow.includes(activeColor);
			element.setAttribute('data-state', isActive ? 'active' : 'inactive');
		}
	}

	/**
	 * Creates a new `MutationObserver` instance to track DOM changes
	 */
	const observer = new MutationObserver(mutations => {
		requestAnimationFrame(() => processMutations(mutations));
	});

	/**
	 * Processes mutations efficiently
	 * 
	 * @param {MutationRecord[]} mutations - List of mutations
	 */
	function processMutations(mutations) {
		mutations.forEach(({ addedNodes, removedNodes }) => {
			addedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) {
					setInitialState();
					document.body.addEventListener('click', handleClick);
					document.body.addEventListener('keyup', handleKeydown);
				}
			});
			removedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) {
					document.body.removeEventListener('click', handleClick);
					document.body.removeEventListener('keyup', handleKeydown);
				}
			});
		});
	}

	// Set up observation for changes in the document
	observer.observe(document.body, { childList: true, subtree: true });
})();