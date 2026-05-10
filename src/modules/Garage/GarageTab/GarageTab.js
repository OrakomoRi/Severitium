import { onMutation, watchElement } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { elementHasStyleRule } from '../../../libs/modules/StyleRuleInspector/StyleRuleInspector.js';

(function () {
	// --- Supply buttons ---

	// Selector for supply purchase buttons in the garage
	const BUTTON_SELECTOR = '.GarageSuppliesComponentStyle-containerButtons .GarageCommonStyle-bigActionButton';

	// Map of background-image URL keyword fragments to data-price attribute values
	const ICON_KEYWORDS = {
		crystalSmall: 'crystal',
		ruby: 'ruby',
	};

	/**
	 * Inspects the coin icon inside a button and sets a data-price attribute
	 * based on which currency icon is applied via stylesheet rules
	 *
	 * @param {HTMLElement} el - The button element to tag
	 */
	function tagButton(el) {
		const icon = el.querySelector('.GarageCommonStyle-iconCoinSmall');
		if (!icon) {
			el.setAttribute('data-price', 'empty');
			return;
		}

		// Match the icon's stylesheet rule against known currency keyword fragments
		const key = Object.keys(ICON_KEYWORDS).find(k =>
			elementHasStyleRule(icon, { properties: ['background-image', 'background'], value: k, caseInsensitive: true })
		);
		if (key) el.setAttribute('data-price', ICON_KEYWORDS[key]);
		else el.setAttribute('data-price', 'empty');
	}

	onMutation(mutations => {
		for (const { addedNodes } of mutations) {
			for (const node of addedNodes) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue;

				// Handle both the node itself and any matching descendants
				const buttons = node.matches(BUTTON_SELECTOR)
					? [node]
					: [...node.querySelectorAll(BUTTON_SELECTOR)];

				for (const button of buttons) tagButton(button);
			}
		}
	});

	// --- Paint rarity ---

	// Map of exact color values to rarity names
	const RARITY_COLORS = {
		'rgb(191, 213, 255)': 'common',
		'rgb(118, 255, 51)': 'uncommon',
		'rgb(0, 212, 255)': 'rare',
		'rgb(170, 128, 255)': 'epic',
		'rgb(255, 204, 0)': 'legendary',
		'rgb(254, 102, 102)': 'mystic',
	};

	/**
	 * Reads the rarity color from the paint headline and sets a data-rarity attribute
	 * on the description container
	 *
	 * @param {HTMLElement} el - The h3 element inside the paint headline
	 */
	function tagRarity(el) {
		const rarity = Object.keys(RARITY_COLORS).find(color =>
			elementHasStyleRule(el, { properties: ['color'], value: color, match: 'exact' })
		);
		el.setAttribute('data-rarity', rarity ? RARITY_COLORS[rarity] : '');
	}

	watchElement(
		'.PaintsCollectionComponentStyle-headlinePaint > h3',
		el => tagRarity(el)
	);
})();
