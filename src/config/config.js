export const CONFIG = {
	SCRIPT_NAME: 'Severitium',
	
	get SCRIPT_VERSION() {
		return window.__SEVERITIUM__?.version || null;
	},

	getStableBase(version) {
		return version.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)?.[0] ?? version;
	},

	getBaseCDN(version) {
		const base = this.getStableBase(version);
		return `https://severitium-builds.vercel.app/versions/${base}/${version}`;
	},

	UPDATE_CHECK_ENABLED: true,
	UPDATE_MODAL_TIMER: 10000,
	GITHUB_SCRIPT_URL: (v) => `https://orakomori.github.io/Severitium/release/severitium.user.js?v=${v}`,
	STABLE_JSON_URL: (v) => `https://severitium-builds.vercel.app/stable.json?v=${v}`,
	IMAGES_URL: (v) => `https://orakomori.github.io/Severitium/src/assets/preload/ImageModules.json?v=${v}`,

	TRACK_URL: 'https://severitium-builds-server.onrender.com/api/track',
	NICKNAME_URL: 'https://severitium-builds-server.onrender.com/api/nickname',
};