(function () {
	const containerSelector = '.SettingsComponentStyle-blockContentOptions';

	let themeMenuItem = null;
	let menuClickHandlerAdded = false;
	let isThemeTabActive = false;

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

		// If theme tab was active, restore it
		if (isThemeTabActive) {
			showThemeContent();
		}
	}

	/**
	 * Show theme content
	 */
	function showThemeContent() {
		// Remove active class from all items
		document.querySelectorAll('.SettingsMenuComponentStyle-menuItemOptions').forEach(item => 
			item.classList.remove('SettingsMenuComponentStyle-activeItemOptions')
		);

		// Add active class to theme tab
		if (themeMenuItem) {
			themeMenuItem.classList.add('SettingsMenuComponentStyle-activeItemOptions');
		}

		// Show theme content
		const contentContainer = document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu');
		if (contentContainer) {
			const contentSection = document.createElement('div');
			contentSection.className = 'theme-settings';
			contentSection.innerHTML = '<h2>Theme Settings</h2><p>Customize your theme settings here.</p>';
			contentContainer.innerHTML = contentSection.outerHTML;
		}
		
		isThemeTabActive = true;
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

			// Handle theme tab content
			if (clickedItem === themeMenuItem) {
				e.preventDefault();
				e.stopPropagation();
				showThemeContent();
				return;
			} 
			
			// If clicking on any other tab while theme is active, let React handle it
			if (isThemeTabActive) {
				isThemeTabActive = false;
				// Remove active class from theme tab
				if (themeMenuItem) {
					themeMenuItem.classList.remove('SettingsMenuComponentStyle-activeItemOptions');
				}
				// Let the natural React click handler proceed
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
		mutations.forEach(({ addedNodes, removedNodes }) => {
			// Check for added nodes
			addedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) initializeSettingsTab();
			});
			
			// Check for removed nodes - reset state if settings container is removed
			removedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) {
					isThemeTabActive = false;
				}
			});
		});
	}

	// Set up observation for changes in the document
	observer.observe(document.body, { childList: true, subtree: true });
})();