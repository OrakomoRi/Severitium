// ==UserScript==

// @name			Severitium
// @namespace		TankiOnline
// @version			1.7.2+build41
// @description		Custom theme for Tanki Online
// @author			OrakomoRi

// @icon			https://github.com/OrakomoRi/Severitium/blob/main/images/icon.svg?raw=true

// @match			https://*.tankionline.com/play/*
// @include			https://*test*.tankionline.com/*

// @connect			raw.githubusercontent.com
// @connect			github.com
// @connect			cdn.jsdelivr.net

// @updateURL		https://github.com/OrakomoRi/Severitium/blob/main/release/severitium.user.js?raw=true
// @downloadURL		https://github.com/OrakomoRi/Severitium/blob/main/release/severitium.user.js?raw=true

// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/_Additional/_getSeason.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/_Additional/_extractFileName.min.js?raw=true

// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/_Additional/class/LoadingScreen.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/_Additional/class/Logger.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/_Additional/class/SeveritiumInjector.min.js?raw=true

// @run-at			document-start
// @grant			unsafeWindow
// @grant			GM_xmlhttpRequest
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_openInTab

// @require			https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require			https://cdn.jsdelivr.net/gh/OrakomoRi/CompareVersions@main/JS/compareversions.min.js
// @require			https://cdn.jsdelivr.net/gh/OrakomoRi/Breezium@latest/modules/BreeziumSelect/js/BreeziumSelect.min.js

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
		timer: 5000,
	};

	const GITHUB_SCRIPT_URL = GM_info.script.updateURL;
	const STABLE_JSON_URL = 'https://github.com/OrakomoRi/Severitium/blob/main/src/_preload/stable.json?raw=true';

	const script = {
		CSS: {},
		JS: {},
		images: {},
		version: GM_info.script.version,
		name: GM_info.script.name,
	}

	let imageLinks;

	const lastSeason = GM_getValue('SeveritiumSeason', '');
	const currentSeason = _getSeason();

	const severitiumInjector = new SeveritiumInjector(script);

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
			const stableData = await fetchJSON(STABLE_JSON_URL);

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
			style.textContent = '.swal2-container { z-index: 10000; } .swal2-container h1, .swal2-container h2, .swal2-container h3, .swal2-container h4, .swal2-container span, .swal2-container p { color: #000000; } ';
			document.head.appendChild(style);

			// Show SweetAlert2 modal for update prompt
			Swal.fire({
				position: 'top-end',
				backdrop: false,
				color: "#000000",
				background: "#ffffff",
				title: `${script.name}: new version is available!`,
				text: `Do you want to update to version ${newVersion}?`,
				icon: 'info',
				showCancelButton: true,
				showDenyButton: true,
				confirmButtonText: 'Update',
				denyButtonText: 'Skip',
				cancelButtonText: 'Close',
				timer: customModal.timer ?? 5000,
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
	 * Fetches a resource from a given URL, optionally as a Base64 string
	 *
	 * @param {string} url - The URL of the resource to fetch
	 * @param {boolean} [asBase64=false] - Whether to fetch the resource as Base64
	 * @returns {Promise<string>} - Resolves with the resource content (text or Base64)
	 */
	async function fetchResource(url, asBase64 = false) {
		const { fileName, fileType } = _extractFileName(url);
		const startTime = performance.now();
		logger.log(`[START] ${new Date().toISOString()}\n${fileName} ${fileType}`, 'debug');
	
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url,
				responseType: asBase64 ? 'blob' : 'text',
				onload: (response) => {
					if (response.status === 200) {
						const endTime = performance.now();
						const duration = ((endTime - startTime) / 1000).toFixed(3);
						logger.log(`[END] ${new Date().toISOString()} (Time: ${duration}s)\n${fileName} ${fileType}`, 'debug');
	
						if (asBase64) {
							// Convert blob to Base64 string for image embedding
							const reader = new FileReader();
							reader.onloadend = () => resolve(reader.result.split(',')[1]);
							reader.readAsDataURL(response.response);
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
	 * Fetches and parses JSON from a given URL
	 *
	 * @param {string} url - The URL to fetch JSON from
	 * @returns {Promise<Object>} - Resolves with the parsed JSON object
	 */
	function fetchJSON(url) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url: url,
				onload(response) {
					if (response.status !== 200) {
						// Reject if HTTP status is not OK
						reject(new Error(`${(script.name).toUpperCase()}: Failed to fetch: ${response.status}`));
						return;
					}
					try {
						// Attempt to parse JSON
						const jsonData = JSON.parse(response.responseText);
						if (typeof jsonData !== 'object' || jsonData === null) {
							throw new Error('Parsed JSON is not an object');
						}
						resolve(jsonData);
					} catch (error) {
						// Reject if JSON parsing fails
						reject(new Error(`Failed to parse JSON from ${url}: ${error.message}`));
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
			const loadEverything = forceReload || !isSameVersion;

			// Construct URLs for CSS and JS for the current version
			const RELEASE_CSS_URL = `https://github.com/OrakomoRi/Severitium/blob/builds/${script.version}/style.release.min.css?raw=true`;
			const RELEASE_JS_URL = `https://github.com/OrakomoRi/Severitium/blob/builds/${script.version}/script.release.min.js?raw=true`;
			logger.log(`Resolved CSS path: ${RELEASE_CSS_URL}`, 'debug');
			logger.log(`Resolved JS path: ${RELEASE_JS_URL}`, 'debug');

			logger.log(`Last season: ${lastSeason || 'null'}; current season: ${currentSeason}. Season changed: ${isSeasonChanged ? 'yes' : 'no'}`, 'debug');
			// Fetch image links for the current season
			imageLinks = await fetchJSON('https://github.com/OrakomoRi/Severitium/blob/main/src/_preload/ImageModules.json?raw=true').then(data => data || []);

			if (!loadEverything && !loadOnlyImages) {
				// Load all resources from cache if nothing changed
				logger.log(`Loading resources from cache.`, 'info');
				script.CSS = GM_getValue('SeveritiumCSS', {});
				script.JS = GM_getValue('SeveritiumJS', {});
				script.images = GM_getValue('SeveritiumImages', {});
			} else {
				logger.log(`Fetching ${loadOnlyImages ? 'only images' : 'all resources'}.`, 'info');

				let cssPromise = null;
				let jsPromise = null;

				if (!loadOnlyImages) {
					// Fetch CSS and JS if not just images
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
				const imagePromises = imageLinks.map(({ url }) => {
					const formattedUrl = url.replace('SEASON_PLACEHOLDER', _getSeason());
					return fetchResource(formattedUrl, true).then(img => {
						script.images[formattedUrl] = img;
						loadingScreen.updateProgress();
					});
				});

				// Wait for all resources to load
				const allPromises = [...imagePromises];
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
					// Save CSS and JS to cache
					GM_setValue('SeveritiumCSS', script.CSS);
					GM_setValue('SeveritiumJS', script.JS);
				} else {
					// If only images, reload CSS/JS from cache
					script.CSS = GM_getValue('SeveritiumCSS', {});
					script.JS = GM_getValue('SeveritiumJS', {});
				}
				// Save images, version, and season to cache
				GM_setValue('SeveritiumImages', script.images);
				GM_setValue('SeveritiumVersion', script.version);
				GM_setValue('SeveritiumSeason', currentSeason);

				logger.log(`Resources loaded.`, 'success');
			}
		} catch (error) {
			// Log any error during resource loading
			logger.log(`Error loading resources:\n${error}`, 'error');
		} finally {
			// Apply loaded resources to the page
			severitiumInjector.updateSeveritium(script);
			logger.log(`CSS found: ${script.CSS['main'] ? 'yes' : 'no'}.\nJS found: ${script.JS['main'] ? 'yes' : 'no'}.`, 'debug');
			if (script.CSS['main']) {
				logger.log(typeof script.CSS['main'], 'debug');
				severitiumInjector.applyCSS('main');
			}
			if (script.JS['main']) {
				logger.log(typeof script.JS['main'], 'debug');
				severitiumInjector.applyJS('main');
			}
			// Apply images to the page
			severitiumInjector.applyImages(imageLinks);
			// Remove loading screen
			LoadingScreen.remove(loadingScreen);
		}
	}

	/**
	 * Manually reloads all resources, bypassing cache
	 */
	async function reloadResources() {
		// Log manual reload
		logger.log(`Manually reloading resources.`, 'info');
		await loadResources(true);
	}

	unsafeWindow.reloadSeveritiumResources = reloadResources;

	(async () => {
		if (updateCheck) {
			checkForUpdates();
		}

		await loadResources(false);
	})();
})();