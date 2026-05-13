import { watchElement } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { elementHasStyleRule } from '../../../libs/modules/StyleRuleInspector/StyleRuleInspector.js';

(function () {
	const BUTTON_SELECTOR = '.TanksPartComponentStyle-tankPartUpgrades .SquarePriceButtonComponentStyle-commonBlockButton';

	// box-shadow checks first — their colors overlap with background-color of other states
	const BUTTON_STATES = [
		{ state: 'max', prop: 'box-shadow', value: '118, 255, 51' },
		{ state: 'need-rank', prop: 'box-shadow', value: '0, 212, 255' },
		{ state: 'locked', prop: 'box-shadow', value: '255, 255, 255' },
		{ state: 'ruby', prop: 'background-color', value: '255, 102, 102' },
		{ state: 'crystal', prop: 'background-color', value: '0, 212, 255' },
		{ state: 'equip', prop: 'background-color', value: '118, 255, 51' },
		{ state: 'unequip', prop: 'background-color', value: '191, 213, 255' },
	];

	function tagButton(el) {
		const match = BUTTON_STATES.find(({ prop, value }) =>
			elementHasStyleRule(el, { properties: [prop], value })
		);
		el.setAttribute('data-state', match ? match.state : '');
	}

	watchElement(BUTTON_SELECTOR, el => tagButton(el));
})();
