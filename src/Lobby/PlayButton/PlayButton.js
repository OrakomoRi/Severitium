(function () {
	// State to keep track of the previous X and Y values of button background
	let state = {
		prevX: 10,
		prevY: 25,
	};
	
	/**
	 * Generates a random number within a specified range with a maximum difference from the previous value
	 * 
	 * @param {number} min - The minimum value of the range
	 * @param {number} max - The maximum value of the range
	 * @param {number} prev - The previous value for comparison
	 * @param {number} maxDifference - The maximum allowed difference between the new and previous values
	 * @returns {number} - The generated random number
	*/
	function getRandomInRange(min, max, prev, maxDifference) {
		let val;
		do {
			val = Math.floor(Math.random() * (max - min + 1)) + min;
		} while (Math.abs(val - prev) > maxDifference);
		return val;
	}

	/**
	 * Applies background animation to the specified element
	 * 
	 * @param {HTMLElement} disabledButton - The element to which the animation will be applied
	*/
	function applyAnimation(disabledButton) {
		let prevX = state.prevX || 10; // Previous value of X
		let prevY = state.prevY || 25; // Previous value of Y

		const intervalId = setInterval(function () {
			const randomX = getRandomInRange(0, 100, prevX, 35); // Random value between 0 and 100 for X
			const randomY = getRandomInRange(0, 100, prevY, 35); // Random value between 0 and 100 for Y
			disabledButton.style.transition = "background-position 0.75s ease"; // Apply smooth animation
			disabledButton.style.backgroundPosition = `${randomX}% ${randomY}%`; // Set new background position
			state.prevX = randomX; // Update previous value of X in dataset
			state.prevY = randomY; // Update previous value of Y in dataset
		}, 1250); // Update position every 1.25 seconds

		// Save interval identifier in the element's dataset
		disabledButton.dataset.animationIntervalId = intervalId;
	}

	/**
	 * Stops the background animation of the specified element
	 * 
	 * @param {HTMLElement} disabledButton - The element from which the animation will be stopped
	*/
	function stopAnimation(disabledButton) {
		// Get the interval identifier from the element's dataset
		const intervalId = disabledButton.dataset.animationIntervalId;
		if (intervalId) {
			// If the interval exists, clear it
			clearInterval(intervalId);
			// Remove dataset attribute from the element
			delete disabledButton.dataset.animationIntervalId;
			// Assign the last background position to the parent element MainScreenComponentStyle-playButtonContainer
			const playButton = document.querySelector('.MainScreenComponentStyle-playButtonContainer');
			if (playButton) {
				// Set the background position of the parent container
				playButton.style.backgroundPosition = `${state.prevX}% ${state.prevY}%`;
			}
		}
	}

	// Create a new instance of MutationObserver
	const observer = new MutationObserver(function (mutationsList) {
		// Iterate through all mutations
		for (const mutation of mutationsList) {
			// Check if the mutation is done with some child
			if (mutation.type === 'childList') {
				for (const node of mutation.addedNodes) {
					if (node.nodeType === node.ELEMENT_NODE) {
						// Check if the added node or its descendants contain the target class
						const targetNode = node.classList && node.classList.contains('MainScreenComponentStyle-playButtonContainer') 
							? node 
							: node.querySelector('.MainScreenComponentStyle-playButtonContainer');
						if (targetNode && targetNode.classList.contains('MainScreenComponentStyle-disabledButtonPlay')) {
							applyAnimation(targetNode);
						}
					}
				}

				for (const node of mutation.removedNodes) {
					if (node.nodeType === node.ELEMENT_NODE) {
						// Check if the removed node or its descendants contain the target class
						const targetNode = node.classList && node.classList.contains('MainScreenComponentStyle-playButtonContainer') 
							? node 
							: node.querySelector('.MainScreenComponentStyle-playButtonContainer');
						if (targetNode) {
							stopAnimation(targetNode);
						}
					}
				}
			}

			// Check if the mutation is an attribute change
			if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
				// Check if the element is a .MainScreenComponentStyle-playButtonContainer
				const target = mutation.target;
				if (target.classList.contains('MainScreenComponentStyle-playButtonContainer')) {
					// Check if the .MainScreenComponentStyle-disabledButtonPlay class is added
					if (target.classList.contains('MainScreenComponentStyle-disabledButtonPlay')) {
						// If yes, apply animation to the element
						applyAnimation(target);
					} else {
						// If the .MainScreenComponentStyle-disabledButtonPlay class is removed, stop the animation
						stopAnimation(target);
						// Leave the background position as it is
					}
				}
			}
		}
	});

	// Set up observation for changes in the document
	observer.observe(document.body, { attributes: true, childList: true, subtree: true });
})();