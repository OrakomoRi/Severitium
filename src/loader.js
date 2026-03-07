// Platform-independent libraries
import './libs/loader/**/*.js';

// Core modules
import { Bridge } from './core/Bridge.js';
import { Logger } from './core/Logger.js';
import { ResourceLoader } from './core/ResourceLoader.js';
import { SeveritiumInjector } from './core/SeveritiumInjector.js';
import { UpdateChecker } from './core/UpdateChecker.js';

// Utilities
import { _getPeriod } from './utils/_getPeriod.js';

// Configuration
import { CONFIG } from './config/config.js';

(async () => {
	Bridge.init();

	const logger = new Logger(CONFIG.SCRIPT_NAME);

	document.addEventListener('severitium:log', () => {
		logger.enableLogging();
	});

	const currentSeason = _getPeriod();

	if (CONFIG.UPDATE_CHECK_ENABLED) {
		const updateChecker = new UpdateChecker();
		updateChecker.check().catch(err =>
			logger.log(`Update check failed: ${err}`, 'warn')
		);
	}

	try {
		const resourceLoader = new ResourceLoader(CONFIG.SCRIPT_VERSION, currentSeason);
		const severitium = await resourceLoader.load();

		const injector = new SeveritiumInjector(severitium, currentSeason);
		injector.updateSeveritium(severitium);

		if (severitium.CSS['main']) injector.applyCSS('main');
		if (severitium.theme) injector.applyTheme();
		if (severitium.JS['main']) injector.applyJS('main');

		const imageLinks = resourceLoader.getImageLinks();
		
		logger.log(`DEBUG: imageLinks.length = ${imageLinks.length}`, 'debug');
		logger.log(`DEBUG: imageLinks URLs:`, 'debug');
		imageLinks.forEach((el, i) => logger.log(`  [${i}] ${el.url}`, 'debug'));
		
		logger.log(`DEBUG: severitium.images keys count = ${Object.keys(severitium.images).length}`, 'debug');
		logger.log(`DEBUG: severitium.images keys:`, 'debug');
		Object.keys(severitium.images).forEach((key, i) => logger.log(`  [${i}] ${key}`, 'debug'));
		
		const validImages = imageLinks.filter(el => {
			const found = severitium.images[el.url];
			logger.log(`DEBUG: Checking ${el.url} -> ${found ? 'FOUND' : 'NOT FOUND'}`, 'info');
			return found;
		});
		logger.log(`DEBUG: validImages.length = ${validImages.length}`, 'debug');

		if (validImages.length > 0) {
			injector.applyImages(validImages, currentSeason);
		} else {
			logger.log('No valid images to apply', 'warn');
		}

		logger.log('Severitium initialized successfully', 'success');
	} catch (error) {
		logger.log(`Fatal error: ${error}`, 'error');
	}

	window.Severitium = {
		reloadResources: async () => {
			await Bridge.setValue('SeveritiumVersion', '');
			location.reload();
		}
	};

	window.addEventListener('theme:savethemes', async () => {
		const data = localStorage.getItem('SeveritiumThemes');
		if (!data) return;
		try {
			await Bridge.setValue('SeveritiumThemes', JSON.parse(data));
		} catch (error) {
			logger.log(`Failed to save themes: ${error}`, 'error');
		} finally {
			logger.log('Themes saved', 'info');
		}
	});
})();
