(function () {
	/**
	 * Replaces the visual representation of a checkbox in the DOM with a custom SVG checkbox
	 * and preserves the checkbox's text content
	 * 
	 * @param {HTMLElement} checkboxContainer - The container element containing the checkbox
	 */
	function replaceEntranceCheckbox(checkboxContainer) {
		const checkboxVisuals = checkboxContainer.querySelector('.CheckBoxStyle-checkbox > label > span');
		const checkboxText = checkboxContainer.querySelector(':scope > span');

		if (!checkboxVisuals || !checkboxText) return; // Ensure the required elements exist

		// New custom checkbox visuals
		const newCheckboxVisuals = `
			<svg class="severitium-checkbox-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
				<rect width="21" height="21" x=".5" y=".5" rx="3" />
				<path class="tick" fill="none" stroke-linecap="round" stroke-width="4" d="M4 10l5 5 9-9" />
			</svg>
			<span class="severitium-checkbox-text">${checkboxText.textContent}</span>
		`;

		// Replace old checkbox visuals with the new one
		checkboxVisuals.outerHTML = newCheckboxVisuals;

		// Remove the old text element
		checkboxText.remove();
	}

	/**
	 * Processes mutations efficiently to handle dynamically added checkboxes
	 * 
	 * @param {MutationRecord[]} mutations - List of observed mutations
	 */
	function processMutations(mutations) {
		mutations.forEach(({ addedNodes }) => {
			addedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;

				// Check if the added node is a checkbox container or contains one
				const checkboxContainer = node.matches('.EntranceComponentStyle-checkbox')
					? node
					: node.querySelector('.EntranceComponentStyle-checkbox');

				if (checkboxContainer) {
					replaceEntranceCheckbox(checkboxContainer);
				}
			});
		});
	}

	// Creates a new MutationObserver instance to track changes in the DOM
	const observer = new MutationObserver(mutations => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => processMutations(mutations));
		} else {
			processMutations(mutations);
		}
	})

	// Start observing changes in the document
	observer.observe(document.body, { childList: true, subtree: true });

	// Initial processing of already existing checkboxes
	document.querySelectorAll('.EntranceComponentStyle-checkbox').forEach(replaceEntranceCheckbox);
})();