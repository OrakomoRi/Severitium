if (typeof window.Glitchium === 'undefined') {
	/**
	 * glitchium - Lightweight library for fully randomized glitch effects
	 * 
	 * Main Glitchium class for creating and managing glitch effects
	 * @class
	 * @example
	 * const glitch = new Glitchium();
	 * glitch.glitch('.my-element', { intensity: 0.8 });
	 */
	class Glitchium {
		/**
		 * Creates a new Glitchium instance
		 * @constructor
		 */
		constructor() {
			/**
			 * Map of active glitch effect controls
			 * @private
			 * @type {Map<Symbol, {start: Function, stop: Function, destroy: Function}>}
			 */
			this.activeGlitches = new Map();
		}

		/**
		 * Create glitch effect on element(s)
		 * @public
		 * @param {string|HTMLElement|HTMLElement[]|NodeList} selector - Element(s) to apply glitch effect to
		 * @param {GlitchOptions} [options={}] - Configuration options
		 * @returns {GlitchControl} Control object with start, stop, and destroy methods
		 * @throws {TypeError} If selector is invalid
		 * @example
		 * // Simple usage
		 * glitch.glitch('.element');
		 * 
		 * @example
		 * // With options
		 * glitch.glitch('.element', {
		 *   playMode: 'hover',
		 *   intensity: 0.8,
		 *   layers: 7
		 * });
		 * 
		 * @example
		 * // With custom trigger
		 * const control = glitch.glitch('.title', {
		 *   playMode: 'hover',
		 *   trigger: '.card',
		 *   intensity: 0.9
		 * });
		 * 
		 * // Manual control
		 * control.start();
		 * control.stop();
		 * control.destroy();
		 */
		glitch(selector = '.glitch', options = {}) {
			const config = {
				playMode: 'always',
				trigger: null,
				intensity: 0.7,
				fps: 15,
				layers: 5,
				slice: {
					minHeight: 0.02,
					maxHeight: 0.2,
					hueRotate: true
				},
				shake: true,
				shakeIntensity: 0.15,
				pulse: false,
				glitchTimeSpan: false,
				filters: true,
				hideOverflow: false,
				createContainers: true,
				smoothTransitions: false,
				glitchFrequency: 10,
				optimizeSeo: true,
				...options
			};

			// Merge slice options if provided
			if (options.slice) {
				config.slice = { ...config.slice, ...options.slice };
			}

			// Normalize glitchTimeSpan
			if (config.glitchTimeSpan && typeof config.glitchTimeSpan === 'object') {
				// Ensure valid range
				const start = Math.max(0, Math.min(1, config.glitchTimeSpan.start || 0));
				const end = Math.max(0, Math.min(1, config.glitchTimeSpan.end || 1));
				config.glitchTimeSpan = { start, end };
			} else if (config.glitchTimeSpan === true) {
				// Default: glitch in middle half
				config.glitchTimeSpan = { start: 0.25, end: 0.75 };
			}

			// SEO optimization: skip glitch for crawlers
			if (config.optimizeSeo && this._isCrawler()) {
				return this._emptyControl();
			}

			const elements = this._getElements(selector);
			if (!elements.length) return this._emptyControl();

			const controls = elements.map(el => this._glitchElement(el, config));

			return {
				start: () => controls.forEach(c => c.start()),
				stop: () => controls.forEach(c => c.stop()),
				destroy: () => controls.forEach(c => c.destroy())
			};
		}

		/**
		 * Apply glitch effect to a single element
		 * @private
		 * @param {HTMLElement} element - Target element
		 * @param {GlitchOptions} config - Configuration object
		 * @returns {GlitchControl} Control methods object
		 */
		_glitchElement(element, config) {
			const { container, layersContainer, original } = this._prepareDOM(element, config);
			const layers = this._createLayers(original, layersContainer, config);

			const glitchId = Symbol('glitch');
			let rafId = null;
			let isRunning = false;
			let lastUpdate = 0;
			let animationStartTime = 0;

			// Interpolation state (only used if smoothTransitions is enabled)
			let interpolationState = null;
			if (config.smoothTransitions) {
				interpolationState = this._createInterpolationState(layers, config);
			}

			const updateGlitch = (timestamp) => {
				if (!isRunning) return;

				const interval = 1000 / config.fps;
				if (timestamp - lastUpdate < interval) {
					rafId = requestAnimationFrame(updateGlitch);
					return;
				}
				lastUpdate = timestamp;

				// Calculate animation progress (0-1 looping every 2 seconds)
				const animationProgress = ((timestamp - animationStartTime) % 2000) / 2000;

				if (config.smoothTransitions && interpolationState) {
					// Smooth interpolated mode
					this._updateWithInterpolation(layers, interpolationState, timestamp, config, animationProgress);
				} else {
					// Original instant mode
					layers.forEach(layer => {
						if (layer.isBase) {
							if (config.shake) {
								this._updateShake(layer.element, config, animationProgress);
							} else {
								// Keep base layer visible when shake is disabled
								layer.element.style.opacity = '1';
								layer.element.style.transform = 'none';
							}
						} else {
							this._updateSlice(layer.element, config, animationProgress);
						}
					});
				} rafId = requestAnimationFrame(updateGlitch);
			};

			const start = () => {
				if (isRunning) return;
				isRunning = true;
				animationStartTime = performance.now();
				rafId = requestAnimationFrame(updateGlitch);
			};

			const stop = () => {
				isRunning = false;
				if (rafId) cancelAnimationFrame(rafId);

				layers.forEach(layer => {
					layer.element.style.transform = 'none';
					layer.element.style.clipPath = 'none';
					layer.element.style.opacity = '0';
				});
				if (layers[0]) layers[0].element.style.opacity = '1';
			};

			const destroy = () => {
				stop();
				this.activeGlitches.delete(glitchId);
				if (config.createContainers && container.parentElement) {
					container.parentElement.insertBefore(original, container);
					container.remove();
				}
			};

			this._setupPlayMode(container, config.playMode, config.trigger, start, stop);
			this.activeGlitches.set(glitchId, { start, stop, destroy });

			return { start, stop, destroy };
		}

		/**
		 * Prepare DOM structure for glitch effect
		 * @private
		 * @param {HTMLElement} element - Target element
		 * @param {GlitchOptions} config - Configuration object
		 * @returns {DOMStructure} DOM structure object
		 */
		_prepareDOM(element, config) {
			if (!config.createContainers) {
				return {
					container: element,
					layersContainer: element,
					original: element.firstElementChild
				};
			}

			const container = document.createElement('div');
			const layersContainer = document.createElement('div');

			const display = getComputedStyle(element).display;
			if (display.startsWith('inline')) {
				container.style.display = 'inline-block';
			}

			layersContainer.style.display = 'grid';
			layersContainer.style.gridTemplateColumns = '1fr';
			layersContainer.style.gridTemplateRows = '1fr';

			if (config.hideOverflow) {
				container.style.overflow = 'hidden';
			}

			container.appendChild(layersContainer);
			element.parentElement.insertBefore(container, element);
			layersContainer.appendChild(element);

			element.style.gridArea = '1/1/-1/-1';

			return { container, layersContainer, original: element };
		}

		/**
		 * Create layered clones for glitch effect
		 * @private
		 * @param {HTMLElement} original - Original element to clone
		 * @param {HTMLElement} container - Container for layers
		 * @param {GlitchOptions} config - Configuration object
		 * @returns {Array<LayerObject>} Array of layer objects
		 */
		_createLayers(original, container, config) {
			const layers = [{ element: original, isBase: true }];

			for (let i = 0; i < config.layers; i++) {
				const layer = original.cloneNode(true);
				layer.style.gridArea = '1/1/-1/-1';
				layer.style.pointerEvents = 'none';
				layer.style.userSelect = 'none';
				layer.style.opacity = '0';
				container.appendChild(layer);
				layers.push({ element: layer, isBase: false });
			}

			return layers;
		}

		/**
		 * Create interpolation state for smooth transitions
		 * @private
		 * @param {Array<LayerObject>} layers - Layer objects
		 * @param {GlitchOptions} config - Configuration object
		 * @returns {InterpolationState} Interpolation state object
		 */
		_createInterpolationState(layers, config) {
			const state = {
				keyframeInterval: 1000 / config.glitchFrequency,
				lastKeyframeUpdate: 0,
				shake: {
					current: { x: 0, y: 0 },
					target: { x: 0, y: 0 }
				},
				slices: []
			};

			// Initialize slice states
			layers.forEach((layer, index) => {
				if (!layer.isBase) {
					state.slices.push({
						current: {
							offsetX: 0,
							clipTop: 0,
							clipHeight: 0,
							visible: false,
							hue: 0,
							saturate: false,
							invert: false
						},
						target: {
							offsetX: 0,
							clipTop: 0,
							clipHeight: 0,
							visible: false,
							hue: 0,
							saturate: false,
							invert: false
						}
					});
				}
			});

			return state;
		}

		/**
		 * Update glitch with smooth interpolation
		 * @private
		 * @param {Array<LayerObject>} layers - Layer objects
		 * @param {InterpolationState} state - Interpolation state
		 * @param {number} timestamp - Current timestamp in milliseconds
		 * @param {GlitchOptions} config - Configuration object
		 * @param {number} animationProgress - Overall animation progress (0-1)
		 * @returns {void}
		 */
		_updateWithInterpolation(layers, state, timestamp, config, animationProgress) {
			// Update keyframes if needed
			if (timestamp - state.lastKeyframeUpdate >= state.keyframeInterval) {
				this._updateKeyframes(state, config, animationProgress);
				state.lastKeyframeUpdate = timestamp;
			}

			// Calculate interpolation progress
			const progress = Math.min((timestamp - state.lastKeyframeUpdate) / state.keyframeInterval, 1);
			const easedProgress = this._easeOutQuad(progress);

			// Update layers
			let sliceIndex = 0;
			layers.forEach(layer => {
				if (layer.isBase) {
					if (config.shake) {
						this._updateShakeInterpolated(layer.element, state.shake, easedProgress, config, animationProgress);
					} else {
						// Keep base layer visible when shake is disabled
						layer.element.style.opacity = '1';
						layer.element.style.transform = 'none';
					}
				} else {
					this._updateSliceInterpolated(layer.element, state.slices[sliceIndex], easedProgress, config, animationProgress);
					sliceIndex++;
				}
			});
		}

		/**
		 * Update keyframes with new random targets
		 * @private
		 * @param {InterpolationState} state - Interpolation state
		 * @param {GlitchOptions} config - Configuration object
		 * @param {number} progress - Animation progress (0-1) for glitchTimeSpan
		 * @returns {void}
		 */
		_updateKeyframes(state, config, progress = 0.5) {
			const glitchFactor = this._getGlitchFactor(config, progress);
			const effectiveIntensity = config.intensity * glitchFactor;

			// Update shake keyframes
			state.shake.current.x = state.shake.target.x;
			state.shake.current.y = state.shake.target.y;
			const intensity = effectiveIntensity * config.shakeIntensity;
			state.shake.target.x = (Math.random() - 0.5) * intensity * 100;
			state.shake.target.y = (Math.random() - 0.5) * intensity * 100;

			// Update slice keyframes
			state.slices.forEach(slice => {
				const curr = slice.current;
				const targ = slice.target;

				curr.offsetX = targ.offsetX;
				curr.clipTop = targ.clipTop;
				curr.clipHeight = targ.clipHeight;
				curr.visible = targ.visible;
				curr.hue = targ.hue;
				curr.saturate = targ.saturate;
				curr.invert = targ.invert;

				targ.visible = Math.random() <= effectiveIntensity;
				targ.offsetX = (Math.random() - 0.5) * effectiveIntensity * 60;

				const minHeight = config.slice.minHeight * 100;
				const maxHeight = config.slice.maxHeight * 100;
				targ.clipHeight = Math.random() * (maxHeight - minHeight) + minHeight;
				targ.clipTop = Math.random() * (100 - targ.clipHeight);

				targ.hue = config.slice.hueRotate ? Math.floor(Math.random() * 360) : 0;
				targ.saturate = Math.random() > 0.5;
				targ.invert = Math.random() > 0.7;
			});
		}

		/**
		 * Linear interpolation helper function (lerp)
		 * @private
		 * @param {number} start - Start value
		 * @param {number} end - End value
		 * @param {number} progress - Progress from 0 to 1
		 * @returns {number} Interpolated value between start and end
		 * @example
		 * _lerp(0, 100, 0.5) // returns 50
		 */
		_lerp(start, end, progress) {
			return start + (end - start) * progress;
		}

		/**
		 * Ease-out quadratic easing function for smooth deceleration
		 * @private
		 * @param {number} t - Progress from 0 to 1
		 * @returns {number} Eased progress value
		 * @see {@link https://easings.net/#easeOutQuad}
		 */
		_easeOutQuad(t) {
			return t * (2 - t);
		}

		/**
		 * Update shake effect with smooth interpolation
		 * @private
		 * @param {HTMLElement} element - Element to apply shake effect
		 * @param {Object} shakeState - Shake state with current and target values
		 * @param {Object} shakeState.current - Current shake position
		 * @param {number} shakeState.current.x - Current X offset
		 * @param {number} shakeState.current.y - Current Y offset
		 * @param {Object} shakeState.target - Target shake position
		 * @param {number} shakeState.target.x - Target X offset
		 * @param {number} shakeState.target.y - Target Y offset
		 * @param {number} progress - Interpolation progress from 0 to 1
		 * @param {GlitchOptions} config - Configuration object
		 * @param {number} animationProgress - Overall animation progress (0-1)
		 * @returns {void}
		 */
		_updateShakeInterpolated(element, shakeState, progress, config, animationProgress) {
			const x = this._lerp(shakeState.current.x, shakeState.target.x, progress);
			const y = this._lerp(shakeState.current.y, shakeState.target.y, progress);

			let transform = `translate3d(${x}%, ${y}%, 0)`;

			// Add pulse effect if enabled
			if (config.pulse) {
				const scale = 1 + Math.sin(animationProgress * Math.PI * 2) * 0.05;
				transform += ` scale(${scale})`;
			}

			element.style.transform = transform;
			element.style.opacity = '1';
		}

		/**
		 * Update slice layer with smooth interpolation
		 * @private
		 * @param {HTMLElement} element - Slice layer element
		 * @param {Object} sliceState - Slice state with current and target values
		 * @param {number} progress - Interpolation progress from 0 to 1
		 * @param {GlitchOptions} config - Configuration object
		 * @param {number} animationProgress - Overall animation progress (0-1)
		 * @returns {void}
		 */
		_updateSliceInterpolated(element, sliceState, progress, config, animationProgress) {
			// Interpolate visibility (snap at 0.5)
			const visible = progress < 0.5 ? sliceState.current.visible : sliceState.target.visible;

			if (!visible) {
				element.style.opacity = '0';
				return;
			}

			element.style.opacity = '1';

			// Interpolate position
			const offsetX = this._lerp(sliceState.current.offsetX, sliceState.target.offsetX, progress);
			let transform = `translate3d(${offsetX}%, 0, 0)`;

			// Add pulse effect if enabled
			if (config.pulse) {
				const scale = 1 + Math.sin(animationProgress * Math.PI * 2) * 0.05;
				transform += ` scale(${scale})`;
			}

			element.style.transform = transform;

			// Interpolate clip-path
			const clipTop = this._lerp(sliceState.current.clipTop, sliceState.target.clipTop, progress);
			const clipHeight = this._lerp(sliceState.current.clipHeight, sliceState.target.clipHeight, progress);
			element.style.clipPath = `polygon(0 ${clipTop}%, 100% ${clipTop}%, 100% ${clipTop + clipHeight}%, 0 ${clipTop + clipHeight}%)`;

			// Interpolate filters
			if (config.filters) {
				const hue = Math.round(this._lerp(sliceState.current.hue, sliceState.target.hue, progress));
				const saturate = progress < 0.5 ? sliceState.current.saturate : sliceState.target.saturate;
				const invert = progress < 0.5 ? sliceState.current.invert : sliceState.target.invert;

				const saturateStr = saturate ? `saturate(${2 + Math.random() * 3})` : '';
				const invertStr = invert ? 'invert(1)' : '';
				const hueStr = config.slice.hueRotate ? `hue-rotate(${hue}deg)` : '';
				element.style.filter = `${hueStr} ${saturateStr} ${invertStr}`.trim();
			}
		}

		/**
		 * Update shake effect on base layer (instant mode, no interpolation)
		 * @private
		 * @param {HTMLElement} element - Element to apply shake effect
		 * @param {GlitchOptions} config - Configuration object
		 * @param {number} animationProgress - Overall animation progress (0-1)
		 * @returns {void}
		 */
		_updateShake(element, config, animationProgress) {
			const glitchFactor = this._getGlitchFactor(config, animationProgress);
			const intensity = config.intensity * config.shakeIntensity * glitchFactor;
			const x = (Math.random() - 0.5) * intensity * 100;
			const y = (Math.random() - 0.5) * intensity * 100;

			let transform = `translate3d(${x}%, ${y}%, 0)`;

			// Add pulse effect if enabled
			if (config.pulse) {
				const scale = 1 + Math.sin(animationProgress * Math.PI * 2) * 0.05;
				transform += ` scale(${scale})`;
			}

			element.style.transform = transform;
			element.style.opacity = '1';
		}

		/**
		 * Update slice layer with random transforms and clipping (instant mode, no interpolation)
		 * @private
		 * @param {HTMLElement} element - Slice layer element to update
		 * @param {GlitchOptions} config - Configuration object
		 * @param {number} animationProgress - Overall animation progress (0-1)
		 * @returns {void}
		 */
		_updateSlice(element, config, animationProgress) {
			const glitchFactor = this._getGlitchFactor(config, animationProgress);
			const effectiveIntensity = config.intensity * glitchFactor;

			if (Math.random() > effectiveIntensity) {
				element.style.opacity = '0';
				return;
			}

			element.style.opacity = '1';

			const offsetX = (Math.random() - 0.5) * effectiveIntensity * 60;
			let transform = `translate3d(${offsetX}%, 0, 0)`;

			// Add pulse effect if enabled
			if (config.pulse) {
				const scale = 1 + Math.sin(animationProgress * Math.PI * 2) * 0.05;
				transform += ` scale(${scale})`;
			}

			element.style.transform = transform;

			const clipPath = this._randomClipPath(config.slice.minHeight * 100, config.slice.maxHeight * 100);
			element.style.clipPath = clipPath;

			if (config.filters) {
				const hue = config.slice.hueRotate ? Math.floor(Math.random() * 360) : 0;
				const saturate = Math.random() > 0.5 ? `saturate(${2 + Math.random() * 3})` : '';
				const invert = Math.random() > 0.7 ? 'invert(1)' : '';
				const hueStr = config.slice.hueRotate ? `hue-rotate(${hue}deg)` : '';
				element.style.filter = `${hueStr} ${saturate} ${invert}`.trim();
			}
		}

		/**
		 * Generate random clip-path polygon for horizontal slicing effect
		 * @private
		 * @param {number} minHeight - Minimum slice height in percentage (default 2)
		 * @param {number} maxHeight - Maximum slice height in percentage (default 20)
		 * @returns {string} CSS clip-path polygon value
		 * @example
		 * // Returns something like: "polygon(0 20%, 100% 20%, 100% 35%, 0 35%)"
		 */
		_randomClipPath(minHeight = 2, maxHeight = 20) {
			const height = Math.random() * (maxHeight - minHeight) + minHeight;
			const top = Math.random() * (100 - height);

			return `polygon(0 ${top}%, 100% ${top}%, 100% ${top + height}%, 0 ${top + height}%)`;
		}

		/**
		 * Setup play mode event handlers for glitch effect
		 * @private
		 * @param {HTMLElement} container - Container element (fallback trigger)
		 * @param {('always'|'hover'|'click'|'manual')} playMode - Play mode for the effect
		 * @param {string|HTMLElement|null} trigger - Custom trigger element or CSS selector
		 * @param {Function} start - Callback to start the effect
		 * @param {Function} stop - Callback to stop the effect
		 * @returns {void}
		 */
		_setupPlayMode(container, playMode, trigger, start, stop) {
			// Determine the trigger element
			let triggerElement = container;
			if (trigger) {
				if (typeof trigger === 'string') {
					triggerElement = document.querySelector(trigger);
				} else if (trigger instanceof HTMLElement) {
					triggerElement = trigger;
				}
			}

			if (!triggerElement) {
				console.warn('glitchium: trigger element not found, using container');
				triggerElement = container;
			}

			// Clear existing handlers
			container.onmouseenter = null;
			container.onmouseleave = null;
			container.onclick = null;

			if (triggerElement !== container) {
				triggerElement.onmouseenter = null;
				triggerElement.onmouseleave = null;
				triggerElement.onclick = null;
			}

			switch (playMode) {
				case 'always':
					start();
					break;
				case 'hover':
					triggerElement.onmouseenter = start;
					triggerElement.onmouseleave = stop;
					break;
				case 'click':
					triggerElement.onclick = () => {
						stop();
						setTimeout(start, 50);
					};
					break;
				case 'manual':
					break;
			}
		}

		/**
		 * Convert various selector types to array of HTMLElements
		 * @private
		 * @param {string|HTMLElement|HTMLElement[]|NodeList} selector - Element selector
		 * @returns {HTMLElement[]} Array of HTML elements
		 * @example
		 * _getElements('.my-class') // returns [element1, element2, ...]
		 * _getElements(document.getElementById('my-id')) // returns [element]
		 */
		_getElements(selector) {
			if (typeof selector === 'string') {
				return Array.from(document.querySelectorAll(selector));
			}
			if (selector instanceof NodeList) {
				return Array.from(selector);
			}
			if (Array.isArray(selector)) {
				return selector;
			}
			if (selector instanceof HTMLElement) {
				return [selector];
			}
			return [];
		}

		/**
		 * Return empty control object when no elements found
		 * @private
		 * @returns {GlitchControl} Empty control object with warning methods
		 */
		_emptyControl() {
			return {
				start: () => { },
				stop: () => { },
				destroy: () => { }
			};
		}

		/**
		 * Detect if current user agent is a search engine crawler
		 * @private
		 * @returns {boolean} True if crawler detected
		 */
		_isCrawler() {
			if (typeof navigator === 'undefined') return false;
			const ua = navigator.userAgent.toLowerCase();
			const crawlers = [
				'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
				'yandexbot', 'facebot', 'ia_archiver', 'chrome-lighthouse'
			];
			return crawlers.some(bot => ua.includes(bot));
		}

		/**
		 * Calculate glitch intensity factor based on glitchTimeSpan
		 * @private
		 * @param {Object} config - Configuration object
		 * @param {number} progress - Animation progress (0-1)
		 * @returns {number} Glitch factor (0-1)
		 */
		_getGlitchFactor(config, progress) {
			if (!config.glitchTimeSpan) return 1;

			const { start, end } = config.glitchTimeSpan;
			if (progress < start || progress > end) return 0;

			// Peak at the middle of the timespan
			const peak = start + (end - start) / 2;
			if (progress < peak) {
				return (progress - start) / (peak - start);
			} else {
				return (end - progress) / (end - peak);
			}
		}

		/**
		 * Stop all active glitch effects managed by this instance
		 * @public
		 * @returns {void}
		 * @example
		 * const glitch = new Glitchium();
		 * glitch.glitch('.element1');
		 * glitch.glitch('.element2');
		 * glitch.stopAll(); // Stops both effects
		 */
		stopAll() {
			this.activeGlitches.forEach(control => control.stop());
		}

		/**
		 * Destroy all glitch effects and clear all references
		 * Removes all DOM modifications and event listeners
		 * @public
		 * @returns {void}
		 * @example
		 * const glitch = new Glitchium();
		 * glitch.glitch('.element');
		 * glitch.destroyAll(); // Complete cleanup
		 */
		destroyAll() {
			this.activeGlitches.forEach(control => control.destroy());
			this.activeGlitches.clear();
		}
	}

	/**
	 * Export for different module systems and environments
	 * Supports CommonJS (Node.js) and browser global
	 * @exports Glitchium
	 */
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = Glitchium;
	}
	if (typeof window !== 'undefined') {
		window.Glitchium = Glitchium;
	}
}