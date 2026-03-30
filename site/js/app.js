import I18nService from './services/I18nService.js';
import GalleryService from './services/GalleryService.js';
import ChangelogService from './services/ChangelogService.js';
import GalleryController from './controllers/GalleryController.js';
import LanguageController from './controllers/LanguageController.js';
import ChangelogController from './controllers/ChangelogController.js';
import PrivacyController from './controllers/PrivacyController.js';
import QAController from './controllers/QAController.js';
import InstallTabsController from './controllers/InstallTabsController.js';
import ScrollController from './controllers/ScrollController.js';
import DownloadController from './controllers/DownloadController.js';
import HeroGlitchController from './controllers/HeroGlitchController.js';
import './components/SimpleIcon.js';


document.addEventListener('DOMContentLoaded', async () => {
	const i18nService = new I18nService();
	await i18nService.init();

	const galleryService = new GalleryService();
	const changelogService = new ChangelogService();

	new ScrollController().init();
	new LanguageController(i18nService).init();
	new GalleryController(galleryService, i18nService).init();
	new ChangelogController(changelogService).init();
	new PrivacyController().init();
	new QAController().init();
	new InstallTabsController().init();
	new DownloadController().init();
	new HeroGlitchController().init();

	if (typeof AOS !== 'undefined') {
		AOS.init({ duration: 450, easing: 'ease-out-quad', once: false, offset: 60 });
	}
});
