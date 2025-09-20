/**
 * Background Animation Component
 * Uses CSS Custom Properties for better performance and cleaner code.
 * Implements particle system with optimized movement and resource management.
 */

class Particle {
	constructor(x, y, index, options) {
		this.x = x;
		this.y = y;
		this.index = index;
		this.options = options;

		// Random initial direction (angle)
		this.angle = Math.random() * Math.PI * 2;

		// Target direction for smooth transitions
		this.targetAngle = this.angle;

		// Constant speed - never changes
		this.speed = this.options.constantSpeed;

		this.speedMultiplier = 2;
		this.cssPropertyX = `--particle-${index}-x`;
		this.cssPropertyY = `--particle-${index}-y`;

		// Time offset for unique behavior per particle
		this.timeOffset = Math.random() * Math.PI * 2;
		this.directionChangeTimer = 0;
		this.directionChangeInterval = 60 + Math.random() * 120; // 1-3 seconds at 60fps
	}

	update() {
		// Smooth random direction changes
		this.directionChangeTimer++;

		if (this.directionChangeTimer >= this.directionChangeInterval) {
			// Set new target direction
			this.targetAngle = Math.random() * Math.PI * 2;
			this.directionChangeTimer = 0;
			this.directionChangeInterval = 60 + Math.random() * 120; // New random interval
		}

		// Smoothly interpolate to target angle
		let angleDiff = this.targetAngle - this.angle;

		// Handle angle wrapping (shortest path)
		if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
		if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

		// Smooth interpolation
		this.angle += angleDiff * this.options.directionChangeRate;

		// Add subtle continuous direction variation
		this.angle += (Math.random() - 0.5) * 0.005;

		// Calculate velocity from angle and constant speed
		const currentSpeed = this.speed * this.speedMultiplier;
		const vx = Math.cos(this.angle) * currentSpeed;
		const vy = Math.sin(this.angle) * currentSpeed;

		// Update position
		this.x += vx;
		this.y += vy;

		// Boundary handling with direction change (no energy loss)
		if (this.x <= 0 || this.x >= 100) {
			this.x = Math.max(0, Math.min(100, this.x));
			// Reflect angle horizontally and add small random variation
			this.angle = Math.PI - this.angle + (Math.random() - 0.5) * 0.2;
			this.targetAngle = this.angle; // Reset target to current
		}

		if (this.y <= 0 || this.y >= 100) {
			this.y = Math.max(0, Math.min(100, this.y));
			// Reflect angle vertically and add small random variation
			this.angle = -this.angle + (Math.random() - 0.5) * 0.2;
			this.targetAngle = this.angle; // Reset target to current
		}

		// Normalize angle to 0-2π range
		this.angle = this.angle % (Math.PI * 2);
		if (this.angle < 0) this.angle += Math.PI * 2;
	}

	updateCSS(root) {
		// Update CSS custom properties for smooth animation
		root.style.setProperty(this.cssPropertyX, `${this.x.toFixed(2)}%`);
		root.style.setProperty(this.cssPropertyY, `${this.y.toFixed(2)}%`);
	}

	reset(root) {
		// Reset to default positions
		const defaultPositions = [
			{ x: 20, y: 50 },
			{ x: 80, y: 20 },
			{ x: 40, y: 80 }
		];

		const defaultPos = defaultPositions[this.index - 1];
		if (defaultPos) {
			root.style.setProperty(this.cssPropertyX, `${defaultPos.x}%`);
			root.style.setProperty(this.cssPropertyY, `${defaultPos.y}%`);
		}
	}
}

class BackgroundAnimation {
	constructor(options = {}) {
		this.options = {
			particleCount: 3,
			constantSpeed: 0.15,
			directionChangeRate: 0.02,
			smoothness: 0.98,
			enableVisibilityOptimization: true,
			enableReducedMotion: true,
			targetFPS: 60,
			...options
		};

		this.particles = [];
		this.isRunning = false;
		this.animationId = null;
		this.documentRoot = document.documentElement;
		this.lastFrameTime = 0;
		this.frameInterval = 1000 / this.options.targetFPS; // 16.67ms for 60fps

		this.init();
	}

