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
	 * Apply data-state attribute to an element based on its active state
	 * Also, set data-rarity based on the src of the image inside the active card
	 * 
	 * @param {HTMLElement} element - The element to update
	 * @param {boolean} isActive - Whether the element is active
	 */
	function applyDataState(element, isActive) {
		element.setAttribute('data-state', isActive ? 'active' : 'inactive');

		if (isActive) {
			const imgElement = element.querySelector('img');
			if (imgElement) {
				const rarity = getRarityFromSrc(imgElement.getAttribute('src'));
				document.querySelector(textSelector)?.setAttribute('data-rarity', rarity)
			}
		}
	}

	/**
	 * Determine the rarity based on the `src` of the image
	 * 
	 * @param {string} src - The `src` attribute of the image
	 * @returns {string} - The rarity value
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
		return 'all';
	}

	/**
	 * Handle click event on an element
	 * 
	 * @param {MouseEvent} event - The click event
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
	 * Handle keyboard events for Q and E keys
	 * 
	 * @param {KeyboardEvent} event - The keyboard event
	 */
	function handleKeydown(event) {
		if (event.code === 'KeyQ') {
			navigateToPreviousCard();
		} else if (event.code === 'KeyE') {
			navigateToNextCard();
		}
	}

	/**
	 * Navigates to the previous reward card
	 */
	function navigateToPreviousCard() {
		const elements = Array.from(document.querySelectorAll(cardSelector));
		const activeElement = document.querySelector(`${cardSelector}[data-state="active"]`);
		let index = elements.indexOf(activeElement);
		index = index === -1 ? 0 : index > 0 ? index - 1 : elements.length - 1;

		elements.forEach((el, i) => applyDataState(el, i === index));
	}

	/**
	 * Navigates to the next reward card
	 */
	function navigateToNextCard() {
		const elements = Array.from(document.querySelectorAll(cardSelector));
		const activeElement = document.querySelector(`${cardSelector}[data-state="active"]`);
		let index = elements.indexOf(activeElement);
		index = index === -1 ? 0 : index < elements.length - 1 ? index + 1 : 0;

		elements.forEach((el, i) => applyDataState(el, i === index));
	}

	/**
	 * Add event listeners for click and keydown events
	 */
	function addEventListeners() {
		if (!eventListenersActive) {
			document.addEventListener('click', handleClick);
			document.addEventListener('keydown', handleKeydown);
			eventListenersActive = true;
		}
	}

	/**
	 * Processes added elements to apply `data-state` and attach event listeners
	 * 
	 * @param {HTMLElement} element - The new element to process
	 */
	function processElement(element) {
		if (!element.matches(cardSelector)) return;
		applyDataState(element, window.getComputedStyle(element).backgroundColor.includes(activeColor));
	}

	// Create a new instance of MutationObserver
	const cardsObserver = new MutationObserver(mutations => {
		requestAnimationFrame(() => processMutations(mutations));
	});

	/**
	 * Processes mutations efficiently
	 * 
	 * @param {MutationRecord[]} mutations - The list of mutations
	 */
	function processMutations(mutations) {
		mutations.forEach(({ addedNodes, removedNodes }) => {
			addedNodes.forEach(node => {
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
			});

			removedNodes.forEach(node => {
				if (node.nodeType === Node.ELEMENT_NODE) {
					// Process the removed node if it matches the selector
					if ((node.matches && node.matches(cardSelector)) || (node.querySelector && node.querySelector(rewardsContainerSelector))) {
						if (eventListenersActive) {
							document.removeEventListener('click', handleClick);
							document.removeEventListener('keydown', handleKeydown);
							eventListenersActive = false;
						}
					}
				}
			});
		});
	}

	// Set up observation for changes in the document
	cardsObserver.observe(document.body, { childList: true, subtree: true });
}) ();