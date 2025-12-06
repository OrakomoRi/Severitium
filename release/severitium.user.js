// ==UserScript==

// @name			Severitium
// @namespace		TankiOnline
// @version			1.8.3+build.4
// @description		Custom theme for Tanki Online
// @author			OrakomoRi

// @icon			https://i.imgur.com/8MoASmv.png

// @match			https://*.tankionline.com/play/*
// @include			https://*test*.tankionline.com/*

// @connect			orakomori.github.io
// @connect			raw.githubusercontent.com
// @connect			github.com
// @connect			cdn.jsdelivr.net
// @connect			severitium-builds.vercel.app

// @require			https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require			https://cdn.jsdelivr.net/gh/OrakomoRi/CompareVersions/JS/compareversions.min.js

// @require			https://orakomori.github.io/Severitium/src/_Additional/_getSeason.min.js
// @require			https://orakomori.github.io/Severitium/src/_Additional/_extractFileName.min.js

// @require			https://orakomori.github.io/Severitium/src/_Additional/class/LoadingScreen.min.js
// @require			https://orakomori.github.io/Severitium/src/_Additional/class/Logger.min.js
// @require			https://orakomori.github.io/Severitium/src/_Additional/class/SeveritiumInjector.min.js

// @run-at			document-start
// @grant			unsafeWindow
// @grant			GM_xmlhttpRequest
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_openInTab

// ==/UserScript==

