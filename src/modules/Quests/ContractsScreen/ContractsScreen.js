import { onMutation } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { singleClearAllInlineStyle } from '../../../libs/modules/InlineStyleRemover/InlineStyleRemover.js';
import { RARITY_COLORS } from '../../../libs/modules/constants/RarityColors.js';

(function () {
	const CARD = '.ContractCardComponentStyle-card';

	function processCard(card) {
		const rarityBlock = card.querySelector('div.-backgroundImageContain + div');
		if (rarityBlock) {
			rarityBlock.classList.add('ContractCardComponentStyle-rarityBlock');
			const bg = rarityBlock.style.getPropertyValue('background');
			const match = Object.entries(RARITY_COLORS).find(([, colors]) => colors.some(color => bg.includes(color)));
			card.setAttribute('data-rarity', match ? match[0] : '');
		}

		singleClearAllInlineStyle(card);
		card.querySelectorAll(':scope *').forEach(el => singleClearAllInlineStyle(el));
	}

	onMutation(mutations => {
		for (const { addedNodes } of mutations) {
			for (const node of addedNodes) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue;
				const cards = node.matches(CARD) ? [node] : [...node.querySelectorAll(CARD)];
				cards.forEach(processCard);
			}
		}
	});
})();
