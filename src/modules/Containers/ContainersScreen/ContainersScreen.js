import { watchElement } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { elementHasStyleRule } from '../../../libs/modules/StyleRuleInspector/StyleRuleInspector.js';
import { RARITY_COLORS } from '../../../libs/modules/constants/RarityColors.js';

(function () {
	const REWARD_SELECTOR = '.ContainersComponentStyle-infoPanel .ContainersComponentStyle-possibleRewardsBlock .ContainersComponentStyle-rewards > div';

	watchElement(REWARD_SELECTOR, el => {
		const icon = el.querySelector(':scope > div:first-child');
		if (!icon) return;

		icon.classList.add('RewardCardComponentStyle-rarityBlock');

		const match = Object.entries(RARITY_COLORS).find(([, colors]) =>
			colors.some(color => elementHasStyleRule(icon, { properties: ['background', 'background-color'], value: color }))
		);
		el.setAttribute('data-rarity', match ? match[0] : '');
	});
})();
