(function () {
	// Lobby chat category select selector
	const chatSelectSelector = '.ChatComponentStyle-channels .ChatComponentStyle-channelsSelect';

	/**
	 * Replaces the original select element with a custom dropdown menu
	 */
	function customChatLogic() {
		// Find the original select container and select element
		const originalSelectContainer = document.querySelector('.ChatComponentStyle-channels .ChatComponentStyle-channelsSelect');
		if (!originalSelectContainer) return; // Prevent errors if element is missing

		const originalSelect = originalSelectContainer.querySelector('select');
		if (!originalSelect) return;

		// Extract options from the original select
		const options = Array.from(originalSelect.options).map(option => ({
			name: option.textContent || '',
			value: option.value || ''
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
			const clanChannel = document.querySelector('.ChatComponentStyle-channels .ChatComponentStyle-clanChannel');
			// Check if clan chat is open
			if (clanChannel?.dataset.state === 'selected') {
				// Find select active option
				originalSelect.value = selectedOption.dataset.value;
				originalSelect.dispatchEvent(new Event('change', { bubbles: true }));

				// Clan channel should be closed, and custom select should not open
				clanChannel.dataset.state = '';
				breeziumSelect.container.classList.remove('show');

				selectedOption.dataset.state = 'selected';
			}
		});

		// Handle clicks on the clan channel button
		const clanChannel = document.querySelector('.ChatComponentStyle-channels .ChatComponentStyle-clanChannel');
		if (clanChannel) {
			clanChannel.addEventListener('click', () => {
				const isSelected = clanChannel.dataset.state === 'selected';
				clanChannel.dataset.state = isSelected ? '' : 'selected';
				selectedOption.dataset.state = isSelected ? 'selected' : '';
			});
		}

		// Close dropdown when clicking outside
		document.querySelector('.ChatComponentStyle-chatWindow')?.addEventListener('click', (event) => {
			if (!breeziumSelect.container.contains(event.target) && breeziumSelect.container.classList.contains('show')) {
				breeziumSelect.container.classList.remove('show');
			}
		});
	}

	/**
	 * Create a new instance of MutationObserver with a callback function
	 * to observe changes in the DOM.
	 */
	const observer = new MutationObserver((mutations) => {
		if (typeof requestAnimationFrame === 'function') {
			// Use requestAnimationFrame to optimize DOM changes processing
			requestAnimationFrame(() => {
				mutations.forEach((mutation) => {
					if (mutation.type === 'childList') {
						mutation.addedNodes.forEach((node) => {
							if (node.nodeType === Node.ELEMENT_NODE && (node.matches(chatSelectSelector) || node.querySelector(chatSelectSelector))) {
								customChatLogic();
							}
						});
					}
				});
			});

			return;
		}

		// Fallback: Execute immediately if requestAnimationFrame is not available
		mutations.forEach((mutation) => {
			if (mutation.type === 'childList') {
				mutation.addedNodes.forEach((node) => {
					if (node.nodeType === Node.ELEMENT_NODE && (node.matches(chatSelectSelector) || node.querySelector(chatSelectSelector))) {
						customChatLogic();
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