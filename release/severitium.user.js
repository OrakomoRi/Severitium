// ==UserScript==

// @name			Severitium
// @namespace       TankiOnline
// @version			1.6.1+build35
// @description		Custom theme for Tanki Online
// @author			OrakomoRi

// @icon			https://i.imgur.com/Srv1szX.png

// @match			https://*.tankionline.com/play/*

// @connect			raw.githubusercontent.com
// @connect			github.com
// @connect			cdn.jsdelivr.net

// @updateURL		https://github.com/OrakomoRi/Severitium/blob/main/release/severitium.user.js?raw=true
// @downloadURL		https://github.com/OrakomoRi/Severitium/blob/main/release/severitium.user.js?raw=true

// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/_Additional/_getSeason.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/_Additional/_loadingScreen.min.js?raw=true

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

// @run-at			document-start
// @grant			unsafeWindow
// @grant			GM_xmlhttpRequest
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_openInTab

// @require			https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require			https://cdn.jsdelivr.net/gh/OrakomoRi/CompareVersions@main/JS/compareversions.min.js

// ==/UserScript==

(function () {
	'use strict';

	/**
	 * Configs
	 * 
	 * @param {Boolean} updateCheck - Checks for userscript updates
	 * 
	 * @param {Array} customModal - Enable custom modal
	 * Uses SweetAlert2 library (https://cdn.jsdelivr.net/npm/sweetalert2@11) for the modal
	 * @param {Boolean} customModal.enable - When set to false, the default modal will be used
	 * @param {*} customModal.timer - Can be set (number | false): used to set the time
	 * the custom modal should wait for response untill it closes
	 * 
	 * @param {Boolean} hasIgnoredUpdate - Used for the updater
	 * 
	 * @param {String} GITHUB_SCRIPT_URL - Link to the script to update
	 * 
	 * @param {Array} Severitium - Array with catched data
	 * Catches all CSS, images based on main userscript's version
	 * @param {Array} Severitium.CSS - array with CSS
	 * @param {Array} Severitium.images - array with images
	 * @param {String} Severitium.images - version of the main userscript
	*/

	const updateCheck = true;

	const customModal = {
		enable: true,
		timer: 5000,
	};

	const GITHUB_SCRIPT_URL = GM_info.script.updateURL;

	const Severitium = {
		CSS: {},
		images: {},
		version: GM_info.script.version,
	}

	/**
	 * Function to check if the script is updated 
	*/
	function checkForUpdates() {
		GM_xmlhttpRequest({
			method: 'GET',
			url: GITHUB_SCRIPT_URL,
			onload: function (response) {
				// Script from GitHub
				const data = response.responseText;

				// Try to extract version from the script on GitHub
				const match = data.match(/@version\s+([\w.-]+)/);
				if (!match) {
					console.log(`========\n${GM_info.script.name}\nUnable to extract version from the GitHub script.\n========`);
					return;
				}

				// Version on GitHub
				const githubVersion = match[1];
				// Current version
				const currentVersion = GM_info.script.version;

				// Compare versions
				const compareResult = compareVersions(githubVersion, currentVersion);

				console.log(`========\n`);
				console.log(`${GM_info.script.name}\n`);

				switch (compareResult) {
					case 1:
						console.log(`A new version is available. Please update your script.\n`);
						promptUpdate(githubVersion);
						break;
					case 0:
						console.log(/[-+]/.test(githubVersion + currentVersion)
							? `You are using some version that is based on the latest stable.`
							: `You are using the latest stable version.`);
						break;
					case -1:
						console.log(`You are using a version newer than the one on GitHub.`);
						break;
					case -2:
						console.log(`Error comparing versions.`);
						break;
				}

				console.log(`Your × GitHub:\n${currentVersion} × ${githubVersion}`);
				console.log(`\n========`);
			},
			onerror: function (error) {
				console.error('Failed to check for updates:', error);
			}
		});
	}

	function promptUpdate(newVersion) {
		const skippedVersion = GM_getValue('skippedVersion', '');
		if (skippedVersion === newVersion) return;

		if (customModal.enable) {
			const style = document.createElement('style');
			style.textContent = '.swal2-container { z-index: 8888; } .swal2-container h1, .swal2-container h2, .swal2-container h3, .swal2-container h4, .swal2-container span, .swal2-container p { color: #000000; } ';
			document.head.appendChild(style);

			Swal.fire({
				position: 'top-end',
				backdrop: false,
				color: "#000000",
				background: "#ffffff",
				title: `${GM_info.script.name}: new version is available!`,
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
					GM_openInTab(GITHUB_SCRIPT_URL, { active: true });
				} else if (result.isDenied) {
					GM_setValue('skippedVersion', newVersion);
				}
			});
		} else {
			var result = window.confirm(`${GM_info.script.name}: A new version is available. Please update your script.`);

			if (result) {
				GM_openInTab(GITHUB_SCRIPT_URL, { active: true });
			}
		}
	}

	if (updateCheck) { checkForUpdates(); }



	let imageLinks, CSSLinks;
	const severitiumInjector = new SeveritiumInjector(Severitium);

	async function fetchAsText(url) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url,
				onload: (response) => {
					if (response.status === 200) {
						resolve(response.responseText);
					} else {
						reject(new Error(`Failed to fetch resource from ${url}`));
					}
				},
				onerror: (error) => reject(error),
			});
		});
	}

	async function fetchImageAsBase64(url) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url,
				responseType: 'blob',
				onload: (response) => {
					if (response.status === 200) {
						const reader = new FileReader();
						reader.onloadend = () => resolve(reader.result.split(',')[1]);
						reader.readAsDataURL(response.response);
					} else {
						console.error(`SEVERITIUM: Failed to fetch image from ${url}, status: ${response.status}`);
						reject(new Error(`Failed to fetch image from ${url}`));
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
					try {
						const data = JSON.parse(response.responseText);
						resolve(data);
					} catch (error) {
						reject(`Failed to parse JSON from ${url}: ${error}`);
					}
				},
				onerror(error) {
					reject(`Failed to fetch ${url}: ${error}`);
				}
			});
		});
	}

	async function loadResources(forceReload = false) {
		_createSeveritiumLoadingScreen(GM_info.script.name);
		try {
			
			const cachedVersion = GM_getValue('SeveritiumVersion', '');

			[CSSLinks, imageLinks] = await Promise.all([
				fetchJSON('https://github.com/OrakomoRi/Severitium/blob/main/src/_preload/CSSModules.json?raw=true').then(data => data || []),
				fetchJSON('https://github.com/OrakomoRi/Severitium/blob/main/src/_preload/ImageModules.json?raw=true').then(data => data || [])
			]);

			if (!forceReload && cachedVersion === Severitium.version) {
				console.log('SEVERITIUM: Loading resources from cache.');
				Severitium.CSS = GM_getValue('SeveritiumCSS', {});
				Severitium.images = GM_getValue('SeveritiumImages', {});
			} else {
				console.log('SEVERITIUM: Fetching new resources.');

				let promises = [];

				for (const { url } of CSSLinks) {
					promises.push(
						fetchAsText(url).then(css => {
							Severitium.CSS[url] = css;
						})
					);
				}
	
				for (const { url } of imageLinks) {
					const formattedUrl = url.replace('SEASON_PLACEHOLDER', _getSeason());
					promises.push(
						fetchImageAsBase64(formattedUrl).then(image => {
							Severitium.images[formattedUrl] = image;
						})
					);
				}
	
				await Promise.all(promises);

				GM_setValue('SeveritiumCSS', Severitium.CSS);
				GM_setValue('SeveritiumImages', Severitium.images);
				GM_setValue('SeveritiumVersion', Severitium.version);
			}
			console.log('SEVERITIUM: Resources loaded.');
		} catch (error) {
			console.error('SEVERITIUM: Error loading resources:', error);
		} finally {
			severitiumInjector.updateSeveritium(Severitium);
			severitiumInjector.applyCSS(CSSLinks);
			severitiumInjector.applyImages(imageLinks);
			_removeSeveritiumLoadingScreen();
		}
	}

	async function reloadResources() {
		console.log('SEVERITIUM: Manually reloading resources.');
		await loadResources(true);
	}

	unsafeWindow.reloadSeveritiumResources = reloadResources;

	(async () => {
		await loadResources(false);
	})();
})();