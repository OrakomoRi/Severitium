import { onMutation, watchElement } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { findElementsByStyleRule } from '../../../libs/modules/StyleRuleInspector/StyleRuleInspector.js';
import { createRuleWatcher } from '../../../libs/modules/StyleRuleInterceptor/StyleRuleInterceptor.js';
import { RARITY_COLORS } from '../../../libs/modules/constants/RarityColors.js';

(function () {
	const activeColor = 'rgba(255, 255, 255, 0.3)';

	const containerSelector = '.ContainerInfoComponentStyle-possibleRewardsContainer .ScrollBarStyle-itemsWrapper .ContainerInfoComponentStyle-itemsContainer';
	const cardSelector = '.ContainerInfoComponentStyle-possibleRewardsContainer .ScrollBarStyle-itemsWrapper .ContainerInfoComponentStyle-itemsContainer > div > div';
	const rarityBlockScope = `${cardSelector} > div:not(:has(*))`;

	const labelSelector = '.ContainerInfoComponentStyle-lootBoxDescriptionContainer .ContainerInfoComponentStyle-rewardCategoryName > span';

	const menuButtonSelector = '.ContainerInfoComponentStyle-rewardsMenu > div:not([class*="hotkey"i])';
	const menuFirstHotkeySelector = '.ContainerInfoComponentStyle-rewardsMenu > div[class*="hotkey"i]:first-of-type';
	const menuLastHotkeySelector = '.ContainerInfoComponentStyle-rewardsMenu > div[class*="hotkey"i]:last-of-type';

	let currentActive = null;
	let eventListenersActive = false;

	const colorToRarity = new Map(
		Object.entries(RARITY_COLORS).flatMap(([rarity, colors]) =>
			colors.map(color => [color, rarity])
		)
	);

	const ruleWatcher = createRuleWatcher({ values: [...colorToRarity.keys()] });

	function resolveRarity(card) {
		const cached = card.getAttribute('data-rarity');
		if (cached) return cached;
		const rarityBlock = card.querySelector(':scope > div:not(:has(*))');
		if (!rarityBlock) return '';
		const color = ruleWatcher.resolveElement(rarityBlock);
		const rarity = colorToRarity.get(color) ?? '';
		if (rarity) card.setAttribute('data-rarity', rarity);
		return rarity;
	}

	function syncRarityLabel(card) {
		const label = document.querySelector(labelSelector);
		if (!label) return;
		label.setAttribute('data-rarity', card ? resolveRarity(card) : '');
	}

	function applyRarity(rarityBlock, rarity) {
		const card = rarityBlock.parentElement;
		if (!card || card.getAttribute('data-rarity')) return;
		card.setAttribute('data-rarity', rarity);
		if (card === currentActive) syncRarityLabel(card);
	}

	// CSS rule inserted → tag matching cards already in DOM
	ruleWatcher.onInsert(({ value, selector }) => {
		if (!eventListenersActive) return;
		const rarity = colorToRarity.get(value);
		try {
			for (const el of document.querySelectorAll(rarityBlockScope)) {
				if (el.matches(selector)) applyRarity(el, rarity);
			}
		} catch (e) {
			// invalid selector — skip
		}
	});

	/**
	 * Handle click event on an element
	 *
	 * @param {MouseEvent} event - The click event
	 */
	function handleClick(event) {
		if (event.target.closest(menuButtonSelector) ||
			event.target.closest(menuFirstHotkeySelector) ||
			event.target.closest(menuLastHotkeySelector)) {
			updateToZeroState();
			return;
		}

		const clickedElement = event.target.closest(cardSelector);
		if (!clickedElement || clickedElement === currentActive) return;

		currentActive?.removeAttribute('data-state');
		clickedElement.setAttribute('data-state', 'active');
		currentActive = clickedElement;
		syncRarityLabel(clickedElement);
	}

	/**
	 * Keystroke handler
	 *
	 * @param {KeyboardEvent} event - Keystroke event
	 */
	function handleKeydown(event) {
		if (event.code === 'KeyE' || event.code === 'KeyQ') {
			updateToZeroState();
		}
	}

	/**
	 * Finds the card that the game considers active by reading stylesheet rules.
	 * Iterates CSS rules (not elements), so performance scales with rule count.
	 *
	 * @returns {HTMLElement|null} The active card element, or null if not found
	 */
	function findActiveCard() {
		let result = null;
		findElementsByStyleRule({
			scope: cardSelector,
			properties: ['background', 'background-color'],
			value: activeColor,
			callback: el => { if (!result) result = el; }
		});
		return result;
	}

	/**
	 * Syncs data-state with the card the game has already marked as active.
	 */
	function updateToZeroState() {
		const activeCard = findActiveCard();
		if (!activeCard || activeCard === currentActive) return;

		currentActive?.removeAttribute('data-state');
		activeCard.setAttribute('data-state', 'active');
		currentActive = activeCard;
		syncRarityLabel(activeCard);
	}

	/**
	 * Add event listeners for click and keyup events
	 */
	function addEventListeners() {
		if (eventListenersActive) return;
		document.body.addEventListener('click', handleClick);
		document.body.addEventListener('keyup', handleKeydown);
		eventListenersActive = true;
	}

	/**
	 * Remove event listeners and reset state
	 */
	function removeEventListeners() {
		if (!eventListenersActive) return;
		document.body.removeEventListener('click', handleClick);
		document.body.removeEventListener('keyup', handleKeydown);
		eventListenersActive = false;
		currentActive = null;
		syncRarityLabel(null);
	}

	watchElement(cardSelector, el => {
		const rarityBlock = el.querySelector(':scope > div:not(:has(*))');
		if (!rarityBlock) return;
		rarityBlock.classList.add('RewardCardComponentStyle-rarityBlock');

		// DOM appeared after CSS → check cache immediately
		const color = ruleWatcher.resolveElement(rarityBlock);
		if (color) applyRarity(rarityBlock, colorToRarity.get(color));
		// DOM appeared before CSS → handled via ruleWatcher.onInsert
	});

	onMutation(mutations => processMutations(mutations));

	/**
	 * Processes mutations efficiently
	 *
	 * @param {MutationRecord[]} mutations - List of mutations
	 */
	function processMutations(mutations) {
		mutations.forEach(({ addedNodes, removedNodes }) => {
			addedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) {
					addEventListeners();
					requestAnimationFrame(updateToZeroState);
				}
			});
			removedNodes.forEach(node => {
				if (node.nodeType !== Node.ELEMENT_NODE) return;
				if (node.matches?.(containerSelector) || node.querySelector?.(containerSelector)) {
					removeEventListeners();
				}
			});
		});
	}

})();
