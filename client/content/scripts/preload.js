"use strict";

process.once('loaded', () => {
	const { ipcRenderer } = require('electron');

	const config = {
		vsync: getArgValue('x.config.vsync') === 'true',
	};

	window.electronAPI = {
		config,
		restart: () => ipcRenderer.send('restart'),
		setVsync: (enable) => ipcRenderer.send('vsync-changed', enable),

		fetch: (url) => ipcRenderer.invoke('mod:fetch', url).then(({ data, error }) => {
			if (error) throw new Error(error);
			return {
				ok: true,
				text: () => Promise.resolve(data),
				json: () => Promise.resolve(JSON.parse(data)),
				blob: () => Promise.resolve(new Blob([
					Uint8Array.from(atob(data), c => c.charCodeAt(0))
				])),
			};
		}),

		getValue: (key, defaultValue) =>
			ipcRenderer.invoke('mod:store:get', key, defaultValue),

		setValue: (key, value) =>
			ipcRenderer.invoke('mod:store:set', key, value),

		openExternal: (url) => ipcRenderer.invoke('mod:open-external', url),
	};

	window.greenworksBridge = {
		receive: (channel, func) => {
			if (channel === 'steamPayment') {
				ipcRenderer.on(channel, (event, ...args) => func(...args));
			}
		}
	};
});

function getArgValue(arg) {
	const found = process.argv.find((element) => {
		const argName = element.slice(0, element.indexOf('='));
		return argName === arg;
	});
	return found ? found.slice(found.indexOf('=') + 1) : '';
}