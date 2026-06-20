import { onMutation } from '../../../libs/modules/MutationHandler/MutationHandler.js';

(function () {
	'use strict';

	const SELECTORS = {
		scrollingMenu: '.SettingsComponentStyle-scrollingMenu',
		container: '.SettingsComponentStyle-blockContentOptions',
		menuItem: '.SettingsMenuComponentStyle-menuItemOptions:not([data-module="SeveritiumSettingsTab"])',
	};

	const CLASSES = {
		headline: 'SettingsComponentStyle-textHeadlineOptions',
		paragraph: 'SettingsComponentStyle-textParagraph',
		applyButton: 'SettingsComponentStyle-applyButton',
	};

	function isLastNativeTabActive(scrollingMenu) {
		const container = scrollingMenu.closest(SELECTORS.container);
		const menuItems = container?.querySelectorAll(`:scope > ul > ${SELECTORS.menuItem}`);
		if (!menuItems?.length) return false;

		return menuItems[menuItems.length - 1].matches('[class*="activeitem" i]');
	}

	function tagSupportTab(scrollingMenu) {
		if (!isLastNativeTabActive(scrollingMenu)) return;

		const wrapper = scrollingMenu.querySelector(':scope > div');
		if (!wrapper) return;

		wrapper.querySelectorAll(':scope > p').forEach((p, index) => {
			p.classList.add(index === 0 ? CLASSES.headline : CLASSES.paragraph);
		});

		wrapper.querySelector(':scope > div > div[class*="aligncenter" i]')
			?.classList.add(CLASSES.applyButton);
	}

	function refresh() {
		const scrollingMenus = document.querySelectorAll(SELECTORS.scrollingMenu);
		if (!scrollingMenus.length) return;

		scrollingMenus.forEach(tagSupportTab);
	}

	onMutation(refresh);
	refresh();
})();
