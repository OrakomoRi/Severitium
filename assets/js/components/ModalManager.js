/**
 * Modern Modal System - Dynamic modal creation and management
 */

class ModalManager {
	constructor(markdownParser = null) {
		this.activeModal = null;
		this.animationDuration = 300;
		this.markdownParser = markdownParser;
		this.init();
	}

	/**
	 * Initialize event listeners
	 * @private
	 */
	init() {
		this.bindEvents();
	}

	/**
	 * Bind global event listeners
	 * @private
	 */
	bindEvents() {
		document.addEventListener('keydown', this.handleKeydown.bind(this));
		document.addEventListener('click', this.handleClick.bind(this));
	}

	/**
	 * Handle keydown events
	 * @param {KeyboardEvent} e - Keyboard event
	 * @private
	 */
	handleKeydown(e) {
		if (e.key === 'Escape' && this.activeModal) {
			this.hide();
		}
	}

	/**
	 * Handle click events using delegation
	 * @param {MouseEvent} e - Mouse event
	 * @private
	 */
	handleClick(e) {
		// Close button
		if (e.target.closest('.modal__close')) {
			e.preventDefault();
			this.hide();
			return;
		}

		// Modal overlay click
		if (e.target.classList.contains('modal__overlay') || e.target.classList.contains('modal')) {
			this.hide();
			return;
		}

		// Changelog button
		if (e.target.closest('#changelog-btn')) {
			e.preventDefault();
			this.showChangelog();
			return;
		}

		// License button
		if (e.target.closest('#license-btn')) {
			e.preventDefault();
			this.showLicense();
			return;
		}
	}

	/**
	 * Create modal HTML structure
	 * @param {string} id - Modal ID
	 * @param {string} title - Modal title
	 * @param {string} icon - Ion icon name
	 * @param {string} contentClass - CSS class for content styling
	 * @returns {HTMLElement} Modal element
	 * @private
	 */
	createElement(id, title, icon, contentClass = 'changelog') {
		const modal = document.createElement('div');
		modal.id = id;
		modal.className = 'modal';

		modal.innerHTML = `
			<div class="modal__overlay"></div>
			<div class="modal__content modal__content--${contentClass}">
				<div class="modal__header">
					<h2 class="modal__title">
						<ion-icon name="${icon}"></ion-icon> ${title}
					</h2>
					<button class="modal__close" data-modal="${id}">
						<ion-icon name="close-outline"></ion-icon>
					</button>
				</div>
				<div class="modal__body">
					<div id="${id}-content" class="${contentClass}">
						${this.createLoadingHTML(contentClass, title)}
					</div>
				</div>
			</div>
		`;

		return modal;
	}

	/**
	 * Create loading HTML
	 * @param {string} contentClass - Content class
	 * @param {string} title - Modal title
	 * @returns {string} Loading HTML
	 * @private
	 */
	createLoadingHTML(contentClass, title) {
		return `
			<div class="${contentClass}__loading">
				<ion-icon name="hourglass-outline" class="${contentClass}__loading-icon"></ion-icon>
				<p class="${contentClass}__loading-text">Loading ${title.toLowerCase()}...</p>
			</div>
		`;
	}

	/**
	 * Create error HTML
	 * @param {string} contentClass - Content class
	 * @param {string} title - Modal title
	 * @returns {string} Error HTML
	 * @private
	 */
	createErrorHTML(contentClass, title) {
		return `
			<div class="${contentClass}__error">
				<ion-icon name="alert-circle-outline"></ion-icon>
				<p>Failed to load ${title.toLowerCase()}. Please try again later.</p>
			</div>
		`;
	}

	/**
	 * Show modal with content loading
	 * @param {Object} options - Modal options
	 * @param {string} options.modalId - Modal ID
	 * @param {string} options.title - Modal title
	 * @param {string} options.icon - Ion icon name
	 * @param {Function} options.contentLoader - Function to load content
	 * @param {string} [options.contentClass='changelog'] - CSS class for content
	 */
	async show({ modalId, title, icon, contentLoader, contentClass = 'changelog' }) {
		// Remove existing modal
		this.hide();

		// Create and append modal
		const modal = this.createElement(modalId, title, icon, contentClass);
		document.body.appendChild(modal);
		this.activeModal = modal;

		// Lock body scroll
		document.body.style.overflow = 'hidden';

		// Show with animation
		requestAnimationFrame(() => {
			modal.classList.add('modal--show');
		});

		// Load content
		await this.loadContent(modalId, contentLoader, contentClass, title);
	}

	/**
	 * Load content into modal
	 * @param {string} modalId - Modal ID
	 * @param {Function} contentLoader - Content loader function
	 * @param {string} contentClass - Content class
	 * @param {string} title - Modal title
	 * @private
	 */
	async loadContent(modalId, contentLoader, contentClass, title) {
		const contentElement = document.getElementById(`${modalId}-content`);
		if (!contentElement) return;

		try {
			const content = await contentLoader();
			contentElement.innerHTML = content;
		} catch (error) {
			console.error(`Error loading ${title}:`, error);
			contentElement.innerHTML = this.createErrorHTML(contentClass, title);
		}
	}

	/**
	 * Hide active modal with animation
	 */
	hide() {
		if (!this.activeModal) return;

		this.activeModal.classList.remove('modal--show');

		// Unlock body scroll
		document.body.style.overflow = '';

		setTimeout(() => {
			if (this.activeModal?.parentNode) {
				this.activeModal.parentNode.removeChild(this.activeModal);
			}
			this.activeModal = null;
		}, this.animationDuration);
	}

	/**
	 * Show changelog modal
	 */
	async showChangelog() {
		await this.show({
			modalId: 'changelog-modal',
			title: 'Changelog',
			icon: 'document-text-outline',
			contentLoader: async () => {
				if (!this.markdownParser) {
					throw new Error('MarkdownParser not available');
				}

				const markdownContent = await this.markdownParser.fetchFromUrl();
				const parsedContent = this.markdownParser.parse(markdownContent);

				if (!parsedContent?.trim()) {
					return `
						<div class="changelog__error">
							<ion-icon name="alert-circle-outline"></ion-icon>
							<p>No changelog content available</p>
						</div>
					`;
				}

				return parsedContent;
			}
		});
	}

	/**
	 * Show license modal
	 */
	async showLicense() {
		await this.show({
			modalId: 'license-modal',
			title: 'License',
			icon: 'document-outline',
			contentLoader: async () => {
				const response = await fetch('https://raw.githubusercontent.com/OrakomoRi/Severitium/main/LICENSE');
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const licenseText = await response.text();
				return `<pre class="license">${licenseText}</pre>`;
			},
			contentClass: 'license'
		});
	}

	/**
	 * Check if modal is currently active
	 * @returns {boolean} True if modal is active
	 */
	isActive() {
		return !!this.activeModal;
	}

	/**
	 * Get active modal element
	 * @returns {HTMLElement|null} Active modal element
	 */
	getActiveModal() {
		return this.activeModal;
	}

	/**
	 * Destroy modal manager and cleanup
	 */
	destroy() {
		this.hide();
		// Remove event listeners if needed (depends on your requirements)
	}
}

export default ModalManager;