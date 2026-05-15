import { onMutation, watchElement } from '../../../libs/modules/MutationHandler/MutationHandler.js';
import { findElementsByStyleRule } from '../../../libs/modules/StyleRuleInspector/StyleRuleInspector.js';
import { RARITY_COLORS } from '../../../libs/modules/constants/RarityColors.js';

(function () {
	// Defines the active color used to determine the current state of the card
	const activeColor = 'rgba(255, 255, 255, 0.3)';

	// Card & container selectors:
	// Possible reward container selector
	const containerSelector = '.ContainerInfoComponentStyle-possibleRewardsContainer .ScrollBarStyle-itemsWrapper .ContainerInfoComponentStyle-itemsContainer';
	// Possible reward card selector
	const cardSelector = '.ContainerInfoComponentStyle-possibleRewardsContainer .ScrollBarStyle-itemsWrapper .ContainerInfoComponentStyle-itemsContainer > div > div';

	const labelSelector = '.ContainerInfoComponentStyle-lootBoxDescriptionContainer .ContainerInfoComponentStyle-rewardCategoryName > span';

	// Menu selectors:
	// Menu button
	const menuButtonSelector = '.ContainerInfoComponentStyle-rewardsMenu > div:not([class*="hotkey"i])';
	// Hotkey
	const menuFirstHotkeySelector = '.ContainerInfoComponentStyle-rewardsMenu > div[class*="hotkey"i]:first-of-type';
	const menuLastHotkeySelector = '.ContainerInfoComponentStyle-rewardsMenu > div[class*="hotkey"i]:last-of-type';

	let currentActive = null;
	let eventListenersActive = false;

	function syncRarityLabel(rarity) {
		const label = document.querySelector(labelSelector);
		if (label) label.setAttribute('data-rarity', rarity ?? '');
	}

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
		syncRarityLabel(clickedElement.getAttribute('data-rarity'));
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
		syncRarityLabel(activeCard.getAttribute('data-rarity'));
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
		syncRarityLabel('');
	}

	const _idle = window.requestIdleCallback ?? (cb => setTimeout(cb, 0));

	// Lazily built on first use: Map<color_fragment → selectorText[]>
	let _rarityCache = null;

	function getRarityCache() {
		if (_rarityCache) return _rarityCache;
		_rarityCache = new Map();
		const allColors = Object.values(RARITY_COLORS).flat();
		for (const sheet of document.styleSheets) {
			let rules;
			try { rules = sheet.cssRules; } catch { continue; }
			for (const rule of rules) {
				if (!rule.style || !rule.selectorText) continue;
				for (const prop of ['background', 'background-color']) {
					const val = rule.style.getPropertyValue(prop).trim();
					if (!val) continue;
					for (const color of allColors) {
						if (val.includes(color)) {
							if (!_rarityCache.has(color)) _rarityCache.set(color, []);
							_rarityCache.get(color).push(rule.selectorText);
						}
					}
				}
			}
		}
		return _rarityCache;
	}

	watchElement(cardSelector, el => {
		const rarityBlock = el.querySelector(':scope > div:not(:has(*))');
		if (!rarityBlock) return;

		rarityBlock.classList.add('RewardCardComponentStyle-rarityBlock');

		_idle(() => {
			const cache = getRarityCache();
			const match = Object.entries(RARITY_COLORS).find(([, colors]) =>
				colors.some(color => {
					const selectors = cache.get(color) ?? [];
					return selectors.some(sel => { try { return rarityBlock.matches(sel); } catch { return false; } });
				})
			);
			el.setAttribute('data-rarity', match ? match[0] : '');
		});
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
					updateToZeroState();
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
