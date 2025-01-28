(function () {
	// Represents a collection of stars and their properties
	let stars = {};
	// Represents the index of the stars collection
	let index = 0;
	// Represents the count of stars currently present
	let count = 0;
	// Represents the coefficient for acceleration smoothing
	const smoothnessFactor = 50;
	// Represents the basic acceleration of stars
	let baseAcceleration = 0.05;

	/**
	 * Represents a star with properties and methods for updating and drawing.
	 */
	class Star {
		/**
		 * Creates a new star
		 * 
		 * @param {HTMLElement} canvas - The canvas element to draw the star on
		 */
		constructor(canvas) {
			// Use the global canvas
			this.canvas = canvas;

			// Initial position and velocity of the star
			// By the start X & Y are the center of the canvas
			this.X = this.canvas.width / 2;
			this.Y = this.canvas.height / 2;
			// Random factor to set the star on canvas
			this.SX = Math.random() * 10 - 5;
			this.SY = Math.random() * 10 - 5;

			// Adjust position based on canvas dimensions
			const start = this.canvas.width > this.canvas.height ? this.canvas.width : this.canvas.height;
			// X & Y are changed to meet the random position
			this.X += (this.SX * start) / 10;
			this.Y += (this.SY * start) / 10;

			// Assign an ID to the star
			index++;
			stars[index] = this;
			this.ID = index;

			// Choose random color for the star
			const colors = ['#ffffff', '#fec777', '#498fb3', '#77fee1', '#fa8072'];
			this.C = colors[Math.floor(Math.random() * colors.length)];

			// Define the shape of the star (just a path from svg)
			this.path = new Path2D('M1 .5C.72.5.5.28.5 0 .5.28.28.5 0 .5.28.5.5.72.5 1 .5.72.72.5 1 .5');

			// Random scale for the star
			this.scale = randomNum(2, 8, 2);
		}

		/**
		 * Draws the star on the canvas
		 * 
		 * @param {number} delta - Time elapsed since the last frame, in seconds
		 */
		draw(delta) {
			if (!this.canvas) return;

			// Update position based on velocity and delta
			this.X += this.SX * delta * 60;
			this.Y += this.SY * delta * 60;

			// Update velocity with acceleration
			this.SX += (this.SX / (smoothnessFactor / baseAcceleration)) * delta * 60;
			this.SY += (this.SY / (smoothnessFactor / baseAcceleration)) * delta * 60;

			// Check if star is out of bounds
			if (
				this.X < 0 - this.scale * 10 ||
				this.X > this.canvas.width ||
				this.Y < 0 - this.scale * 10 ||
				this.Y > this.canvas.height
			) {
				delete stars[this.ID];
				count--;
			}

			// Get canvas 2D context to draw the star
			let ctx = this.canvas.getContext('2d');

			// Save the canvas position, scale, etc.
			ctx.save();

			// Translate, scale, stroke, and fill the star path
			ctx.fillStyle = this.C;
			ctx.translate(this.X, this.Y);
			ctx.scale(this.scale, this.scale);
			ctx.stroke(this.path);
			ctx.fill(this.path);

			// Restore the canvas
			ctx.restore();
		}
	}

	/**
	 * Initializes the animated background with stars
	 * 
	 * @param {HTMLElement} backgroundElement - The element to append the canvas to
	 */
	function animatedBackground(backgroundElement) {
		if (!backgroundElement) return;

		let canvas;

		// Create canvas element
		canvas = document.createElement('canvas');
		canvas.className = 'severitium-star-canvas';

		// Create container to store the canvas
		const canvasContainer = document.createElement('div');
		canvasContainer.className = 'severitium-star-canvas-container';

		// Place the container into the parent element and the canvas into the container
		backgroundElement.appendChild(canvasContainer);
		canvasContainer.appendChild(canvas);

		// Fill the canvas background
		canvas.getContext('2d').fillStyle = 'rgba(0, 0, 0, .8)';
		canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);

		// Set canvas dimensions
		canvas.width = backgroundElement.clientWidth;
		canvas.height = backgroundElement.clientHeight;

		// Calculate number of stars to draw
		let starsToDraw = (canvas.width * canvas.height) / 5000;

		let lastTime = performance.now();

		/**
		 * Animates the gears by clearing the canvas and redrawing them
		 * 
		 * @param {number} timestamp - Current timestamp provided by requestAnimationFrame
		 */
		function draw(timestamp) {
			if (!canvas || !canvas.getContext) {
				return;
			}

			// Resize canvas if needed
			if (canvas.width !== backgroundElement.clientWidth) {
				canvas.width = backgroundElement.clientWidth;
			}
			if (canvas.height !== backgroundElement.clientHeight) {
				canvas.height = backgroundElement.clientHeight;
			}

			// Calculate time delta
			const delta = (timestamp - lastTime) / 1000; // Delta time in seconds
			lastTime = timestamp;

			// Fill the canvas every frame
			canvas.getContext('2d').fillStyle = 'rgba(0, 0, 0, .8)';
			canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);

			// Add new stars and draw existing stars
			for (let i = count; i < starsToDraw; i++) {
				new Star(canvas);
				count++;
			}

			for (const star in stars) {
				stars[star].draw(delta);
			}

			// Request the next animation frame
			requestAnimationFrame(draw);
		}

		// Start the animation
		requestAnimationFrame(draw);
	}

	/**
	 * Removes the animated background canvas from the DOM
	 * 
	 * @param {HTMLElement} backgroundElement - The element containing the canvas
	 */
	function animatedBackgroundDelete(backgroundElement) {
		if (!backgroundElement) return;

		// Get the canvas element
		const canvas = backgroundElement.querySelector('.severitium-star-canvas');

		if (canvas) {
			canvas.parentNode.remove();
		}
	}

	/**
	 * Replaces the original progress bar with a custom one
	 * 
	 * @param {HTMLElement} element - The original progress bar element
	 */
	function replaceOriginalProgress(element) {
		// New progress div
		const newProgress = document.createElement('div');
		// Inner of the new progress
		const progressInner = document.createElement('div');
		// Set the class of the new progrss
		newProgress.className = 'severitium-progress';
		// Set the bottom position (to replace the old one)
		newProgress.style.bottom = element.style.bottom;
		// Append the inner to the new progrss
		newProgress.appendChild(progressInner);

		// Replace original progress element with the custom one
		element.replaceWith(newProgress);
	}

	/**
	 * Generates a random number between min and max
	 * @param {number} min - The minimum value
	 * @param {number} max - The maximum value
	 * @param {number} precision - The number of digits after the point
	 * @returns {number} - A random number
	 */
	function randomNum(min, max, precision) {
		return Math.max((Math.random() * max), min).toFixed(precision);
	}

	/**
	 * Create a new instance of MutationObserver with a callback function
	 * to observe changes in the DOM 
	 */
	const observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.type === 'childList' && mutation.addedNodes.length > 0) { // If the change is of type childList
				mutation.addedNodes.forEach(function (node) { // Iterate through added nodes
					if (node.nodeType === Node.ELEMENT_NODE) { // If it's an element node
						// Find an element with the needed selector in the added node
						const check = node.classList.contains('ApplicationLoaderComponentStyle-container') || node.classList.contains('LobbyLoaderComponentStyle-container');
						if (check) { // If found
							animatedBackground(node);
						}

						// Find a progress element
						const progress = document.querySelector('.ApplicationLoaderComponentStyle-loader, .progress, .LobbyLoaderComponentStyle-loaderContainer img, #preloader .progress');
						if (progress) { // If found
							replaceOriginalProgress(progress);
						}
					}
				});
			} else if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
				mutation.removedNodes.forEach(function (node) { // Iterate through removed nodes
					if (node.nodeType === Node.ELEMENT_NODE) { // If it's an element node
						// Find an element with the needed selector in the added node
						const check = node.classList.contains('ApplicationLoaderComponentStyle-container') || node.classList.contains('LobbyLoaderComponentStyle-container');
						if (check) { // If found
							animatedBackgroundDelete(node);
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

	// Check a progress element immediately after the page loads
	const progress = document.querySelector('.ApplicationLoaderComponentStyle-loader, .progress, .LobbyLoaderComponentStyle-loaderContainer img, #preloader .progress');
	if (progress) {
		replaceOriginalProgress(progress);
	}
})();