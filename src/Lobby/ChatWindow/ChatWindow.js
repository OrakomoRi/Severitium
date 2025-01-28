(function () {
	/**
	 * Replaces the original select element with a custom dropdown menu
	 */
	function customChatLogic() {
		// Find the original select container and select element
		const originalSelectContainer = document.querySelector('.ChatComponentStyle-channels .ChatComponentStyle-channelsSelect');
		const originalSelect = originalSelectContainer.querySelector('select');

		// Extract the options from the original select
		const options = Array.from(originalSelect.options).map(option => ({
			name: option.textContent,
			code: option.value
		}));

		// Create an instance of BreeziumSelect
		const breeziumSelect = new BreeziumSelect(options, (selectedCode) => {
			// Update the value of the original select
			originalSelect.value = selectedCode;
			originalSelect.dispatchEvent(new Event('change', { bubbles: true }))
		}, originalSelect.options[originalSelect.selectedIndex].textContent);

		// Insert a custom select into the DOM
		breeziumSelect.render(originalSelectContainer.parentNode, originalSelectContainer.nextSibling);

		// Add a click handler for the custom selector
		const customDropdown = breeziumSelect.container.querySelector('.breezium-selected');
		customDropdown.addEventListener('click', () => {
			// Check if clan chat is open
			if (clanChannel && clanChannel.dataset.state === 'selected') {
				// Find option with "selected" text and activate
				const selectedOptionText = customDropdown.querySelector('.severitium-selected-text').textContent;
				for (const option of originalSelect.options) {
					if (option.textContent === selectedOptionText) {
						originalSelect.value = matchingOption.value;
						originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
						break;
					}
				}

				// Clan channel should be closed, and custom select should not open
				clanChannel.dataset.state = '';
				breeziumSelect.container.classList.remove('show');
			}
		});

		// Handle clicks on '.ChatComponentStyle-channels .ChatComponentStyle-clanChannel'
		const clanChannel = document.querySelector('.ChatComponentStyle-channels .ChatComponentStyle-clanChannel');
		// Check if the clan channel exists to the user
		if (clanChannel) {
			clanChannel.addEventListener('click', () => {
				if (clanChannel.dataset.state !== 'selected') {
					clanChannel.dataset.state = 'selected';
				}
			});
		}

		// Supposed to add this custom event listener since game has own preventDefault somewhere
		const chat = document.querySelector('.ChatComponentStyle-chatWindow');
		chat.addEventListener('click', (event) => {
			if (!breeziumSelect.container.contains(event.target) && breeziumSelect.container.classList.contains('show')) {
				breeziumSelect.container.classList.remove('show');
			}
		});
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
						// Find an element with the selector in the added node
						const select = node.querySelector('.ChatComponentStyle-channels .ChatComponentStyle-channelsSelect');
						if (select) { // If found
							customChatLogic();
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