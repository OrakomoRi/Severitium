(function () {
	/**
	 * Represents a gear with properties and methods for updating and drawing
	*/
	class Gear {
		/**
		 * Creates a new gear
		 * 
		 * @param {number} x - The X-coordinate of the gear's center
		 * @param {number} y - The Y-coordinate of the gear's center
		 * @param {number} size - The size of the gear
		 * @param {number} radius - The radius of the gear
		 * @param {number} speed - The rotation speed of the gear
		 * @param {boolean} direction - The rotation direction (true for clockwise, false for counter-clockwise)
		*/
		constructor(x, y, size, radius, speed, direction) {
			this.x = x;  // X-coordinate of the gear's center
			this.y = y;  // Y-coordinate of the gear's center
			this.size = size;  // Size of the gear
			this.radius = radius;  // Radius of the gear
			this.speed = speed;  // Rotation speed of the gear
			this.direction = direction;  // Rotation direction (true for clockwise, false for counter-clockwise)
			this.angle = 0;  // Initial rotation angle

			// Array with possible colors
			const colors = ['#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529'];

			// Choose random color for the figure
			this.C = colors[Math.floor(Math.random() * colors.length)];

			// Define the shape of the figure (just a path from svg)
			this.path = new Path2D('M.44 0 .38.15S.36.15.35.16L.2.1.11.19l.06.15s0 .02-.01.03L0 .44v.13l.15.06c0 .01 0 .02.01.03L.1.81.19.9.34.84s.02 0 .03.01L.43 1h.13L.62.85C.63.85.64.85.65.84L.8.9.89.81.83.66s0-.02.01-.03L.99.57V.44L.84.38C.84.37.84.36.83.35L.89.2.8.11.65.17S.63.17.62.16L.56 0H.43Zm.03.31c.1-.02.2.05.22.15V.5a.19.19 0 1 1-.38 0C.31.41.37.33.46.31');
		}

		/**
		 * Updates the angle of the gear based on its speed and direction
		*/
		update() {
			// Update the angle based on speed and direction
			this.angle += this.direction ? this.speed : -this.speed;
		}

		/**
		 * Draws the gear on the given canvas context
		 * 
		 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
		*/
		draw(ctx) {
			ctx.save(); // Save the current canvas state
			ctx.fillStyle = this.C; // Set the fill color
			ctx.translate(this.x, this.y); // Move the canvas origin to the gear's center
			ctx.rotate(this.angle); // Rotate the canvas by the gear's angle
			ctx.translate(-this.radius, -this.radius); // Move the origin to the top-left of the gear
			ctx.scale(this.size, this.size); // Scale the gear
			ctx.fill(this.path); // Fill the path with the current fill color
			ctx.restore(); // Restore the previous canvas state
		}
	}

	/**
	 * Initializes the animated background with stars
	 * 
	 * @param {HTMLElement} backgroundElement - The element to append the canvas to
	*/
	function animatedBackground(backgroundElement) {
		if (!backgroundElement) return;

		// Create canvas element
		const canvas = document.createElement('canvas');
		canvas.className = 'severitium-gear-canvas';

		// Take the context of the canvas
		const ctx = canvas.getContext('2d');

		// Insert the canvas as the first child of backgroundElement
		backgroundElement.insertBefore(canvas, backgroundElement.firstChild);

		// Standard size of a single gear
		const standardSize = 25;
		// Range of values by which the standard size can be multiplied
		const minSizeFactor = 1, maxSizeFactor = 2.5;

		// A variable storing groups of gears
		let groups = [];

		/**
		 * Initializes the canvas and generates gear groups
		*/
		function initialize() {
			canvas.width = window.innerWidth; // Set canvas width to window width
			canvas.height = window.innerHeight; // Set canvas height to window height
			groups = []; // Reset the groups array

			let targetGroups = getRandomNumber(4, 20, 12); // Determine the number of groups to generate

			// Generate groups until the desired number is reached
			while (groups.length < targetGroups) {
				const group = generateGroup(); // Generate a new group
				// Add the valid group to the groups array
				if (isGroupValid(group, groups)) {
					groups.push(group);
				}
			}
		}

		// Reinitialize gears on window resize
		window.onresize = initialize;

		/**
		 * Generates a random number of gears based on weighted probabilities
		 * 
		 * @returns {number} - A random number of gears
		*/
		function getRandomNumber(min, max, mode) {
			const numbers = []; // Array to hold numbers and their weights
			for (let i = min; i <= max; i++) { // Generate numbers from min number to max number
				const distance = Math.abs(i - mode); // Calculate the distance from mode number
				const weight = 1 / (distance + 1); // Calculate the weight based on the distance
				numbers.push({ number: i, weight }); // Add the number and its weight to the array
			}

			const totalInitialWeight = numbers.reduce((acc, item) => acc + item.weight, 0); // Calculate the total initial weight
			const targetWeightForTwo = totalInitialWeight * 0.05; // Target weight for the min number
			const currentWeightForTwo = numbers.find(item => item.number === min).weight; // Current weight for the min number
			const weightAdjustmentFactor = targetWeightForTwo / currentWeightForTwo; // Calculate the weight adjustment factor

			numbers.forEach(item => {
				item.weight = (item.number === min) ? targetWeightForTwo : item.weight / weightAdjustmentFactor; // Adjust weights
			});

			const totalWeight = numbers.reduce((acc, item) => acc + item.weight, 0); // Calculate the total weight
			let randomWeight = Math.random() * totalWeight; // Generate a random weight

			// Select a number based on the random weight
			for (const item of numbers) {
				randomWeight -= item.weight;
				if (randomWeight < 0) {
					return item.number; // Return the selected number
				}
			}
		}

		/**
		 * Generates a new group of gears
		 * 
		 * @returns {Gear[]} - An array representing the group of gears
		*/
		function generateGroup() {
			const group = []; // Array to hold the gears in the group
			const baseSpeed = parseFloat((Math.random() * 0.01 + 0.05).toFixed(2)); // Random base speed for the group

			// Ensure initial coordinates are within the bounds
			const startX = parseFloat((Math.random() * (canvas.width - 200) + 100).toFixed());
			const startY = parseFloat((Math.random() * (canvas.height - 200) + 100).toFixed());

			let generating = true; // Flag to control gear generation

			// Generate gears until the group has at least 4 gears and generating random is working
			while (group.length < 4 || generating) {
				const size = parseFloat(((Math.random() * (maxSizeFactor - minSizeFactor) + minSizeFactor) * standardSize).toFixed(2));
				const radius = size / 2; // Calculate the radius based on the size
				const speed = parseFloat((baseSpeed / (size / standardSize)).toFixed(4)); // Calculate the speed based on the size

				const prevGear = group[Math.floor(Math.random() * group.length)]; // Randomly select a previous gear in the group
				const degree = Math.floor(Math.random() * 360) + 1; // Randomly select the degree of the new gear relative to the previous one

				// Calculate coordinates
				const x = prevGear ? parseFloat((prevGear.x + Math.sin(degree) * (prevGear.radius + radius + 1)).toFixed()) : startX;
				const y = prevGear ? parseFloat((prevGear.y + Math.cos(degree) * (prevGear.radius + radius + 1)).toFixed()) : startY;

				// Create a new gear with calculated properties
				const newGear = new Gear(
					x,
					y,
					size,
					radius,
					speed,
					prevGear ? !prevGear.direction : group.length % 2 === 0
				);

				// Check if the new gear's position is valid and add it to the group if so
				if (isGearPositionValid(newGear, group)) {
					group.push(newGear);
					generating = Math.random() < getGearGenerationProbability(group.length); // Determine if more gears should be generated
				}
			}

			return group; // Return the generated group
		}

		/**
		 * Gets the probability of generating another gear based on the current index
		 * 
		 * @param {number} index - The current number of gears in the group
		 * @returns {number} - The probability of generating another gear
		*/
		function getGearGenerationProbability(index) {
			// Probabilities for generating more gears
			const probabilities = [1, 1, 0.975, 0.95, 0.9, 0.85, 0.75, 0.65, 0.575, 0.5, 0.375, 0.25, 0.175, 0.10];
			return probabilities[index] || 0; // Return the probability or 0 if the index is out of range
		}

		/**
		 * Checks if a new group of gears is valid (i.e., does not overlap with existing groups)
		 * 
		 * @param {Gear[]} newGroup - The new group of gears
		 * @param {Gear[][]} groups - The existing groups of gears
		 * @returns {boolean} - True if the new group is valid, false otherwise
		 */
		function isGroupValid(newGroup, groups) {
			return newGroup.length >= 4 && newGroup.every(newGear => {
				return groups.every(group => {
					return group.every(gear => {
						const dx = newGear.x - gear.x;
						const dy = newGear.y - gear.y;
						const distance = Math.sqrt(dx * dx + dy * dy);
						return distance >= newGear.radius + gear.radius + standardSize;
					});
				});
			});
		}

		/**
		 * Checks if a new gear's position is valid within the canvas and relative to other gears
		 * 
		 * @param {Gear} newGear - The new gear to be checked
		 * @param {Gear[]} gears - The existing gears
		 * @returns {boolean} - True if the gear's position is valid, false otherwise
		 */
		function isGearPositionValid(newGear, gears) {
			return newGear.x - newGear.radius >= 0 &&
				newGear.x + newGear.radius <= canvas.width &&
				newGear.y - newGear.radius >= 0 &&
				newGear.y + newGear.radius <= canvas.height &&
				gears.every(gear => {
					const dx = newGear.x - gear.x;
					const dy = newGear.y - gear.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					const isValidDistance = distance >= newGear.radius + gear.radius + 1;

					const adjacentGears = gears.filter(otherGear => {
						const otherDx = newGear.x - otherGear.x;
						const otherDy = newGear.y - otherGear.y;
						const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
						return otherDistance < standardSize / 4;
					});

					const invalidAdjacentGears = adjacentGears.filter(otherGear => otherGear.direction === newGear.direction);

					return isValidDistance && invalidAdjacentGears.length < 2;
				});
		}

		/**
		 * Updates and draws a gear on the canvas
		 * 
		 * @param {Gear} gear - The gear to be drawn
		*/
		function drawGear(gear) {
			gear.update(); // Update the gear's angle
			gear.draw(ctx); // Draw the gear on the canvas
		}

		/**
		 * Animates the gears by clearing the canvas and redrawing them
		*/
		function animate() {
			ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
			groups.forEach(group => {
				group.forEach(gear => drawGear(gear)); // Draw each gear in each group
			});
		}

		initialize(); // Initialize the canvas and generate the gears

		// Interval to repeat the function
		const interval = setInterval(animate, 1000 / 60); // Animate at 60 FPS

		// Save references to the canvas and interval ID for later use
		backgroundElement._gearCanvas = canvas;
		backgroundElement._gearIntervalId = interval;
	}

	/**
	 * Removes the animated background canvas from the DOM
	 * 
	 * @param {HTMLElement} backgroundElement - The element containing the canvas
	*/
	function animatedBackgroundDelete(backgroundElement) {
		if (!backgroundElement) return;

		// Clear the interval to stop the animation
		clearInterval(backgroundElement._gearIntervalId);

		// Remove the canvas element
		if (backgroundElement._gearCanvas) {
			backgroundElement.removeChild(backgroundElement._gearCanvas);
			backgroundElement._gearCanvas = null;
		}
	}

	/**
	 * Create a new instance of MutationObserver with a callback function
	 * to observe changes in the DOM 
	*/
	const observer = new MutationObserver(function (mutations) {
		const selector = '.Common-container:not(.Common-entranceBackground):not(:has(.Common-entranceGradient)):not(:has(.MainScreenComponentStyle-playButtonContainer))';

		mutations.forEach(function (mutation) {
			if (mutation.type === 'childList') { // If the change is of type childList
				mutation.addedNodes.forEach(function (node) { // Iterate through added nodes
					if (node.nodeType === Node.ELEMENT_NODE) { // If it's an element node
						// Check if the added node itself matches the selector or any descendant matches the selector
						if (node.matches(selector) || node.querySelector(selector)) {
							animatedBackground(node);
						}
					}
				});

				mutation.removedNodes.forEach(function (node) { // Iterate through removed nodes
					if (node.nodeType === Node.ELEMENT_NODE) { // If it's an element node
						// Check if the added node itself matches the selector or any descendant matches the selector
						if (node.matches(selector) || node.querySelector(selector)) {
							animatedBackgroundDelete(node);
						}
					}
				});
			}
		});
	});

	// Set up observation for changes in the document
	observer.observe(document.body, { childList: true, subtree: true });
})();