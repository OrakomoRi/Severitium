// ==UserScript==

// @name			Severitium
// @namespace		TankiOnline
// @version			1.8.3+build.63
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

// @run-at			document-start
// @grant			unsafeWindow
// @grant			GM_xmlhttpRequest
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_openInTab

// ==/UserScript==

(function () {
	'use strict';

	const LOG = false;

	function addBlackScreen(){const e=document.createElement("div");e.style.position="absolute",e.style.top="0",e.style.left="0",e.style.width="100vw",e.style.height="100vh",e.style.backgroundColor="black",e.style.zIndex="999999",e.style.pointerEvents="none",e.style.overflow="hidden",e.className="severitium-black-screen",e.setAttribute("data-severitium","black-screen"),document.body.appendChild(e)}function removeBlackScreen(){const e=document.querySelector('.severitium-black-screen[data-severitium="black-screen"]');e&&e.remove()}document.body?addBlackScreen():document.addEventListener("DOMContentLoaded",(()=>{addBlackScreen()}));

	window.addEventListener('severitium:fetch', (event) => {
		const { id, url, format } = event.detail;

		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			responseType: format === 'base64' ? 'blob' : 'text',
			onload: (response) => {
				let data;

				try {
					if (format === 'json') {
						data = JSON.parse(response.responseText);
					} else if (format === 'base64') {
						const reader = new FileReader();
						reader.onloadend = () => {
							data = reader.result.split(',')[1];
							window.dispatchEvent(new CustomEvent('severitium:fetch:response', {
								detail: { id, data }
							}));
						};
						reader.readAsDataURL(response.response);
						return;
					} else {
						data = response.responseText;
					}

					window.dispatchEvent(new CustomEvent('severitium:fetch:response', {
						detail: { id, data }
					}));
				} catch (error) {
					window.dispatchEvent(new CustomEvent('severitium:fetch:response', {
						detail: { id, error: error.message }
					}));
				}
			},
			onerror: (error) => {
				window.dispatchEvent(new CustomEvent('severitium:fetch:response', {
					detail: { id, error: error.message || 'Network error' }
				}));
			}
		});
	});

	window.addEventListener('severitium:store:get', (event) => {
		const { id, key, default: defaultValue } = event.detail;
		const value = GM_getValue(key, defaultValue);

		window.dispatchEvent(new CustomEvent('severitium:store:response', {
			detail: { id, value }
		}));
	});

	window.addEventListener('severitium:store:set', (event) => {
		const { key, value } = event.detail;
		GM_setValue(key, value);
	});

	window.addEventListener('severitium:open-tab', (event) => {
		const { url } = event.detail;
		GM_openInTab(url, { active: true });
	});

	window.addEventListener('severitium:update', (event) => {
		const { hash } = event.detail;
		const updateUrl = `https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@${hash}/release/severitium.user.js`;
		GM_openInTab(updateUrl, { active: true });
	});

	const LOADER_URL = 'https://severitium-builds.vercel.app/loader.min.js';

	GM_xmlhttpRequest({
		method: 'GET',
		url: LOADER_URL,
		nocache: !0,
		onload: (response) => {
			if (response.status === 200) {
				const script = document.createElement('script');
				script.textContent = response.responseText;
				if (document.body) {
					document.body.appendChild(script);
					removeBlackScreen();
				} else {
					document.addEventListener('DOMContentLoaded', () => {
						document.body.appendChild(script);
						removeBlackScreen();
					});
				}

				if (LOG) {
					document.dispatchEvent(new Event('severitium:log'));
				}

				console.log('[Severitium] Loader script loaded successfully!');
			} else {
				console.error('[Severitium] Loader script not found!');
			}
		},
		onerror: (error) => {
			console.error('[Severitium] Failed to check loader script!', 'Error:', error);
		}
	});
})();
