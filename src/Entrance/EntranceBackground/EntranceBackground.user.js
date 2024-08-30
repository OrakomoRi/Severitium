// ==UserScript==

// @name			CSS Entrance Background
// @version			2.0.4
// @description		Injects CSS code into the page
// @author			OrakomoRi

// @icon			https://i.imgur.com/InNLwvb.png

// @match			https://*.tankionline.com/*

// @connect			raw.githubusercontent.com
// @connect			i.imgur.com
// @connect			cdn.jsdelivr.net

// @require			https://github.com/OrakomoRi/Severitium/blob/main/src/_Additional/_getSeason.min.js?raw=true

// @run-at			document-start
// @grant			GM_xmlhttpRequest
// @grant			unsafeWindow

// ==/UserScript==

(function() {
	'use strict';

	// Link to raw CSS file
	const link = 'https://github.com/OrakomoRi/Severitium/blob/main/src/Entrance/EntranceBackground/EntranceBackground.min.css?raw=true';

	// Make an AJAX request to fetch the CSS file
	GM_xmlhttpRequest({
		method: 'GET',
		url: link,
		onload: function(response) {
			// Inject CSS into the page
			// Create a <style> element
			var styleElement = document.createElement('style');
			// Set the CSS text to styles
			styleElement.textContent = response.responseText;
			// Apply styles to body end (to override initial styles)
			document.body.appendChild(styleElement);
		},
		onerror: function(error) {
			console.error('Failed to load CSS file:', error);
		}
	});



	// Links to images as Base64
	const imageLinks = [
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