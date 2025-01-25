(function () {
	// Defines the active color used to determine the current state of the card
	const activeColor = 'rgb(191, 213, 255)';

	// Possible reward card selector
	const selector = '.ContainerInfoComponentStyle-possibleRewardsContainer .ScrollBarStyle-itemsWrapper .ContainerInfoComponentStyle-itemsContainer > div > div';

	/**
	 * Apply styles to an element based on its active state.
	 * @param {HTMLElement} element - The element to style.
	 * @param {boolean} isActive - Whether the element is active.
	 */
	function applyStyles(element, isActive) {
		const styles = isActive
			? `
				box-shadow: none;
                background-color: var(--severitium-light-transparent-background3);
                border: .1em solid var(--severitium-light-gray-color);
                pointer-events: none;
            `
			: `
				box-shadow: none;
                background-color: var(--severitium-dark-transparent-background2);
                border: .1em solid var(--severitium-gray-color);
            `;

		element.setAttribute('style', styles);
	}

	/**
	 * Handle click event on an element.
	 * @param {MouseEvent} event - The click event.
	 */
	document.body.addEventListener('click', function (event) {
		const clickedElement = event.target.closest(selector);
		if (!clickedElement) return;

		const elements = document.querySelectorAll(selector);

		// Apply inactive styles to all elements except the clicked one
		for (const element of elements) {
			const isActive = element === clickedElement;
			applyStyles(element, isActive);
		}
	});

	/**
	 * Process a new element to apply styles and attach event listeners.
	 * @param {HTMLElement} element - The new element to process.
	 */
	function processElement(element) {
		if (!element.matches(selector)) return;

		// Check if the element is active based on its box-shadow
		const isActive = window.getComputedStyle(element).boxShadow.includes(activeColor);
		applyStyles(element, isActive);
	}

	/**
	 * Create a new instance of MutationObserver with a callback function
	 * to observe changes in the DOM and track the addition of reward cards.
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