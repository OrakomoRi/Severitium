(function () {
	if (typeof Glitchium === 'undefined') {
		return;
	}

	const selector = '.UserInfoContainerStyle-blockForIconTankiOnline';

	const glitchOptions = {
		intensity: 0.9,
		minDuration: 200,
		maxDuration: 400
	};

	const appliedElements = new WeakSet();

	/**
	 * Apply random glitch effect on hover with configurable intervals
	 * @param {string|HTMLElement} selector - CSS selector or HTMLElement to apply glitch
	 * @param {Object} options - Configuration options
	 * @param {number} options.intensity - Glitch intensity (0-1, default: 0.8)
	 * @param {number} options.fps - Frame rate (default: 20)
	 * @param {number} options.minDuration - Minimum glitch duration in ms (default: 200)
	 * @param {number} options.maxDuration - Maximum glitch duration in ms (default: 400)
	 * @param {number} options.minPause - Minimum pause between glitches in ms (default: 5000)
	 * @param {number} options.maxPause - Maximum pause between glitches in ms (default: 15000)
	 * @returns {Object} Control object with start, stop, destroy methods
	 */
	function randomGlitchOnHover(selector, options = {}) {
		const glitch = new Glitchium();

		// Merge default config with user options
		const config = {
			intensity: options.intensity ?? 0.8,
			fps: options.fps ?? 20,
			minDuration: options.minDuration ?? 200,
			maxDuration: options.maxDuration ?? 400,
			minPause: options.minPause ?? 5000,
			maxPause: options.maxPause ?? 15000,
			...options
		};

		// Initialize glitch with manual control
		const control = glitch.glitch(selector, {
			playMode: 'manual',
			intensity: config.intensity,
			fps: config.fps,
			layers: config.layers,
			shake: config.shake,
			filters: config.filters
		});

		// Normalize selector to array of elements
		const elements = typeof selector === 'string'
			? document.querySelectorAll(selector)
			: (selector instanceof HTMLElement ? [selector] : []);

		if (!elements.length) {
			return { start: () => { }, stop: () => { }, destroy: () => { } };
		}

		// Store intervals per element to prevent memory leaks
		const intervals = new WeakMap();

		// Attach hover handlers to each element
		elements.forEach(el => {
			// Initialize storage for this element
			const elementData = {
				handlers: {},
				timers: {}
			};
			intervals.set(el, elementData);

			elementData.handlers.enter = () => {
				// Clear any existing timers to prevent stacking
				clearTimeout(elementData.timers.durationTimer);
				clearTimeout(elementData.timers.pauseTimer);

				// Recursive function for continuous random glitches
				function tick() {
					// Check if element is still in intervals map (not destroyed)
					if (!intervals.has(el)) return;

					control.start();

					// Random duration between min and max
					const duration = config.minDuration + Math.random() * (config.maxDuration - config.minDuration);

					elementData.timers.durationTimer = setTimeout(() => {
						// Check again before stopping
						if (!intervals.has(el)) return;

						control.stop();

						// Random pause before next glitch
						const pause = config.minPause + Math.random() * (config.maxPause - config.minPause);
						elementData.timers.pauseTimer = setTimeout(tick, pause);
					}, duration);
				}

				tick();
			};

			elementData.handlers.leave = () => {
				control.stop();
				clearTimeout(elementData.timers.durationTimer);
				clearTimeout(elementData.timers.pauseTimer);
			};

			el.addEventListener('mouseenter', elementData.handlers.enter);
			el.addEventListener('mouseleave', elementData.handlers.leave);
		});

		// Enhanced control object with proper cleanup
		return {
			start: control.start,
			stop: () => {
				control.stop();
				// Clear all timers
				elements.forEach(el => {
					const data = intervals.get(el);
					if (data?.timers) {
						clearTimeout(data.timers.durationTimer);
						clearTimeout(data.timers.pauseTimer);
					}
				});
			},
			destroy: () => {
				control.destroy();
				// Remove all event listeners and clear timers
				elements.forEach(el => {
					const data = intervals.get(el);
					if (data?.handlers) {
						el.removeEventListener('mouseenter', data.handlers.enter);
						el.removeEventListener('mouseleave', data.handlers.leave);
					}
					if (data?.timers) {
						clearTimeout(data.timers.durationTimer);
						clearTimeout(data.timers.pauseTimer);
					}
					intervals.delete(el);
				});
			}
		};
	}

	// Try to apply immediately if element exists
	const existing = document.querySelectorAll(selector);
	existing.forEach(el => {
		appliedElements.add(el);
		randomGlitchOnHover(el, glitchOptions);
	});

	// Watch for new elements
	const observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			mutation.addedNodes.forEach(node => {
				// Check if added node is element (not text/comment)
				if (node.nodeType !== 1) return;

				// Check if node itself matches selector
				if (node.matches && node.matches(selector)) {
					appliedElements.add(node);
					randomGlitchOnHover(node, glitchOptions);
				}

				// Check if node contains matching children
				if (node.querySelectorAll) {
					node.querySelectorAll(selector).forEach(el => {
						if (!appliedElements.has(el)) {
							appliedElements.add(el);
							randomGlitchOnHover(el, glitchOptions);
						}
					});
				}
			});
		});
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
})();