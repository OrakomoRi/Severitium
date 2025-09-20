/**
 * Severitium Website Main Application
 * Handles initialization, version fetching, and component management
 */

import MarkdownParser from './components/MarkdownParser.js';
import ModalManager from './components/ModalManager.js';
import BackgroundAnimation from './components/BackgroundAnimation.js';

class SeveritiumApp {
	constructor() {
		this.modalManager = null;
		this.markdownParser = null;
		this.backgroundAnimation = null;

		this.init();
	}

	/**
	 * Initialize application
	 * @private
	 */
	async init() {
		this.initializeComponents();
		this.setupGlobalReferences();
		await this.initializeDownloadButtons();
		console.log('🖤 Severitium website loaded');
	}

	/**
	 * Initialize core components
	 * @private
	 */
	initializeComponents() {
		this.markdownParser = new MarkdownParser();
		this.modalManager = new ModalManager(this.markdownParser);
		this.backgroundAnimation = new BackgroundAnimation({
			constantSpeed: 0.15,
			directionChangeRate: 0.02,
			smoothness: 0.98,
			targetFPS: 60
		});
	}

	/**
	 * Setup global references for backward compatibility
	 * @private
	 */
	setupGlobalReferences() {
		// For modal system compatibility
		window.markdownParser = this.markdownParser;
		window.modalManager = this.modalManager;

		// Background animation global interface
		window.BackgroundAnimation = {
			instance: () => this.backgroundAnimation,
			setSpeed: (speed) => this.backgroundAnimation?.setSpeed(speed),
			setDirectionChangeRate: (rate) => this.backgroundAnimation?.setDirectionChangeRate(rate),
			start: () => this.backgroundAnimation?.start(),
			stop: () => this.backgroundAnimation?.stop(),
			pause: () => this.backgroundAnimation?.pause(),
			resume: () => this.backgroundAnimation?.resume(),
			destroy: () => this.backgroundAnimation?.destroy()
		};
	}

	/**
	 * Fetch the latest stable version from GitHub Pages
	 * @returns {Promise<string>} URL to the latest stable version
	 * @private
	 */
	async getLatestVersion() {
		const timestamp = new Date().getTime();
		const fallbackUrl = `https://orakomori.github.io/Severitium/release/severitium.user.js?t=${timestamp}`;

		try {
			const response = await fetch(`https://orakomori.github.io/Severitium/src/_preload/stable.json?t=${timestamp}`);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data?.versions?.length > 0) {
				const latestVersion = data.versions[data.versions.length - 1];
				return latestVersion.link || fallbackUrl;
			}
		} catch (error) {
			console.error('Error fetching latest version:', error);
		}

		return fallbackUrl;
	}

	/**
	 * Generate dynamic download URL with timestamp
	 * @returns {string} Download URL with timestamp
	 * @private
	 */
	generateLatestUrl() {
		const timestamp = new Date().getTime();
		return `https://orakomori.github.io/Severitium/release/severitium.user.js?t=${timestamp}`;
	}

	/**
	 * Setup latest version button
	 * @param {HTMLElement} button - Button element
	 * @private
	 */
	setupLatestButton(button) {
		if (!button) return;

		button.removeAttribute('href');
		button.addEventListener('click', (e) => {
			e.preventDefault();
			window.open(this.generateLatestUrl(), '_blank');
		});
	}

	/**
	 * Setup stable version button
	 * @param {HTMLElement} button - Button element
	 * @private
	 */
	async setupStableButton(button) {
		if (!button) return;

		try {
			const stableLink = await this.getLatestVersion();
			button.href = stableLink;
		} catch (error) {
			console.error('Error setting up stable button:', error);
			button.href = this.generateLatestUrl();
		}
	}

	/**
	 * Setup main install button
	 * @param {HTMLElement} button - Button element
	 * @private
	 */
	async setupInstallButton(button) {
		if (!button) return;

		try {
			const installLink = await this.getLatestVersion();
			button.href = installLink;
		} catch (error) {
			console.error('Error setting up install button:', error);
			button.href = this.generateLatestUrl();
		}
	}

	/**
	 * Initialize all download buttons with proper URLs
	 * @private
	 */
	async initializeDownloadButtons() {
		const buttons = {
			latest: document.getElementById('latest-btn'),
			stable: document.getElementById('stable-btn'),
			install: document.getElementById('install-script-btn')
		};

		// Setup buttons
		this.setupLatestButton(buttons.latest);
		await Promise.all([
			this.setupStableButton(buttons.stable),
			this.setupInstallButton(buttons.install)
		]);
	}

	/**
	 * Get modal manager instance
	 * @returns {ModalManager} Modal manager instance
	 */
	getModalManager() {
		return this.modalManager;
	}

	/**
	 * Get markdown parser instance
	 * @returns {MarkdownParser} Markdown parser instance
	 */
	getMarkdownParser() {
		return this.markdownParser;
	}

	/**
	 * Get background animation instance
	 * @returns {BackgroundAnimation} Background animation instance
	 */
	getBackgroundAnimation() {
		return this.backgroundAnimation;
	}

	/**
	 * Control background animation
	 * @param {string} action - Action to perform (start, stop, pause, resume)
	 */
	controlBackgroundAnimation(action) {
		if (!this.backgroundAnimation) return;

		switch (action) {
			case 'start':
				this.backgroundAnimation.start();
				break;
			case 'stop':
				this.backgroundAnimation.stop();
				break;
			case 'pause':
				this.backgroundAnimation.pause();
				break;
			case 'resume':
				this.backgroundAnimation.resume();
				break;
		}
	}

	/**
	 * Show changelog modal (public method)
	 */
	async showChangelog() {
		if (this.modalManager) {
			await this.modalManager.showChangelog();
		}
	}

	/**
	 * Show license modal (public method)
	 */
	async showLicense() {
		if (this.modalManager) {
			await this.modalManager.showLicense();
		}
	}

	/**
	 * Cleanup and destroy app
	 */
	destroy() {
		if (this.modalManager) {
			this.modalManager.destroy();
		}

		if (this.backgroundAnimation) {
			this.backgroundAnimation.destroy();
		}

		// Clean up global references
		delete window.markdownParser;
		delete window.modalManager;
		delete window.BackgroundAnimation;
		delete window.severitiumApp;
	}
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
	window.severitiumApp = new SeveritiumApp();
});

// Export for potential external use
export default SeveritiumApp;