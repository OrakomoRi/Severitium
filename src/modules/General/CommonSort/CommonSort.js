import { onMutation } from '../../../libs/modules/MutationHandler/MutationHandler.js';

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

	// Currently active sort element — kept as a reference to avoid querying all elements on click
	let activeSortElement = null;

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

		if (state !== customPropertyStates.neutral) {
			activeSortElement = sortElement;
		}
	}

	/**
	 * Handles click events on a sort container
	 *
	 * @param {HTMLElement} sortElement - The sort container that was clicked
	 */
	function handleSortClick(sortElement) {
		// Reset previously active element without querying the whole DOM
		if (activeSortElement && activeSortElement !== sortElement) {
			activeSortElement.setAttribute(customProperty, customPropertyStates.neutral);
		}
		activeSortElement = sortElement;

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
						initializeSortState(sortElement);
					}
			});
		});
	}

	onMutation(mutations => processMutations(mutations));

	document.body.addEventListener('click', ({ target }) => {
		const th = target.closest('th');
		if (!th) return;

		const sortElement = th.querySelector('.TableComponentStyle-commonSort');
		if (sortElement) handleSortClick(sortElement);
	});
	
})();