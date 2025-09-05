if (typeof window.BreeziumSelect === 'undefined') {
	/**
	 * Lightweight custom select with zero dependencies.
	 *
	 * @param {Array<{name:string,value?:string,code?:string,disabled?:boolean}>} options
	 * @param {(value:string)=>void} callback
	 * @param {{name:string,value?:string,code?:string}|string|null} defaultOption
	 */
	class BreeziumSelect {
		constructor(options, callback, defaultOption = null) {
			// Root container
			this.container = document.createElement('div');
			this.container.classList.add('breezium-select');
			// Ensure positioned context for absolute options container
			if (getComputedStyle(this.container).position === 'static') {
				this.container.style.position = 'relative';
			}

			this.options = this._normalizeOptions(options);
			this.callback = typeof callback === 'function' ? callback : () => { };

			// Selected header node
			this.selected = null;
			// Dropdown node
			this.optionsContainer = null;
			// Current open direction: 'down' | 'up'
			this._dropDirection = 'down';

			// Bound listeners for cleanup (to avoid leaks)
			this._boundDocClick = (e) => { if (!this.container.contains(e.target)) this.close(); };
			this._boundRecalc = () => { if (this.isOpen()) { this._decideDirection(); this._applyMaxHeight(); } };

			// Resolve default option (object or string)
			const resolvedDefault =
				(defaultOption && typeof defaultOption === 'object')
					? this._optFromAny(defaultOption.value ?? defaultOption.code)
					: (typeof defaultOption === 'string'
						? this._optFromAny(defaultOption)
						: null) || this.options[0] || { name: 'Select Option', value: '' };

			this.defaultOption = resolvedDefault;

			this._init();
		}

		/* ------------------ Private utils ------------------ */

		/**
		 * Normalize incoming options to canonical { name, value, disabled }.
		 * Supports legacy { code } field by mapping it to value.
		 */
		_normalizeOptions(options) {
			const arr = Array.isArray(options) ? options : [];
			return arr.map(o => ({
				name: String(o?.name ?? ''),
				value: String(o?.value ?? o?.code ?? ''),
				disabled: !!o?.disabled
			}));
		}

		/**
		 * Find option by either value or legacy code.
		 * @param {string} anyValue
		 */
		_optFromAny(anyValue) {
			const val = anyValue != null ? String(anyValue) : '';
			return this.options.find(o => o.value === val) || null;
		}

		_rootFontSizePx() {
			return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
		}

		/**
		 * Read --breezium-select-options-max-height, convert to rem.
		 * Supports rem/em/px/%; fallback = 10rem.
		 */
		_readMaxHeightRem() {
			const cs = getComputedStyle(this.optionsContainer);
			let maxCss = cs.getPropertyValue('--breezium-select-options-max-height').trim();
			const rootRemPx = this._rootFontSizePx();

			if (!maxCss) return 10; // default

			// rem
			if (maxCss.endsWith('rem')) return parseFloat(maxCss) || 10;

			// em (convert to rem using this element's font-size)
			if (maxCss.endsWith('em')) {
				const emPx = parseFloat(getComputedStyle(this.optionsContainer).fontSize) || rootRemPx;
				return (parseFloat(maxCss) * (emPx / rootRemPx)) || 10;
			}

			// px
			if (maxCss.endsWith('px')) {
				return (parseFloat(maxCss) / rootRemPx) || 10;
			}

			// %
			if (maxCss.endsWith('%')) {
				const pct = parseFloat(maxCss);
				const vhPx = window.innerHeight * (pct / 100);
				return (vhPx / rootRemPx) || 10;
			}

			// Unknown unit — fallback
			return 10;
		}

		/* ------------------ Lifecycle & rendering ------------------ */

		_init() {
			// Header (current selection)
			this.selected = document.createElement('div');
			this.selected.classList.add('breezium-selected');
			this.selected.textContent = this.defaultOption.name;
			this.selected.dataset.value = this.defaultOption.value;

			// Dropdown container
			this.optionsContainer = document.createElement('div');
			this.optionsContainer.classList.add('breezium-options');

			// Ensure absolute positioning so we can place above/below
			const ocStyle = getComputedStyle(this.optionsContainer);
			if (ocStyle.position === 'static') {
				this.optionsContainer.style.position = 'absolute';
				this.optionsContainer.style.left = '0';
				this.optionsContainer.style.right = '0';
			}

			this._renderOptions();

			// Events
			this.selected.addEventListener('click', () => this.toggle());
			document.addEventListener('click', this._boundDocClick);
			window.addEventListener('resize', this._boundRecalc, { passive: true });
			window.addEventListener('scroll', this._boundRecalc, { passive: true });
		}

		_renderOptions() {
			this.optionsContainer.innerHTML = '';
			const current = this.getValue();
			for (const option of this.options) {
				const el = document.createElement('div');
				el.classList.add('breezium-option');
				if (option.disabled) el.classList.add('is-disabled');
				if (current === option.value) el.classList.add('is-selected');
				el.textContent = option.name;
				el.dataset.value = option.value;

				el.addEventListener('click', () => {
					if (option.disabled) return;
					this._selectOptionInternal(option, true);
				});

				this.optionsContainer.appendChild(el);
			}
		}

		/**
		 * Decide opening direction based on available viewport space.
		 * Try down first; if there's not enough space and more space above — open up.
		 */
		_decideDirection() {
			const rect = this.container.getBoundingClientRect();
			const viewportHeight = window.innerHeight;

			const spaceBelow = Math.max(0, viewportHeight - rect.bottom); // px
			const spaceAbove = Math.max(0, rect.top);                     // px

			const desiredRem = this._readMaxHeightRem();
			const desiredPx = desiredRem * this._rootFontSizePx();

			const openUp = spaceBelow < desiredPx && spaceAbove > spaceBelow;
			this._dropDirection = openUp ? 'up' : 'down';
			this._applyDropdownPosition();
		}

		/**
		 * Apply CSS position for the chosen direction and set helper classes.
		 */
		_applyDropdownPosition() {
			this.container.classList.toggle('drop-up', this._dropDirection === 'up');
			this.container.classList.toggle('drop-down', this._dropDirection === 'down');

			if (this._dropDirection === 'up') {
				this.optionsContainer.style.bottom = '100%';
				this.optionsContainer.style.top = 'auto';
			} else {
				this.optionsContainer.style.top = '100%';
				this.optionsContainer.style.bottom = 'auto';
			}
		}

		/**
		 * Compute and apply max-height according to available space and CSS limits.
		 */
		_applyMaxHeight() {
			const rect = this.container.getBoundingClientRect();
			const viewportHeight = window.innerHeight;

			const spaceBelowPx = Math.max(0, viewportHeight - rect.bottom);
			const spaceAbovePx = Math.max(0, rect.top);

			const maxCssRem = this._readMaxHeightRem();
			const rootRemPx = this._rootFontSizePx();

			// Small gutter to avoid touching the viewport edge
			const gutterPx = 8;
			const toRem = (px) => (px / rootRemPx);

			const availablePx = (this._dropDirection === 'up' ? spaceAbovePx : spaceBelowPx) - gutterPx;
			const availableRem = Math.max(0, toRem(availablePx));

			const finalRem = Math.max(0, Math.min(availableRem, maxCssRem));
			this.optionsContainer.style.maxHeight = `${finalRem}rem`;

			// Ensure vertical scrolling if needed
			if (!this.optionsContainer.style.overflowY) {
				this.optionsContainer.style.overflowY = 'auto';
			}
		}

		/* ------------------ Public API ------------------ */

		/**
		 * Update options in place. Keeps current value by default.
		 * @param {Array<{name:string,value?:string,code?:string,disabled?:boolean}>} options
		 * @param {string|null} keepValue null -> keep current; string -> force that value
		 */
		updateOptions(options, keepValue = null) {
			this.options = this._normalizeOptions(options);
			const target = keepValue === null ? this.getValue() : String(keepValue);
			this._renderOptions();

			// Restore selection if possible; fallback to first option
			const found = this._optFromAny(target) || this.options[0] || { name: 'Select Option', value: '' };
			this.selected.textContent = found.name;
			this.selected.dataset.value = found.value;
		}

		/**
		 * Programmatically set value (triggers callback by default).
		 * @param {string} value
		 * @param {{trigger?:boolean}} opts
		 */
		setValue(value, { trigger = true } = {}) {
			const opt = this._optFromAny(value);
			if (!opt || opt.disabled) return;
			const prev = this.getValue();

			this.selected.textContent = opt.name;
			this.selected.dataset.value = opt.value;

			// Refresh option highlight
			this.optionsContainer.querySelectorAll('.breezium-option').forEach(el => {
				el.classList.toggle('is-selected', el.dataset.value === opt.value);
			});

			if (trigger && prev !== opt.value) this.callback(opt.value);
		}

		/** @returns {string} current value */
		getValue() { return this.selected?.dataset?.value ?? ''; }

		/** @returns {string} current label */
		getLabel() { return this.selected?.textContent ?? ''; }

		/**
		 * Select option from list (usually by click).
		 * Internal to ensure unified callback/closing.
		 */
		_selectOptionInternal(option, trigger = true) {
			this.setValue(option.value, { trigger });
			this.close();
		}

		/** Open dropdown. Auto-chooses direction and applies max-height. */
		open() {
			this._decideDirection();
			this._applyMaxHeight();
			this.container.classList.add('show');
		}

		/** Close dropdown. */
		close() { this.container.classList.remove('show'); }

		/** Toggle dropdown. */
		toggle() { this.isOpen() ? this.close() : this.open(); }

		/** @returns {boolean} whether dropdown is open */
		isOpen() { return this.container.classList.contains('show'); }

		/**
		 * Mount into DOM.
		 * @param {HTMLElement} parent
		 * @param {HTMLElement|null} sibling  Insert before/after this node if provided
		 * @param {boolean} insertAfter       true -> insert after sibling; false -> before
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

		/** Clean up listeners and remove DOM. */
		destroy() {
			document.removeEventListener('click', this._boundDocClick);
			window.removeEventListener('resize', this._boundRecalc, { passive: true });
			window.removeEventListener('scroll', this._boundRecalc, { passive: true });
			this.container.remove();
		}
	}

	window.BreeziumSelect = BreeziumSelect;
}