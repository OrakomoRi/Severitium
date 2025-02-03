(function () {
	const progressSelector = '.ApplicationLoaderComponentStyle-loader, .progress, .LobbyLoaderComponentStyle-loaderContainer img, #preloader .progress';
	const loaderSelector = '.ApplicationLoaderComponentStyle-container, .LobbyLoaderComponentStyle-container';

	// Represents a collection of stars and their properties
	let stars = {};
	let index = 0;
	let count = 0;
	const smoothnessFactor = 50;
	let baseAcceleration = 0.5;

	/**
	 * @param {Array} starSettings - Array with data
	 * 
	 * @param {Array} starSettings.colors - Array with possible colors
	 * @param {Path2D} starSettings.path - SVG path of star
	 */
	const starSettings = {
		colors: ['#ffffff', '#fec777', '#498fb3', '#77fee1', '#fa8072'],
		path: new Path2D('M1 .5C.72.5.5.28.5 0 .5.28.28.5 0 .5.28.5.5.72.5 1 .5.72.72.5 1 .5'),
	};

	/**
	 * Represents a star with properties and methods for updating and drawing
	 */
	class Star {
		constructor(canvas) {
			this.canvas = canvas;
			this.X = this.canvas.width / 2;
			this.Y = this.canvas.height / 2;
			this.SX = Math.random() * 10 - 5;
			this.SY = Math.random() * 10 - 5;

			const start = Math.max(this.canvas.width, this.canvas.height);
			this.X += (this.SX * start) / 10;
			this.Y += (this.SY * start) / 10;

			index++;
			stars[index] = this;
			this.ID = index;

			this.C = starSettings.colors[Math.floor(Math.random() * starSettings.colors.length)];
			this.scale = randomNum(2, 8, 2);

			this.path = starSettings.path;
		}

		draw(delta, ctx) {
			if (!this.canvas) return;
			delta *= 60;
			this.X += this.SX * delta;
			this.Y += this.SY * delta;

			this.SX += (this.SX / (smoothnessFactor / baseAcceleration)) * delta;
			this.SY += (this.SY / (smoothnessFactor / baseAcceleration)) * delta;

			if (
				this.X < -this.scale * 10 || this.X > this.canvas.width ||
				this.Y < -this.scale * 10 || this.Y > this.canvas.height
			) {
				delete stars[this.ID];
				count--;
			}

			ctx.save();
			ctx.fillStyle = this.C;
			ctx.translate(this.X, this.Y);
			ctx.scale(this.scale, this.scale);
			ctx.stroke(this.path);
			ctx.fill(this.path);
			ctx.restore();
		}
	}

	/**
	 * Initializes the animated background with stars
	 */
	function animatedBackground(backgroundElement) {
		if (!backgroundElement) return;

		let canvas = document.createElement('canvas');
		canvas.className = 'severitium-star-canvas';

		const canvasContainer = document.createElement('div');
		canvasContainer.className = 'severitium-star-canvas-container';

		backgroundElement.append(canvasContainer);
		canvasContainer.append(canvas);

		canvas.width = backgroundElement.clientWidth;
		canvas.height = backgroundElement.clientHeight;

		const ctx = canvas.getContext('2d');
		let starsToDraw = (canvas.width * canvas.height) / 8000;
		let lastTime = performance.now();

		function draw(currentTime) {
			if (!canvas || !canvas.getContext) return;

			if (canvas.width !== backgroundElement.clientWidth || canvas.height !== backgroundElement.clientHeight) {
				canvas.width = backgroundElement.clientWidth;
				canvas.height = backgroundElement.clientHeight;
			}

			const delta = (currentTime - lastTime) / 1000;
			lastTime = currentTime;

			ctx.fillStyle = 'rgba(0, 0, 0, 1)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			while (count < starsToDraw) {
				new Star(canvas);
				count++;
			}

			Object.values(stars).forEach(star => star.draw(delta, ctx));

			backgroundElement.dataset.animationId = requestAnimationFrame(draw);
		}

		backgroundElement.dataset.animationId = requestAnimationFrame(draw);
	}

	/**
	 * Removes the animated background canvas from the DOM
	 */
	function animatedBackgroundDelete(backgroundElement) {
		if (!backgroundElement) return;

		const animationId = backgroundElement.dataset.animationId;
		if (animationId) {
			cancelAnimationFrame(animationId);
			backgroundElement.dataset.animationId = null;
		}

		resetAnimationState();
		const canvas = backgroundElement.querySelector('.severitium-star-canvas');
		if (canvas) canvas.parentNode.remove();
	}

	function resetAnimationState() {
		stars = {};
		index = 0;
		count = 0;
	}

	/**
	 * Replaces the original progress bar with a custom one
	 * 
	 * @param {HTMLElement} element - The original progress bar element
	 */
	function replaceOriginalProgress(element) {
		const newProgress = document.createElement('div');
		const progressInner = document.createElement('div');
		newProgress.className = 'severitium-progress';
		newProgress.style.bottom = element.style.bottom;
		newProgress.append(progressInner);

		element.replaceWith(newProgress);
	}

	/**
	 * Generates a random number between min and max
	 */
	function randomNum(min, max, precision) {
		return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
	}

	// Creates a new MutationObserver instance to track changes in the DOM
	const observer = new MutationObserver(mutations => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => mutations.forEach(processMutation));
		} else {
			mutations.forEach(processMutation);
		}
	})

	/**
	 * Processes added and removed nodes to manage background animations and progress bars
	 * 
	 * @param {MutationRecord} mutation - Mutation record containing added and removed nodes
	 * @param {NodeList} mutation.addedNodes - List of nodes added to the DOM
	 * @param {NodeList} mutation.removedNodes - List of nodes removed from the DOM
	 */
	function processMutation({ addedNodes, removedNodes }) {
		addedNodes.forEach(node => {
			if (node.nodeType !== Node.ELEMENT_NODE) return;

			// Check for background animation elements
			if (node.matches(loaderSelector)) {
				node.matches(loaderSelector) ? animatedBackground(node) : animatedBackground(node.querySelector(loaderSelector));
			}

			// Check for progress bar elements
			const progress = node.matches(progressSelector) ? node : node.querySelector(progressSelector);
			if (progress) {
				replaceOriginalProgress(progress);
			}
		})

		removedNodes.forEach(node => {
			if (node.nodeType !== Node.ELEMENT_NODE) return;

			if (node.matches(loaderSelector) || node.querySelector(loaderSelector)) {
				node.matches(loaderSelector) ? animatedBackgroundDelete(node) : animatedBackgroundDelete(node.querySelector(loaderSelector));
			}
		})
	}

	observer.observe(document.body, { childList: true, subtree: true })

	// Initial check for progress bars when the script runs
	const progress = document.querySelector(progressSelector);
	if (progress) {
		replaceOriginalProgress(progress);
	}
})();