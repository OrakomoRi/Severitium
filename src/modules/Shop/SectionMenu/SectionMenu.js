(function () {
	// Defines the active color used to determine the current state of the menu item
	const activeColor = 'rgba(255, 204, 0, 0.25)';
	// Possible reward card selector
	const itemSelector = `div > div`;
	// Shop section menu selector
	const menuSelector = '.NewShopCommonComponentStyle-commonBlockMenuShop';

	/**
	 * Apply data-state attribute to an element based on its active state
	 * 
	 * @param {HTMLElement} element - The element to update
	 */
	function applyDataState(element) {
		const isActive = window.getComputedStyle(element).backgroundColor.includes(activeColor);
		element.setAttribute('data-state', isActive ? 'active' : 'inactive');
	}

	/**
	 * Handles click event on the menu and updates `data-state`
	 * 
	 * @param {MouseEvent} event - The click event
	 */
	function handleClick(event) {
		const clickedElement = event.target.closest(`${menuSelector} > ${itemSelector}`);
		if (!clickedElement) return;

		// Update state for all elements
		document.querySelectorAll(`${menuSelector} > ${itemSelector}`).forEach(element => {
			element.setAttribute('data-state', element === clickedElement ? 'active' : 'inactive');
		});
	}

	/**
	 * Processes a new menu element to apply `data-state` and attach event listeners
	 * 
	 * @param {HTMLElement} menu - The menu element
	 */
	function processMenu(menu) {
		document.querySelectorAll(`${menuSelector} > ${itemSelector}`).forEach(applyDataState);
		menu.addEventListener('click', handleClick);
	}

	/**
	 * Creates a new instance of MutationObserver to track changes in the DOM
	 */
	const observer = new MutationObserver(mutations => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => processMutations(mutations));
		} else {
			processMutations(mutations);
		}
	});

	/**
	 * Processes added and removed nodes efficiently
	 * 
	 * @param {MutationRecord[]} mutations - List of mutations
	 */
	function processMutations(mutations) {
		mutations.forEach(({ addedNodes, removedNodes }) => {
			addedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				const menu = node.matches(menuSelector) ? node : node.querySelector(menuSelector);
				if (menu) processMenu(menu);
			});

			removedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				const menu = node.matches(menuSelector) ? node : node.querySelector(menuSelector);
				if (menu) menu.removeEventListener('click', handleClick);
			});
		});
	}

	// Starts observing changes in the document
	observer.observe(document.body, { childList: true, subtree: true });
})();