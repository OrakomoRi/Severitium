(function () {
	/**
	 * Function to replace notification images with SVG elements
	 * 
	 * @param {HTMLElement} element - The element to be replaced
	 */
	function changeNotificationImg(element) {
		if (element.dataset.replaced) return; // Avoid re-processing the same element

		// Get computed styles of the element
		const initStyles = window.getComputedStyle(element);

		// Create a new SVG element
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('viewBox', '0 0 30 30');
		svg.classList.add('severitium-notificator-icon');

		// Check if inside the main menu
		const inMainMenu = element.closest('.MainScreenComponentStyle-blockMainMenu > ul > li');

		// Apply styles only if not inside the main menu
		if (!inMainMenu) {
			Object.assign(svg.style, {
				position: initStyles.position,
				display: initStyles.display,
				height: initStyles.height,
				width: initStyles.width,
				right: initStyles.right,
				top: initStyles.top,
				left: initStyles.left,
				bottom: initStyles.bottom,
				marginRight: initStyles.marginRight,
				marginLeft: initStyles.marginLeft,
				marginTop: initStyles.marginTop,
				marginBottom: initStyles.marginBottom,
			});
		}

		// Add SVG inner content
		svg.innerHTML = `
			<circle cx="15" cy="15" r="8" fill="var(--severitium-main-color)"/>
			<circle cx="15" cy="15" r="11.5" stroke="var(--severitium-main-color)" stroke-opacity="0.25" stroke-width="7"/>
		`;

		// Hide the original element
		Object.assign(element.style, {
			position: 'absolute',
			height: '1px',
			width: '1px',
			overflow: 'hidden',
			clip: 'rect(0 0 0 0)'
		});

		// Mark the element as processed
		element.dataset.replaced = "true";

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
			delete element.dataset.replaced; // Remove processing flag
			element.style.display = ''; // Reset display property of the original element
		}
	}

	// Selector for notification icons
	const selector = `img[class*='notification'i][src*='ellipse'i], img[class*='new'i][src*='ellipse'i]:not([class*='nonew'i]), .NewsComponentStyle-newsItemDate img[src*='circle'i]`;

	/**
	 * Process mutations efficiently
	 * 
	 * @param {MutationRecord[]} mutations - List of observed mutations
	 */
	function processMutations(mutations) {
		mutations.forEach(({ addedNodes, removedNodes, type, target, attributeName }) => {
			addedNodes.forEach((node) => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;

				// Check if the node itself or its children match the selector
				const iconImg = node.matches(selector) ? node : node.querySelector(selector);
				if (iconImg) changeNotificationImg(iconImg);
			});

			removedNodes.forEach((node) => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;

				const iconImg = node.matches(selector) ? node : node.querySelector(selector);
				if (iconImg) removeNotificationSvg(iconImg);
			});

			// Handling changes in class attributes
			if (type === 'attributes' && attributeName === 'class' && target.matches(`img[class*='new'i][src*='ellipse'i]`)) {
				const hasNoNewClass = [...target.classList].some(className => /nonew/i.test(className));
				hasNoNewClass ? removeNotificationSvg(target) : changeNotificationImg(target);
			}
		});
	}

	// Create a new instance of MutationObserver
	const observer = new MutationObserver((mutations) => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => processMutations(mutations));
		} else {
			processMutations(mutations); // Fallback for old browsers
		}
	});

	// Start observing mutations in the document body
	observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

	// Initial processing of notification icons
	document.querySelectorAll(selector).forEach(changeNotificationImg);
})();