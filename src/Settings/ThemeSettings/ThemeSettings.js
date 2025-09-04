(function () {
	const containerSelector = '.SettingsComponentStyle-blockContentOptions';

	let themeMenuItem = null;
	let menuClickHandlerAdded = false;
	let previousActiveTab = null;

	/**
	 * Initialize the custom settings tab
	 */
	function initializeSettingsTab() {
		const menuContainer = document.querySelector('.SettingsMenuComponentStyle-blockMenuOptions');
		const contentContainer = document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu');

		if (!menuContainer || !contentContainer) return;

		// Only create menu item if it doesn't exist
		if (!themeMenuItem || !menuContainer.contains(themeMenuItem)) {
			createMenuItem();
		}

		// Add event delegation only once
		if (!menuClickHandlerAdded) {
			addMenuEventDelegation();
			menuClickHandlerAdded = true;
		}
	}

	/**
	 * Adds event delegation to the menu container for optimal performance
	 */
	function addMenuEventDelegation() {
		const menuContainer = document.querySelector('.SettingsMenuComponentStyle-blockMenuOptions');
		if (!menuContainer) return;

		// Use capture phase to intercept before React handlers
		menuContainer.addEventListener('click', (e) => {
			const clickedItem = e.target.closest('.SettingsMenuComponentStyle-menuItemOptions');
			if (!clickedItem) return;

			// Handle theme tab content
			if (clickedItem === themeMenuItem) {
				// Remember the currently active tab before switching to theme
				const currentActive = document.querySelector('.SettingsMenuComponentStyle-activeItemOptions:not([data-theme-tab])');
				if (currentActive) {
					previousActiveTab = currentActive;
				}

				// Remove active class from all items
				document.querySelectorAll('.SettingsMenuComponentStyle-menuItemOptions').forEach(item => 
					item.classList.remove('SettingsMenuComponentStyle-activeItemOptions')
				);

				// Add active class to theme tab
				clickedItem.classList.add('SettingsMenuComponentStyle-activeItemOptions');

				const contentSection = document.createElement('div');
				contentSection.className = 'theme-settings';
				contentSection.innerHTML = '<h2>Theme Settings</h2><p>Customize your theme settings here.</p>';
				document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu').innerHTML = contentSection.outerHTML;
			} else {
				// For other tabs, check if we're returning from theme tab
				const isThemeCurrentlyActive = themeMenuItem && themeMenuItem.classList.contains('SettingsMenuComponentStyle-activeItemOptions');
				
				if (isThemeCurrentlyActive) {
					// We're switching from theme tab - let React handle this naturally
					// Just remove our theme active class and let the click proceed
					themeMenuItem.classList.remove('SettingsMenuComponentStyle-activeItemOptions');
					// Don't prevent the event - let React's handlers work
				}
			}
		}, true); // Use capture phase
	}

	/**
	 * Creates and appends the menu item
	 */
	function createMenuItem() {
		const menuContainer = document.querySelector('.SettingsMenuComponentStyle-blockMenuOptions');
		if (!menuContainer) return;

		themeMenuItem = document.createElement('li');
		themeMenuItem.className = 'SettingsMenuComponentStyle-menuItemOptions';
		themeMenuItem.innerHTML = '<span>Theme</span>';
		themeMenuItem.setAttribute('data-theme-tab', 'true');

		menuContainer.appendChild(themeMenuItem);
	}

	/**
	 * Creates a new `MutationObserver` instance to track DOM changes
	 */
	const observer = new MutationObserver(mutations => {
		requestAnimationFrame(() => processMutations(mutations));
	});

	/**
	 * Processes mutations efficiently
	 * 
	 * @param {MutationRecord[]} mutations - List of mutations
	 */
	function processMutations(mutations) {
		mutations.forEach(({ addedNodes }) => {
			addedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) initializeSettingsTab();
			});
		});
	}

	// Set up observation for changes in the document
	observer.observe(document.body, { childList: true, subtree: true });
})();