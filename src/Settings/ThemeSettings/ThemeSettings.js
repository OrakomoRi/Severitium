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

		// Always recreate menu item to ensure it's valid
		createMenuItem();

		// Add event delegation only once
		if (!menuClickHandlerAdded) {
			addMenuEventDelegation();
			menuClickHandlerAdded = true;
		}

		// If theme tab was active, restore it and hide original content
		if (isThemeTabActive) {
			// Use setTimeout to ensure React has finished rendering the content
			setTimeout(() => {
				showThemeContent();
			}, 100);
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

		// Save currently active tab before switching to theme (only if not already theme active)
		if (!isThemeTabActive) {
			previousActiveTab = document.querySelector('.SettingsMenuComponentStyle-activeItemOptions:not([data-theme-tab])');
		}

		// Hide all original content with CSS class
		hideOriginalContent();

		// Always recreate theme content to ensure it's valid
		const existingThemeContent = contentContainer.querySelector('.theme-settings-custom');
		if (existingThemeContent) {
			existingThemeContent.remove();
		}

		themeContentElement = document.createElement('div');
		themeContentElement.className = 'theme-settings-custom';
		themeContentElement.innerHTML = '<h2>Theme Settings</h2><p>Customize your theme settings here.</p>';
		contentContainer.appendChild(themeContentElement);

		// Remove active class from all items and add to theme tab
		document.querySelectorAll('.SettingsMenuComponentStyle-menuItemOptions').forEach(item => 
			item.classList.remove('SettingsMenuComponentStyle-activeItemOptions')
		);
		
		// Ensure we have a valid theme menu item
		if (!themeMenuItem || !document.contains(themeMenuItem)) {
			themeMenuItem = document.querySelector('[data-theme-tab="true"]');
		}
		
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
	 * Hide original content when theme is active (for use during initialization)
	 */
	function hideOriginalContent() {
		const contentContainer = document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu');
		if (!contentContainer) return;

		// Hide all original content with CSS class
		const originalChildren = contentContainer.children;
		for (let child of originalChildren) {
			if (!child.classList.contains('theme-settings-custom')) {
				child.classList.add('content-hidden');
			}
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

			// Check if this is our theme tab (by data attribute)
			if (clickedItem.getAttribute('data-theme-tab') === 'true') {
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

		// Remove existing theme tab if it exists
		const existingThemeTab = menuContainer.querySelector('[data-theme-tab="true"]');
		if (existingThemeTab) {
			existingThemeTab.remove();
		}

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
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) {
					initializeSettingsTab();
					
					// If theme was active and new content appeared, hide it after React renders
					if (isThemeTabActive) {
						setTimeout(() => {
							hideOriginalContent();
						}, 50);
					}
				}
			});
			
			// Check for removed nodes - reset state if settings container is removed
			removedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) {
					// Don't reset isThemeTabActive - we want to preserve the state
					themeContentElement = null;
					previousActiveTab = null;
				}
			});
		});
	}

	// Set up observation for changes in the document
	observer.observe(document.body, { childList: true, subtree: true });
})();