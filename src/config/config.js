export const CONFIG = {
	SCRIPT_NAME: 'Severitium',
	SCRIPT_VERSION: null,

	getStableBase(version) {
		return version.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)?.[0] ?? version;
	},

	getBaseCDN(version) {
		const base = this.getStableBase(version);
		return `https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/versions/${base}/${version}`;
	},

	UPDATE_CHECK_ENABLED: true,
	UPDATE_MODAL_TIMER: 10000,
	GITHUB_SCRIPT_URL: (v) => `https://orakomori.github.io/Severitium/release/severitium.user.js?v=${v}`,
	STABLE_JSON_URL: (v) => `https://severitium-builds.vercel.app/stable.json?v=${v}`,
	IMAGES_URL: (v) => `https://orakomori.github.io/Severitium/src/assets/preload/ImageModules.json?v=${v}`,

	fillVersion(version) {
		this.SCRIPT_VERSION = version;
	}
};