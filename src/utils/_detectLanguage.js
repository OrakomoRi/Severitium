/**
 * Detects the user's language from URL params, localStorage, or browser settings.
 *
 * @return {string} Language code (e.g. 'en', 'ru')
 */
export function _detectLanguage() {
	const urlLang = new URLSearchParams(document.location.search).get('locale');
	if (urlLang) return urlLang.toLowerCase();

	const storedLang = localStorage.getItem('language_store_key');
	if (storedLang) return storedLang.toLowerCase();

	return navigator.language.split('-')[0].toLowerCase();
}
