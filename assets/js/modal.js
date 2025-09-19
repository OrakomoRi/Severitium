/**
 * Modal System - Dynamic modal creation and management
 */

class ModalManager {
	constructor() {
		this.activeModal = null;
		this.initializeEventListeners();
	}

	/**
	 * Create modal HTML structure
	 * @param {string} id - Modal ID
	 * @param {string} title - Modal title
	 * @param {string} icon - Ion icon name
	 * @param {string} contentClass - CSS class for content styling
	 * @returns {HTMLElement} Modal element
	 */
	createModal(id, title, icon, contentClass = 'changelog') {
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
						<div class="${contentClass}__loading">
							<ion-icon name="hourglass-outline" class="${contentClass}__loading-icon"></ion-icon>
							<p class="${contentClass}__loading-text">Loading ${title.toLowerCase()}...</p>
						</div>
					</div>
				</div>
			</div>
		`;

		return modal;
	}

	/**
	 * Show modal with content loading
	 * @param {string} modalId - Modal ID
	 * @param {string} title - Modal title
	 * @param {string} icon - Ion icon name
	 * @param {Function} contentLoader - Function to load content
	 * @param {string} contentClass - CSS class for content
	 */
	async showModal(modalId, title, icon, contentLoader, contentClass = 'changelog') {
		// Remove existing modal if present
		this.hideModal();

		// Create and append modal
		const modal = this.createModal(modalId, title, icon, contentClass);
		document.body.appendChild(modal);
		this.activeModal = modal;

		// Show modal with animation
		requestAnimationFrame(() => {
			modal.classList.add('modal--show');
		});

		// Load content
		const contentElement = document.getElementById(`${modalId}-content`);
		try {
			const content = await contentLoader();
			contentElement.innerHTML = content;
		} catch (error) {
			contentElement.innerHTML = `
				<div class="${contentClass}__error">
					<ion-icon name="alert-circle-outline"></ion-icon>
					<p>Failed to load ${title.toLowerCase()}. Please try again later.</p>
				</div>
			`;
		}
	}

	/**
	 * Hide active modal
	 */
	hideModal() {
		if (this.activeModal) {
			this.activeModal.classList.remove('modal--show');
			setTimeout(() => {
				if (this.activeModal && this.activeModal.parentNode) {
					this.activeModal.parentNode.removeChild(this.activeModal);
				}
				this.activeModal = null;
			}, 300); // Wait for animation to complete
		}
	}

	/**
	 * Initialize global event listeners
	 */
	initializeEventListeners() {
		// Handle escape key
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.activeModal) {
				this.hideModal();
			}
		});

		// Handle clicks using event delegation
		document.addEventListener('click', (e) => {
			// Close button
			if (e.target.closest('.modal__close')) {
				e.preventDefault();
				this.hideModal();
				return;
			}

			// Modal overlay click
			if (e.target.classList.contains('modal__overlay') || e.target.classList.contains('modal')) {
				this.hideModal();
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
		});
	}

	/**
	 * Show changelog modal
	 */
	async showChangelog() {
		await this.showModal(
			'changelog-modal',
			'Changelog',
			'document-text-outline',
			async () => {
				if (!window.ChangelogParser) {
					throw new Error('ChangelogParser not available');
				}
				const markdownContent = await window.ChangelogParser.fetchChangelog();
				return window.ChangelogParser.parseChangelog(markdownContent) || `
					<div class="changelog__error">
						<ion-icon name="alert-circle-outline"></ion-icon>
						<p>No changelog content available</p>
					</div>
				`;
			}
		);
	}

	/**
	 * Show license modal
	 */
	async showLicense() {
		await this.showModal(
			'license-modal',
			'License',
			'document-outline',
			async () => {
				const response = await fetch('https://raw.githubusercontent.com/OrakomoRi/Severitium/main/LICENSE');
				const licenseText = await response.text();
				
				return `<pre class="license">${licenseText}</pre>`;
			},
			'license'
		);
	}
}

// Initialize modal manager
window.modalManager = new ModalManager();