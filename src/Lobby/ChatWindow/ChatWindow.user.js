// ==UserScript==

// @name			CSS Chat Window
// @version			1.2.5
// @description		Changes the default look of a chat window
// @author			OrakomoRi

// @icon			https://i.imgur.com/InNLwvb.png

// @match			https://*.tankionline.com/*

// @connect			raw.githubusercontent.com
// @connect			cdn.jsdelivr.net

// @require			https://github.com/OrakomoRi/Breezium/blob/main/modules/BreeziumSelect/js/BreeziumSelect.min.js?raw=true
// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/ChatWindow/ChatWindow.min.js?raw=true

// @run-at			document-start
// @grant			GM_xmlhttpRequest
// @grant			unsafeWindow

// ==/UserScript==

(function () {
	'use strict';

	// Link to raw CSS file
	const links = [
		'https://github.com/OrakomoRi/Breezium/blob/main/modules/BreeziumSelect/css/BreeziumSelect.min.css?raw=true',
		'https://github.com/OrakomoRi/Severitium/blob/main/src/Lobby/ChatWindow/ChatWindow.min.css?raw=true',
	];

	for (const link of links) {
		// Make an AJAX request to fetch the CSS file
		GM_xmlhttpRequest({
			method: 'GET',
			url: link,
			onload: function (response) {
				// Inject CSS into the page
				// Create a <style> element
				var styleElement = document.createElement('style');
				// Set the CSS text to styles
				styleElement.textContent = response.responseText;
				// Apply styles to body end (to override initial styles)
				document.body.appendChild(styleElement);
			},
			onerror: function (error) {
				console.error('Failed to load CSS file:', error);
			}
		});
	}
})();