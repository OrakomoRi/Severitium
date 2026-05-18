import { watchElement } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { clearInlineStyle, clearAllInlineStyle } from '../../../libs/modules/InlineStyleRemover/InlineStyleRemover.js';
import { RARITY_COLORS } from '../../../libs/modules/constants/RarityColors.js';

(function () {
	const CARD = '.ContractCardComponentStyle-card';

	watchElement(`${CARD} > div.-backgroundImageContain + div`, el => {
		el.classList.add('ContractCardComponentStyle-rarityBlock');
		const bg = el.style.getPropertyValue('background');
		if (!bg) return;
		const match = Object.entries(RARITY_COLORS).find(([, colors]) => colors.some(color => bg.includes(color)));
		el.closest(CARD)?.setAttribute('data-rarity', match ? match[0] : '');
		el.removeAttribute('style');
	}, { attributeFilter: ['class', 'style'] });

	[
		[CARD, ['background-color']],
		['.ContractCardComponentStyle-timer', ['background-color']],
		[`${CARD} > div:has(> span[id*="timer"]) + div`, ['font-size', 'text-transform']],
		[`${CARD} > div.-flexCenterAlignCenterColumn`, ['position', 'width', 'height']],
		[`${CARD} > div > img + div`, ['font-size', 'color']],
		[`${CARD} > div > img + div > [class*="icon"]`, ['background-color']],
		['.ContractCardComponentStyle-progressBar', ['position', 'display']],
		['.ContractCardComponentStyle-progressBar > div:first-child', ['position', 'border', 'width', 'height', 'border-radius']],
		['.ContractCardComponentStyle-progressBar > div:last-child > div', ['border', 'border-radius', 'height', 'transform']],
		[`${CARD} > div:nth-last-child(2)`, ['width', 'height', 'background-color']],
		[`${CARD} > div:last-child > span`, ['color']],
	].forEach(([selector, ]) => clearAllInlineStyle(selector));
})();
