(function () {
	/**
	 * Function to replace notification images with SVG elements
	 * 
	 * @param {HTMLElement} element - The element to be replaced
	*/
	function changeNotificationImg(element) {
		// Get computed styles of the element
		var initStyles = window.getComputedStyle(element);

		// Create a new SVG element
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('viewBox', '0 0 30 30');
		svg.setAttribute('class', 'severitium-notificator-icon');

		// Get specific styles of the original element
		var position = initStyles.getPropertyValue('position');
		var display = initStyles.getPropertyValue('display');
		var height = initStyles.getPropertyValue('height');
		var width = initStyles.getPropertyValue('width');
		var right = initStyles.getPropertyValue('right');
		var top = initStyles.getPropertyValue('top');
		var left = initStyles.getPropertyValue('left');
		var bottom = initStyles.getPropertyValue('bottom');
		var marginRight = initStyles.getPropertyValue('margin-right');
		var marginLeft = initStyles.getPropertyValue('margin-left');
		var marginTop = initStyles.getPropertyValue('margin-top');
		var marginBottom = initStyles.getPropertyValue('margin-bottom');

		// Check if the svg is inside .MainScreenComponentStyle-blockMainMenu > ul > li > svg
		var inMainMenu = element.closest('.MainScreenComponentStyle-blockMainMenu > ul > li');

		// Set styles for the SVG element only if it's not inside main menu
		if (!inMainMenu) {
			svg.style.setProperty('position', position);
			svg.style.setProperty('display', display);
			svg.style.setProperty('height', height);
			svg.style.setProperty('width', width);
			svg.style.setProperty('right', right);
			svg.style.setProperty('top', top);
			svg.style.setProperty('left', left);
			svg.style.setProperty('bottom', bottom);
			svg.style.setProperty('margin-right', marginRight);
			svg.style.setProperty('margin-left', marginLeft);
			svg.style.setProperty('margin-top', marginTop);
			svg.style.setProperty('margin-bottom', marginBottom);
		}

		// Add SVG inner content
		svg.innerHTML = `
			<circle cx="15" cy="15" r="8" fill="var(--severitium-main-color)"/>
			<circle cx="15" cy="15" r="11.5" stroke="var(--severitium-main-color)" stroke-opacity="0.25" stroke-width="7"/>
		`;

		// Hide the original element using accessibility styles
		element.style.setProperty('position', 'absolute');
		element.style.setProperty('height', '1px');
		element.style.setProperty('width', '1px');
		element.style.setProperty('overflow', 'hidden');
		element.style.setProperty('clip', 'rect(0 0 0 0)');

		// Add the SVG as a sibling element
		element.parentNode.appendChild(svg);
	}

	/**
	 * Function to remove custom SVG when the related element is removed
	 * 
	 * @param {HTMLElement} element - The element to be replaced
	*/
	function removeNotificationSvg(element) {
		const svg = element.parentNode.querySelector('.severitium-notificator-icon');
		if (svg) {
			svg.remove();
			element.style.display = ''; // Reset display property of the original element
		}
	}

	// Selector to check the notificator icon items on the screen
	const selector = `img[class*='notification'i][src*='ellipse'i], img[class*='new'i][src*='ellipse'i]:not([class*='nonew'i]), .NewsComponentStyle-newsItemDate img[src*='circle'i]`;

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
						const iconImg = node.querySelector(selector);
						if (iconImg) { // If found
							// Get all elements
							const iconsImg = document.querySelectorAll(selector);
							for (const target of iconsImg) { // Iterate through found elements
								changeNotificationImg(target); // Apply styles to each element
							}
						}
					}
				});

				mutation.removedNodes.forEach(function (node) { // Handle removed nodes
					if (node.nodeType === Node.ELEMENT_NODE) {
						const iconImg = node.querySelector(selector);
						if (iconImg) {
							removeNotificationSvg(iconImg);
						}
					}
				});
			} else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
				const target = mutation.target;
				if (target.matches(`img[class*='new'i][src*='ellipse'i]`)) {
					const classList = target.className.split(/\s+/);
					const hasNoNewClass = classList.some(className => /nonew/i.test(className));
					if (hasNoNewClass) {
						removeNotificationSvg(target);
					} else {
						changeNotificationImg(target);
					}
				}
			}
		});
	});

	// Configuration for the mutation observer
	const observerConfig = { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] };

	// Start observing mutations in the document body
	observer.observe(document.body, observerConfig);

	// Initial check of the notificator icons
	let icon = document.querySelector(selector);

	if (icon) {
		// Get all elements
		const iconsImg = document.querySelectorAll(selector);
		for (const target of iconsImg) { // Iterate through found elements
			changeNotificationImg(target); // Apply styles to each element
		}
	}
})();