import { onMutation } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { continuousClearAllInlineStyle } from '../../../libs/modules/InlineStyleRemover/InlineStyleRemover.js';
import { RARITY_COLORS } from '../../../libs/modules/constants/RarityColors.js';

(function () {
	const CARD = '.ContractCardComponentStyle-card';

	// Must run before continuousClearAllInlineStyle handlers to read rarity from inline style first
	onMutation(mutations => {
		for (const { addedNodes } of mutations) {
			for (const node of addedNodes) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue;
				const cards = node.matches(CARD) ? [node] : [...node.querySelectorAll(CARD)];
				for (const card of cards) {
					const cardBg = card.style.getPropertyValue('background-color') || card.style.getPropertyValue('background');
					if (cardBg.replace(/\s/g, '').includes('118,255,51')) {
						card.setAttribute('data-state', 'completed');
					}

					const rarityBlock = card.querySelector('div.-backgroundImageContain + div');
					if (!rarityBlock) continue;
					rarityBlock.classList.add('ContractCardComponentStyle-rarityBlock');
					const bg = rarityBlock.style.getPropertyValue('background');
					const match = Object.entries(RARITY_COLORS).find(([, colors]) => colors.some(color => bg.includes(color)));
					card.setAttribute('data-rarity', match ? match[0] : '');
				}
			}
		}
	});

	continuousClearAllInlineStyle(CARD);
	continuousClearAllInlineStyle(`${CARD} *`);
})();
