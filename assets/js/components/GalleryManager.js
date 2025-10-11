/**
 * Gallery Manager - Visual comparison gallery component
 * Handles image loading, category filtering, and theme switching
 */

class GalleryManager {
	constructor() {
		this.currentTheme = 'new'; // 'new' or 'old'
		this.currentCategory = 'all';
		this.images = [];
		this.filteredImages = [];
		this.isLoading = false;
		this.currentPage = 1;
		this.itemsPerPage = this.getItemsPerPage(); // Responsive items per page
		this.totalPages = 1;
		this.categorySelect = null;
		
		// DOM elements
		this.galleryGrid = document.getElementById('gallery-grid');
		this.toggleButton = document.getElementById('gallery-toggle');
		this.categorySelectorContainer = document.querySelector('.gallery-controls-row');
		
		// Initialize gallery
		this.init();
	}

	/**
	 * Get items per page based on screen size
	 * @returns {number} Items per page
	 */
	getItemsPerPage() {
		return window.innerWidth <= 768 ? 3 : 9;
	}

	/**
	 * Initialize the gallery component
	 */
	init() {
		this.setupEventListeners();
		this.loadImages();
		
		// Listen for language changes
		document.addEventListener('languageChanged', () => {
			this.updateTranslations();
		});
		
		// Listen for window resize to update items per page
		window.addEventListener('resize', () => {
			const newItemsPerPage = this.getItemsPerPage();
			if (newItemsPerPage !== this.itemsPerPage) {
				this.itemsPerPage = newItemsPerPage;
				this.currentPage = 1;
				this.calculatePagination();
				this.renderGallery();
			}
		});
	}

	/**
	 * Setup category selector using BreeziumSelect
	 * @description
	 * Creates a dropdown selector with all available categories.
	 * Categories are dynamically determined from loaded images,
	 * so new categories automatically appear when added to the manifest.
	 */
	setupCategorySelector() {
		// Wait for BreeziumSelect to load
		const initSelector = () => {
			if (typeof window.BreeziumSelect === 'undefined') {
				setTimeout(initSelector, 100);
				return;
			}

			try {
				// Extract unique categories from loaded images
				const uniqueCategories = [...new Set(this.images.map(img => img.category))].sort();
				
				// Build category options with translations
				const categories = [
					{ 
						value: 'all',
						code: 'all', // Keep for backward compatibility
						name: window.i18n ? window.i18n.t('gallery.all') : 'All' 
					}
				];
				
				// Add each available category
				for (const category of uniqueCategories) {
					categories.push({
						value: category,
						code: category, // Keep for backward compatibility
						name: window.i18n ? window.i18n.t(`gallery.${category}`) : this.capitalize(category)
					});
				}

				// Create the selector
				this.categorySelect = new window.BreeziumSelect(
					categories,
					(category) => this.filterByCategory(category),
					this.currentCategory
				);

				// Render into container
				if (this.categorySelectorContainer) {
					this.categorySelect.render(this.categorySelectorContainer);
				}
			} catch (error) {
				console.error('Error creating category selector:', error);
			}
		};

		initSelector();
	}