	/**
	 * Initialize animation
	 * @private
	 */
	init() {
		// Check for reduced motion preference
		if (this.options.enableReducedMotion && this.prefersReducedMotion()) {
			return;
		}

		// Check if CSS custom properties are supported
		if (!this.supportsCSSCustomProperties()) {
			console.warn('CSS Custom Properties not supported. Background animation disabled.');
			return;
		}

		this.createParticles();
		this.setupVisibilityOptimization();
		this.start();
	}

	/**
	 * Create particle instances
	 * @private
	 */
	createParticles() {
		const initialPositions = [
			{ x: 20, y: 50 },
			{ x: 80, y: 20 },
			{ x: 40, y: 80 }
		];

		this.particles = initialPositions.map((pos, index) => new Particle(
			pos.x,
			pos.y,
			index + 1,
			this.options
		));
	}

	/**
	 * Start animation
	 */
	start() {
		if (this.isRunning) return;

		this.isRunning = true;
		this.animate();
	}

	/**
	 * Stop animation
	 */
	stop() {
		this.isRunning = false;
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}

	/**
	 * Animation loop
	 * @private
	 */
	animate() {
		if (!this.isRunning) return;

		const currentTime = performance.now();

		// Frame rate limiting for consistent 60fps
		if (currentTime - this.lastFrameTime >= this.frameInterval) {
			this.particles.forEach(particle => {
				particle.update();
				particle.updateCSS(this.documentRoot);
			});

			this.lastFrameTime = currentTime;
		}

		this.animationId = requestAnimationFrame(() => this.animate());
	}

	/**
	 * Setup visibility optimization
	 * @private
	 */
	setupVisibilityOptimization() {
		if (!this.options.enableVisibilityOptimization) return;

		// Pause animation when tab is not visible
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				this.stop();
			} else {
				this.start();
			}
		});

		// Pause animation when window loses focus
		window.addEventListener('blur', () => this.stop());
		window.addEventListener('focus', () => this.start());
	}

	/**
	 * Check if user prefers reduced motion
	 * @returns {boolean}
	 * @private
	 */
	prefersReducedMotion() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	/**
	 * Check if CSS custom properties are supported
	 * @returns {boolean}
	 * @private
	 */
	supportsCSSCustomProperties() {
		return window.CSS && CSS.supports('color', 'var(--fake-var)');
	}

	/**
	 * Set speed multiplier for all particles
	 * @param {number} multiplier - Speed multiplier
	 */
	setSpeed(multiplier) {
		this.particles.forEach(particle => {
			particle.speedMultiplier = multiplier;
		});
	}

	/**
	 * Set direction change rate
	 * @param {number} rate - Direction change rate
	 */
	setDirectionChangeRate(rate) {
		this.options.directionChangeRate = rate;
	}

	/**
	 * Check if animation is running
	 * @returns {boolean}
	 */
	isAnimationRunning() {
		return this.isRunning;
	}

	/**
	 * Get current particles data
	 * @returns {Array} Particles array
	 */
	getParticles() {
		return this.particles.map(particle => ({
			x: particle.x,
			y: particle.y,
			angle: particle.angle,
			index: particle.index
		}));
	}

	/**
	 * Update animation options
	 * @param {Object} newOptions - New options to merge
	 */
	updateOptions(newOptions) {
		this.options = { ...this.options, ...newOptions };
		this.particles.forEach(particle => {
			particle.options = this.options;
		});
	}

	/**
	 * Pause animation temporarily
	 */
	pause() {
		this.stop();
	}

	/**
	 * Resume animation
	 */
	resume() {
		this.start();
	}

	/**
	 * Destroy animation and cleanup
	 */
	destroy() {
		this.stop();
		if (this.particles) {
			this.particles.forEach(particle => particle.reset(this.documentRoot));
		}
		this.particles = [];
	}
}

export default BackgroundAnimation;