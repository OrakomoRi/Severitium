(function () {
	// Defines the active color used to determine the current state of the sort arrows
	const activeColor = 'rgb(118, 255, 51)';

	// The custom attribute used to store the sort state of a container
	const customProperty = 'data-sort-state';

	// Possible states for the sort functionality
	const customPropertyStates = {
		neutral: 'neutral', // Indicates no active sort
		up: 'up', // Indicates ascending sort
		down: 'down', // Indicates descending sort
	};

	// Cache for existing UUIDs to avoid duplicates
	const existingUUIDs = new Map();

	/**
	 * Generates a unique UUID that is not already used by existing sort elements
	 * 
	 * @returns {string} - A unique UUID
	 */
	function generateUniqueUUID() {
		let uuid;
		do {
			uuid = crypto.randomUUID();
		} while (existingUUIDs.has(uuid));
		existingUUIDs.set(uuid, true);
		return uuid;
	}

	/**
	 * Adds unique styles for each sort element using the provided UUID
	 * 
	 * @param {HTMLElement} element - The sortElement to apply styles to
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
	 * Initializes the sort state for a newly added sort container
	 * 
	 * @param {HTMLElement} sortElement - The container element with sorting functionality
	 */
	function initializeSortState(sortElement) {
		const arrows = sortElement.querySelectorAll('.TableComponentStyle-sortIndicatorUpDown');
		if (arrows.length !== 2) return;

		const [upArrow, downArrow] = arrows;
		const upArrowBgColor = getComputedStyle(upArrow).backgroundColor;
		const downArrowBgColor = getComputedStyle(downArrow).backgroundColor;

		// Check the background color of the arrows to determine the sort state
		const state =
			upArrowBgColor === activeColor ? customPropertyStates.up :
			downArrowBgColor === activeColor ? customPropertyStates.down :
			customPropertyStates.neutral;

		sortElement.setAttribute(customProperty, state);
	}

	/**
	 * Handles click events on a sort container
	 * 
	 * @param {MouseEvent} event - The click event object
	 */
	function handleSortClick(sortElement) {
		document.querySelectorAll('.TableComponentStyle-commonSort').forEach((el) => {
			if (el !== sortElement) {
				el.setAttribute(customProperty, customPropertyStates.neutral);
			}
		});

		// Toggle the sort state based on the current state
		const currentState = sortElement.getAttribute(customProperty);
		sortElement.setAttribute(
			customProperty,
			currentState === customPropertyStates.down ? customPropertyStates.up : customPropertyStates.down
		);
	}

	/**
	 * Processes mutations efficiently
	 * 
	 * @param {MutationRecord[]} mutations - Array of mutation records
	 */
	function processMutations(mutations) {
		mutations.forEach(({ addedNodes }) => {
			addedNodes.forEach((node) => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;

				const sortElements = node.matches('.TableComponentStyle-commonSort') ? 
					[node] : 
					Array.from(node.querySelectorAll('.TableComponentStyle-commonSort'));

					for (const sortElement of sortElements) {
						// Initialize the sort state for the new sort container
						initializeSortState(sortElement);
						// Add custom styles for this sort element
						addStylesForSortElement(sortElement);
					}
			});
		});
	}

	/**
	 * Create a new instance of MutationObserver
	 */
	const observer = new MutationObserver((mutations) => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => processMutations(mutations));
		} else {
			// Fallback: Execute immediately if requestAnimationFrame is not supported
			processMutations(mutations);
		}
	});

	// Set up observation for changes in the document
	observer.observe(document.body, { childList: true, subtree: true });

	// Add event listener on body to delegate click event for th
	document.body.addEventListener('click', (event) => {
		// If the click was inside th
		const thElement = event.target.closest('th');
		// Return if not
		if (!thElement) return;
	
		// If the th element has element with needed selector inside it
		const sortElement = thElement.querySelector('.TableComponentStyle-commonSort');
		if (sortElement) {
			handleSortClick(sortElement);
		}
	});
	
})();