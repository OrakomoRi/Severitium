import { onMutation } from '../../libs/modules/MutationHandler/MutationHandler.js';
import { elementHasStyleRule } from '../../libs/modules/StyleRuleInspector/StyleRuleInspector.js';

(function () {
	// Selector for supply purchase buttons in the garage
	const SELECTOR = '.GarageSuppliesComponentStyle-containerButtons .GarageCommonStyle-bigActionButton';

	// Map of background-image keyword fragments to data-price attribute values
	const ICON_KEYWORDS = {
		crystalsmall: 'crystal',
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
		if (!icon) return;

		// Match the icon's stylesheet rule against known currency keyword fragments
		const key = Object.keys(ICON_KEYWORDS).find(k =>
			elementHasStyleRule(icon, { properties: ['background-image', 'background'], value: k })
		);
		if (key) el.setAttribute('data-price', ICON_KEYWORDS[key]);
	}

	onMutation(mutations => {
		for (const { addedNodes } of mutations) {
			for (const node of addedNodes) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue;

				// Handle both the node itself and any matching descendants
				const buttons = node.matches(SELECTOR)
					? [node]
					: [...node.querySelectorAll(SELECTOR)];

				for (const button of buttons) tagButton(button);
			}
		}
	});
})();
