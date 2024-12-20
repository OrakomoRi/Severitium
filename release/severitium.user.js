// ==UserScript==

// @name			Severitium
// @version			1.6.1+build2
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

// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/General/LoadingScreen/LoadingScreen.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceForms/EntranceForms.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceIcons/EntranceIcons.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceLinks/EntranceLinks.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Battle/BattleTab/ColorfulResists/ColorfulResists.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/PlayButton/PlayButton.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/ChatWindow/ChatWindow.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/General/PlayerContextMenu/PlayerContextMenu.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Quests/QuestsScreen/QuestsScreen.min.js?raw=true

// @run-at			document-start
// @grant			unsafeWindow
// @grant			GM_xmlhttpRequest
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_openInTab

// @require			https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require			https://cdn.jsdelivr.net/gh/OrakomoRi/CompareVersions@main/JS/compareversions.min.js

// ==/UserScript==

(function() {
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
			onload: function(response) {
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
			onerror: function(error) {
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



	const variables = 'https://github.com/OrakomoRi/Severitium/blob/main/src/Variables/Variables.min.css?raw=true';

	const CSSLinks = [
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/General/CommonContainer/CommonContainer.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceBackground/EntranceBackground.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceForms/EntranceForms.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceIcons/EntranceIcons.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceLinks/EntranceLinks.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/General/LoadingScreen/LoadingScreen.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/General/Modal/Modal.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/General/Dropdown/Dropdown.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/General/NotificatorIcon/NotificatorIcon.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/General/TopPanel/TopPanel.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Battle/BattleChat/BattleChat.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Battle/BattleTab/TabContainer/TabContainer.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/FooterMenu/FooterMenu.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/MainMenu/MainMenu.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/PlayButton/PlayButton.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/NewsWindow/NewsWindow.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/ChatWindow/ChatWindow.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/Challenges/CommonChallenges/CommonChallenges.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/Challenges/EliteChallenges/EliteChallenges.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/Announcements/Announcements.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/BattleSelect/BattleType/BattleType.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/BattleSelect/BattleMode/BattleMode.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/General/TopMenu/TopMenu.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Friends/FriendsScreen/FriendsScreen.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Friends/InviteScreen/InviteScreen.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/General/PlayerContextMenu/PlayerContextMenu.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Clan/ClanModal/ClanModal.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Clan/ExistingClan/ExistingClan.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Clan/JoinClan/JoinClan.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/General/XP/XP.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/MatchmakingWaitBlock/MatchmakingWaitBlock.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Battle/BattlePause/BattlePause.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/General/ScrollingCards/ScrollingCards.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Containers/PossibleRewardsScreen/PossibleRewardsScreen.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Containers/ContainersScreen/ContainersScreen.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Containers/ContainersOpening/ContainersOpening.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Quests/ContractsScreen/ContractsScreen.min.css?raw=true' },
		{ url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/Quests/QuestsScreen/QuestsScreen.min.css?raw=true' },
	];	

	// Links to images
	const imageLinks = [
		{
			url: `https://github.com/OrakomoRi/Severitium/blob/main/src/.images/webp/Entrance/${_getSeason()}.webp?raw=true`,
			style: '.Common-container.Common-container.Common-entranceBackground, .Common-background.Common-container.SystemMessageStyle-container, .Common-container.Common-container:has(.Common-changingBackground){background-image:url(data:image/webp;base64,SEVERITIUM_PLACEHOLDER)}'
		},
		{
			url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/.images/webp/General/CommonContainer.webp?raw=true',
			style: '.Common-container:not(.Common-entranceBackground){background-image:url(data:image/webp;base64,SEVERITIUM_PLACEHOLDER)}'
		},
		{
			url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/.images/webp/Lobby/PlayButton.webp?raw=true',
			style: '.MainScreenComponentStyle-playButtonContainer{background-image:url(data:image/webp;base64,SEVERITIUM_PLACEHOLDER)}'
		},
	];

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

	async function loadResources(forceReload = false) {
		const cachedVersion = GM_getValue('SeveritiumVersion', '');
		if (!forceReload && cachedVersion === Severitium.version) {
			console.log('SEVERITIUM: Loading resources from cache.');
			Severitium.CSS = GM_getValue('SeveritiumCSS', {});
			Severitium.images = GM_getValue('SeveritiumImages', {});
		} else {
			console.log('SEVERITIUM: Fetching new resources.');
			for (const { url } of [ { url: variables }, ...CSSLinks ]) {
				Severitium.CSS[url] = await fetchAsText(url);
			}
			for (const { url } of imageLinks) {
				Severitium.images[url] = await fetchImageAsBase64(url);
			}
			GM_setValue('SeveritiumCSS', Severitium.CSS);
			GM_setValue('SeveritiumImages', Severitium.images);
			GM_setValue('SeveritiumVersion', Severitium.version);
		}
		console.log('SEVERITIUM: Resources loaded.');
	}

	function injectCSS(url, attributes = []) {
		const style = document.createElement('style');
		style.textContent = Severitium.CSS[url];
		attributes.forEach(attr => style.setAttribute(attr.name, attr.value));
		document.body.appendChild(style);
		// console.log(`SEVERITIUM: Applied CSS from ${url}`);
	}

	function applyCSS() {
		injectCSS(variables, [{ name: 'data-module', value: 'SeveritiumVariables' }]);
		for (const { url } of CSSLinks) {
			injectCSS(url);
		}
	}

	function applyImages() {
		for (const { url, style } of imageLinks) {
			const processedStyle = style.replace('SEVERITIUM_PLACEHOLDER', Severitium.images[url]);
			const styleElement = document.createElement('style');
			styleElement.textContent = processedStyle;
			document.body.appendChild(styleElement);
			// console.log(`SEVERITIUM: Applied image from ${url}`);
		}
	}

	async function reloadResources() {
		console.log('SEVERITIUM: Manually reloading resources.');
		await loadResources(true);
		applyCSS();
		applyImages();
	}

	unsafeWindow.reloadSeveritiumResources = reloadResources;

	(async () => {
		const isCacheDisabled = navigator.onLine && (performance.navigation.type === performance.navigation.TYPE_RELOAD);
		await loadResources(isCacheDisabled);
		applyCSS();
		applyImages();
	})();
})();