(function () {
	'use strict';

	/**
	 * Configs
	 * 
	 * @param {boolean} updateCheck - Checks for userscript updates
	 * 
	 * @param {array} customModal - Enable custom modal
	 * Uses SweetAlert2 library (https://cdn.jsdelivr.net/npm/sweetalert2@11) for the modal
	 * @param {boolean} customModal.enable - When set to false, the default modal will be used
	 * @param {*} customModal.timer - Can be set (number | false): used to set the time
	 * the custom modal should wait for response untill it closes
	 * 
	 * @param {boolean} hasIgnoredUpdate - Used for the updater
	 * 
	 * @param {string} GITHUB_SCRIPT_URL - Link to the script to update
	 * @param {string} STABLE_JSON_URL - Link to the JSON with stable versions and their links
	 * 
	 * @param {array} script - Array with catched data
	 * Catches all CSS, JS, images based on main userscript's version
	 * @param {array} script.theme - Object with themes
	 * @param {array} script.CSS - Array with CSS
	 * @param {array} script.JS - Array with JS
	 * @param {array} script.images - Array with images
	 * @param {string} script.version - Version of the main userscript
	 * @param {string} script.name - Name of the main userscript
	 * 
	 * @param {array} imageLinks - Array of image links with attributes
	 * 
	 * @param {string} lastSeason - Remembered season name
	 * @param {string} currentSeason - Current season name
	 * 
	 * @type {SeveritiumInjector} - Instance of the style/image injector
	 * 
	 * @type {Logger} - Instance of the Logger class used for structured logging
	*/

	const updateCheck = true;

	const customModal = {
		enable: true,
		timer: 10000,
	};

	const script = {
		theme: {},
		CSS: {},
		JS: {},
		images: {},
		version: GM_info.script.version,
		name: GM_info.script.name,
	}

	let imageLinks;

	const GITHUB_SCRIPT_URL = `https://orakomori.github.io/Severitium/release/severitium.user.js?v=${script.version}`;
	const STABLE_JSON_URL = `https://severitium-builds.vercel.app/stable.json?v=${script.version}`;

	const lastSeason = GM_getValue('SeveritiumSeason', '');
	const currentSeason = _getSeason();

	const severitiumInjector = new SeveritiumInjector(script, currentSeason);

	const logger = new Logger(script.name);
	// logger.enableLogging();

	/**
	 * Function to check if the script is updated 
	 */
	function checkForUpdates() {
		GM_xmlhttpRequest({
			method: 'GET',
			url: GITHUB_SCRIPT_URL,
			onload: function (response) {
				if (response.status !== 200) {
					logger.log(`Failed to fetch GitHub script:\n${response.status}`, 'error');
					return;
				}

				// Script from GitHub
				const data = response.responseText;
				// Try to extract version from the script on GitHub
				const match = data.match(/@version\s+([\w.+-]+)/);
				if (!match) {
					logger.log(`========\nUnable to extract version from the GitHub script.\n========`);
					return;
				}

				// Version on GitHub
				const githubVersion = match[1];
				// Compare versions
				const compareResult = compareVersions(githubVersion, script.version);

				logger.logVersionComparison(compareResult, script.version, githubVersion);

				if (compareResult === 1) findLatestStableVersion();
			},
			onerror: function (error) {
				logger.log(`Failed to check for updates:\n${error}`, 'error');
			}
		});
	}

	/**
	 * Extract MAJOR.MINOR.PATCH from SemVer version
	 * @param {string} version - Full SemVer version
	 * @returns {string|null} - Base version (e.g., "1.8.2") or null if invalid
	 */
	function extractStableBase(version) {
		const match = version.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/);
		return match ? match[0] : null;
	}

	/**
	 * Find the latest version
	 * 
	 * @param {array} versions - Array of stable versions
	 * @returns {Object|null} - The object representing the latest version, or `null` if the array is empty or invalid
	 */
	function getLatestVersion(versions) {
		// Check if the input is a valid array with at least one element
		if (!Array.isArray(versions) || versions.length === 0) return null;

		// Use `reduce` to iterate through the array and determine the latest version
		return versions.reduce((latest, current) =>
			compareVersions(current.version, latest.version) > 0 ? current : latest
		);
	}

	/**
	 * Check for updates by parsing stable.json with multiple versions
	 */
	async function findLatestStableVersion() {
		try {
			// Fetch the stable.json file containing all available stable versions
			const stableData = await fetchResource(STABLE_JSON_URL, 'json');

			// Determine the latest stable version from the list of versions in stable.json (should return the most recent one)
			const latestVersionData = getLatestVersion(stableData.versions);

			// Destructure version and link from the latest version data, if available
			const { version: latestVersion, link: latestLink } = latestVersionData || {};

			// Compare the latest stable version with the current script version
			if (latestVersionData && compareVersions(latestVersion, script.version) === 1) {
				promptUpdate(latestVersion, latestLink); // Prompt update if a newer stable version is found
			} else {
				logger.log(`${script.name.toUpperCase()}: No valid stable versions found.`, 'warn');
			}
		} catch (error) {
			logger.log(`${script.name.toUpperCase()}: Failed to fetch stable versions.\n${error}`, 'error');
		}
	}

	/**
	 * Prompts the user to update to a new version using a modal or confirm dialog
	 *
	 * @param {string} newVersion - The new version available for update
	 * @param {string} downloadUrl - The URL to download the new version
	 */
	function promptUpdate(newVersion, downloadUrl) {
		const skippedVersion = GM_getValue('skippedVersion', '');
		if (skippedVersion === newVersion) return;

		if (customModal.enable) {
			// Inject custom styles for the modal to ensure visibility and readability
			const style = document.createElement('style');
			style.textContent = '.swal2-container { z-index: 10000; }';
			document.head.appendChild(style);

			// Show SweetAlert2 modal for update prompt
			Swal.fire({
				position: 'top-end',
				backdrop: false,
				theme: 'dark',
				title: `${script.name}: new version is available!`,
				text: `Do you want to update to version ${newVersion}?`,
				icon: 'info',
				showCancelButton: true,
				showDenyButton: true,
				confirmButtonText: 'Update',
				denyButtonText: 'Skip',
				cancelButtonText: 'Close',
				timer: customModal.timer ?? 10000,
				timerProgressBar: true,
				didOpen: (modal) => {
					// Pause timer on mouse hover for better UX
					modal.onmouseenter = Swal.stopTimer;
					modal.onmouseleave = Swal.resumeTimer;
				}
			}).then((result) => {
				if (result.isConfirmed) {
					// Open the update link in a new tab if user confirms
					GM_openInTab(downloadUrl, { active: true });
				} else if (result.isDenied) {
					// Remember skipped version to avoid prompting again
					GM_setValue('skippedVersion', newVersion);
				}
			});
		} else {
			// Fallback to browser confirm dialog if custom modal is disabled
			if (confirm(`${script.name}: A new stable version is available. Update now?`)) {
				GM_openInTab(downloadUrl, { active: true });
			}
		}
	}

	/**
	 * Fetches a resource from a given URL with various return formats
	 *
	 * @param {string} url - The URL of the resource to fetch
	 * @param {'text'|'base64'|'json'} [format='text'] - The format to return the resource in
	 * @returns {Promise<string|Object>} - Resolves with the resource content in the specified format
	 */
	async function fetchResource(url, format = 'text') {
		const { fileName, fileType } = _extractFileName(url);
		const startTime = performance.now();
		logger.log(`[START] ${new Date().toISOString()}\n${fileName} ${fileType}`, 'debug');
		logger.log(`Fetching resource from ${url}`, 'debug');

		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url,
				responseType: format === 'base64' ? 'blob' : 'text',
				onload: (response) => {
					if (response.status === 200) {
						const endTime = performance.now();
						const duration = ((endTime - startTime) / 1000).toFixed(3);
						logger.log(`[END] ${new Date().toISOString()} (Time: ${duration}s)\n${fileName} ${fileType}`, 'debug');

						if (format === 'base64') {
							// Convert blob to Base64 string for image embedding
							if (!response.response || response.response.size === 0) {
								logger.log(`[ERROR] ${fileName} ${fileType}: Empty blob response`, 'error');
								reject(new Error(`Empty blob response from ${url}`));
								return;
							}

							const reader = new FileReader();
							reader.onloadend = () => resolve(reader.result.split(',')[1]);
							reader.readAsDataURL(response.response);
						} else if (format === 'json') {
							// Parse JSON and validate
							try {
								const jsonData = JSON.parse(response.responseText);
								if (typeof jsonData !== 'object' || jsonData === null) {
									throw new Error('Parsed JSON is not an object');
								}
								resolve(jsonData);
							} catch (error) {
								logger.log(`[ERROR] ${fileName} ${fileType}: Failed to parse JSON - ${error.message}`, 'error');
								reject(new Error(`Failed to parse JSON from ${url}: ${error.message}`));
							}
						} else {
							// Return plain text for CSS/JS
							resolve(response.responseText);
						}
					} else {
						// Log and reject on HTTP error
						logger.log(`[ERROR] ${fileName} ${fileType}: Failed to fetch (${response.status})`, 'error');
						reject(new Error(`Failed to fetch resource from ${url}`));
					}
				},
				onerror: (error) => reject(error),
			});
		});
	}

	/**
	 * Loads all required resources (CSS, JS, images) and caches them if needed
	 *
	 * @param {boolean} [forceReload=false] - Whether to force reload all resources
	 */
	async function loadResources(forceReload = false) {
		logger.log(`Load resources started.`, 'debug');

		// Show loading screen
		const loadingScreen = LoadingScreen.add(`${script.name}`);

		try {
			// Get cached version and check if season or version changed
			const cachedVersion = GM_getValue('SeveritiumVersion', '');
			const isSeasonChanged = lastSeason !== currentSeason;
			const isSameVersion = cachedVersion === script.version;
			// If only season changed, only images need to be reloaded
			const loadOnlyImages = isSameVersion && isSeasonChanged;
			// If version changed or force reload, reload everything
			const loadEverything = forceReload || !isSameVersion

			// Extract stable base version
			const STABLE_BASE = extractStableBase(script.version);

			// Construct URLs for CSS and JS for the current version using jsDelivr CDN
			const RELEASE_VARIABLES_URL = `https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/versions/${STABLE_BASE}/${script.version}/variables.json`;
			const RELEASE_CSS_URL = `https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/versions/${STABLE_BASE}/${script.version}/style.release.min.css`;
			const RELEASE_JS_URL = `https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/versions/${STABLE_BASE}/${script.version}/script.release.min.js`;

			logger.log(`Stable base: ${STABLE_BASE}`, 'debug');
			logger.log(`Resolved CSS path: ${RELEASE_CSS_URL}`, 'debug');
			logger.log(`Resolved JS path: ${RELEASE_JS_URL}`, 'debug');
			logger.log(`Resolved Variables path: ${RELEASE_VARIABLES_URL}`, 'debug');

			logger.log(`Last season: ${lastSeason || 'null'}; current season: ${currentSeason}. Season changed: ${isSeasonChanged ? 'yes' : 'no'}`, 'debug');
			// Fetch image links for the current season
			imageLinks = await fetchResource(`https://orakomori.github.io/Severitium/src/_preload/ImageModules.json?v=${script.version}`, 'json').then(data => {
				logger.log(`Loaded ${data ? data.length : 0} image links from ImageModules.json`, 'info');
				if (data && data.length > 0) {
					data.forEach((item, index) => {
						logger.log(`Image ${index + 1}: ${item.url}`, 'debug');
					});
				}
				return data || [];
			});

			if (!loadEverything && !loadOnlyImages) {
				// Load all resources from cache if nothing changed
				logger.log(`Loading resources from cache.`, 'info');
				script.theme = GM_getValue('SeveritiumThemes', { active: 'default', themes: {} });
				script.CSS = GM_getValue('SeveritiumCSS', {});
				script.JS = GM_getValue('SeveritiumJS', {});
				script.images = GM_getValue('SeveritiumImages', {});
			} else {
				logger.log(`Fetching ${loadOnlyImages ? 'only images' : 'all resources'}.`, 'info');

				// Get cached themes
				script.theme = GM_getValue('SeveritiumThemes', { active: 'default', themes: {} });

				let jsonPromise = null;
				let cssPromise = null;
				let jsPromise = null;

				if (!loadOnlyImages) {
					// Fetch Default theme, CSS and JS if not just images
					jsonPromise = fetchResource(RELEASE_VARIABLES_URL, 'json').then(json => {
						// Ensure themes structure exists
						if (!script.theme.themes) {
							script.theme.themes = {};
						}
						if (json.variables && json.timestamp && typeof json.variables === 'object') {
							// Ensure default theme object exists
							if (!script.theme.themes.default) {
								script.theme.themes.default = {};
							}
							script.theme.themes.default.id = 'default';
							script.theme.themes.default.name = 'Default';
							script.theme.themes.default.timestamp = json.timestamp;
							script.theme.themes.default.variables = json.variables;
						}
						loadingScreen.updateProgress();
					});

					cssPromise = fetchResource(RELEASE_CSS_URL).then(css => {
						script.CSS['main'] = css;
						loadingScreen.updateProgress();
					});

					jsPromise = fetchResource(RELEASE_JS_URL).then(js => {
						script.JS['main'] = js;
						loadingScreen.updateProgress();
					});
				}

				// Fetch all images (as Base64)
				const imagePromises = imageLinks.map(({ url }, index) => {
					const formattedUrl = url
						.replace('SEASON_PLACEHOLDER', currentSeason)
						+ `?v=${script.version}`;
					logger.log(`Attempting to load image ${index + 1}/${imageLinks.length}: ${formattedUrl}`, 'info');
					return fetchResource(formattedUrl, 'base64').then(img => {
						script.images[formattedUrl] = img;
						loadingScreen.updateProgress();
					});
				});

				// Wait for all resources to load
				const allPromises = [...imagePromises];
				if (jsonPromise) allPromises.push(jsonPromise);
				if (cssPromise) allPromises.push(cssPromise);
				if (jsPromise) allPromises.push(jsPromise);

				loadingScreen.setTotalModules(allPromises.length);
				const results = await Promise.allSettled(allPromises);

				// Log any failed resource loads
				results.forEach((result, index) => {
					if (result.status === 'rejected') {
						logger.log(`Error in resource #${index}:\n${result.reason}`, 'error');
					}
				});

				if (!loadOnlyImages) {
					// Update custom themes with new default variables
					if (script.theme.themes?.default) {
						updateCustomThemesWithNewVariables();
					}

					GM_setValue('SeveritiumThemes', script.theme);
					GM_setValue('SeveritiumCSS', script.CSS);
					GM_setValue('SeveritiumJS', script.JS);
				} else {
					// If only images, reload CSS/JS from cache
					script.theme = GM_getValue('SeveritiumThemes', { active: 'default', themes: {} });
					script.CSS = GM_getValue('SeveritiumCSS', {});
					script.JS = GM_getValue('SeveritiumJS', {});
				}

				// Save images, version, and season to cache
				GM_setValue('SeveritiumImages', script.images);
				GM_setValue('SeveritiumVersion', script.version);
				GM_setValue('SeveritiumSeason', currentSeason);
				
				logger.log(`All resources cached successfully.`, 'success');

				logger.log(`Resources loaded.`, 'success');
			}
		} catch (error) {
			// Log any error during resource loading
			logger.log(`Error loading resources:\n${error}`, 'error');
		} finally {
			// Apply loaded resources to the page
			severitiumInjector.updateSeveritium(script);
			logger.log(`Theme found: ${script.theme ? 'yes' : 'no'}.\nCSS found: ${script.CSS['main'] ? 'yes' : 'no'}.\nJS found: ${script.JS['main'] ? 'yes' : 'no'}.`, 'info');
			if (script.CSS['main']) {
				logger.log(`Type of CSS['main']: ${typeof script.CSS['main']}`, 'debug');
				severitiumInjector.applyCSS('main');
			}
			if (script.theme) {
				// Apply active theme
				const activeVariables = getActiveThemeVariables();
				if (activeVariables) {
					severitiumInjector.applyTheme();
				}

				// Update localStorage for external access
				if (script.theme.themes?.default) {
					localStorage.setItem('SeveritiumThemes', JSON.stringify(script.theme, null, 2));
				}
			}
			if (script.JS['main']) {
				logger.log(`Type of JS['main']: ${typeof script.JS['main']}`, 'debug');
				severitiumInjector.applyJS('main');
			}
			// Apply images to the page
			if (imageLinks && imageLinks.length > 0) {
				// Prepare image links with proper URLs and check if data exists
				const preparedImageLinks = imageLinks.map(element => {
					const formattedUrl = element.url
						.replace('SEASON_PLACEHOLDER', currentSeason)
						+ `?v=${script.version}`;

					// Check if we have valid image data for this URL
					const imageData = script.images[formattedUrl];
					const hasValidData = imageData && imageData !== 'undefined' && typeof imageData === 'string' && imageData.length > 0;

					if (!hasValidData) {
						logger.log(`Missing or invalid image data for: ${formattedUrl}`, 'warn');
					}

					return {
						...element,
						url: formattedUrl,
						hasValidData: hasValidData
					};
				});

				// Filter out images without valid data
				const validImageLinks = preparedImageLinks.filter(element => element.hasValidData);

				logger.log(`Applying ${validImageLinks.length} valid images out of ${imageLinks.length} total`, 'info');
				if (validImageLinks.length > 0) {
					severitiumInjector.applyImages(validImageLinks);
				} else {
					logger.log('No valid image data found, skipping image application', 'warn');
				}
			} else {
				logger.log('No image links to apply.', 'warn');
			}
			// Remove loading screen
			LoadingScreen.remove(loadingScreen);
		}
	}

	/**
	 * Manually reloads all resources, bypassing cache
	 */
	async function reloadResources() {
		logger.log(`Manually reloading resources.`, 'info');
		await loadResources(true);
	}

	/**
	 * Update custom themes with new variables from default theme
	 */
	function updateCustomThemesWithNewVariables() {
		const defaultTheme = script.theme.themes.default;
		if (!defaultTheme) return;

		// Get existing themes from storage, but preserve current script.theme structure
		const existingThemes = GM_getValue('SeveritiumThemes', { active: 'default', themes: {} });

		// Merge existing themes with current script.theme to preserve new default
		if (!existingThemes.themes) {
			existingThemes.themes = {};
		}

		// Keep the new default theme from script.theme
		existingThemes.themes.default = defaultTheme;

		// Set active theme properly
		if (!existingThemes.active) {
			existingThemes.active = 'default';
		}

		// Add missing variables to custom themes only
		Object.keys(existingThemes.themes).forEach(uuid => {
			if (uuid !== 'default') {
				Object.keys(defaultTheme.variables).forEach(varName => {
					if (!(varName in existingThemes.themes[uuid].variables)) {
						existingThemes.themes[uuid].variables[varName] = defaultTheme.variables[varName];
					}
				});
			}
		});

		// Update script.theme with merged data
		script.theme = existingThemes;
	}

	/**
	 * Get active theme variables
	 */
	function getActiveThemeVariables() {
		// Use current script.theme instead of reading from storage
		const activeTheme = script.theme.active || 'default';
		return script.theme.themes?.[activeTheme].variables || script.theme.themes?.default.variables || null;
	}

	// Expose minimal API
	unsafeWindow.Severitium = {
		reloadResources: reloadResources
	};

	// Custom event listeners

	window.addEventListener('theme:savethemes', () => {
		const data = localStorage.getItem('SeveritiumThemes');
		if (!data) return null;
		const themesData = JSON.parse(data);
		logger.log(`Themes updated. Total themes: ${Object.keys(themesData.themes).length}, Active: ${themesData.active}`, 'info');
		GM_setValue('SeveritiumThemes', themesData);
	});

	(async () => {
		if (updateCheck) {
			checkForUpdates();
		}

		await loadResources(false);
	})();
})();