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
	 * Applies background animation using requestAnimationFrame
	 * 
	 * @param {HTMLElement} disabledButton - The element to which the animation will be applied
	*/
	function applyAnimation(disabledButton) {
		let { prevX, prevY } = state;

		// If animation already running, do nothing
		if (disabledButton.dataset.animationRunning) return;

		disabledButton.dataset.animationRunning = "true"; // Mark animation as running

		function animate() {
			// If the element no longer has the class, stop animation
			if (!disabledButton.classList.contains('MainScreenComponentStyle-disabledButtonPlay')) {
				delete disabledButton.dataset.animationRunning;
				return;
			}

			// Generate new random background position
			const randomX = getRandomInRange(0, 100, prevX, 35); // Random value between 0 and 100 for X
			const randomY = getRandomInRange(0, 100, prevY, 35); // Random value between 0 and 100 for Y

			// Apply styles
			disabledButton.style.transition = "background-position 0.75s ease"; // Apply smooth animation
			disabledButton.style.backgroundPosition = `${randomX}% ${randomY}%`; // Set new background position

			// Update state
			state.prevX = randomX; // Update previous value of X in dataset
			state.prevY = randomY; // Update previous value of Y in dataset

			// Schedule next frame with delay
			setTimeout(() => {
				disabledButton.dataset.animationFrameId = requestAnimationFrame(animate);
			}, 1250);
		}

		// Start animation
		disabledButton.dataset.animationFrameId = requestAnimationFrame(animate);
	}

	/**
	 * Stops the background animation of the specified element
	 * 
	 * @param {HTMLElement} disabledButton - The element from which the animation will be stopped
	*/
	function stopAnimation(disabledButton) {
		// Cancel the scheduled animation frame if it exists
		if (disabledButton.dataset.animationFrameId) {
			cancelAnimationFrame(Number(disabledButton.dataset.animationFrameId));
			delete disabledButton.dataset.animationFrameId;
		}
		
		// Remove animation flag
		delete disabledButton.dataset.animationRunning;

		// Assign the last background position to the parent element
		const playButton = document.querySelector('.MainScreenComponentStyle-playButtonContainer');
		if (playButton) {
			playButton.style.backgroundPosition = `${state.prevX}% ${state.prevY}%`;
		}
	}

	/**
	 * Handles mutations efficiently
	 */
	const observer = new MutationObserver((mutations) => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => processMutations(mutations));
			return;
		}
		
		// Fallback: Process changes immediately if `requestAnimationFrame` is not supported
		processMutations(mutations);
	});

	function processMutations(mutations) {
		for (const mutation of mutations) {
			if (mutation.type === 'childList') {
				for (const node of mutation.addedNodes) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						// Check if added node or its descendants contain the target element
						const targetNode = node.matches('.MainScreenComponentStyle-playButtonContainer') 
							? node 
							: node.querySelector('.MainScreenComponentStyle-playButtonContainer');
						
						if (targetNode?.classList.contains('MainScreenComponentStyle-disabledButtonPlay')) {
							applyAnimation(targetNode);
						}
					}
				}

				for (const node of mutation.removedNodes) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						// Check if removed node or its descendants contain the target element
						const targetNode = node.matches('.MainScreenComponentStyle-playButtonContainer') 
							? node 
							: node.querySelector('.MainScreenComponentStyle-playButtonContainer');
						
						if (targetNode) {
							stopAnimation(targetNode);
						}
					}
				}
			}

			// Optimize attribute mutation handling
			if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
				const target = mutation.target;
				if (target.classList.contains('MainScreenComponentStyle-playButtonContainer')) {
					if (target.classList.contains('MainScreenComponentStyle-disabledButtonPlay')) {
						applyAnimation(target);
					} else {
						stopAnimation(target);
					}
				}
			}
		}
	}

	// Start observing document body for changes
	observer.observe(document.body, { attributes: true, childList: true, subtree: true });
})();