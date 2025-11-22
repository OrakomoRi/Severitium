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

/**
 * Detects the language from URL params, localStorage or browser settings
 * 
 * @returns {string} ISO-639-1 language code
 */
const detectLanguage = () => {
	const urlLang = new URLSearchParams(document.location.search).get('locale');
	if (urlLang) return urlLang.toLowerCase();

	const storedLang = localStorage.getItem('language_store_key');
	if (storedLang) return storedLang.toLowerCase();

	return navigator.language.split('-')[0].toLowerCase();
};

/**
 * Adds custom Severitium tip to tips.data in localStorage if it doesn't exist
 * and removes custom tips in other languages
 * 
 * @returns {void}
 */
const addCustomTip = () => {
	const lang = detectLanguage();
	const tipText = CUSTOM_TIPS[lang] || CUSTOM_TIPS.en;

	try {
		const rawData = localStorage.getItem('tips.data');

		if (!rawData) {
			console.warn('tips.data not found in localStorage');
			return;
		}

		const tipsData = JSON.parse(rawData);

		// Get all custom tip texts (for all languages)
		const allCustomTips = Object.values(CUSTOM_TIPS);

		// Remove all custom tips except the current language
		tipsData.data = tipsData.data.filter(tip => {
			// Keep original game tips
			if (!allCustomTips.includes(tip.tip)) {
				return true;
			}
			// Keep only current language custom tip
			return tip.tip === tipText;
		});

		// Check if current language tip exists
		const exists = tipsData.data.some(tip => tip.tip === tipText);

		if (!exists) {
			// Add new tip
			tipsData.data.push({
				minRank: 1,
				maxRank: 31,
				tip: tipText
			});
		}

		localStorage.setItem('tips.data', JSON.stringify(tipsData));

	} catch (error) {
		console.error('Failed to add custom tip:', error);
	}
};

/**
 * Monitors localStorage for changes to tips.data and re-adds custom tip if needed
 * 
 * @returns {void}
 */
const monitorTipsData = () => {
	let lastTipsCount = 0;
	
	// Monitor direct localStorage changes using proxy
	const originalSetItem = localStorage.setItem;
	
	localStorage.setItem = function(key, value) {
		const result = originalSetItem.apply(this, arguments);
		
		if (key === 'tips.data') {
			try {
				const tipsData = JSON.parse(value);
				const currentCount = tipsData?.data?.length || 0;
				
				// Game reloaded tips if count changed significantly or is non-zero
				if (currentCount > 0 && currentCount !== lastTipsCount) {
					lastTipsCount = currentCount;
					
					// Add custom tip after game finishes loading tips
					// Use double rAF to ensure game's code fully completes
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							addCustomTip();
						});
					});
				}
			} catch (e) {
				// Ignore parse errors
			}
		}
		
		return result;
	};
	
	// Also intercept getItem to ensure our tip is always included when game reads
	const originalGetItem = localStorage.getItem;
	
	localStorage.getItem = function(key) {
		const result = originalGetItem.apply(this, arguments);
		
		if (key === 'tips.data' && result) {
			try {
				const tipsData = JSON.parse(result);
				const lang = detectLanguage();
				const tipText = CUSTOM_TIPS[lang] || CUSTOM_TIPS.en;
				
				// Check if custom tip exists
				const exists = tipsData.data?.some(tip => tip.tip === tipText);
				
				// If not, add it silently and return modified data
				if (!exists && tipsData.data) {
					const allCustomTips = Object.values(CUSTOM_TIPS);
					
					// Remove old language tips
					tipsData.data = tipsData.data.filter(tip => !allCustomTips.includes(tip.tip));
					
					// Add current language tip
					tipsData.data.push({
						minRank: 1,
						maxRank: 31,
						tip: tipText
					});
					
					return JSON.stringify(tipsData);
				}
			} catch (e) {
				// If parsing fails, return original
			}
		}
		
		return result;
	};
};

// Start monitoring
monitorTipsData();