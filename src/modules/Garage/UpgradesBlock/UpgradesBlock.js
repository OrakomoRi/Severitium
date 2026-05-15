import { watchElement } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { elementHasStyleRule } from '../../../libs/modules/StyleRuleInspector/StyleRuleInspector.js';

(function () {
	const BUTTON_SELECTOR = '.TanksPartComponentStyle-tankPartUpgrades .SquarePriceButtonComponentStyle-commonBlockButton';

	function applyAttribute(el, states, attribute = 'data-state') {
		const match = states.find(({ properties, value }) =>
			elementHasStyleRule(el, { properties, value })
		);
		el.setAttribute(attribute, match ? match.state : '');
	}

	const BUTTON_STATES = [
		{ state: 'max', properties: ['box-shadow'], value: '118, 255, 51' },
		{ state: 'rank', properties: ['box-shadow'], value: '0, 212, 255' },
		{ state: 'locked', properties: ['box-shadow'], value: '255, 255, 255' },
		{ state: 'ruby', properties: ['background-color'], value: '255, 102, 102' },
		{ state: 'crystal', properties: ['background-color'], value: '0, 212, 255' },
		{ state: 'equip', properties: ['background-color'], value: '118, 255, 51' },
		{ state: 'unequip', properties: ['background-color'], value: '191, 213, 255' },
	];

	watchElement(BUTTON_SELECTOR, el => applyAttribute(el, BUTTON_STATES));

	const DOT_SELECTOR = '.TanksPartComponentStyle-tankPartUpgrades > div > div:has(.TanksPartComponentStyle-nameUpgradeable) + div > div';
	const BG = ['background', 'background-color'];

	const DOT_STATES_LEAF = [
		{ state: 'unfilled', properties: BG, value: '118, 255, 51, 0.25' },
		{ state: 'filled', properties: BG, value: '255, 255, 255' },
		{ state: 'purchase', properties: BG, value: '255, 204, 0' },
	];

	const DOT_STATES_CHILD = [
		{ state: 'unfilled', properties: BG, value: '116, 186, 61, 0.25' },
		{ state: 'active', properties: BG, value: '118, 255, 51' },
		{ state: 'filled', properties: BG, value: '255, 255, 255' },
	];

	function tagDot(el) {
		if (!el.firstElementChild) {
			applyAttribute(el, DOT_STATES_LEAF);
		} else {
			for (const child of el.querySelectorAll(':scope > div')) {
				if (!child.firstElementChild) applyAttribute(child, DOT_STATES_CHILD);
			}
		}
	}

	watchElement(DOT_SELECTOR, el => tagDot(el));
})();
