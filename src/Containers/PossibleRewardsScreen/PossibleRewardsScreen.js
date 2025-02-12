(function () {
	// Defines the active color used to determine the current state of the card
	const activeColor = 'rgb(191, 213, 255)';
	// Possible reward card selector
	const selector = '.ContainerInfoComponentStyle-possibleRewardsContainer .ScrollBarStyle-itemsWrapper .ContainerInfoComponentStyle-itemsContainer > div > div';

	/**
	 * Handle click event on an element.
	 * @param {MouseEvent} event - The click event.
	 */
	document.body.addEventListener('click', function (event) {
		const clickedElement = event.target.closest(selector);
		if (!clickedElement) return;

		const elements = document.querySelectorAll(selector);

		// Apply inactive state to all elements except the clicked one
		for (const element of elements) {
			element.setAttribute('data-state', element === clickedElement ? 'active' : 'inactive');
		}
	});

	/**
	 * Process a new element to apply data-state and attach event listeners
	 * 
	 * @param {HTMLElement} element - The new element to process
	 */
	function processElement(element) {
		if (!element.matches(selector)) return;

		// Check if the element is active based on its box-shadow
		let isActive = window.getComputedStyle(element).boxShadow.includes(activeColor);
		element.setAttribute('data-state', isActive ? 'active' : 'inactive');
	}

	/**
	 * Creates a new `MutationObserver` instance to track DOM changes
	 */
	const observer = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			for (const node of mutation.addedNodes) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					// Process the added node if it matches the selector
					if (node.matches && node.matches(selector)) {
						processElement(node);
					}
					// If the added node contains child elements, process them recursively
					if (node.querySelectorAll) {
						node.querySelectorAll(selector).forEach(processElement);
					}
				}
			}
		}
	});

	// Set up observation for changes in the document
	observer.observe(document.body, { childList: true, subtree: true });
})();