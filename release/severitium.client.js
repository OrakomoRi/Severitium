(function () {
	'use strict';

	const CLIENT_VERSION = '1.9.3+build6';

	const isLogging = false;

	function addBlackScreen() { const e = document.createElement("div"); e.style.position = "absolute", e.style.top = "0", e.style.left = "0", e.style.width = "100vw", e.style.height = "100vh", e.style.backgroundColor = "black", e.style.zIndex = "999999", e.style.pointerEvents = "none", e.style.overflow = "hidden", e.className = "severitium-black-screen", e.setAttribute("data-severitium", "black-screen"), document.body.appendChild(e) } function removeBlackScreen() { const e = document.querySelector('.severitium-black-screen[data-severitium="black-screen"]'); e && e.remove() } document.body ? addBlackScreen() : document.addEventListener("DOMContentLoaded", (() => { addBlackScreen() }));

	if (typeof modAPI === 'undefined') {
		console.error('[Severitium] No modAPI provided. This script requires TankiOnline ModLoader.');
		return;
	}

	window.addEventListener('severitium:fetch', async (event) => {
		const { id, url, format } = event.detail;

		try {
			const response = await modAPI.fetch(url);

			let data;
			if (format === 'json') {
				data = await response.json();
			} else if (format === 'base64') {
				const blob = await response.blob();
				const arrayBuffer = await blob.arrayBuffer();
				const bytes = new Uint8Array(arrayBuffer);
				let binary = '';
				for (let i = 0; i < bytes.length; i++) {
					binary += String.fromCharCode(bytes[i]);
				}
				data = btoa(binary);
			} else {
				data = await response.text();
			}

			window.dispatchEvent(new CustomEvent('severitium:fetch:response', {
				detail: { id, data }
			}));
		} catch (error) {
			window.dispatchEvent(new CustomEvent('severitium:fetch:response', {
				detail: { id, error: error.message }
			}));
		}
	});

	window.addEventListener('severitium:store:get', async (event) => {
		const { id, key, default: defaultValue } = event.detail;

		try {
			const value = await modAPI.getValue(key, defaultValue);

			window.dispatchEvent(new CustomEvent('severitium:store:response', {
				detail: { id, value }
			}));
		} catch (error) {
			window.dispatchEvent(new CustomEvent('severitium:store:response', {
				detail: { id, value: defaultValue }
			}));
		}
	});

	window.addEventListener('severitium:store:set', async (event) => {
		const { key, value } = event.detail;

		try {
			await modAPI.setValue(key, value);
			localStorage.setItem(
				key,
				typeof value === 'string' ? value : JSON.stringify(value)
			);
		} catch (error) {
			console.error('[Severitium] Failed to save value:', key, error);
		}
	});

	window.addEventListener('severitium:open-tab', (event) => {
		const { url } = event.detail;
		modAPI.openExternal(url);
	});

	window.addEventListener('severitium:update', async (event) => {
		const { hash } = event.detail;
		const downloadUrl = `https://cdn.statically.io/gh/OrakomoRi/Severitium@${hash}/release/severitium.client.js`;
		const result = await modAPI.updateSelf(downloadUrl);
		if (result?.error) {
			console.error('[Severitium] Auto-update failed:', result.error);
			modAPI.openExternal(`https://github.com/OrakomoRi/Severitium/releases`);
		} else {
			modAPI.restart();
		}
	});

	const LOADER_URL = 'https://severitium-builds.vercel.app/loader.min.js';

	Object.defineProperty(window, '__SEVERITIUM__', {
		value: Object.freeze({
			version: CLIENT_VERSION
		}),
		writable: false,
		configurable: false
	});

	async function loadLoader() {
		try {
			const response = await modAPI.fetch(LOADER_URL);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.text();

			const script = document.createElement('script');
			script.textContent = data;

			if (document.body) {
				document.body.appendChild(script);
				removeBlackScreen();
			} else {
				document.addEventListener('DOMContentLoaded', () => {
					document.body.appendChild(script);
					removeBlackScreen();
				});
			}

			if (isLogging) {
				document.dispatchEvent(new Event('severitium:log'));
			}

			console.log('[Severitium] Loader script loaded successfully');
		} catch (error) {
			console.error('[Severitium] Failed to load loader.min.js', error);
		}
	}

	loadLoader();

	console.log('[Severitium] Client initialized for Electron');
})();
