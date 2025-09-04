(function () {
	const containerSelector = '.SettingsComponentStyle-blockContentOptions';

	let themeMenuItem = null;
	let menuClickHandlerAdded = false;

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

		menuContainer.addEventListener('click', (e) => {
			const clickedItem = e.target.closest('.SettingsMenuComponentStyle-menuItemOptions');
			if (!clickedItem) return;

			// If clicking on theme tab, handle it ourselves
			if (clickedItem === themeMenuItem) {
				e.stopPropagation();
				
				// Remove active class from all items
				document.querySelectorAll('.SettingsMenuComponentStyle-menuItemOptions').forEach(item => 
					item.classList.remove('SettingsMenuComponentStyle-activeItemOptions')
				);

				// Add active class to theme tab
				clickedItem.classList.add('SettingsMenuComponentStyle-activeItemOptions');

				// Show theme content
				const contentSection = document.createElement('div');
				contentSection.className = 'theme-settings';
				contentSection.innerHTML = '<h2>Theme Settings</h2><p>Customize your theme settings here.</p>';
				document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu').innerHTML = contentSection.outerHTML;
			} else {
				// For other tabs, let the original handlers work by temporarily removing our theme tab,
				// then restoring it after the original click is processed
				const tempParent = themeMenuItem.parentNode;
				const tempNextSibling = themeMenuItem.nextSibling;
				
				// Temporarily remove theme tab so original handlers can work
				themeMenuItem.remove();
				
				// Allow original click to be processed
				setTimeout(() => {
					// Restore theme tab
					if (tempNextSibling) {
						tempParent.insertBefore(themeMenuItem, tempNextSibling);
					} else {
						tempParent.appendChild(themeMenuItem);
					}
				}, 0);
			}
		}, true); // Use capture phase to handle before other handlers
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