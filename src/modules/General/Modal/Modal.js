import { watchElement } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { singleClearAllInlineStyle } from '../../../libs/modules/InlineStyleRemover/InlineStyleRemover.js';

(function () {
	const ITEM_CONTAINER_SELECTOR = '.UserProgressComponentStyle-modalWrapper .UserProgressComponentStyle-itemContainer';

	function clearStyles(el) {
		singleClearAllInlineStyle(el);
		for (const child of el.querySelectorAll('*')) singleClearAllInlineStyle(child);
	}

	watchElement(ITEM_CONTAINER_SELECTOR, clearStyles);

	const ITEM_NAME_WRAPPER_SELECTOR = `${ITEM_CONTAINER_SELECTOR} div:has(> span.UserProgressComponentStyle-itemName)`;

	function tagItemNameBlock(el) {
		const isNameOnlyChild = el.children.length === 1 && el.firstElementChild.classList.contains('UserProgressComponentStyle-itemName');
		el.classList.toggle('UserProgressComponentStyle-itemNameBlock', isNameOnlyChild);
	}

	watchElement(ITEM_NAME_WRAPPER_SELECTOR, tagItemNameBlock);

	const ITEM_CONTAINER_DIV_SELECTOR = `${ITEM_CONTAINER_SELECTOR} div`;

	function tagItemText(el) {
		// Exclude the class being toggled itself so the check stays stable once applied
		const hasOtherClasses = [...el.classList].some(c => c !== 'UserProgressComponentStyle-itemText');
		const isPlainTextBlock = !hasOtherClasses && el.children.length === 0 && el.textContent.trim().length > 0;
		el.classList.toggle('UserProgressComponentStyle-itemText', isPlainTextBlock);
	}

	watchElement(ITEM_CONTAINER_DIV_SELECTOR, tagItemText);
})();
