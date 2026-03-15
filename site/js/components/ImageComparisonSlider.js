/**
 * Image Comparison Slider - Interactive comparison component
 * Supports two modes:
 * 1. Slider mode - for images with matching aspect ratios (smooth transition)
 * 2. Toggle mode - for images with different aspect ratios (instant switch)
 */

export default class ImageComparisonSlider {
	constructor(container, oldSrc, newSrc, { newLabel = 'Severitium', oldLabel = 'Original', initialState = 'new' } = {}) {
		this.container = container;
		this.oldImageSrc = oldSrc;
		this.newImageSrc = newSrc;
		this.newLabel = newLabel;
		this.oldLabel = oldLabel;

		this.mode = null; // 'slider' or 'toggle'
		this.isInitialized = false;
		this.isDragging = false;
		this.sliderPosition = 50; // Percentage
		this.toggleState = initialState; // 'new' or 'old'

		// DOM elements
		this.oldImage = null;
		this.newImage = null;
		this.sliderControl = null;
		this.toggleControl = null;
		this.labelTimeout = null;

		// Bind methods
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);
		this.handleTouchStart = this.handleTouchStart.bind(this);
		this.handleTouchMove = this.handleTouchMove.bind(this);
		this.handleTouchEnd = this.handleTouchEnd.bind(this);
		this.handleToggle = this.handleToggle.bind(this);

