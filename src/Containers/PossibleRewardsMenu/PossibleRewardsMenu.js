(function () {
	// Defines the active color used to determine the current state of the card
	const activeColor = 'rgba(255, 255, 255, 0.15)';

	// Possible reward card selector
	const cardSelector = '.ContainerInfoComponentStyle-rewardsMenu > div:not([class*="hotkey"i])';
	const textSelector = '.ContainersComponentStyle-navigationBlockForCategories .ContainerInfoComponentStyle-typeRewardsBlock .ContainerInfoComponentStyle-rewardText';

	// Hotkey selectors
	const firstHotkeySelector = '.ContainerInfoComponentStyle-rewardsMenu > div[class*="hotkey"i]:first-of-type';
	const lastHotkeySelector = '.ContainerInfoComponentStyle-rewardsMenu > div[class*="hotkey"i]:last-of-type';

	// Container selector
	const rewardsContainerSelector = '.ContainerInfoComponentStyle-possibleRewardsContainer';

	// Flag to track if event listeners are active
	let eventListenersActive = false;

	/**
	 * Apply data-state attribute to an element based on its active state.
	 * Also, set data-rarity based on the src of the image inside the active card.
	 * @param {HTMLElement} element - The element to update.
	 * @param {boolean} isActive - Whether the element is active.
	 */
	function applyDataState(element, isActive) {
		element.setAttribute('data-state', isActive ? 'active' : 'inactive');

		if (isActive) {
			const imgElement = element.querySelector('img');
			if (imgElement) {
				const src = imgElement.getAttribute('src');
				const rarity = getRarityFromSrc(src);
				const textElement = document.querySelector(textSelector);
				if (textElement) {
					textElement.setAttribute('data-rarity', rarity);
				}
			}
		}
	}

	/**
	 * Determine the rarity based on the src of the image.
	 * @param {string} src - The src attribute of the image.
	 * @returns {string} - The rarity value.
	 */
	function getRarityFromSrc(src) {
		const lowerSrc = src.toLowerCase();

		if (lowerSrc.includes('all')) return 'all';
		if (lowerSrc.includes('casual')) return 'common';
		if (lowerSrc.includes('uncommon')) return 'uncommon';
		if (lowerSrc.includes('rare')) return 'rare';
		if (lowerSrc.includes('epic')) return 'epic';
		if (lowerSrc.includes('legendary')) return 'legendary';
		if (lowerSrc.includes('red')) return 'mystic';
		return 'all'; // Default rarity if no match is found
	}

	/**
	 * Handle click event on an element.
	 * @param {MouseEvent} event - The click event.
	 */
	function handleClick(event) {
		const clickedElement = event.target.closest(cardSelector);
		if (clickedElement) {
			const elements = document.querySelectorAll(cardSelector);

			// Apply inactive state to all elements except the clicked one
			for (const element of elements) {
				const isActive = element === clickedElement;
				applyDataState(element, isActive);
			}
		}

		// Handle first hotkey click
		const firstHotkey = event.target.closest(firstHotkeySelector);
		if (firstHotkey) {
			navigateToPreviousCard();
		}

		// Handle last hotkey click
		const lastHotkey = event.target.closest(lastHotkeySelector);
		if (lastHotkey) {
			navigateToNextCard();
		}
	}

	/**
	 * Handle keyboard events for Q and E keys.
	 * @param {KeyboardEvent} event - The keyboard event.
	 */
	function handleKeydown(event) {
		if (event.key === 'q' || event.key === 'Q') {
			navigateToPreviousCard();
		} else if (event.key === 'e' || event.key === 'E') {
			navigateToNextCard();
		}
	}

	/**
	 * Navigate to the previous card.
	 */
	function navigateToPreviousCard() {
		const elements = document.querySelectorAll(cardSelector);
		const activeElement = document.querySelector(`${cardSelector}[data-state="active"]`);
		let activeIndex = Array.from(elements).indexOf(activeElement);

		if (activeIndex === -1) {
			activeIndex = 0;
		} else {
			activeIndex = (activeIndex - 1 + elements.length) % elements.length;
		}

		applyDataState(elements[activeIndex], true);
		elements.forEach((element, index) => {
			if (index !== activeIndex) {
				applyDataState(element, false);
			}
		});
	}

	/**
	 * Navigate to the next card.
	 */
	function navigateToNextCard() {
		const elements = document.querySelectorAll(cardSelector);
		const activeElement = document.querySelector(`${cardSelector}[data-state="active"]`);
		let activeIndex = Array.from(elements).indexOf(activeElement);

		if (activeIndex === -1) {
			activeIndex = 0;
		} else {
			activeIndex = (activeIndex + 1) % elements.length;
		}

		applyDataState(elements[activeIndex], true);
		elements.forEach((element, index) => {
			if (index !== activeIndex) {
				applyDataState(element, false);
			}
		});
	}

	/**
	 * Add event listeners for click and keydown events.
	 */
	function addEventListeners() {
		if (!eventListenersActive) {
			document.addEventListener('click', handleClick);
			document.addEventListener('keydown', handleKeydown);
			eventListenersActive = true;
		}
	}

	/**
	 * Remove event listeners for click and keydown events.
	 */
	function removeEventListeners() {
		if (eventListenersActive) {
			document.removeEventListener('click', handleClick);
			document.removeEventListener('keydown', handleKeydown);
			eventListenersActive = false;
		}
	}

	/**
	 * Process a new element to apply data-state and attach event listeners.
	 * @param {HTMLElement} element - The new element to process.
	 */
	function processElement(element) {
		if (!element.matches(cardSelector)) return;

		// Check if the element is active based on its background-color
		const isActive = window.getComputedStyle(element).backgroundColor.includes(activeColor);
		applyDataState(element, isActive);
	}

	/**
	 * Create a new instance of MutationObserver to track the addition of reward cards.
	 */
	const cardsObserver = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			for (const node of mutation.addedNodes) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					// Process the removed node if it matches the selector
					if ((node.matches && node.matches(cardSelector)) || (node.querySelector && node.querySelector(rewardsContainerSelector))) {
						addEventListeners(); // Add event listeners if the container is present
					}
					
					// Process the added node if it matches the selector
					if (node.matches && node.matches(cardSelector)) {
						processElement(node);
					}

					// If the added node contains child elements, process them recursively
					if (node.querySelectorAll) {
						node.querySelectorAll(cardSelector).forEach(processElement);
					}
				}
			}

			for (const node of mutation.removedNodes) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					// Process the removed node if it matches the selector
					if ((node.matches && node.matches(cardSelector)) || (node.querySelector && node.querySelector(rewardsContainerSelector))) {
						removeEventListeners(); // Remove event listeners if the container is absent
					}
				}
			}
		}
	});

	// Set up observation for changes in the document
	cardsObserver.observe(document.body, { childList: true, subtree: true });
})();