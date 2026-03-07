import { Bridge } from './Bridge.js';
import { LoadingScreen } from './LoadingScreen.js';
import { CONFIG } from '../config/config.js';

export class ResourceLoader {
	constructor(version, season, logger) {
		this.version = version;
		this.season = season;
		this.logger = logger;
		this.loadingScreen = null;
		this.imageLinks = [];
	}

	async load() {
		this.loadingScreen = LoadingScreen.add(CONFIG.SCRIPT_NAME);

		try {
			const cachedVersion = await Bridge.getValue('SeveritiumVersion', '');
			const lastSeason = await Bridge.getValue('SeveritiumSeason', '');
			const isSeasonChanged = lastSeason !== this.season;
			const isSameVersion = cachedVersion === this.version;

			const loadStrategy = this._determineStrategy(isSameVersion, isSeasonChanged);

			this.logger.log(
				`Strategy: ${loadStrategy} | Version: ${this.version} (cached: ${cachedVersion}) | Season: ${this.season} (last: ${lastSeason})`,
				'info'
			);

			this.imageLinks = await this._fetchImageLinks();

			const severitium = {
				theme: {},
				CSS: {},
				JS: {},
				images: {},
				version: this.version,
				name: CONFIG.SCRIPT_NAME,
			};

			switch (loadStrategy) {
				case 'cache':
					await this._loadFromCache(severitium);
					break;
				case 'images-only':
					await this._loadImagesOnly(severitium);
					break;
				case 'full':
					await this._loadEverything(severitium);
					break;
			}

			return severitium;
		} catch (error) {
			this.logger.log(`Resource loading failed: ${error}`, 'error');
			throw error;
		} finally {
			if (this.loadingScreen) {
				LoadingScreen.remove(this.loadingScreen);
			}
		}
	}

	getImageLinks() {
		return this.imageLinks.map(el => ({
			...el,
			url: el.url.replace('SEASON_PLACEHOLDER', this.season) + `?v=${this.version}`
		}));
	}

	_determineStrategy(isSameVersion, isSeasonChanged) {
		if (isSameVersion && !isSeasonChanged) return 'cache';
		if (isSameVersion && isSeasonChanged) return 'images-only';
		return 'full';
	}

	async _fetchImageLinks() {
		try {
			const data = await Bridge.fetch(CONFIG.IMAGES_URL(this.version), 'json');
			this.logger.log(`Loaded ${data?.length ?? 0} image links`, 'info');
			return data ?? [];
		} catch (error) {
			this.logger.log(`Failed to load image links: ${error}`, 'error');
			return [];
		}
	}

	async _loadFromCache(severitium) {
		this.logger.log('Loading from cache', 'info');

		severitium.theme = await Bridge.getValue('SeveritiumThemes', { active: 'default', themes: {} });
		severitium.CSS = await Bridge.getValue('SeveritiumCSS', {});
		severitium.JS = await Bridge.getValue('SeveritiumJS', {});
		severitium.images = await Bridge.getValue('SeveritiumImages', {});
		
		this.logger.log(`DEBUG: Loaded ${Object.keys(severitium.images).length} cached images`, 'info');
		
		const expectedKeys = this.getImageLinks().map(el => el.url);
		const cachedKeys = Object.keys(severitium.images);
		const keysMatch = expectedKeys.every(key => cachedKeys.includes(key));
		
		this.logger.log(`DEBUG: Expected ${expectedKeys.length} keys, cached ${cachedKeys.length} keys, match = ${keysMatch}`, 'info');
		this.logger.log(`DEBUG: First expected key: ${expectedKeys[0]}`, 'info');
		this.logger.log(`DEBUG: First cached key: ${cachedKeys[0]}`, 'info');
		
		if (!keysMatch && this.imageLinks.length > 0) {
			this.logger.log('Cached image keys mismatch, reloading images...', 'warn');
			expectedKeys.forEach((key, i) => {
				const found = cachedKeys.includes(key);
				this.logger.log(`  Expected[${i}]: ${found ? 'FOUND' : 'MISSING'} - ${key}`, 'info');
			});
			severitium.images = {};
			
			const imagePromises = this._createImagePromises(severitium);
			const results = await Promise.allSettled(imagePromises);
			this._logFailedPromises(results);
			
			await Bridge.setValue('SeveritiumImages', severitium.images);
			this.logger.log(`DEBUG: Reloaded ${Object.keys(severitium.images).length} images`, 'info');
		}
	}

