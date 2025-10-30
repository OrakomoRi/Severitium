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

		// Check if tip already exists
		const exists = tipsData.data.some(tip => tip.tip === tipText);

		if (exists) {
			console.log('Custom tip already exists');
			return;
		}

		// Add new tip
		tipsData.data.push({
			minRank: 1,
			maxRank: 31,
			tip: tipText
		});

		localStorage.setItem('tips.data', JSON.stringify(tipsData));
		console.log('Custom tip added successfully');

	} catch (error) {
		console.error('Failed to add custom tip:', error);
	}
};

// Execute once
addCustomTip();