/**
 * Bridge — communication layer between the bundle and the extension's background script.
 * Provides methods to fetch resources, get/set values, and open tabs
 * via CustomEvent messaging.
 */
export const Bridge = {
	_pending: new Map(),

	/**
	 * Fetch a resource via external service (bypasses CORS)
	 *
	 * @param {string} url
	 * @param {'text'|'base64'|'json'} [format='text']
	 * @param {number} [timeout=30000]
	 * @returns {Promise<string|Object>}
	 */
	fetch(url, format = 'text', timeout = 30000) {
		return new Promise((resolve, reject) => {
			const id = this._uniqueUuid();
			this._pending.set(id, { resolve, reject });

			window.dispatchEvent(new CustomEvent('severitium:fetch', {
				detail: { id, url, format }
			}));

			setTimeout(() => {
				if (!this._pending.has(id)) return;
				this._pending.delete(id);
				reject(new Error(`Fetch timeout: ${url}`));
			}, timeout);
		});
	},

	/**
	 * Get a value from long-term storage
	 *
	 * @param {string} key
	 * @param {*} [defaultVal='']
	 * @returns {Promise<*>}
	 */
	getValue(key, defaultVal = '') {
		return new Promise((resolve) => {
			const id = this._uniqueUuid();
			this._pending.set(id, { resolve, reject: resolve });

			window.dispatchEvent(new CustomEvent('severitium:store:get', {
				detail: { id, key, default: defaultVal }
			}));
		});
	},

	/**
	 * Save a value to long-term storage
	 *
	 * @param {string} key
	 * @param {*} value
	 */
	setValue(key, value) {
		window.dispatchEvent(new CustomEvent('severitium:store:set', {
			detail: { key, value }
		}));
	},

	/**
	 * Open a URL in a new browser tab
	 *
	 * @param {string} url
	 */
	openTab(url) {
		window.dispatchEvent(new CustomEvent('severitium:open-tab', {
			detail: { url }
		}));
	},

	/**
	 * Notify the extension to update the script
	 *
	 * @param {string} hash - A unique identifier for the update
	 */
	updateScript(hash) {
		window.dispatchEvent(new CustomEvent('severitium:update', {
			detail: { hash }
		}));
	},

	/**
	 * Initialize response listeners.
	 * Must be called once before any fetch/getValue calls.
	 */
	init() {
		window.addEventListener('severitium:fetch:response', (e) => {
			const { id, data, error } = e.detail;
			const pending = this._pending.get(id);
			if (!pending) return;
			this._pending.delete(id);
			error ? pending.reject(new Error(error)) : pending.resolve(data);
		});

		window.addEventListener('severitium:store:response', (e) => {
			const { id, value } = e.detail;
			const pending = this._pending.get(id);
			if (!pending) return;
			this._pending.delete(id);
			pending.resolve(value);
		});
	},

	/**
	 * Generate a unique UUID for request tracking
	 * Ensures no collisions with pending requests
	 * 
	 * @returns {string} - A unique UUID
	 * @private
	 */
	_uniqueUuid() {
		let uuid;
		do {
			uuid = crypto.randomUUID();
		} while (this._pending.has(uuid));
		return uuid;
	}
};