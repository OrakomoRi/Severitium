import { onMutation } from '../../../libs/modules/MutationHandler/MutationHandler.js';

(function () {
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

	// Currently active card — kept as a reference to avoid querying all cards
	let currentActive = null;
	// Flag to avoid adding event listeners multiple times
	let eventListenersActive = false;

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
		if (!clickedElement || clickedElement === currentActive) return;

		currentActive?.removeAttribute('data-state');
		clickedElement.setAttribute('data-state', 'active');
		currentActive = clickedElement;
	}

	/**
	 * Keystroke handler
	 *
	 * @param {KeyboardEvent} event - Keystroke event
	 */
	function handleKeydown(event) {
		if (event.code === 'KeyE' || event.code === 'KeyQ') {
			updateToZeroState();
		}
	}

	/**
	 * Resets the state of the items, making the first one active
	 */
	function updateToZeroState() {
		setTimeout(() => {
			document.querySelector(cardSelector)?.click();
		}, 100); // Delay for correct rendering of elements
	}

	/**
	 * Add event listeners for click and keyup events
	 */
	function addEventListeners() {
		if (eventListenersActive) return;
		document.body.addEventListener('click', handleClick);
		document.body.addEventListener('keyup', handleKeydown);
		eventListenersActive = true;
	}

	/**
	 * Remove event listeners and reset state
	 */
	function removeEventListeners() {
		if (!eventListenersActive) return;
		document.body.removeEventListener('click', handleClick);
		document.body.removeEventListener('keyup', handleKeydown);
		eventListenersActive = false;
		currentActive = null;
	}

	onMutation(mutations => processMutations(mutations));

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
					addEventListeners();
					updateToZeroState();
				}
			});
			removedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) {
					removeEventListeners();
				}
			});
		});
	}

})();
