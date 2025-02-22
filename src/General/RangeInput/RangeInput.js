(function () {
	// Set to store already processed range inputs
	const processedRanges = new WeakMap();

	/**
	 * Updates the background of a range input based on its current value
	 * 
	 * @param {HTMLInputElement} rangeInput - The range input element to update
	 */
	function updateRangeBackground(rangeInput) {
		const min = parseFloat(rangeInput.min) || 0;
		const max = parseFloat(rangeInput.max) || 100;
		const val = parseFloat(rangeInput.value) || 0;
		const percentage = ((val - min) / (max - min)) * 100;
		rangeInput.style.background = `linear-gradient(to right, var(--severitium-main-color) ${percentage}%, var(--severitium-gray-color) ${percentage}%)`;
	}

	/**
	 * Initializes a range input: updates background and starts observing attribute changes
	 * 
	 * @param {HTMLInputElement} input - The range input element to initialize
	 */
	function initializeRangeInput(input) {
		if (processedRanges.has(input)) return;

		// Update background initially
		updateRangeBackground(input);

		// Observe changes to the "value" attribute
		const attrObserver = new MutationObserver(() => updateRangeBackground(input));
		attrObserver.observe(input, { attributes: true, attributeFilter: ["value"] });

		// Store observer reference for later cleanup
		processedRanges.set(input, attrObserver);
	}

	/**
	 * Removes observer when an input is deleted from the DOM
	 * 
	 * @param {HTMLInputElement} input - The removed range input element
	 */
	function cleanupRangeInput(input) {
		if (processedRanges.has(input)) {
			processedRanges.get(input).disconnect(); // Stop observing changes
			processedRanges.delete(input); // Remove reference
		}
	}

	// Initialize existing range inputs on page load
	document.querySelectorAll('input[type="range"]').forEach(initializeRangeInput);

	/**
	 * Observes the DOM for dynamically added and removed range inputs
	 */
	const observer = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			// Handle added elements
			for (const node of mutation.addedNodes) {
				if (node.nodeType === 1) {
					if (node.matches && node.matches('input[type="range"]')) {
						initializeRangeInput(node);
					} else {
						node.querySelectorAll?.('input[type="range"]').forEach(initializeRangeInput);
					}
				}
			}

			// Handle removed elements
			for (const node of mutation.removedNodes) {
				if (node.nodeType === 1) {
					if (node.matches && node.matches('input[type="range"]')) {
						cleanupRangeInput(node);
					} else {
						node.querySelectorAll?.('input[type="range"]').forEach(cleanupRangeInput);
					}
				}
			}
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });
})();