(function () {
	const processedCheckboxes = new WeakSet();

	/**
	 * Initializes a checkbox input by detecting its visual state from span::before background
	 * 
	 * @param {HTMLInputElement} input - The checkbox input to initialize
	 */
	function initializeCheckbox(input) {
		if (processedCheckboxes.has(input)) return;

		const label = input.closest('label');
		if (!label) return;

		const span = label.querySelector('span');
		if (!span) return;

		const computed = getComputedStyle(span, '::before');
		const bg = computed.backgroundImage || '';

		input.classList.add('no-transition');

		let state = 'off';
		if (/\/incorrect[^\/]*\.svg["']?\)?$/.test(bg)) {
			state = 'off';
		} else {
			state = 'on';
		}

		input.setAttribute('data-state', state);
		input.checked = (state === 'on');
		processedCheckboxes.add(input);

		requestAnimationFrame(() => {
			input.classList.remove('no-transition');
		});
	}

	/**
	 * Cleans up checkbox reference when it's removed
	 * 
	 * @param {HTMLInputElement} input - The checkbox input to clean up
	 */
	function cleanupCheckbox(input) {
		if (processedCheckboxes.has(input)) {
			processedCheckboxes.delete(input);
		}
	}

	let lastClickedInput = null;

	/**
	 * Handles click events and toggles data-state on custom checkboxes
	 */
	function handleClick(e) {
		const clickable = e.target.closest('[class*="checkbox" i]');
		if (!clickable) return;

		const input = clickable.querySelector('label > input[type="checkbox"]');
		if (!input) return;

		if (input === lastClickedInput) return;
		lastClickedInput = input;

		setTimeout(() => {
			lastClickedInput = null;
		}, 50);

		const current = input.getAttribute('data-state') || 'off';
		const next = current === 'on' ? 'off' : 'on';
		input.setAttribute('data-state', next);
	}

	// Initialize existing checkboxes on load
	document.querySelectorAll('input[type="checkbox"]').forEach(initializeCheckbox);

	// Observe DOM for dynamically added/removed checkboxes
	const observer = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			for (const node of mutation.addedNodes) {
				if (node.nodeType !== 1) continue;

				if (node.matches?.('.CheckBoxStyle-checkbox input[type="checkbox"]')) {
					initializeCheckbox(node);
				} else {
					node.querySelectorAll?.('.CheckBoxStyle-checkbox input[type="checkbox"]').forEach(initializeCheckbox);
				}
			}

			for (const node of mutation.removedNodes) {
				if (node.nodeType !== 1) continue;

				if (node.matches?.('.CheckBoxStyle-checkbox input[type="checkbox"]')) {
					cleanupCheckbox(node);
				} else {
					node.querySelectorAll?.('.CheckBoxStyle-checkbox input[type="checkbox"]').forEach(cleanupCheckbox);
				}
			}
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });

	document.body.addEventListener('click', handleClick, true);
})();