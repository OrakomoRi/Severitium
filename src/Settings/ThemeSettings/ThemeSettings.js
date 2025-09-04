(function () {
	const containerSelector = '.SettingsComponentStyle-blockContentOptions';

	/**
	 * Initialize the custom settings tab
	 */
	function initializeSettingsTab() {
		const menuContainer = document.querySelector('.SettingsMenuComponentStyle-blockMenuOptions');
		const contentContainer = document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu');

		if (!menuContainer || !contentContainer) return;

		createMenuItem();
	}


	/**
	 * Creates and appends the menu item and content section
	 */
	function createMenuItem() {
		const menuContainer = document.querySelector('.SettingsMenuComponentStyle-blockMenuOptions');
		const menuItem = document.createElement('li');
		menuItem.className = 'SettingsMenuComponentStyle-menuOption';
		menuItem.innerHTML = '<span>Theme</span>';

		menuItem.addEventListener('click', () => {
			document.querySelectorAll('.SettingsMenuComponentStyle-menuOption').forEach(item => item.classList.remove('SettingsMenuComponentStyle-activeItemOptions'));
			menuItem.classList.add('SettingsMenuComponentStyle-activeItemOptions');

			contentSection = document.createElement('div');
			contentSection.className = 'theme-settings';
			contentSection.innerHTML = '<h2>Theme Settings</h2><p>Customize your theme settings here.</p>';
			document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu').innerHTML = contentSection.outerHTML;
		});

		// Append the new menu item
		menuContainer.appendChild(menuItem);
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