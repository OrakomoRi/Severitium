import { onMutation } from '../../../libs/modules/MutationHandler/MutationHandler.js';

(function () {
	const PRICE_CONTAINER_CLASS = 'ShowcaseItemComponentStyle-priceContainer';
	const REAL_CURRENCY_CLASS = 'ShowcaseItemComponentStyle-realCurrencyPrice';
	const PRICE_SPAN_SELECTOR = '.ShowcaseItemComponentStyle-priceText, .ShopItemComponentStyle-footerContent';

	function tagContainer(span) {
		const container = span.parentElement;
		if (!container || container.tagName !== 'DIV') return;

		container.classList.add(PRICE_CONTAINER_CLASS);

		if (container.querySelector(':scope > img')) {
			container.classList.remove(REAL_CURRENCY_CLASS);
		} else {
			container.classList.add(REAL_CURRENCY_CLASS);
		}
	}

	function processNode(node) {
		if (node.nodeType !== Node.ELEMENT_NODE) return;
		if (node.matches(PRICE_SPAN_SELECTOR)) {
			tagContainer(node);
		} else {
			node.querySelectorAll(PRICE_SPAN_SELECTOR).forEach(tagContainer);
		}
	}

	document.querySelectorAll(PRICE_SPAN_SELECTOR).forEach(tagContainer);

	onMutation(mutations => {
		for (const { addedNodes } of mutations) {
			for (const node of addedNodes) processNode(node);
		}
	});
})();
