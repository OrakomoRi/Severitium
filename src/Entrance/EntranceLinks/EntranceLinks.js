(function () {
	/**
	 * Changes the entrance links icon to a new SVG icon and adds a mouseenter event listener to it
	*/
	function changeEntranceLinksIcon() {
		// Find the icon element
		const icon = document.querySelector(`.HeaderComponentStyle-enableIconLinksComponentShowed`);

		// Define the new SVG icon markup
		const newIcon = `<svg class="severitium-link-rects" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="8" height="8" rx="1"/><rect x="11" y="0" width="8" height="8" rx="1"/><rect x="22" y="0" width="8" height="8" rx="1"/><rect x="0" y="11" width="8" height="8" rx="1"/><rect x="11" y="11" width="8" height="8" rx="1"/><rect x="22" y="11" width="8" height="8" rx="1"/><rect x="0" y="22" width="8" height="8" rx="1"/><rect x="11" y="22" width="8" height="8" rx="1"/><rect x="22" y="22" width="8" height="8" rx="1"/></svg>`;

		// Set the new SVG icon as innerHTML of the icon element
		icon.innerHTML = newIcon;

		// Add mouseenter event listener to the .link-rects SVG elements
		document.querySelector(".severitium-link-rects").addEventListener("mouseenter", function () {
			fill = this.getAttribute('fill');

			var rects = this.querySelectorAll("rect");

			var lastIndex;

			var interval = setInterval(function () {
				// Random next index
				var index;
				do {
					index = randomInt(0, rects.length);
				} while (lastIndex === index); // Cannot be the same as previous

				lastIndex = index;

				// Set the color for selected random rectangle
				for (var j = 0; j < rects.length; j++) {
					if (j === index) {
						rects[j].setAttribute("fill", "var(--severitium-main-color)");
					} else {
						rects[j].setAttribute("fill", fill);
					}
				}
			}, 250);

			// Add mouseleave event listener to revert changes on mouse leave
			this.addEventListener("mouseleave", function () {
				clearInterval(interval);
				for (var j = 0; j < rects.length; j++) {
					rects[j].setAttribute("fill", fill);
				}
			});
		});
	}

	/**
	 * Generates a random integer between min and max
	 * @param {number} min - The minimum value
	 * @param {number} max - The maximum value
	 * @returns {number} - A random integer number
	*/
	function randomInt(min, max) {
		return Math.floor((Math.random() * max) + min);
	}

	/**
	 * Creates a new instance of MutationObserver to observe changes in the DOM
	*/
	const observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.type === 'childList') { // If the change is of type childList
				mutation.addedNodes.forEach(function (node) { // Iterate through added nodes
					if (node.nodeType === Node.ELEMENT_NODE) { // If it's an element node
						// Find an element with the needed selector in the added node
						const icon = node.querySelector(`.HeaderComponentStyle-enableIconLinksComponentShowed`);
						if (icon) { // If found
							changeEntranceLinksIcon();
						}
					}
				});
			}
		});
	});

	// Configuration for the mutation observer
	const observerConfig = { childList: true, subtree: true };

	// Start observing mutations in the document body
	observer.observe(document.body, observerConfig);
})();