	async _loadImagesOnly(severitium) {
		this.logger.log('Loading images only (season changed)', 'info');

		severitium.theme = await Bridge.getValue('SeveritiumThemes', { active: 'default', themes: {} });
		severitium.CSS = await Bridge.getValue('SeveritiumCSS', {});
		severitium.JS = await Bridge.getValue('SeveritiumJS', {});

		const imagePromises = this._createImagePromises(severitium);
		this.loadingScreen.setTotalModules(imagePromises.length);

		const results = await Promise.allSettled(imagePromises);
		this._logFailedPromises(results);

		await Bridge.setValue('SeveritiumImages', severitium.images);
		await Bridge.setValue('SeveritiumSeason', this.season);
	}

	async _loadEverything(severitium) {
		this.logger.log('Loading all resources (new version)', 'info');

		severitium.theme = await Bridge.getValue('SeveritiumThemes', { active: 'default', themes: {} });

		const promises = [];
		const BASE_CDN = CONFIG.getBaseCDN(this.version);

		promises.push(
			this._fetchVariables(severitium, `${BASE_CDN}/variables.json`),
			this._fetchCSS(severitium, `${BASE_CDN}/style.release.min.css`),
			this._fetchJS(severitium, `${BASE_CDN}/script.release.min.js`)
		);

		const imagePromises = this._createImagePromises(severitium);
		promises.push(...imagePromises);

		this.loadingScreen.setTotalModules(promises.length);

		const results = await Promise.allSettled(promises);
		this._logFailedPromises(results);

		await Bridge.setValue('SeveritiumThemes', severitium.theme);
		await Bridge.setValue('SeveritiumCSS', severitium.CSS);
		await Bridge.setValue('SeveritiumJS', severitium.JS);
		await Bridge.setValue('SeveritiumImages', severitium.images);
		await Bridge.setValue('SeveritiumVersion', this.version);
		await Bridge.setValue('SeveritiumSeason', this.season);

		this.logger.log('All resources cached successfully', 'success');
	}

	async _fetchVariables(severitium, url) {
		try {
			const json = await Bridge.fetch(url, 'json');

			if (!severitium.theme.themes) severitium.theme.themes = {};

			if (json.variables && json.timestamp) {
				severitium.theme.themes.default = {
					id: 'default',
					name: 'Default',
					timestamp: json.timestamp,
					variables: json.variables,
				};
			}

			this.loadingScreen?.updateProgress();
		} catch (error) {
			this.logger.log(`Failed to load variables: ${error}`, 'error');
			throw error;
		}
	}

	async _fetchCSS(severitium, url) {
		try {
			const css = await Bridge.fetch(url, 'text');
			severitium.CSS['main'] = css;
			this.loadingScreen?.updateProgress();
		} catch (error) {
			this.logger.log(`Failed to load CSS: ${error}`, 'error');
			throw error;
		}
	}

	async _fetchJS(severitium, url) {
		try {
			const js = await Bridge.fetch(url, 'text');
			severitium.JS['main'] = js;
			this.loadingScreen?.updateProgress();
		} catch (error) {
			this.logger.log(`Failed to load JS: ${error}`, 'error');
			throw error;
		}
	}

	_createImagePromises(severitium) {
		this.logger.log(`DEBUG: _createImagePromises called with ${this.imageLinks.length} links`, 'info');
		return this.imageLinks.map(async ({ url }, index) => {
			const formatted = url.replace('SEASON_PLACEHOLDER', this.season) + `?v=${this.version}`;
			this.logger.log(`DEBUG: [${index}] Formatted URL: ${formatted}`, 'info');

			try {
				const img = await Bridge.fetch(formatted, 'base64');
				this.logger.log(`DEBUG: [${index}] Fetched image, length: ${img?.length || 0}`, 'info');
				severitium.images[formatted] = img;
				this.logger.log(`DEBUG: [${index}] Successfully loaded and saved with key: ${formatted}`, 'info');
				this.loadingScreen?.updateProgress();
			} catch (error) {
				this.logger.log(`Failed to load image ${url}: ${error}`, 'warn');
				throw error;
			}
		});
	}

	_logFailedPromises(results) {
		results.forEach((result, index) => {
			if (result.status === 'rejected') {
				this.logger.log(`Resource #${index} failed: ${result.reason}`, 'error');
			}
		});
	}
}
