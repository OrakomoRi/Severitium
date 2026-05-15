import { clearInlineStyle } from '../../../libs/modules/InlineStyleRemover/InlineStyleRemover.js';

(function () {
	const CARD = '.ContractCardComponentStyle-card';

	[
		[CARD, ['background-color']],
		[`${CARD} > div.-backgroundImageContain + div`, ['position', 'top', 'left', 'border-top-left-radius']],
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
	].forEach(([selector, properties]) => clearInlineStyle(selector, properties));
})();
