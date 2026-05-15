import { onMutation, watchElement } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { elementHasStyleRule } from '../../../libs/modules/StyleRuleInspector/StyleRuleInspector.js';
import { RARITY_COLORS } from '../../../libs/modules/constants/RarityColors.js';

(function () {
	const BUTTON_SELECTOR = '.GarageSuppliesComponentStyle-containerButtons .GarageCommonStyle-bigActionButton';

	const ICON_KEYWORDS = {
		crystalSmall: 'crystal',
		ruby: 'ruby',
	};

	function tagButton(el) {
		const icon = el.querySelector('.GarageCommonStyle-iconCoinSmall');
		if (!icon) {
			el.setAttribute('data-price', 'disabled');
			return;
		}

		const key = Object.keys(ICON_KEYWORDS).find(k =>
			elementHasStyleRule(icon, { properties: ['background-image', 'background'], value: k, caseInsensitive: true })
		);
		if (key) el.setAttribute('data-price', ICON_KEYWORDS[key]);
		else el.setAttribute('data-price', 'disabled');
	}

	onMutation(mutations => {
		for (const { addedNodes } of mutations) {
			for (const node of addedNodes) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue;

				const buttons = node.matches(BUTTON_SELECTOR)
					? [node]
					: [...node.querySelectorAll(BUTTON_SELECTOR)];

				for (const button of buttons) tagButton(button);
			}
		}
	});

	function tagRarity(el) {
		const match = Object.entries(RARITY_COLORS).find(([color]) =>
			elementHasStyleRule(el, { properties: ['color'], value: `rgb(${color})`, match: 'exact' })
		);
		el.setAttribute('data-rarity', match ? match[1] : '');
	}

	watchElement(
		'.PaintsCollectionComponentStyle-headlinePaint > h3',
		el => tagRarity(el)
	);
})();
