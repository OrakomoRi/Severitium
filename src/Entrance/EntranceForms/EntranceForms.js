(function () {
	/**
	 * Replaces the visual representation of a checkbox in the DOM with a custom SVG checkbox and preserves the checkbox's text content 
	*/
	function replaceEntranceCheckbox() {
		// Old checkbox visuals
		const checkboxVisuals = document.querySelector('.EntranceComponentStyle-checkbox > .CheckBoxStyle-checkbox > label > span');
		// Checkbox text that should be inside the label
		const checkboxText = document.querySelector('.EntranceComponentStyle-checkbox > span');

		// New checkbox visuals
		const newCheckboxVisuals = `<svg class="severitium-checkbox-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><rect width="21" height="21" x=".5" y=".5" rx="3" /><path class="tick" fill="none" stroke-linecap="round" stroke-width="4" d="M4 10l5 5 9-9" /></svg><span class="severitium-checkbox-text">${checkboxText.textContent}</span>`;

		// Replace old checkbox visuals with the new one
		checkboxVisuals.outerHTML = newCheckboxVisuals;

		// Remove checkboxText element
		checkboxText.remove();
	}

	/**
	 * Create a new instance of MutationObserver with a callback function
	 * to observe changes in the DOM 
	*/
	const observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.type === 'childList') { // If the change is of type childList
				mutation.addedNodes.forEach(function (node) { // Iterate through added nodes
					if (node.nodeType === Node.ELEMENT_NODE) { // If it's an element node
						// Find an element with the needed selector in the added node
						const entrance = node.querySelector(`.EntranceComponentStyle-checkbox > .CheckBoxStyle-checkbox > label > input`);
						if (entrance) { // If found
							replaceEntranceCheckbox();
						}
					}
				});
			}
		});
	});

	// Configuration for the mutation observer
	const observerConfig = { childList: true, subtree: true };

	// Start observing mutations in the document body
	observer.observe(document.body, observerConfig);
})();