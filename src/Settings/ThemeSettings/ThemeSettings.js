(function () {
	const containerSelector = '.SettingsComponentStyle-blockContentOptions';

	let themeMenuItem = null;
	let menuClickHandlerAdded = false;
	let previousActiveTab = null;
	let savedContent = new Map(); // Cache for tab contents
	const MAX_CACHE_SIZE = 5;

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
	 * Cache cleanup to prevent memory leaks
	 * Called when switching tabs or when settings container is removed
	 */
	function cleanupCache() {
		// Keep only the most recent entries if cache is too large
		if (savedContent.size > MAX_CACHE_SIZE) {
			const entries = Array.from(savedContent.entries());
			const toKeep = entries.slice(-MAX_CACHE_SIZE);
			savedContent.clear();
			toKeep.forEach(([key, value]) => savedContent.set(key, value));
		}
	}

	/**
	 * Get unique identifier for a tab
	 */
	function getTabId(tabElement) {
		if (!tabElement) return null;
		
		const span = tabElement.querySelector('span');
		if (!span) return null;
		
		return span.textContent?.trim().toLowerCase();
	}

	/**
	 * Save current content for a tab
	 */
	function saveTabContent(tabElement) {
		const tabId = getTabId(tabElement);
		if (!tabId) return;
		
		const contentContainer = document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu');
		if (!contentContainer) return;
		
		// Save only the innerHTML content, not the container itself
		savedContent.set(tabId, {
			content: contentContainer.innerHTML,
			timestamp: Date.now()
		});
	}

	/**
	 * Restore content for a tab
	 */
	function restoreTabContent(tabElement) {
		const tabId = getTabId(tabElement);
		if (!tabId) return false;
		
		const cached = savedContent.get(tabId);
		if (!cached) return false;
		
		const contentContainer = document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu');
		if (!contentContainer) return false;
		
		// Restore only the innerHTML content into the existing container
		contentContainer.innerHTML = cached.content;
		
		return true;
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

			// Clean cache when switching between tabs
			cleanupCache();

			// Handle theme tab content
			if (clickedItem === themeMenuItem) {
				// Save content of currently active tab before switching
				const currentActive = document.querySelector('.SettingsMenuComponentStyle-activeItemOptions:not([data-theme-tab])');
				if (currentActive) {
					saveTabContent(currentActive);
					previousActiveTab = currentActive;
				}

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
				// Check if we're returning from theme tab
				const isThemeCurrentlyActive = themeMenuItem && themeMenuItem.classList.contains('SettingsMenuComponentStyle-activeItemOptions');
				
				if (isThemeCurrentlyActive) {
					// Check if we're returning to the same tab we came from
					if (clickedItem === previousActiveTab) {
						// Try to restore cached content
						if (restoreTabContent(clickedItem)) {
							// Content restored successfully, just update active classes
							document.querySelectorAll('.SettingsMenuComponentStyle-menuItemOptions').forEach(item => 
								item.classList.remove('SettingsMenuComponentStyle-activeItemOptions')
							);
							clickedItem.classList.add('SettingsMenuComponentStyle-activeItemOptions');
							return;
						}
					}
					
					// If no cached content or different tab, let React handle it normally
					themeMenuItem.classList.remove('SettingsMenuComponentStyle-activeItemOptions');
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
		mutations.forEach(({ addedNodes, removedNodes }) => {
			// Check for added nodes
			addedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) initializeSettingsTab();
			});
			
			// Check for removed nodes - clean cache if settings container is removed
			removedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) {
					cleanupCache();
				}
			});
		});
	}

	// Set up observation for changes in the document
	observer.observe(document.body, { childList: true, subtree: true });
})();