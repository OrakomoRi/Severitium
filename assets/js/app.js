import MarkdownParser from './components/MarkdownParser.js';
import ModalManager from './components/ModalManager.js';
import BackgroundAnimation from './components/BackgroundAnimation.js';
import I18n from '../libs/i18n.js';
import I18nManager from './components/I18nManager.js';
import GalleryManager from './components/GalleryManager.js';
import ImageComparisonSlider from './components/ImageComparisonSlider.js';
import { HeaderController } from './components/HeaderController.js';

class SeveritiumApp {
	constructor() {
		this.modalManager = null;
		this.markdownParser = null;
		this.backgroundAnimation = null;
		this.i18n = null;
		this.i18nManager = null;
		this.galleryManager = null;

		this.init();
	}

	/**
	 * Initialize application
	 * @private
	 */
	async init() {
		await this.initializeI18n();
		this.initializeComponents();
		this.setupGlobalReferences();
		await this.initializeDownloadButtons();
		new HeaderController();

		this.availableLocales = await this.fetchAvailableLocales();

		this._createLanguageSelector();
		console.log('🖤 Severitium website loaded');
	}

	/**
	 * Initialize internationalization
	 * @private
	 */
	async initializeI18n() {
		// Create I18n instance
		this.i18n = new I18n({
			locale: this.detectLocale(),
			fallbacks: ['en'],
			missingHandler: (key) => key // Return key if translation missing
		});

		// Add initial translations
		await this.loadTranslations();

		// Create DOM manager
		this.i18nManager = new I18nManager(this.i18n, {
			autoWatch: true,
			translateOnInit: true
		});
	}

	/**
	 * Detect user locale from browser
	 * @returns {string} - Detected locale
	 * @private
	 */
	detectLocale() {
		// Check localStorage first
		const savedLocale = localStorage.getItem('severitium-locale');
		if (savedLocale) return savedLocale;

		// Detect from browser
		const browserLang = navigator.language || navigator.languages[0] || 'en';
		return browserLang.split('-')[0]; // 'en-US' -> 'en'
	}

	/**
	 * Load translation files dynamically from lang folder
	 * @param {string} locale - Locale to load
	 * @returns {Promise<Object|null>} - Translation data or null if failed
	 * @private
	 */
	async loadTranslationFile(locale) {
		try {
			const response = await fetch(`assets/lang/${locale}.json`);
			if (!response.ok) {
				throw new Error(`Failed to load ${locale}.json: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.warn(`Could not load translations for ${locale}:`, error);
			return null;
		}
	}

	/**
	 * Initialize translations - load default locale
	 * @private
	 */
	async loadTranslations() {
		const defaultLocale = this.detectLocale();

		// Load initial locale
		const translations = await this.loadTranslationFile(defaultLocale);
		if (translations) {
			this.i18n.add(defaultLocale, translations);
		}

		// Load fallback (en) if different from default
		if (defaultLocale !== 'en') {
			const fallbackTranslations = await this.loadTranslationFile('en');
			if (fallbackTranslations) {
				this.i18n.add('en', fallbackTranslations);
			}
		}
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
		this.galleryManager = new GalleryManager();
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

		// For i18n access
		window.i18n = this.i18n;
		window.i18nManager = this.i18nManager;
		
		// For gallery access
		window.galleryManager = this.galleryManager;
		
		// For image comparison component
		window.ImageComparisonSlider = ImageComparisonSlider;
	}

	/**
	 * Switch language and save preference
	 * @param {string} locale - New locale
	 */
	async switchLanguage(locale) {
		try {
			// Load translations dynamically
			const translations = await this.loadTranslationFile(locale);
			if (translations) {
				this.i18n.add(locale, translations);
			} else {
				console.warn(`Failed to load translations for ${locale}`);
				return;
			}

			// Switch locale and update DOM
			await this.i18nManager.setLocale(locale);
			localStorage.setItem('severitium-locale', locale);

			console.log(`Language switched to: ${locale}`);
		} catch (error) {
			console.error('Error switching language:', error);
		}
	}

	/**
	 * Fetch available locales from locales.json
	 * @returns {Promise<Array>} - Array of available locales
	 * @private
	 */
	async fetchAvailableLocales() {
		try {
			const res = await fetch('assets/config/locales.json?t=' + Date.now());
			if (!res.ok) throw new Error('locales.json not found');
			const data = await res.json();
			return Array.isArray(data.locales) ? data.locales : [];
		} catch (e) {
			console.warn('Locales manifest error:', e);
			// Fallback to hardcoded list
			return [
				{ code: 'en', name: 'English' }
			];
		}
	}

	/**
	 * Create and insert language selector into the header
	 * @private
	 */
	_createLanguageSelector() {
		const header = document.querySelector('header .header__language-selector');
		if (!header) return;

		// Wait for BreeziumSelect to load
		const initSelector = () => {
			if (typeof window.BreeziumSelect === 'undefined') {
				// Retry after a short delay
				setTimeout(initSelector, 100);
				return;
			}

			try {
				const options = (this.availableLocales || []).map(l => ({
					code: l.code,
					name: l.name
				}));

				const select = new window.BreeziumSelect(
					options,
					(newLocale) => this.switchLanguage(newLocale),
					this.i18n.locale,
				);

				select.render(header);
			} catch (error) {
				console.error('Error creating language selector:', error);
			}
		};

		initSelector();
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
			const response = await fetch(`https://severitium-builds.vercel.app/stable.json?t=${timestamp}`);

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

	setupLogo() {
		const logo = document.querySelector('[data-element="logo"]');
		if (!logo) return;

		logo.addEventListener('click', (e) => {
			window.location.href = '';
		});
	}

	/**
	 * Get current locale
	 * @returns {string} Current locale
	 */
	get locale() {
		return this.i18n?.locale || 'en';
	}

	/**
	 * Get I18n manager instance
	 * @returns {I18nManager} I18n manager instance
	 */
	getI18nManager() {
		return this.i18nManager;
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
	 * Get gallery manager instance
	 * @returns {GalleryManager} Gallery manager instance
	 */
	getGalleryManager() {
		return this.galleryManager;
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

		if (this.i18nManager) {
			this.i18nManager.destroy();
		}

		// Clean up global references
		delete window.markdownParser;
		delete window.modalManager;
		delete window.BackgroundAnimation;
		delete window.i18n;
		delete window.i18nManager;
		delete window.galleryManager;
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