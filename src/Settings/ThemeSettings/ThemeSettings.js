(function () {
	const containerSelector = '.SettingsComponentStyle-blockContentOptions';

	let themeMenuItem = null;
	let menuClickHandlerAdded = false;
	let isThemeTabActive = false;
	let themeContentElement = null;
	let previousActiveTab = null;

	/**
	 * Initialize the custom settings tab
	 */
	function initializeSettingsTab() {
		const menuContainer = document.querySelector('.SettingsMenuComponentStyle-blockMenuOptions');
		const contentContainer = document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu');

		if (!menuContainer || !contentContainer) return;

		// Add CSS for hiding content
		addHiddenContentCSS();

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
	 * Add CSS rule for hiding content
	 */
	function addHiddenContentCSS() {
		if (document.getElementById('theme-settings-css')) return;

		const style = document.createElement('style');
		style.id = 'theme-settings-css';
		style.textContent = '.content-hidden { display: none !important; }';
		document.head.appendChild(style);
	}

	/**
	 * Show theme content by hiding original and showing custom
	 */
	function showThemeContent() {
		const contentContainer = document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu');
		if (!contentContainer) return;

		// Save currently active tab before switching to theme
		previousActiveTab = document.querySelector('.SettingsMenuComponentStyle-activeItemOptions:not([data-theme-tab])');

		// Hide all original content with CSS class
		const originalChildren = contentContainer.children;
		for (let child of originalChildren) {
			if (!child.classList.contains('theme-settings-custom')) {
				child.classList.add('content-hidden');
			}
		}

		// Create or show our custom theme content
		if (!themeContentElement) {
			themeContentElement = document.createElement('div');
			themeContentElement.className = 'theme-settings-custom';
			themeContentElement.innerHTML = '<h2>Theme Settings</h2><p>Customize your theme settings here.</p>';
			contentContainer.appendChild(themeContentElement);
		} else {
			themeContentElement.style.display = 'block';
		}

		// Remove active class from all items and add to theme tab
		document.querySelectorAll('.SettingsMenuComponentStyle-menuItemOptions').forEach(item => 
			item.classList.remove('SettingsMenuComponentStyle-activeItemOptions')
		);
		
		if (themeMenuItem) {
			themeMenuItem.classList.add('SettingsMenuComponentStyle-activeItemOptions');
		}
		
		isThemeTabActive = true;
	}

	/**
	 * Hide theme content and restore original
	 */
	function hideThemeContent() {
		const contentContainer = document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu');
		if (!contentContainer) return;

		// Hide our custom content
		if (themeContentElement) {
			themeContentElement.style.display = 'none';
		}

		// Restore all original content by removing CSS class
		const originalChildren = contentContainer.children;
		for (let child of originalChildren) {
			if (!child.classList.contains('theme-settings-custom')) {
				child.classList.remove('content-hidden');
			}
		}

		// Remove active class from theme tab
		if (themeMenuItem) {
			themeMenuItem.classList.remove('SettingsMenuComponentStyle-activeItemOptions');
		}
		
		isThemeTabActive = false;
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
			
			// If clicking on any other tab while theme is active, hide theme content
			if (isThemeTabActive) {
				hideThemeContent();
				
				// If we're returning to the previously active tab, restore its active class
				if (clickedItem === previousActiveTab) {
					e.preventDefault();
					e.stopPropagation();
					clickedItem.classList.add('SettingsMenuComponentStyle-activeItemOptions');
				}
				// For other tabs, let React handle it normally
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
					themeContentElement = null;
					previousActiveTab = null;
				}
			});
		});
	}

	// Set up observation for changes in the document
	observer.observe(document.body, { childList: true, subtree: true });
})();