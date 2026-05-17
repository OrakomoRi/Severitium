import { watchElement } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { createRuleWatcher } from '../../../libs/modules/StyleRuleInterceptor/StyleRuleInterceptor.js';
import { RARITY_COLORS } from '../../../libs/modules/constants/RarityColors.js';

(function () {
	const REWARD_SELECTOR = '.ContainersComponentStyle-infoPanel .ContainersComponentStyle-possibleRewardsBlock .ContainersComponentStyle-rewards > div';
	const iconScope = `${REWARD_SELECTOR} > div:first-child`;

	const colorToRarity = new Map(
		Object.entries(RARITY_COLORS).flatMap(([rarity, colors]) =>
			colors.map(color => [color, rarity])
		)
	);

	const ruleWatcher = createRuleWatcher({ values: [...colorToRarity.keys()] });

	ruleWatcher.onInsert(({ value, selector }) => {
		const rarity = colorToRarity.get(value);
		try {
			for (const icon of document.querySelectorAll(iconScope)) {
				if (icon.matches(selector)) {
					const card = icon.parentElement;
					if (card) card.setAttribute('data-rarity', rarity);
				}
			}
		} catch (e) {
			// invalid selector — skip
		}
	});

	watchElement(REWARD_SELECTOR, el => {
		const icon = el.querySelector(':scope > div:first-child');
		if (!icon) return;

		icon.classList.add('RewardCardComponentStyle-rarityBlock');

		// DOM appeared after CSS → check cache immediately
		const color = ruleWatcher.resolveElement(icon);
		if (color) el.setAttribute('data-rarity', colorToRarity.get(color));
		// DOM appeared before CSS → handled via ruleWatcher.onInsert
	});
})();
