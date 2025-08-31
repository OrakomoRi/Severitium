/**
 * Universal class to create custom selects
 * @param {Array} options Array of objects with `name` and `code` properties for options: [{name, value}, {name, value}]
 * @param {Function} callback Function triggered when an option is selected
 * @param {string|null} defaultValue Default value displayed before selecting an option
 */
class BreeziumSelect {
	constructor(options, callback, defaultOption = null) {
		this.container = document.createElement('div');
		this.container.classList.add('breezium-select');

		this.options = options;
		this.callback = callback;

		this.defaultOption = defaultOption || options[0] || { name: 'Select Option', value: '' };

		this.selected = null;
		this.optionsContainer = null;

		this.init();
	}

	/**
	 * Initializes the custom select by creating DOM elements and attaching event listeners
	 */
	init() {
		this.selected = document.createElement('div');
		this.selected.classList.add('breezium-selected');
		this.selected.textContent = this.defaultOption.name;
		this.selected.dataset.value = this.defaultOption.value;

		this.optionsContainer = document.createElement('div');
		this.optionsContainer.classList.add('breezium-options');

		for (const option of this.options) {
			const optionEl = document.createElement('div');
			optionEl.classList.add('breezium-option');
			optionEl.textContent = option.name;
			optionEl.dataset.value = option.value;

			optionEl.addEventListener('click', () => this.selectOption(option));

			this.optionsContainer.appendChild(optionEl);
		}

		this.selected.addEventListener('click', () => this.toggleOptions());

		document.addEventListener('click', (event) => {
			if (!this.container.contains(event.target)) {
				this.container.classList.remove('show');
			}
		});
	}

	/**
	 * Handles the selection of an option
	 * @param {object} option The selected option {name, value}
	 */
	selectOption(option) {
		this.callback(option.value);
		this.selected.textContent = option.name;
		this.selected.dataset.value = option.value;
		this.container.classList.remove('show');
	}

	/**
	 * Toggles the visibility of the options list
	 */
	toggleOptions() {
		this.container.classList.toggle('show');

		if (this.container.classList.contains('show')) {
			const rect = this.container.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const spaceBelow = viewportHeight - rect.bottom;

			const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
			const spaceBelowInRem = (spaceBelow - 10) / remInPixels;

			// Get the value of CSS variable --breezium-select-options-max-height
			const computedStyle = getComputedStyle(this.optionsContainer);
			let maxCssHeight = computedStyle.getPropertyValue('--breezium-select-options-max-height').trim();

			// Default value (if the variable does not exist)
			let maxCssHeightRem = 10;

			if (maxCssHeight) {
				if (maxCssHeight.endsWith('rem')) {
					maxCssHeightRem = parseFloat(maxCssHeight);
				} else if (maxCssHeight.endsWith('em')) {
					// Get the font size of the container if it is different from the root
					const emInPixels = parseFloat(getComputedStyle(this.optionsContainer).fontSize);
					maxCssHeightRem = parseFloat(maxCssHeight) * (emInPixels / remInPixels); // em → rem
				} else if (maxCssHeight.endsWith('px')) {
					maxCssHeightRem = parseFloat(maxCssHeight) / remInPixels; // px → rem
				} else if (maxCssHeight.endsWith('%')) {
					const percent = parseFloat(maxCssHeight) / 100;
					maxCssHeightRem = (viewportHeight * percent) / remInPixels; // % → rem
				}
			}

			// Total height (takes into account available space)
			const maxHeightInRem = Math.min(spaceBelowInRem, maxCssHeightRem);
			this.optionsContainer.style.maxHeight = `${maxHeightInRem}rem`;
		}
	}

	/**
	 * Renders the custom select to the DOM
	 * @param {HTMLElement} parent The parent element where the select will be added
	 * @param {HTMLElement|null} sibling Optional. An element before or after which the select should be inserted
	 * @param {boolean} insertAfter Optional. If true, inserts after the sibling element (default: false)
	 */
	render(parent, sibling = null, insertAfter = false) {
		this.container.appendChild(this.selected);
		this.container.appendChild(this.optionsContainer);
		if (sibling) {
			if (insertAfter && sibling.nextSibling) {
				parent.insertBefore(this.container, sibling.nextSibling);
			} else {
				parent.insertBefore(this.container, sibling);
			}
		} else {
			parent.appendChild(this.container);
		}
	}
}