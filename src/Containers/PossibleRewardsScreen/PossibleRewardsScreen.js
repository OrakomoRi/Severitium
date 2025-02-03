(function () {
	// Defines the active color used to determine the current state of the card
	const activeColor = 'rgb(191, 213, 255)';
	// Possible reward container selector
	const containerSelector = '.ContainerInfoComponentStyle-possibleRewardsContainer';
	// Possible reward card selector
	const cardSelector = '.ContainerInfoComponentStyle-possibleRewardsContainer .ScrollBarStyle-itemsWrapper .ContainerInfoComponentStyle-itemsContainer > div > div';

	/**
	 * Handles click event on the reward container to update active states
	 * 
	 * @param {MouseEvent} event - The click event
	 */
	function handleClick(event) {
		const clickedElement = event.target.closest(cardSelector);
		if (!clickedElement) return;

		// Update state for all elements
		for (const element of document.querySelectorAll(cardSelector)) {
			element.setAttribute('data-state', element === clickedElement ? 'active' : 'inactive');
		};
	}

	/**
	 * Process a new element to apply data-state and attach event listeners.
	 * @param {HTMLElement} element - The new element to process.
	 */
	function processElement(element) {
		if (!element.matches(cardSelector)) return;

		// Check if the element is active based on its box-shadow
		const isActive = window.getComputedStyle(element).boxShadow.includes(activeColor);
		element.setAttribute('data-state', isActive ? 'active' : 'inactive');
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
				if (node.matches?.(containerSelector) || node.querySelectorAll?.(containerSelector)) {
					document.body.addEventListener('click', handleClick);
				}
				if (node.matches?.(cardSelector)) processElement(node); // Process the node if it matches the selector
				node.querySelectorAll?.(cardSelector)?.forEach(processElement); // Process child elements recursively
			});
			removedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelectorAll?.(containerSelector)) {
					document.body.removeEventListener('click', handleClick);
				}
			});
		});
	}

	// Start observing changes in the document
	observer.observe(document.body, { childList: true, subtree: true });
})();