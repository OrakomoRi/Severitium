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
			value: option.value
		}));

		// Take selected option as default option
		const defaultOption = {
			name: originalSelect.options[originalSelect.selectedIndex]?.textContent || '',
			value: originalSelect.value || ''
		};

		// Create an instance of BreeziumSelect
		const breeziumSelect = new BreeziumSelect(
			options,
			(selectedValue) => {
				// Update the value of the original select
				originalSelect.value = selectedValue;
				originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
			},
			defaultOption
		);

		// Insert a custom select into the DOM
		breeziumSelect.render(originalSelectContainer.parentNode, originalSelectContainer.nextSibling);

		const selectedOption = breeziumSelect.selected;
		selectedOption.dataset.state = 'selected';

		// Add a click handler for the custom selector
		selectedOption.addEventListener('click', () => {
			// Check if clan chat is open
			if (clanChannel && clanChannel.dataset.state === 'selected') {
				// Find select active option
				originalSelect.value = selectedOption.dataset.value;
				originalSelect.dispatchEvent(new Event('change', { bubbles: true }));

				// Clan channel should be closed, and custom select should not open
				clanChannel.dataset.state = '';
				breeziumSelect.container.classList.remove('show');

				selectedOption.dataset.state = 'selected';
			}
		});

		// Handle clicks on '.ChatComponentStyle-channels .ChatComponentStyle-clanChannel'
		const clanChannel = document.querySelector('.ChatComponentStyle-channels .ChatComponentStyle-clanChannel');
		// Check if the clan channel exists to the user
		if (clanChannel) {
			clanChannel.addEventListener('click', () => {
				if (clanChannel.dataset.state !== 'selected') {
					clanChannel.dataset.state = 'selected';
					selectedOption.dataset.state = '';
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