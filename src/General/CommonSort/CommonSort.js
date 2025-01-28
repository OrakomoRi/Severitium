(function () {
	/**
	 * Defines the active color used to determine the current state of the sort arrows.
	 * This color is compared against the background color of the arrows.
	 * @type {string}
	 */
	const activeColor = 'rgb(118, 255, 51)';

	/**
	 * The custom attribute used to store the sort state of a container.
	 * @type {string}
	 */
	const customProperty = 'data-sort-state';

	/**
	 * Possible states for the sort functionality.
	 * @type {{neutral: string, up: string, down: string}}
	 */
	const customPropertyStates = {
		neutral: 'neutral', // Indicates no active sort
		up: 'up', // Indicates ascending sort
		down: 'down', // Indicates descending sort
	};

	/**
	 * Generates a unique UUID that is not already used by existing sort elements.
	 * @returns {string} - A unique UUID.
	 */
	function generateUniqueUUID() {
		let uuid;
		const existingUUIDs = new Set(
			Array.from(document.querySelectorAll('.TableComponentStyle-commonSort')).map(el => el.getAttribute('data-sort-id'))
		);
		do {
			uuid = crypto.randomUUID();
		} while (existingUUIDs.has(uuid));
		return uuid;
	}

	/**
	 * Adds unique styles for each sort element using the provided UUID.
	 * @param {HTMLElement} element - The sortElement to apply styles to.
	 */
	function addStylesForSortElement(element) {
		const uuid = generateUniqueUUID();
		element.setAttribute('data-sort-id', uuid);

		const newCSSForArrows = `
			/* Inactive sorting icon */
			div.TableComponentStyle-commonSort[data-sort-state*="neutral"i][data-sort-id="${uuid}"] .TableComponentStyle-sortIndicatorUpDown,
			div.TableComponentStyle-commonSort[data-sort-state*="down"i][data-sort-id="${uuid}"] .TableComponentStyle-sortIndicatorUpDown:first-of-type,
			div.TableComponentStyle-commonSort[data-sort-state*="up"i][data-sort-id="${uuid}"] .TableComponentStyle-sortIndicatorUpDown:last-of-type {
				background-color: var(--severitium-light-gray-color);
			}

			/* Active sorting down */
			div.TableComponentStyle-commonSort[data-sort-state*="down"i][data-sort-id="${uuid}"] .TableComponentStyle-sortIndicatorUpDown:last-of-type {
				background-color: var(--severitium-main-color);
			}

			/* Active sorting up */
			div.TableComponentStyle-commonSort[data-sort-state*="up"i][data-sort-id="${uuid}"] .TableComponentStyle-sortIndicatorUpDown:first-of-type {
				background-color: var(--severitium-main-color);
			}
		`;

		const styleSheet = document.createElement('style');
		styleSheet.textContent = newCSSForArrows;
		// Insert the styleSheet as the first child of the element
		element.prepend(styleSheet);
	}

	/**
	 * Create a new instance of MutationObserver with a callback function
	 * to observe changes in the DOM and track the addition of sort containers.
	 */
	const observer = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			for (const node of mutation.addedNodes) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					// Check if the node or any of its descendants contain the target class
					const sortElements = Array.from(node.querySelectorAll('.TableComponentStyle-commonSort'));
					// Include the node itself if it has the target class
					if (node.classList && node.classList.contains('TableComponentStyle-commonSort')) {
						sortElements.push(node);
					}

					for (const sortElement of sortElements) {
						// Initialize the sort state for the new sort container
						initializeSortState(sortElement);
						// Add custom styles for this sort element
						addStylesForSortElement(sortElement);
					}
				}
			}
		}
	});

	// Set up observation for changes in the document
	observer.observe(document.body, { childList: true, subtree: true });

	/**
	 * Initializes the sort state for a newly added sort container.
	 * This function determines the initial sort state (neutral, up, or down)
	 * based on the background color of the sort arrows.
	 * 
	 * @param {HTMLElement} sortElement - The container element with sorting functionality.
	 */
	function initializeSortState(sortElement) {
		// Query the specific arrow icons (up and down) within the sort container
		const upArrow = sortElement.querySelector('.TableComponentStyle-sortIndicatorUpDown:first-child');
		const downArrow = sortElement.querySelector('.TableComponentStyle-sortIndicatorUpDown:last-child');

		if (downArrow && upArrow) { // Ensure both arrows exist
			const upArrowBgColor = getComputedStyle(upArrow).backgroundColor;
			const downArrowBgColor = getComputedStyle(downArrow).backgroundColor;

			// Check the background color of the arrows to determine the sort state
			if (upArrowBgColor === activeColor) {
				sortElement.setAttribute(customProperty, customPropertyStates.up);
			} else if (downArrowBgColor === activeColor) {
				sortElement.setAttribute(customProperty, customPropertyStates.down);
			} else {
				sortElement.setAttribute(customProperty, customPropertyStates.neutral);
			}
		}
	}

	/**
	 * Handles click events on a sort container to manage sorting functionality.
	 * Resets other sort containers to the neutral state and toggles the state of the clicked container.
	 * 
	 * @param {MouseEvent} event - The click event object.
	 */
	function handleSortClick(sortElement) {
		// Reset the sort state of all other sort containers
		document.querySelectorAll('.TableComponentStyle-commonSort').forEach((element) => {
			if (element !== sortElement) {
				element.setAttribute(customProperty, customPropertyStates.neutral);
			}
		});

		// Toggle the sort state based on the current state
		const currentState = sortElement.getAttribute(customProperty);

		if (currentState === customPropertyStates.down) {
			sortElement.setAttribute(customProperty, customPropertyStates.up);
		} else if (currentState === customPropertyStates.neutral || currentState === customPropertyStates.up) {
			sortElement.setAttribute(customProperty, customPropertyStates.down);
		}
	}

	// Add event listener on body to delegate click event for th
	document.body.addEventListener('click', (event) => {
		// If the click was inside th
		const thElement = event.target.closest('th');
		// Return if not
		if (!thElement) return;
	
		// If the th element has element with needed selector inside it
		const sortElement = thElement.querySelector('.TableComponentStyle-commonSort');
		if (sortElement) {
			// Call the function
			handleSortClick(sortElement);
		}
	});
	
})();