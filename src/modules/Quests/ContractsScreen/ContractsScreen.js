import { clearAllInlineStyle } from '../../../libs/modules/InlineStyleRemover/InlineStyleRemover.js';

(function () {
	const CARD = '.ContractCardComponentStyle-card';

	[
		CARD,
		`${CARD} > div.-backgroundImageContain + div`,
		'.ContractCardComponentStyle-timer',
		`${CARD} > div:has(> span[id*="timer"]) + div`,
		`${CARD} > div.-flexCenterAlignCenterColumn`,
		`${CARD} > div > img + div`,
		`${CARD} > div > img + div > [class*="icon"]`,
		'.ContractCardComponentStyle-progressBar',
		'.ContractCardComponentStyle-progressBar > div:first-child',
		'.ContractCardComponentStyle-progressBar > div:last-child > div',
		`${CARD} > div:nth-last-child(2)`,
		`${CARD} > div:last-child > span`,
	].forEach(clearAllInlineStyle);
})();