	/**
	 * Capitalize first letter of a string
	 * @param {string} str - String to capitalize
	 * @returns {string} Capitalized string
	 */
	capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * Setup event listeners for controls
	 */
	setupEventListeners() {
		// Theme toggle button
		if (this.toggleButton) {
			this.toggleButton.addEventListener('click', () => this.toggleTheme());
		}

		// Keyboard navigation
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				this.closeModal();
			}
		});
	}

	/**
	 * Load all available images from the manifest file
	 * @description
	 * Fetches the pre-generated image manifest (created by generate-image-manifest.js)
	 * which contains all image pairs matched between new/ and old/ theme directories.
	 * This approach is much faster than runtime file discovery and doesn't require
	 * making hundreds of HTTP HEAD requests.
	 */
	async loadImages() {
		this.showLoading();
		
		try {
			// Fetch the pre-generated manifest
			const manifest = await this.fetchManifest();
			
			if (!manifest || !manifest.categories) {
				throw new Error('Invalid manifest format');
			}

			this.images = [];

			// Process each category from the manifest
			for (const [category, categoryData] of Object.entries(manifest.categories)) {
				// Only process matched image pairs
				if (!categoryData.matched || categoryData.matched.length === 0) {
					continue;
				}

				// Add each matched pair to the gallery
				for (const imageData of categoryData.matched) {
					this.images.push({
						category,
						filename: imageData.new,
						title: this.formatTitle(imageData.new),
						newPath: `images/${category}/new/${imageData.new}`,
						oldPath: `images/${category}/old/${imageData.old}`
					});
				}
			}

			// Sort images by category and filename for consistent display
			this.images.sort((a, b) => {
				if (a.category !== b.category) {
					return a.category.localeCompare(b.category);
				}
				return a.filename.localeCompare(b.filename);
			});

			// Log loaded images count
			console.log(`📷 Loaded ${this.images.length} images from ${Object.keys(manifest.categories).length} categories`);

			// Setup category selector with loaded categories
			this.setupCategorySelector();

			// Calculate pagination
			this.calculatePagination();
			
			// Render initial gallery
			this.renderGallery();
			
		} catch (error) {
			console.error('Error loading images:', error);
			this.showError('Failed to load gallery images. Please ensure the image manifest is generated.');
		}
	}

	/**
	 * Fetch the image manifest file
	 * @returns {Promise<Object>} The parsed manifest object
	 * @throws {Error} If manifest cannot be fetched or parsed
	 */
	async fetchManifest() {
		const manifestPath = 'assets/config/image-manifest.json';
		
		try {
			const response = await fetch(manifestPath);
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			
			const manifest = await response.json();
			
			// Log manifest info
			if (manifest.version && manifest.generated) {
				console.log(`📋 Loaded manifest v${manifest.version} (generated: ${new Date(manifest.generated).toLocaleString()})`);
			}
			
			return manifest;
		} catch (error) {
			console.error('Failed to load image manifest:', error);
			console.error('Please run: node scripts/generate-image-manifest.js');
			throw error;
		}
	}



	/**
	 * Format filename to display title
	 * @param {string} filename - The filename to format
	 * @returns {string} Formatted title
	 */
	formatTitle(filename) {
		// Keep original case for file names, just remove extension
		return filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
	}

	/**
	 * Toggle between new and old theme
	 */
	toggleTheme() {
		this.currentTheme = this.currentTheme === 'new' ? 'old' : 'new';
		this.updateToggleButton();
		this.renderGallery();
	}

	/**
	 * Update toggle button text and state
	 */
	updateToggleButton() {
		if (this.toggleButton) {
			const i18nKey = this.currentTheme === 'new' ? 'gallery.showOriginal' : 'gallery.showSeveritium';
			this.toggleButton.setAttribute('data-i18n-key', i18nKey);
			// Use i18n to get translated text
			this.toggleButton.textContent = window.i18n.t(i18nKey);
		}
	}

	/**
	 * Filter gallery by category
	 * @param {string} category - Category to filter by
	 */
	filterByCategory(category) {
		this.currentCategory = category;
		this.currentPage = 1; // Reset to first page

		// Calculate pagination for filtered results
		this.calculatePagination();
		
		// Re-render gallery
		this.renderGallery();
	}

	/**
	 * Calculate pagination for current filter
	 */
	calculatePagination() {
		// Filter images by category
		this.filteredImages = this.currentCategory === 'all' 
			? this.images 
			: this.images.filter(img => img.category === this.currentCategory);
		
		// Calculate total pages
		this.totalPages = Math.ceil(this.filteredImages.length / this.itemsPerPage);
		
		// Ensure current page is valid
		if (this.currentPage > this.totalPages) {
			this.currentPage = Math.max(1, this.totalPages);
		}
	}

	/**
	 * Get current page images
	 * @returns {Array} Array of images for current page
	 */
	getCurrentPageImages() {
		const startIndex = (this.currentPage - 1) * this.itemsPerPage;
		const endIndex = startIndex + this.itemsPerPage;
		return this.filteredImages.slice(startIndex, endIndex);
	}

	/**
	 * Render the gallery grid
	 */
	renderGallery() {
		if (!this.galleryGrid) return;

		// Clear existing content and pagination
		this.galleryGrid.innerHTML = '';
		this.clearPagination();

		if (this.filteredImages.length === 0) {
			this.showEmptyState();
			return;
		}

		// Get current page images
		const currentPageImages = this.getCurrentPageImages();

		// Create gallery items
		currentPageImages.forEach(image => {
			const galleryItem = this.createGalleryItem(image);
			this.galleryGrid.appendChild(galleryItem);
		});

		// Add pagination controls
		this.renderPagination();
	}

	/**
	 * Clear existing pagination
	 */
	clearPagination() {
		const existingPagination = document.querySelector('.gallery-pagination');
		if (existingPagination) {
			existingPagination.remove();
		}
	}


	/**
	 * Create a single gallery item element
	 * @param {Object} image - Image data object
	 * @returns {HTMLElement} Gallery item element
	 */
	createGalleryItem(image) {
		const item = document.createElement('div');
		item.className = 'gallery-item';
		item.dataset.category = image.category;

		const imagePath = this.currentTheme === 'new' ? image.newPath : image.oldPath;
		
		// Get translated text
		const loadingText = window.i18n ? window.i18n.t('gallery.loading') : 'Loading...';
		const notFoundText = window.i18n ? window.i18n.t('gallery.imageNotFound') : 'Image not found';
		
		item.innerHTML = `
			<div class="gallery-item__image-container">
				<div class="gallery-item__placeholder">
					<ion-icon name="image-outline" class="gallery-item__placeholder-icon"></ion-icon>
					<div class="gallery-item__loading">${loadingText}</div>
				</div>
				<img 
					src="${imagePath}" 
					alt="${image.title}" 
					class="gallery-item__image"
					loading="lazy"
					onload="this.style.display='block'; this.previousElementSibling.style.display='none';"
					onerror="this.style.display='none'; this.previousElementSibling.innerHTML='<ion-icon name=\\"image-outline\\" style=\\"font-size: 2rem; margin-right: 0.5rem;\\"></ion-icon><span>${notFoundText}</span>'; this.previousElementSibling.style.display='flex';"
				>
			</div>
			<div class="gallery-item__content">
				<h3 class="gallery-item__title" title="${image.title}">${image.title}</h3>
				<p class="gallery-item__category">${image.category}</p>
			</div>
		`;

		// Add click handler for modal
		item.addEventListener('click', () => this.openModal(image, imagePath));

		return item;
	}

	/**
	 * Render pagination controls
	 */
	renderPagination() {
		if (this.totalPages <= 1) return;

		// Create pagination container
		const paginationContainer = document.createElement('div');
		paginationContainer.className = 'gallery-pagination';
		
		// Previous button
		const prevButton = document.createElement('button');
		prevButton.className = 'gallery-pagination__button gallery-pagination__prev';
		prevButton.innerHTML = '<ion-icon name="chevron-back"></ion-icon>';
		prevButton.disabled = this.currentPage === 1;
		prevButton.addEventListener('click', () => this.goToPage(this.currentPage - 1));
		
		// Page numbers
		const pageNumbers = document.createElement('div');
		pageNumbers.className = 'gallery-pagination__numbers';
		
		// Calculate visible page range
		const startPage = Math.max(1, this.currentPage - 2);
		const endPage = Math.min(this.totalPages, this.currentPage + 2);
		
		for (let i = startPage; i <= endPage; i++) {
			const pageButton = document.createElement('button');
			pageButton.className = `gallery-pagination__button gallery-pagination__page ${i === this.currentPage ? 'active' : ''}`;
			pageButton.textContent = i;
			pageButton.addEventListener('click', () => this.goToPage(i));
			pageNumbers.appendChild(pageButton);
		}
		
		// Next button
		const nextButton = document.createElement('button');
		nextButton.className = 'gallery-pagination__button gallery-pagination__next';
		nextButton.innerHTML = '<ion-icon name="chevron-forward"></ion-icon>';
		nextButton.disabled = this.currentPage === this.totalPages;
		nextButton.addEventListener('click', () => this.goToPage(this.currentPage + 1));
		
		// Assemble pagination
		paginationContainer.appendChild(prevButton);
		paginationContainer.appendChild(pageNumbers);
		paginationContainer.appendChild(nextButton);
		
		// Insert after gallery grid
		this.galleryGrid.parentNode.insertBefore(paginationContainer, this.galleryGrid.nextSibling);
	}

	/**
	 * Go to specific page
	 * @param {number} page - Page number to go to
	 */
	goToPage(page) {
		if (page < 1 || page > this.totalPages || page === this.currentPage) return;
		
		this.currentPage = page;
		this.renderGallery();
		
		// Scroll to gallery
		this.galleryGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	/**
	 * Open modal with full-size image
	 * @param {Object} image - Image data object
	 * @param {string} imagePath - Path to the image
	 */
	openModal(image, imagePath) {
		// Create modal if it doesn't exist
		let modal = document.getElementById('gallery-modal');
		if (!modal) {
			modal = this.createModal();
			document.body.appendChild(modal);
		}

		// Update modal content
		const modalImage = modal.querySelector('.gallery-modal__image');
		const modalTitle = modal.querySelector('.gallery-modal__title');
		const modalCategory = modal.querySelector('.gallery-modal__category');
		const errorDiv = modal.querySelector('.gallery-modal__error');

		// Reset visibility
		modalImage.style.display = 'block';
		if (errorDiv) {
			errorDiv.style.display = 'none';
		}

		modalImage.src = imagePath;
		modalImage.alt = image.title;
		modalImage.onerror = () => {
			modalImage.style.display = 'none';
			if (errorDiv) {
				errorDiv.style.display = 'flex';
			}
		};
		modalTitle.textContent = image.title;
		modalCategory.textContent = image.category;

		// Show modal
		modal.classList.add('active');
		document.body.style.overflow = 'hidden';
	}

	/**
	 * Create modal element
	 * @returns {HTMLElement} Modal element
	 */
	createModal() {
		const modal = document.createElement('div');
		modal.id = 'gallery-modal';
		modal.className = 'gallery-modal';
		
		modal.innerHTML = `
			<div class="gallery-modal__content">
				<div class="gallery-modal__header">
					<div class="gallery-modal__info">
						<h3 class="gallery-modal__title"></h3>
						<p class="gallery-modal__category"></p>
					</div>
					<button class="gallery-modal__close" aria-label="Close">
						<ion-icon name="close"></ion-icon>
					</button>
				</div>
				<div class="gallery-modal__body">
					<div class="gallery-modal__image-container">
						<img class="gallery-modal__image" alt="">
					</div>
					<div class="gallery-modal__error" style="display: none;">
						<ion-icon name="image-outline" style="font-size: 3rem;"></ion-icon>
						<span>Image not found</span>
					</div>
				</div>
			</div>
		`;

		// Add event listeners
		const closeButton = modal.querySelector('.gallery-modal__close');
		closeButton.addEventListener('click', () => this.closeModal());
		
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				this.closeModal();
			}
		});

		return modal;
	}

	/**
	 * Close the modal
	 */
	closeModal() {
		const modal = document.getElementById('gallery-modal');
		if (modal) {
			modal.classList.remove('active');
			document.body.style.overflow = '';
		}
	}


	/**
	 * Show loading state
	 */
	showLoading() {
		if (this.galleryGrid) {
			this.galleryGrid.innerHTML = `
				<div class="gallery-loading">
					<div class="gallery-loading__spinner"></div>
					Loading gallery...
				</div>
			`;
		}
	}

	/**
	 * Show empty state
	 */
	showEmptyState() {
		if (this.galleryGrid) {
			this.galleryGrid.innerHTML = `
				<div class="gallery-empty">
					<div class="gallery-empty__icon">📷</div>
					<h3 class="gallery-empty__title">No images found</h3>
					<p class="gallery-empty__description">Try selecting a different category</p>
				</div>
			`;
		}
	}

	/**
	 * Show error state
	 * @param {string} message - Error message to display
	 */
	showError(message) {
		if (this.galleryGrid) {
			this.galleryGrid.innerHTML = `
				<div class="gallery-empty">
					<div class="gallery-empty__icon">⚠️</div>
					<h3 class="gallery-empty__title">Error</h3>
					<p class="gallery-empty__description">${message}</p>
				</div>
			`;
		}
	}

	/**
	 * Update translations when language changes
	 * @description
	 * Updates all translatable UI elements including toggle button,
	 * category selector options, and gallery content.
	 */
	updateTranslations() {
		// Update toggle button text
		this.updateToggleButton();
		
		// Update category selector options with new translations
		if (this.categorySelect) {
			// Get current selected value to preserve selection
			const currentValue = this.categorySelect.getValue();
			
			// Build new options with updated translations
			const uniqueCategories = [...new Set(this.images.map(img => img.category))].sort();
			const categories = [
				{ 
					value: 'all',
					code: 'all',
					name: window.i18n ? window.i18n.t('gallery.all') : 'All' 
				}
			];
			
			for (const category of uniqueCategories) {
				categories.push({
					value: category,
					code: category,
					name: window.i18n ? window.i18n.t(`gallery.${category}`) : this.capitalize(category)
				});
			}
			
			// Update options with new translations
			this.categorySelect.updateOptions(categories, currentValue);
			
			// Force update the selected text with new translation
			// This ensures the displayed text matches the new language
			this.categorySelect.setValue(currentValue, { trigger: false });
		}
		
		// Re-render gallery to update all text
		this.renderGallery();
	}
}

// Export for use in main app
window.GalleryManager = GalleryManager;

// Default export for ES6 modules
export default GalleryManager;