		this.init();
	}

	/**
	 * Initialize the component
	 */
	async init() {
		// Show loading state immediately
		this.showLoading();

		try {
			// Load both images to determine dimensions
			const [oldDimensions, newDimensions] = await Promise.all([
				this.loadImage(this.oldImageSrc),
				this.loadImage(this.newImageSrc)
			]);

			// Determine comparison mode based on aspect ratios
			this.mode = this.shouldUseSliderMode(oldDimensions, newDimensions)
				? 'slider'
				: 'toggle';

			// Create the comparison interface
			this.createInterface(oldDimensions, newDimensions);

			this.isInitialized = true;
		} catch (error) {
			console.error('Error initializing image comparison:', error);
			this.showError();
		}
	}

	/**
	 * Load image and get its dimensions
	 * @param {string} src - Image source URL
	 * @returns {Promise<Object>} Image dimensions {width, height, aspectRatio}
	 */
	loadImage(src) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				resolve({
					width: img.naturalWidth,
					height: img.naturalHeight,
					aspectRatio: img.naturalWidth / img.naturalHeight
				});
			};
			img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
			img.src = src;
		});
	}

	/**
	 * Determine if slider mode should be used
	 * @param {Object} oldDim - Old image dimensions
	 * @param {Object} newDim - New image dimensions
	 * @returns {boolean} True if aspect ratios are close enough for slider mode
	 */
	shouldUseSliderMode(oldDim, newDim) {
		const threshold = 0.02; // 2% tolerance for aspect ratio difference
		const ratioDiff = Math.abs(oldDim.aspectRatio - newDim.aspectRatio);
		return ratioDiff / oldDim.aspectRatio < threshold;
	}

	/**
	 * Create the comparison interface based on mode
	 * @param {Object} oldDim - Old image dimensions
	 * @param {Object} newDim - New image dimensions
	 */
	createInterface(oldDim, newDim) {
		// Clear container
		this.container.innerHTML = '';

		if (this.mode === 'slider') {
			this.createSliderInterface(oldDim, newDim);
		} else {
			this.createToggleInterface(oldDim, newDim);
		}
	}

	/**
	 * Create slider mode interface
	 * @param {Object} oldDim - Old image dimensions
	 * @param {Object} newDim - New image dimensions
	 */
	createSliderInterface(oldDim, newDim) {
		// Calculate optimal container size
		const containerSize = this.calculateOptimalSize(oldDim, newDim);

		this.container.className = 'image-comparison image-comparison--slider';
		this.container.style.width = `${containerSize.width}px`;
		this.container.style.height = `${containerSize.height}px`;

		this.container.innerHTML = `
			<div class="image-comparison__images">
				<div class="image-comparison__image-wrapper image-comparison__image-wrapper--new">
					<img src="${this.newImageSrc}" alt="${this.newLabel}" class="image-comparison__image">
					<div class="image-comparison__label image-comparison__label--new">
						<span>${this.newLabel}</span>
					</div>
				</div>
				<div class="image-comparison__image-wrapper image-comparison__image-wrapper--old">
					<img src="${this.oldImageSrc}" alt="${this.oldLabel}" class="image-comparison__image">
					<div class="image-comparison__label image-comparison__label--old">
						<span>${this.oldLabel}</span>
					</div>
				</div>
			</div>
			<div class="image-comparison__slider">
				<div class="image-comparison__slider-handle">
					<div class="image-comparison__slider-handle-inner">
						<ion-icon name="chevron-back-outline"></ion-icon>
						<ion-icon name="chevron-forward-outline"></ion-icon>
					</div>
				</div>
			</div>
		`;

		// Get elements
		this.newImage = this.container.querySelector('.image-comparison__image-wrapper--new');
		this.oldImage = this.container.querySelector('.image-comparison__image-wrapper--old');
		this.sliderControl = this.container.querySelector('.image-comparison__slider');

		// Set initial position
		this.updateSliderPosition(this.sliderPosition);

		// Add event listeners
		this.addSliderEventListeners();
	}

	/**
	 * Create toggle mode interface
	 * @param {Object} oldDim - Old image dimensions
	 * @param {Object} newDim - New image dimensions
	 */
	createToggleInterface(oldDim, newDim) {
		// Calculate size that fits both images
		const containerSize = this.calculateToggleSize(oldDim, newDim);

		this.container.className = 'image-comparison image-comparison--toggle';
		this.container.style.width = `${containerSize.width}px`;
		this.container.style.height = `${containerSize.height}px`;

		const showNew = this.toggleState === 'new';
		this.container.innerHTML = `
			<div class="image-comparison__images">
				<div class="image-comparison__image-wrapper image-comparison__image-wrapper--new${showNew ? ' active' : ''}">
					<img src="${this.newImageSrc}" alt="${this.newLabel}" class="image-comparison__image">
				</div>
				<div class="image-comparison__image-wrapper image-comparison__image-wrapper--old${!showNew ? ' active' : ''}">
					<img src="${this.oldImageSrc}" alt="${this.oldLabel}" class="image-comparison__image">
				</div>
			</div>
			<div class="image-comparison__toggle-switch">
				<div class="image-comparison__toggle-track">
					<button class="image-comparison__toggle-option image-comparison__toggle-option--new${showNew ? ' active' : ''}" data-state="new">
						${this.newLabel}
					</button>
					<button class="image-comparison__toggle-option image-comparison__toggle-option--old${!showNew ? ' active' : ''}" data-state="old">
						${this.oldLabel}
					</button>
					<div class="image-comparison__toggle-slider" style="${!showNew ? 'transform: translateX(100%)' : ''}"></div>
				</div>
			</div>
		`;

		// Get elements
		this.newImage = this.container.querySelector('.image-comparison__image-wrapper--new');
		this.oldImage = this.container.querySelector('.image-comparison__image-wrapper--old');
		this.toggleControl = this.container.querySelectorAll('.image-comparison__toggle-option');

		// Add event listeners
		this.addToggleEventListeners();
	}

	/**
	 * Calculate optimal size for slider mode
	 * Uses the larger dimensions and maintains aspect ratio
	 * @param {Object} oldDim - Old image dimensions
	 * @param {Object} newDim - New image dimensions
	 * @returns {Object} {width, height}
	 */
	calculateOptimalSize(oldDim, newDim) {
		const targetWidth = Math.max(oldDim.width, newDim.width);
		const targetHeight = Math.max(oldDim.height, newDim.height);
		const targetRatio = targetWidth / targetHeight;

		const maxWidth = Math.min(window.innerWidth * 0.85, 1400);
		const maxHeight = Math.min(window.innerHeight * 0.7, 900);

		const minWidth = 300;
		const minHeight = 200;

		let width = targetWidth;
		let height = targetHeight;

		if (width > maxWidth) {
			width = maxWidth;
			height = width / targetRatio;
		}

		if (height > maxHeight) {
			height = maxHeight;
			width = height * targetRatio;
		}

		if (width < minWidth) {
			width = minWidth;
			height = width / targetRatio;
		}

		if (height < minHeight) {
			height = minHeight;
			width = height * targetRatio;
		}

		return { width: Math.round(width), height: Math.round(height) };
	}

	/**
	 * Calculate size for toggle mode
	 * Fits both images within viewport
	 * @param {Object} oldDim - Old image dimensions
	 * @param {Object} newDim - New image dimensions
	 * @returns {Object} {width, height}
	 */
	calculateToggleSize(oldDim, newDim) {
		const maxWidth = Math.min(window.innerWidth * 0.85, 1400);
		const maxHeight = Math.min(window.innerHeight * 0.65, 850);

		const minWidth = 300;
		const minHeight = 200;

		const oldScaleW = maxWidth / oldDim.width;
		const oldScaleH = maxHeight / oldDim.height;
		const oldScale = Math.min(oldScaleW, oldScaleH, 1);

		const newScaleW = maxWidth / newDim.width;
		const newScaleH = maxHeight / newDim.height;
		const newScale = Math.min(newScaleW, newScaleH, 1);

		const oldFinalW = oldDim.width * oldScale;
		const oldFinalH = oldDim.height * oldScale;
		const newFinalW = newDim.width * newScale;
		const newFinalH = newDim.height * newScale;

		let width = Math.max(oldFinalW, newFinalW);
		let height = Math.max(oldFinalH, newFinalH);

		if (width < minWidth) width = minWidth;
		if (height < minHeight) height = minHeight;

		return { width: Math.round(width), height: Math.round(height) };
	}

	/**
	 * Add event listeners for slider mode
	 */
	addSliderEventListeners() {
		// Mouse events
		this.sliderControl.addEventListener('mousedown', this.handleMouseDown);
		document.addEventListener('mousemove', this.handleMouseMove);
		document.addEventListener('mouseup', this.handleMouseUp);

		// Touch events
		this.sliderControl.addEventListener('touchstart', this.handleTouchStart, { passive: false });
		document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
		document.addEventListener('touchend', this.handleTouchEnd);

		// Keyboard support on container
		this.container.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				this.updateSliderPosition(Math.max(0, this.sliderPosition - 5));
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				this.updateSliderPosition(Math.min(100, this.sliderPosition + 5));
			}
		});

		// Make container focusable for keyboard navigation
		this.container.setAttribute('tabindex', '0');

		// Auto-focus for immediate keyboard control
		setTimeout(() => {
			this.container.focus();
		}, 100);
	}

	/**
	 * Add event listeners for toggle mode
	 */
	addToggleEventListeners() {
		this.toggleControl.forEach(btn => {
			btn.addEventListener('click', this.handleToggle);
		});

		this.toggleControl.forEach(btn => {
			btn.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					this.handleToggle(e);
				}
			});
		});
	}

	/**
	 * Handle mouse down on slider
	 */
	handleMouseDown(e) {
		this.isDragging = true;
		this.updateSliderFromEvent(e);
		e.preventDefault();
	}

	/**
	 * Handle mouse move
	 */
	handleMouseMove(e) {
		if (!this.isDragging) return;

		// Show labels temporarily when dragging
		this.showLabelsTemporarily();

		this.updateSliderFromEvent(e);
		e.preventDefault();
		e.stopPropagation();
	}

	/**
	 * Handle mouse up
	 */
	handleMouseUp(e) {
		if (this.isDragging) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.isDragging = false;
	}

	/**
	 * Handle touch start
	 */
	handleTouchStart(e) {
		this.isDragging = true;
		this.updateSliderFromEvent(e.touches[0]);
		e.preventDefault();
	}

	/**
	 * Handle touch move
	 */
	handleTouchMove(e) {
		if (!this.isDragging) return;

		// Show labels temporarily when dragging on touch
		this.showLabelsTemporarily();

		this.updateSliderFromEvent(e.touches[0]);
		e.preventDefault();
	}

	/**
	 * Handle touch end
	 */
	handleTouchEnd() {
		this.isDragging = false;
	}

	/**
	 * Update slider position from event
	 * @param {MouseEvent|Touch} e - Event object
	 */
	updateSliderFromEvent(e) {
		const rect = this.container.getBoundingClientRect();

		// Clamp mouse position to container bounds
		let x = e.clientX - rect.left;
		x = Math.max(0, Math.min(rect.width, x));

		const percentage = (x / rect.width) * 100;
		this.updateSliderPosition(percentage);
	}

	/**
	 * Update slider position
	 * @param {number} percentage - Position percentage (0-100)
	 */
	updateSliderPosition(percentage) {
		this.sliderPosition = percentage;

		// Update clip path for old image
		if (this.oldImage) {
			this.oldImage.style.clipPath = `inset(0 0 0 ${percentage}%)`;
		}

		// Update slider handle position
		if (this.sliderControl) {
			this.sliderControl.style.left = `${percentage}%`;
		}
	}

	/**
	 * Handle toggle button click
	 * @param {Event} e - Click event
	 */
	handleToggle(e) {
		const btn = e.currentTarget;
		const state = btn.dataset.state;

		if (state === this.toggleState) return;

		this.toggleState = state;

		// Update button states
		this.toggleControl.forEach(b => {
			b.classList.toggle('active', b.dataset.state === state);
		});

		// Update image visibility with smooth transition
		if (state === 'new') {
			this.newImage.classList.add('active');
			this.oldImage.classList.remove('active');
		} else {
			this.oldImage.classList.add('active');
			this.newImage.classList.remove('active');
		}
	}

	/**
	 * Show loading state
	 */
	showLoading() {
		this.container.innerHTML = `
			<div class="image-comparison__loading">
				<div class="image-comparison__loading-spinner"></div>
				<p>Loading...</p>
			</div>
		`;
	}

	/**
	 * Show error state
	 */
	showError() {
		this.container.innerHTML = `
			<div class="image-comparison__error">
				<ion-icon name="alert-circle-outline"></ion-icon>
				<p>Failed to load comparison</p>
			</div>
		`;
	}

	/**
	 * Show labels temporarily when interacting
	 */
	showLabelsTemporarily() {
		if (this.labelTimeout) {
			clearTimeout(this.labelTimeout);
		}

		const labels = this.container.querySelectorAll('.image-comparison__label');
		labels.forEach(label => {
			label.style.opacity = '1';
			label.style.animation = 'none';
		});

		this.labelTimeout = setTimeout(() => {
			labels.forEach(label => {
				label.style.opacity = '0';
			});
		}, 2000);
	}

	/**
	 * Cleanup and remove event listeners
	 */
	destroy() {
		if (this.mode === 'slider') {
			document.removeEventListener('mousemove', this.handleMouseMove);
			document.removeEventListener('mouseup', this.handleMouseUp);
			document.removeEventListener('touchmove', this.handleTouchMove);
			document.removeEventListener('touchend', this.handleTouchEnd);
		}

		if (this.labelTimeout) {
			clearTimeout(this.labelTimeout);
		}

		this.container.innerHTML = '';
	}
}
