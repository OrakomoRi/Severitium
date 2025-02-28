// ==UserScript==

// @name			Severitium
// @namespace		TankiOnline
// @version			1.7.0+build3
// @description		Custom theme for Tanki Online
// @author			OrakomoRi

// @icon			https://i.imgur.com/Srv1szX.png

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

// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/General/LoadingScreen/LoadingScreen.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceForms/EntranceForms.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceIcons/EntranceIcons.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceLinks/EntranceLinks.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Battle/BattleTab/ColorfulResists/ColorfulResists.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/PlayButton/PlayButton.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/ChatWindow/ChatWindow.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/General/PlayerContextMenu/PlayerContextMenu.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/General/CommonSort/CommonSort.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Quests/QuestsScreen/QuestsScreen.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Containers/PossibleRewardsScreen/PossibleRewardsScreen.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Containers/PossibleRewardsMenu/PossibleRewardsMenu.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Shop/SectionMenu/SectionMenu.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/General/RangeInput/RangeInput.min.js?raw=true

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
	 * Catches all CSS, images based on main userscript's version
	 * @param {array} script.CSS - Array with CSS
	 * @param {array} script.images - Array with images
	 * @param {string} script.version - Version of the main userscript
	 * @param {string} script.name - Name of the main userscript
	 * 
	 * @param {array} imageLinks - Array of image links with attributes
	 * @param {array} CSSLinks - Array of css styles links with attributes
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
		images: {},
		version: GM_info.script.version,
		name: GM_info.script.name,
	}

	let imageLinks, CSSLinks;

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

				if (compareResult === 1) findLatestStableVersion(githubVersion);
			},
			onerror: function (error) {
				logger.log(`Failed to check for updates:\n${error}`, 'error');
			}
		});
	}

	/**
	 * Find the latest version
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
	async function findLatestStableVersion(githubVersion) {
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
				// promptUpdate(githubVersion, GITHUB_SCRIPT_URL); // Fallback to GitHub version
			}
		} catch (error) {
			logger.log(`${script.name.toUpperCase()}: Failed to fetch stable versions.\n${error}`, 'error');
		}
	}

	function promptUpdate(newVersion, downloadUrl) {
		const skippedVersion = GM_getValue('skippedVersion', '');
		if (skippedVersion === newVersion) return;

		if (customModal.enable) {
			const style = document.createElement('style');
			style.textContent = '.swal2-container { z-index: 10000; } .swal2-container h1, .swal2-container h2, .swal2-container h3, .swal2-container h4, .swal2-container span, .swal2-container p { color: #000000; } ';
			document.head.appendChild(style);

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
					modal.onmouseenter = Swal.stopTimer;
					modal.onmouseleave = Swal.resumeTimer;
				}
			}).then((result) => {
				if (result.isConfirmed) {
					GM_openInTab(downloadUrl, { active: true });
				} else if (result.isDenied) {
					GM_setValue('skippedVersion', newVersion);
				}
			});
		} else {
			if (confirm(`${script.name}: A new stable version is available. Update now?`)) {
				GM_openInTab(downloadUrl, { active: true });
			}
		}
	}

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
							const reader = new FileReader();
							reader.onloadend = () => resolve(reader.result.split(',')[1]);
							reader.readAsDataURL(response.response);
						} else {
							resolve(response.responseText);
						}
					} else {
						logger.log(`[ERROR] ${fileName} ${fileType}: Failed to fetch (${response.status})`, 'error');
						reject(new Error(`Failed to fetch resource from ${url}`));
					}
				},
				onerror: (error) => reject(error),
			});
		});
	}

	function fetchJSON(url) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url: url,
				onload(response) {
					if (response.status !== 200) {
						reject(new Error(`${(script.name).toUpperCase()}: Failed to fetch: ${response.status}`));
						return;
					}
					try {
						const jsonData = JSON.parse(response.responseText);
						if (typeof jsonData !== 'object' || jsonData === null) {
							throw new Error('Parsed JSON is not an object');
						}
						resolve(jsonData);
					} catch (error) {
						reject(new Error(`Failed to parse JSON from ${url}: ${error.message}`));
					}
				},
				onerror: (error) => reject(error),
			});
		});
	}

	async function loadResources(forceReload = false) {
		logger.log(`Load resources started.`, 'debug');
		const loadingScreen = LoadingScreen.add(`${script.name}`);

		try {
			const cachedVersion = GM_getValue('SeveritiumVersion', '');
			
			[CSSLinks, imageLinks] = await Promise.all([
				fetchJSON('https://github.com/OrakomoRi/Severitium/blob/main/src/_preload/CSSModules.json?raw=true').then(data => data || []),
				fetchJSON('https://github.com/OrakomoRi/Severitium/blob/main/src/_preload/ImageModules.json?raw=true').then(data => data || [])
			]);

			if (!forceReload && cachedVersion === script.version) {
				logger.log(`Loading resources from cache.`, 'info');
				script.CSS = GM_getValue('SeveritiumCSS', {});
				script.images = GM_getValue('SeveritiumImages', {});
			} else {
				logger.log(`Fetching new resources.`, 'info');

				loadingScreen.setTotalModules(CSSLinks.length + imageLinks.length);

				const cssPromises = CSSLinks.map(({ url }) =>
					fetchResource(url).then(css => {
						script.CSS[url] = css;
						loadingScreen.updateProgress();
					})
				);

				const imagePromises = imageLinks.map(({ url }) => {
					const formattedUrl = url.replace('SEASON_PLACEHOLDER', _getSeason());
					return fetchResource(formattedUrl, true).then(img => {
						script.images[formattedUrl] = img;
						loadingScreen.updateProgress();
					});
				});

				const results = await Promise.allSettled([...cssPromises, ...imagePromises]);

				results.forEach((result, index) => {
					if (result.status === 'rejected') {
						logger.log(`Error in resource #${index}:\n${result.reason}`, 'error');
					}
				});

				GM_setValue('SeveritiumCSS', script.CSS);
				GM_setValue('SeveritiumImages', script.images);
				GM_setValue('SeveritiumVersion', script.version);

				logger.log(`Resources loaded.`, 'success');
			}
		} catch (error) {
			logger.log(`Error loading resources:\n${error}`, 'error');
		} finally {
			severitiumInjector.updateSeveritium(script);
			severitiumInjector.applyCSS(CSSLinks);
			severitiumInjector.applyImages(imageLinks);
			LoadingScreen.remove(loadingScreen);
		}
	}

	async function reloadResources() {
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