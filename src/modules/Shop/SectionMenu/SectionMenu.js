import { onMutation } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { elementHasStyleRule } from '../../../libs/modules/StyleRuleInspector/StyleRuleInspector.js';

(function () {
	// Defines the active color used to determine the current state of the menu item
	const activeColor = 'rgba(255, 204, 0, 0.25)';
	// Possible reward card selector
	const itemSelector = `div > div`;
	// Shop section menu selector
	const menuSelector = '.NewShopCommonComponentStyle-commonBlockMenuShop';
	// Full item selector
	const fullItemSelector = `${menuSelector} > ${itemSelector}`;

	// Currently active item — kept as a reference to avoid querying all items on click
	let currentActive = null;

	/**
	 * Apply data-state='active' to an element if the game marks it as active,
	 * reading stylesheet rules directly to bypass Severitium's overrides.
	 *
	 * @param {HTMLElement} element - The element to update
	 */
	function applyDataState(element) {
		const isActive = elementHasStyleRule(element, {
			properties: ['background', 'background-color'],
			value: activeColor
		});
		if (isActive) {
			element.setAttribute('data-state', 'active');
			currentActive = element;
		} else {
			element.removeAttribute('data-state');
		}
	}

	/**
	 * Handles click event on the menu and updates `data-state`
	 *
	 * @param {MouseEvent} event - The click event
	 */
	function handleClick(event) {
		const clickedElement = event.target.closest(fullItemSelector);
		if (!clickedElement || clickedElement === currentActive) return;

		currentActive?.removeAttribute('data-state');
		clickedElement.setAttribute('data-state', 'active');
		currentActive = clickedElement;
	}

	/**
	 * Processes a new menu element to apply `data-state` and attach event listeners
	 *
	 * @param {HTMLElement} menu - The menu element
	 */
	function processMenu(menu) {
		menu.querySelectorAll(itemSelector).forEach(applyDataState);
		menu.addEventListener('click', handleClick);
	}

	onMutation(mutations => processMutations(mutations));

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
				if (menu) {
					menu.removeEventListener('click', handleClick);
					currentActive = null;
				}
			});
		});
	}

})();
