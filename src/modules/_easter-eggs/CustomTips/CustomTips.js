(() => {
	'use strict';

	// Constants
	const STORAGE_KEY = 'tips.data';
	const ACCOUNT_SELECTOR = '.MainScreenComponentStyle-containerPanel .UserInfoContainerStyle-blockForIconTankiOnline';
	const CHECK_INTERVAL = 500; // ms
	const RANK_RANGE = { min: 1, max: 31 };

	/**
	 * Custom tips text for different languages
	 * @type {Object.<string, string>}
	 */
	const CUSTOM_TIPS = {
		en: "Thanks for using Severitium! <3",
		ru: "Спасибо за использование Severitium! <3",
		uk: "Дякуємо за використання Severitium! <3",
		nl: "Bedankt voor het gebruik van Severitium! <3",
		pl: "Dziękujemy za korzystanie z Severitium! <3",
		pt: "Obrigado por usar Severitium! <3",
		de: "Danke, dass du Severitium benutzt! <3",
		ja: "Severitiumをご利用いただきありがとうございます！<3",
		es: "¡Gracias por usar Severitium! <3",
		fr: "Merci d'utiliser Severitium ! <3"
	};

	// Cache custom tips values to avoid repeated Object.values calls
	const ALL_CUSTOM_TIPS = Object.values(CUSTOM_TIPS);

	/**
	 * Detects the current language from URL params, localStorage or browser settings
	 * @returns {string} ISO-639-1 language code
	 */
	const detectLanguage = () => {
		const urlLang = new URLSearchParams(window.location.search).get('locale');
		if (urlLang) return urlLang.toLowerCase();

		const storedLang = localStorage.getItem('language_store_key');
		if (storedLang) return storedLang.toLowerCase();

		return navigator.language.split('-')[0].toLowerCase();
	};

	/**
	 * Modifies tips data by removing old language tips and adding current language tip
	 * @param {Object} tipsData - The tips data object
	 * @returns {boolean} True if data was modified, false otherwise
	 */
	const modifyTipsData = (tipsData) => {
		if (!tipsData?.data?.length) return false;

		const lang = detectLanguage();
		const tipText = CUSTOM_TIPS[lang] || CUSTOM_TIPS.en;

		// Check if current language tip exists
		const hasCurrentTip = tipsData.data.some(tip => tip.tip === tipText);

		// Check if other language tips exist
		const hasOtherTips = tipsData.data.some(tip =>
			ALL_CUSTOM_TIPS.includes(tip.tip) && tip.tip !== tipText
		);

		// No changes needed
		if (hasCurrentTip && !hasOtherTips) return false;

		// Remove all custom tips from other languages
		tipsData.data = tipsData.data.filter(tip => !ALL_CUSTOM_TIPS.includes(tip.tip));

		// Add current language tip
		tipsData.data.push({
			minRank: RANK_RANGE.min,
			maxRank: RANK_RANGE.max,
			tip: tipText
		});

		return true;
	};

	/**
	 * Reads, modifies and writes tips data to localStorage
	 * @returns {boolean} True if successful, false otherwise
	 */
	const updateTipsInStorage = () => {
		try {
			const rawData = localStorage.getItem(STORAGE_KEY);
			if (!rawData) return false;

			const tipsData = JSON.parse(rawData);
			const modified = modifyTipsData(tipsData);

			if (modified) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(tipsData));
			}

			return true;
		} catch (error) {
			return false;
		}
	};

	/**
	 * Initializes monitoring for tips.data changes
	 */
	const initializeMonitoring = () => {
		let rafId = null;
		let lastValue = localStorage.getItem(STORAGE_KEY);
		let lastCheck = 0;

		/**
		 * Stops all active monitoring
		 */
		const stopMonitoring = () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		};

		/**
		 * RAF-based external change detection
		 * @param {DOMHighResTimeStamp} timestamp - Current timestamp
		 */
		const checkExternalChanges = (timestamp) => {
			if (timestamp - lastCheck >= CHECK_INTERVAL) {
				const current = localStorage.getItem(STORAGE_KEY);
				if (current !== lastValue) {
					lastValue = current;
					updateTipsInStorage();
				}
				lastCheck = timestamp;
			}
			rafId = requestAnimationFrame(checkExternalChanges);
		};

		// Initial check on page load
		updateTipsInStorage();

		// Start RAF monitoring for external changes
		rafId = requestAnimationFrame(checkExternalChanges);

		// Monitor for account login completion
		const accountObserver = new MutationObserver((mutations, observer) => {
			if (document.querySelector(ACCOUNT_SELECTOR)) {
				updateTipsInStorage();
				stopMonitoring();
				observer.disconnect();
			}
		});

		// Observe only if body exists, otherwise wait for DOMContentLoaded
		if (document.body) {
			accountObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
		}

		// Intercept localStorage.setItem for immediate detection
		const originalSetItem = localStorage.setItem;

		localStorage.setItem = function (key, value) {
			if (key === STORAGE_KEY) {
				try {
					const tipsData = JSON.parse(value);
					if (modifyTipsData(tipsData)) {
						value = JSON.stringify(tipsData);
					}
					lastValue = value;
				} catch (error) {
					// Silently handle errors
				}
			} return originalSetItem.call(this, key, value);
		};
	};

	// Initialize when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeMonitoring, { once: true });
	} else {
		initializeMonitoring();
	}
})();