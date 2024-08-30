// ==UserScript==

// @name			Severitium
// @version			1.6.0-alpha
// @description		Custom theme for Tanki Online
// @author			OrakomoRi

// @icon			https://i.imgur.com/Srv1szX.png

// @match			https://*.tankionline.com/play/*

// @connect			raw.githubusercontent.com
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
// @grant			GM_xmlhttpRequest
// @grant			unsafeWindow
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
	*/
	
	const updateCheck = true;

	const customModal = {
		enable: true,
		timer: 5000,
	};

	const GITHUB_SCRIPT_URL = GM_info.script.updateURL;

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
						console.log(`You are using the latest version.`);
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

	const linksCSS = [
		'https://github.com/OrakomoRi/Severitium/blob/main/src/General/Modal/Modal.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/General/Dropdown/Dropdown.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/General/LoadingScreen/LoadingScreen.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/General/NotificatorIcon/NotificatorIcon.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/General/TopPanel/TopPanel.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceBackground/EntranceBackground.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceForms/EntranceForms.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceIcons/EntranceIcons.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceLinks/EntranceLinks.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Battle/BattleChat/BattleChat.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Battle/BattleTab/TabContainer/TabContainer.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/FooterMenu/FooterMenu.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/MainMenu/MainMenu.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/PlayButton/PlayButton.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/NewsWindow/NewsWindow.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/ChatWindow/ChatWindow.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/Challenges/CommonChallenges/CommonChallenges.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/Challenges/EliteChallenges/EliteChallenges.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/Announcements/Announcements.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/BattleSelect/BattleType/BattleType.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/BattleSelect/BattleMode/BattleMode.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/General/TopMenu/TopMenu.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Friends/FriendsScreen/FriendsScreen.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Friends/InviteScreen/InviteScreen.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/General/CommonContainer/CommonContainer.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/General/PlayerContextMenu/PlayerContextMenu.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Clan/ClanModal/ClanModal.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Clan/ExistingClan/ExistingClan.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Clan/JoinClan/JoinClan.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/General/XP/XP.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/MatchmakingWaitBlock/MatchmakingWaitBlock.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Battle/BattlePause/BattlePause.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/General/ScrollingCards/ScrollingCards.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Containers/PossibleRewardsScreen/PossibleRewardsScreen.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Containers/ContainersScreen/ContainersScreen.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Containers/ContainersOpening/ContainersOpening.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Quests/ContractsScreen/ContractsScreen.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Quests/QuestsScreen/QuestsScreen.min.css?raw=true',
	];

	// Function to inject CSS
	function injectCSS(url, attributes = []) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			onload: function(response) {
				// Create a <style> element
				var styleElement = document.createElement('style');
				// Set all the needed attributes
				for (const attribute of attributes) {
					styleElement.setAttribute(attribute.name, attribute.value);
				}
				// Set the CSS text to styles
				styleElement.textContent = response.responseText;
				// Apply styles to body end (to override initial styles)
				document.body.appendChild(styleElement);
			},
			onerror: function(error) {
				console.error('SEVERITIUM: Failed to load CSS file:', error);
			}
		});
	}

	injectCSS(variables, [{ name: 'data-module', value: 'SeveritiumVariables' }])

	for (const link of linksCSS) {
		injectCSS(link);
	}



	// Links to images as Base64
	const imageLinks = [
		{
			url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/.images/png/General/CommonContainer.png?raw=true',
			style: '.Common-container:not(.Common-entranceBackground){background-image:url(data:image/png;base64,SEVERITIUM_PLACEHOLDER)}'
		},
		{
			url: 'https://github.com/OrakomoRi/Severitium/blob/main/src/.images/png/Lobby/PlayButton.png?raw=true',
			style: '.MainScreenComponentStyle-playButtonContainer{background-image:url(data:image/png;base64,SEVERITIUM_PLACEHOLDER)}'
		},
		{
			url: `https://github.com/OrakomoRi/Severitium/blob/main/src/.images/png/Entrance/${_getSeason()}.png?raw=true`,
			style: '.Common-container.Common-entranceBackground, .Common-background.SystemMessageStyle-container, .Common-container:has(.Common-changingBackground){background-image:url(data:image/png;base64,SEVERITIUM_PLACEHOLDER)}'
		},
	];

	function applyStyles(base64data, styleTemplate) {
		const styledBackground = styleTemplate.replace('SEVERITIUM_PLACEHOLDER', base64data);
		
		var styleElement = document.createElement('style');
		styleElement.textContent = styledBackground;
		document.body.appendChild(styleElement);
	}

	function fetchImageAsBase64(url, styleTemplate) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			responseType: 'blob',
			onload: function(response) {
				if (response.status === 200) {
					const blob = response.response;
					const reader = new FileReader();
					
					reader.onloadend = function() {
						const base64data = reader.result.split(',')[1];
						applyStyles(base64data, styleTemplate);
					};
	
					reader.readAsDataURL(blob);
				} else {
					console.error('SEVERITIUM: Failed to load image from:', url);
				}
			},
			onerror: function(error) {
				console.error('SEVERITIUM: Failed to load PNG file:', error);
			}
		});
	}

	// Iterate over each image link and apply the corresponding style
	imageLinks.forEach(({ url, style }) => fetchImageAsBase64(url, style));
})();