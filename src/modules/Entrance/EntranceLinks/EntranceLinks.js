(function () {
	/**
	 * Changes the entrance links icon to a new SVG icon and adds a mouseenter event listener to it
	*/
	function changeEntranceLinksIcon() {
		// Find the icon element
		const icon = document.querySelector(`.HeaderComponentStyle-enableIconLinksComponentShowed`);
		if (!icon) return;

		// Define the new SVG icon markup
		const newIcon = `
			<svg class="severitium-link-rects" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
				${[...Array(9)].map((_, i) => `<rect x="${(i % 3) * 11}" y="${Math.floor(i / 3) * 11}" width="8" height="8" rx="1"/>`).join('')}
			</svg>
		`;

		// Set the new SVG icon as innerHTML of the icon element
		icon.innerHTML = newIcon;

		// Add mouseenter event listener to the new SVG element
		const svgElement = document.querySelector('.severitium-link-rects');
		if (!svgElement) return;

		// Add mouseenter event listener to the .link-rects SVG elements
		document.querySelector(".severitium-link-rects").addEventListener("mouseenter", function () {
			let fill = this.getAttribute('fill');
			const rects = Array.from(svgElement.querySelectorAll('rect'));
			let lastIndex = -1;

			let interval = setInterval(function () {
				const index = randomInt(0, rects.length, lastIndex);
				lastIndex = index;

				// Set the color for selected random rectangle
				rects.forEach((rect, i) => {
					rect.setAttribute('fill', i === index ? 'var(--severitium-main-color)' : fill);
				});
			}, 250);

			// Add mouseleave event listener to revert changes on mouse leave
			this.addEventListener('mouseleave', function () {
				clearInterval(interval);
				for (var j = 0; j < rects.length; j++) {
					rects[j].setAttribute('fill', fill);
				}
			});
		});
	}

	/**
	 * Generates a random integer between min and max, ensuring it is not equal to the lastIndex
	 * 
	 * @param {number} min - The minimum value
	 * @param {number} max - The maximum value
	 * @param {number} lastIndex - The last selected index to avoid repetition
	 * @returns {number} - A random integer number
	 */
	function randomInt(min, max, lastIndex) {
		let index;
		do {
			index = Math.floor(Math.random() * (max - min)) + min;
		} while (index === lastIndex);
		return index;
	}

	// Creates a new MutationObserver instance to track changes in the DOM
	const observer = new MutationObserver(mutations => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => mutations.forEach(processMutation));
		} else {
			mutations.forEach(processMutation);
		}
	});

	/**
	 * Processes added nodes to replace the entrance links icon when necessary
	 * 
	 * @param {MutationRecord} mutation - Mutation record containing added nodes
	 * @param {NodeList} mutation.addedNodes - List of nodes added to the DOM
	 */
	function processMutation({ addedNodes }) {
		addedNodes.forEach(node => {
			if (node.nodeType !== Node.ELEMENT_NODE) return;
			if (node.matches('.HeaderComponentStyle-enableIconLinksComponentShowed') || node.querySelector('.HeaderComponentStyle-enableIconLinksComponentShowed')) {
				changeEntranceLinksIcon();
			}
		});
	}

	observer.observe(document.body, { childList: true, subtree: true });

	changeEntranceLinksIcon();
})();