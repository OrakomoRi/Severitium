(function () {
	'use strict';

	// ===== VARIABLES DEFINITION =====

	const VARS = [
		{
			key: '--severitium-main-color',
			label: 'Main theme color',
			type: 'color',
			placeholder: 'rgb(233, 67, 67) | #e94343',
			pattern: null,
			normalize: (v) => v.trim()
		},
		{
			key: '--severitium-border-radius',
			label: 'Border radius',
			type: 'length',
			placeholder: '0.25 | 0.5 | 1',
			pattern: /^(\d+(\.\d+)?|\.\d+)$/,
			normalize: (v) => v.trim()
		},
		{
			key: '--severitium-tab-background',
			label: 'In-battle tab background',
			type: 'color',
			placeholder: 'rgba(0, 0, 0, .5) | #00000080',
			pattern: null,
			normalize: (v) => v.trim()
		},
	];

	// ===== CONFIG =====

	const CONFIG = {
		THEME_STORAGE_KEY: 'SeveritiumThemes',
		THEME_MODULE: 'SeveritiumSettingsTab',
	};

	// ===== CONSTS =====

	const SELECTORS = {
		menuContainer: '.SettingsMenuComponentStyle-blockMenuOptions',
		contentContainer: '.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu',
		menuItem: '.SettingsMenuComponentStyle-menuItemOptions',
		container: '.SettingsComponentStyle-blockContentOptions',
	};

	// ===== STATE =====

	let state = {
		themeMenuItem: null,
		isThemeTabActive: false,
		previousActiveTabText: null,
	};

	// ===== TRANSLATIONS =====

	const TRANSLATIONS = {
		en: {
			'Main theme color': 'Main theme color',
			'Border radius': 'Border radius',
			'In-battle tab background': 'In-battle tab background',
			'Theme Settings': 'Theme Settings',
			'Create New Theme': 'Create New Theme',
			'Delete Theme': 'Delete Theme',
			'Cancel': 'Cancel',
			'Delete': 'Delete',
			'Are you sure you want to delete this theme?': 'Are you sure you want to delete this theme?',
			'This action cannot be undone.': 'This action cannot be undone.',
			'Theme': 'Theme'
		},
		ru: {
			'Main theme color': 'Основной цвет темы',
			'Border radius': 'Радиус границ',
			'In-battle tab background': 'Фон таба в бою',
			'Theme Settings': 'Настройки темы',
			'Create New Theme': 'Создать новую тему',
			'Delete Theme': 'Удалить тему',
			'Cancel': 'Отмена',
			'Delete': 'Удалить',
			'Are you sure you want to delete this theme?': 'Вы уверены, что хотите удалить эту тему?',
			'This action cannot be undone.': 'Это действие нельзя отменить.',
			'Theme': 'Тема'
		},
		hy: {
			'Main theme color': 'Հիմնական գույնի թեմա',
			'Border radius': 'Եզրի շառավիղ',
			'In-battle tab background': 'Պատերազմի ընթացքում Tab-ի ֆոն',
			'Theme Settings': 'Թեմայի կարգավորումներ',
			'Create New Theme': 'Ստեղծել նոր թեմա',
			'Delete Theme': 'Ջնջել թեման',
			'Cancel': 'Չեղարկել',
			'Delete': 'Ջնջել',
			'Are you sure you want to delete this theme?': 'Վստա՞հ եք, որ ուզում եք ջնջել այս թեման:',
			'This action cannot be undone.': 'Այս գործողությունը հնարավոր չէ չեղարկել:',
			'Theme': 'Թեմա'
		},
		es: {
			'Main theme color': 'Color principal del tema',
			'Border radius': 'Radio del borde',
			'In-battle tab background': 'Fondo del tab en batalla',
			'Theme Settings': 'Configuración del tema',
			'Create New Theme': 'Crear nuevo tema',
			'Delete Theme': 'Eliminar tema',
			'Cancel': 'Cancelar',
			'Delete': 'Eliminar',
			'Are you sure you want to delete this theme?': '¿Estás seguro de que quieres eliminar este tema?',
			'This action cannot be undone.': 'Esta acción no se puede deshacer.',
			'Theme': 'Tema'
		},
		pl: {
			'Main theme color': 'Główny kolor motywu',
			'Border radius': 'Promień obramowania',
			'In-battle tab background': 'Tło taba w bitwie',
			'Theme Settings': 'Ustawienia motywu',
			'Create New Theme': 'Utwórz nowy motyw',
			'Delete Theme': 'Usuń motyw',
			'Cancel': 'Anuluj',
			'Delete': 'Usuń',
			'Are you sure you want to delete this theme?': 'Czy na pewno chcesz usunąć ten motyw?',
			'This action cannot be undone.': 'Tej czynności nie można cofnąć.',
			'Theme': 'Motyw'
		},
		pt: {
			'Main theme color': 'Cor principal do tema',
			'Border radius': 'Raio da borda',
			'In-battle tab background': 'Fundo do tab em batalha',
			'Theme Settings': 'Configurações do tema',
			'Create New Theme': 'Criar novo tema',
			'Delete Theme': 'Excluir tema',
			'Cancel': 'Cancelar',
			'Delete': 'Excluir',
			'Are you sure you want to delete this theme?': 'Tem certeza de que deseja excluir este tema?',
			'This action cannot be undone.': 'Esta ação não pode ser desfeita.',
			'Theme': 'Tema'
		},
		de: {
			'Main theme color': 'Hauptfarbe des Themas',
			'Border radius': 'Rahmenradius',
			'In-battle tab background': 'Tab-Hintergrund im Gefecht',
			'Theme Settings': 'Theme-Einstellungen',
			'Create New Theme': 'Neues Theme erstellen',
			'Delete Theme': 'Theme löschen',
			'Cancel': 'Abbrechen',
			'Delete': 'Löschen',
			'Are you sure you want to delete this theme?': 'Sind Sie sicher, dass Sie dieses Theme löschen möchten?',
			'This action cannot be undone.': 'Diese Aktion kann nicht rückgängig gemacht werden.',
			'Theme': 'Theme'
		},
		fr: {
			'Main theme color': 'Couleur principale du thème',
			'Border radius': 'Rayon de la bordure',
			'In-battle tab background': 'Fond de l’onglet en combat',
			'Theme Settings': 'Paramètres du thème',
			'Create New Theme': 'Créer un nouveau thème',
			'Delete Theme': 'Supprimer le thème',
			'Cancel': 'Annuler',
			'Delete': 'Supprimer',
			'Are you sure you want to delete this theme?': 'Êtes-vous sûr de vouloir supprimer ce thème ?',
			'This action cannot be undone.': 'Cette action ne peut pas être annulée.',
			'Theme': 'Thème'
		},
		ja: {
			'Main theme color': 'メインテーマカラー',
			'Border radius': 'ボーダー半径',
			'In-battle tab background': '戦闘中のタブ背景',
			'Theme Settings': 'テーマ設定',
			'Create New Theme': '新しいテーマを作成',
			'Delete Theme': 'テーマを削除',
			'Cancel': 'キャンセル',
			'Delete': '削除',
			'Are you sure you want to delete this theme?': 'このテーマを削除してもよろしいですか？',
			'This action cannot be undone.': 'この操作は取り消すことができません。',
			'Theme': 'テーマ'
		},
		uk: {
			'Main theme color': 'Основний колір теми',
			'Border radius': 'Радіус меж',
			'In-battle tab background': 'Фон таба в бою',
			'Theme Settings': 'Налаштування теми',
			'Create New Theme': 'Створити нову тему',
			'Delete Theme': 'Видалити тему',
			'Cancel': 'Скасувати',
			'Delete': 'Видалити',
			'Are you sure you want to delete this theme?': 'Ви впевнені, що хочете видалити цю тему?',
			'This action cannot be undone.': 'Цю дію неможливо скасувати.',
			'Theme': 'Тема'
		}
	};

	// ===== EVENTS =====

	const saveThemes = new CustomEvent('theme:savethemes');

	window.addEventListener('beforeunload', () => {
		window.dispatchEvent(saveThemes);
	});

	// ===== UTILITIES =====

	const Utils = {
		getLocale: () => {
			const urlLang = new URLSearchParams(document.location.search).get('locale');
			if (urlLang) return urlLang.toLowerCase();

			const storedLang = window.localStorage.getItem('language_store_key');
			if (storedLang) return storedLang.toLowerCase();

			return window.navigator.language.split('-')[0].toLowerCase();
		},

		t: (key) => {
			const locale = Utils.getLocale();
			return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;
		},

		nowTs: () => Date.now(),

		uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
			const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		}),

		// Get or create the SeveritiumTheme style element
		getThemeStyleElement: () => {
			let styleEl = document.querySelector('style[data-resource="SeveritiumTheme"]');
			if (!styleEl) {
				styleEl = document.createElement('style');
				styleEl.setAttribute('data-resource', 'SeveritiumTheme');
				document.head.appendChild(styleEl);
			}
			return styleEl;
		},

		// Update CSS variables in the SeveritiumTheme style element
		applyVars: (vars) => {
			const styleEl = Utils.getThemeStyleElement();
			let cssText = styleEl.textContent || '';
			
			// Parse existing CSS to extract current variables
			const rootMatch = cssText.match(/:root\s*\{([^}]*)\}/);
			let existingVars = {};
			
			if (rootMatch) {
				const varsText = rootMatch[1];
				// Extract CSS variables
				const varMatches = varsText.matchAll(/--([^:]+):\s*([^;]+);?/g);
				for (const match of varMatches) {
					existingVars[`--${match[1].trim()}`] = match[2].trim();
				}
			}
			
			// Merge with new variables
			Object.assign(existingVars, vars || {});
			
			// Build new CSS
			const varsCSS = Object.entries(existingVars)
				.map(([key, value]) => `  ${key}: ${value};`)
				.join('\n');
			
			const newCSS = `:root {\n${varsCSS}\n}`;
			
			// Update style element
			styleEl.textContent = newCSS;
		},

		applyVariable: (variable, value) => {
			Utils.applyVars({ [variable]: value });
		},
	};

	// ====== STORAGE ======

	const Storage = {
		load: () => {
			const data = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
			if (!data) return null;

			try {
				const parsed = JSON.parse(data);
				// Check if default theme existsН
				return !parsed.themes?.default ? null : parsed;
			} catch (error) {
				return null;
			}
		},

		save: (data) => {
			localStorage.setItem(CONFIG.THEME_STORAGE_KEY, JSON.stringify(data));
			window.dispatchEvent(saveThemes);
		},
	};

	// ===== THEME MANAGEMENT =====

	const ThemeManager = {
		getById: (store, id) => {
			return store?.themes?.[id] || null;
		},

		cloneAsNew: (store, sourceThemeId = null, name = null) => {
			// If no source specified, use active theme or fallback to default
			const baseId = sourceThemeId || store.active || 'default';
			const base = ThemeManager.getById(store, baseId) || ThemeManager.getById(store, 'default');
			if (!base) return null;

			const d = new Date();
			const human = `Theme_${d.toLocaleDateString('ru-RU')}-${d.toLocaleTimeString('ru-RU', { hour12: false })}`;
			const theme = {
				id: Utils.uuid(),
				name: name || human,
				timestamp: Utils.nowTs(),
				variables: { ...base.variables }
			};

			store.themes[theme.id] = theme;
			store.active = theme.id;
			return theme;
		},

		deleteTheme: (store, themeId) => {
			if (!themeId || themeId === 'default') return false;

			if (store.themes[themeId]) {
				delete store.themes[themeId];

				// Check if active theme is being deleted -> switch to default
				if (store.active === themeId) {
					store.active = 'default';
				}

				return true;
			}

			return false;
		},

		setVariable: (varName, value) => {
			let store = Storage.load();
			if (!store) return;
			let activeTheme = ThemeManager.getById(store, store.active);

			// If no active theme or active is default -> clone default as new
			if (!activeTheme || activeTheme.id === 'default') {
				activeTheme = ThemeManager.cloneAsNew(store, 'default');
				if (!activeTheme) return;
				Storage.save(store);
				UI.mountOrUpdateSelect(store);
				
				// Update interface to reflect new active theme
				UI.updateThemeInterface(activeTheme);

				// Rebind events for edit buttons
				setTimeout(() => {
					UI.rebindRenameEvents();
				}, 0);
			}

			activeTheme.variables[varName] = value;
			activeTheme.timestamp = Utils.nowTs();
			Storage.save(store);
			Utils.applyVars(activeTheme.variables);
		},
	};

	// ===== UI =====

	const UI = {
		inputsByKey: new Map(),
		selectInstance: null,
		renameState: {
			originalName: '',
			isEditing: false
		},
		eventHandlers: new Map(), // Store event handlers for cleanup

		// Event management utilities
		bindEvent(element, event, handler, key = null) {
			if (!element) return;
			
			// Remove existing handler if key provided
			if (key) {
				this.unbindEvent(element, event, key);
			}
			
			element.addEventListener(event, handler);
			
			// Store handler reference for cleanup
			if (key) {
				this.eventHandlers.set(`${key}_${event}`, { element, event, handler });
			}
		},

		unbindEvent(element, event, key) {
			const handlerKey = `${key}_${event}`;
			const stored = this.eventHandlers.get(handlerKey);
			
			if (stored && stored.element === element) {
				element.removeEventListener(event, stored.handler);
				this.eventHandlers.delete(handlerKey);
			}
		},

		showConfirmModal(title, message, onConfirm, onCancel = null) {
			// Remove existing modal if present
			const existingModal = document.querySelector('.ThemeModalComponentStyle-RootHover');
			if (existingModal) {
				existingModal.remove();
			}

			const modal = document.createElement('div');
			modal.className = 'ThemeModalComponentStyle-RootHover';
			modal.innerHTML = `
				<div class="ThemeModalComponentStyle-container">
					<h3 class="ThemeModalComponentStyle-title">${title}</h3>
					<p class="ThemeModalComponentStyle-text">${message}</p>
					<div class="ThemeModalComponentStyle-actionsContainer">
						<button class="ThemeModalComponentStyle-actionButton ThemeModalComponentStyle-grayActionButton" data-action="cancel"><span>${Utils.t('Cancel')}</span></button>
						<button class="ThemeModalComponentStyle-actionButton ThemeModalComponentStyle-redActionButton" data-action="confirm"><span>${Utils.t('Delete')}</span></button>
					</div>
				</div>
			`;

			const modalRoot = document.querySelector('#modal-root') || document.body;

			modalRoot.appendChild(modal);

			// Show modal
			requestAnimationFrame(() => {
				modal.classList.add('show');
			});

			// Handlers
			const handleAction = (action) => {
				modal.classList.remove('show');
				setTimeout(() => {
					modal.remove();
				}, 200);

				if (action === 'confirm' && onConfirm) {
					onConfirm();
				} else if (action === 'cancel' && onCancel) {
					onCancel();
				}
			};

			modal.querySelector('[data-action="confirm"]').addEventListener('click', () => handleAction('confirm'));
			modal.querySelector('[data-action="cancel"]').addEventListener('click', () => handleAction('cancel'));

			// Close on overlay click
			modal.addEventListener('click', (e) => {
				if (e.target === modal) {
					handleAction('cancel');
				}
			});

			// Close on Escape
			const handleKeydown = (e) => {
				if (e.key === 'Escape') {
					handleAction('cancel');
					document.removeEventListener('keydown', handleKeydown);
				}
			};

			document.addEventListener('keydown', handleKeydown);
		},

		createThemeContent() {
			const store = Storage.load();
			if (!store) return;
			const active = ThemeManager.getById(store, store.active) || ThemeManager.getById(store, 'default');

			Utils.applyVars(active.variables);

			const el = document.createElement('div');
			el.className = 'SettingsComponentStyle-scrollingMenu';
			el.setAttribute('data-content', 'theme');

			el.innerHTML = `
				<div class="ThemeSettingsComponentStyle-settingsTab">
					<p class="AccountSettingsComponentStyle-textHeadlineOptions">${Utils.t('Theme Settings')}</p>

					<div class="ThemeSettingsComponentStyle-row" data-select="theme-select-container"></div>

					<div class="ThemeSettingsComponentStyle-row">
						<button class="ThemeSettingsComponentStyle-actionButton ThemeSettingsComponentStyle-greenActionButton" data-button="new-theme-button">
							<span>${Utils.t('Create New Theme')}</span>
						</button>
						<button class="ThemeSettingsComponentStyle-actionButton ThemeSettingsComponentStyle-redActionButton ${active.id === 'default' ? 'ThemeButtonComponentStyle-disabled' : ''}" data-button="delete-theme-button">
							<span>${Utils.t('Delete Theme')}</span>
						</button>
					</div>

					<div class="ThemeSettingsComponentStyle-row ThemeSettingsComponentStyle-header">
					<input class="ThemeSettingsComponentStyle-nameInput ${active.id === 'default' ? 'disabled' : ''}" data-input="rename-input" type="text" value="${active.name}" readonly/>
						<div class="ThemeSettingsComponentStyle-headerActions">
							${active.id !== 'default' ? `
								<div class="ThemeSettingsComponentStyle-squareActionButton ThemeSettingsComponentStyle-goldActionButton visible" data-button="rename-edit-button">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M498.5 77.85a244.3 244.3 0 0 0-64.35-64.35l-.22-.14C398-10.43 341.48.18 313.21 24.59l-.14.12c-2.7 2.38-12.47 11.16-21.08 18.91l-11.36 10.2-.17.15-22.39 20.45-.12.11C210.15 118.94 79.33 251.86 20.2 315a19.5 19.5 0 0 0-2.09 2.68 55.3 55.3 0 0 0-8.39 26.22c-1.51 22.1-3.36 44.33-5.15 65.87C3 429.28 1.42 447.71.14 465.75c-1 13.18 3.27 25.28 12 34.05A42.15 42.15 0 0 0 42.48 512c1.24 0 2.49-.05 3.75-.14 18.05-1.28 36.48-2.81 56-4.43 21.54-1.79 43.82-3.64 65.92-5.15a55.4 55.4 0 0 0 26.2-8.39 19.5 19.5 0 0 0 2.65-2.09c63.11-59.12 196-189.94 240.45-237.75l.11-.12L458 231.54l.15-.17L468.4 220c7.74-8.61 16.52-18.37 18.9-21.08l.11-.13c24.41-28.27 35-84.8 11.23-120.72zM99.08 469.58c-19.42 1.61-37.75 3.13-55.58 4.39h-.13c-1.94.15-3.51-.23-4.32-1s-1.18-2.38-1-4.32a.6.6 0 0 1 0-.13c1.26-17.83 2.78-36.17 4.39-55.59 1.69-20.3 3.42-41.26 4.89-62.18a24.5 24.5 0 0 1 3 6.38 2 2 0 0 0 .07.23c5.51 18 23.06 32.7 41.72 35h.24c12.59 1.36 25.78 14.55 27.14 27.14v.24c2.26 18.66 17 36.2 35 41.72l.24.07a24.8 24.8 0 0 1 6.65 3.17c-21 1.45-41.98 3.19-62.31 4.88m310.51-241.32c-39.23 42.21-148.16 149.8-215.78 214.28a66.7 66.7 0 0 0-28.27-17.44c-3.59-1.14-7.82-6.18-8.32-9.89-3.35-30.13-30.49-57.26-60.61-60.62-3.72-.49-8.75-4.72-9.9-8.31a66.5 66.5 0 0 0-17.25-28.09c64.48-67.62 172.07-176.56 214.29-215.78L306 82.09l1.55-1.38a786 786 0 0 1 65.13 58.57 788 788 0 0 1 58.62 65.18l-1.39 1.54zm49.12-54.35c-.39.45-1 1.11-1.71 1.92a834 834 0 0 0-57.47-63.41A836 836 0 0 0 336.17 55l1.92-1.72c18.81-16.16 56.46-20.35 74.77-8.28A203.7 203.7 0 0 1 467 99.14c12.07 18.32 7.88 55.97-8.29 74.77"/></svg>
								</div>
								<div class="ThemeSettingsComponentStyle-squareActionButton ThemeSettingsComponentStyle-greenActionButton hidden" data-button="rename-apply-button">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2L210.1 439.4c-10 10-26.2 10-36.2 0z"/></svg>
								</div>
								<div class="ThemeSettingsComponentStyle-squareActionButton ThemeSettingsComponentStyle-redActionButton hidden" data-button="rename-cancel-button">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M242.7 256l100.1-100.1c12.3-12.3 12.3-32.2 0-44.5l-22.2-22.2c-12.3-12.3-32.2-12.3-44.5 0L176 189.3 75.9 89.2c-12.3-12.3-32.2-12.3-44.5 0L9.2 111.4c-12.3 12.3-12.3 32.2 0 44.5L109.3 256 9.2 356.1c-12.3 12.3-12.3 32.2 0 44.5l22.2 22.2c12.3 12.3 32.2 12.3 44.5 0L176 322.7l100.1 100.1c12.3 12.3 32.2 12.3 44.5 0l22.2-22.2c12.3-12.3 12.3-32.2 0-44.5L242.7 256z"/></svg>
								</div>
							` : ''}
						</div>
					</div>

					<div class="ThemeSettingsComponentStyle-variableGrid"></div>
				</div>
			`;

			this.setupElements(el, active, store);
			return el;
		},

		setupElements(el, active, store) {
			const elements = {
				newBtn: el.querySelector('[data-button="new-theme-button"]'),
				deleteBtn: el.querySelector('[data-button="delete-theme-button"]'),
				renameInput: el.querySelector('[data-input="rename-input"]'),
				renameEdit: el.querySelector('[data-button="rename-edit-button"]'),
				renameApply: el.querySelector('[data-button="rename-apply-button"]'),
				renameCancel: el.querySelector('[data-button="rename-cancel-button"]'),
				varsGrid: el.querySelector('.ThemeSettingsComponentStyle-variableGrid'),
				selectContainer: el.querySelector('[data-select="theme-select-container"]'),
			};

			this.renderInputs(elements.varsGrid, active);
			this.mountOrUpdateSelect(store, elements.selectContainer);
			this.bindEvents(elements, store);
		},

		renderInputs(varsGrid, theme) {
			varsGrid.innerHTML = '';
			this.inputsByKey.clear();			

			VARS.forEach(def => {
				const wrap = document.createElement('div');
				wrap.className = 'ThemeInputComponentStyle-wrapper';

				if (def.type === 'length') {
					wrap.innerHTML = `
						<label>${Utils.t(def.label)}</label>
						<div class="ThemeInputComponentStyle-inputWithHelper">
							<input data-input="${def.key}" class="ThemeSettingsComponentStyle-input" data-input-type="length" type="text" placeholder="${def.placeholder || ''}" inputmode="decimal">
							<span class="ThemeInputComponentStyle-inputHelper">rem</span>
						</div>
					`;
				} else {
					wrap.innerHTML = `
						<label>${Utils.t(def.label)}</label>
						<input data-input="${def.key}" class="ThemeSettingsComponentStyle-input" data-input-type="${def.type}" type="text" ${def.type === 'color' ? 'data-coloris data-variable="' + def.key + '"' : ''} placeholder="${def.placeholder || ''}" inputmode="text" ${def.type === 'color' ? 'readonly' : ''}>
					`;
				}

				const inputEl = wrap.querySelector('input');
				if (def.type === 'color') {
					inputEl.classList.add('coloris-input');
				}

				// Set initial value
				let displayValue = theme.variables?.[def.key] ?? '';
				if (def.type === 'length' && displayValue.endsWith('rem')) {
					displayValue = displayValue.replace(/rem$/, '');
				}
				inputEl.value = displayValue;

				// Changes handler
				const inputHandler = (e) => {
					let value = String(e.target.value || '');
					if (def.normalize) value = def.normalize(value);
					if (def.pattern && value && !def.pattern.test(value)) return;

					if (def.type === 'length' && value) {
						ThemeManager.setVariable(def.key, value + 'rem');
					} else {
						ThemeManager.setVariable(def.key, value);
					}
				};
				
				// Save reference for later removal if needed
				inputEl._themeInputHandler = inputHandler;
				inputEl.addEventListener('input', inputHandler);

				this.inputsByKey.set(def.key, inputEl);
				varsGrid.appendChild(wrap);
			});
		},

		setupColorPicker() {
			if (typeof window.Coloris !== 'undefined') {
				Coloris({
					el: '.coloris-input',
					theme: 'polaroid',
					themeMode: 'dark',
					formatToggle: true,
					onChange: (color, input) => {
						if (!input?.dataset?.variable) return;
						const varName = input.dataset.variable;
						input.value = color;
						ThemeManager.setVariable(varName, color);
					}
				});
			} else {
				// console.log('Coloris not found');
			}
		},

		buildSelectOptions(store) {
			return Object.values(store.themes).map(t => ({ name: t.name, value: t.id }));
		},

		mountOrUpdateSelect(store, container = null) {
			const parent = container || document.querySelector('[data-select="theme-select-container"]');
			if (!parent) return;

			const opts = this.buildSelectOptions(store);
			const current = store.themes[store.active] || store.themes.default;

			// Check if we can just update existing select
			if (this.selectInstance && 
				typeof this.selectInstance.updateOptions === 'function' &&
				document.contains(parent.querySelector('.breezium-select'))) {
				this.selectInstance.updateOptions(opts, store.active);
				if (typeof this.selectInstance.setValue === 'function') {
					this.selectInstance.setValue(current.id, { trigger: false });
				}
				return;
			}

			// Remove previous instance if any
			this.selectInstance = null;

			// Initial setup
			this.selectInstance = new window.BreeziumSelect(
				opts,
				(val) => this.onSelectChange(val),
				{ name: current?.name ?? 'Default', value: current?.id ?? 'default' }
			);

			// Clear container and render select
			parent.innerHTML = '';
			this.selectInstance.render(parent, null, false);
		},

		onSelectChange(themeId) {
			const store = Storage.load();
			if (!store) return;

			store.active = themeId;
			Storage.save(store);

			const chosen = store.themes[themeId];
			if (chosen?.variables) {
				Utils.applyVars(chosen.variables);
			}

			// Update interface
			this.updateThemeInterface(chosen);

			// Update variable inputs using optimized method
			this.updateInputValues(chosen);

			// Rebind events if buttons were recreated
			setTimeout(() => {
				const hasButtons = document.querySelector('[data-button="rename-edit-button"]');
				if (hasButtons && chosen.id !== 'default') {
					this.rebindRenameEvents();
				}
			}, 0);
		},

		bindEvents(elements, store) {
			// Create new theme button
			this.bindEvent(elements.newBtn, 'click', () => {
				const store = Storage.load();
				if (!store) return;

				const newTheme = ThemeManager.cloneAsNew(store);
				if (!newTheme) return;

				Storage.save(store);
				this.mountOrUpdateSelect(store, elements.selectContainer);
				this.updateThemeInterface(newTheme);
				Utils.applyVars(newTheme.variables);
				this.updateInputValues(newTheme);

				// Initialize rename handlers for new theme
				setTimeout(() => this.initRenameHandlers(elements), 0);
			}, 'new_theme');

			// Delete theme button
			this.bindEvent(elements.deleteBtn, 'click', (e) => {
				const store = Storage.load();
				if (!store) return;

				const activeTheme = ThemeManager.getById(store, store.active);
				if (!activeTheme || activeTheme.id === 'default') {
					e.preventDefault();
					return;
				}

				if (elements.deleteBtn.classList.contains('ThemeButtonComponentStyle-disabled')) {
					e.preventDefault();
					return;
				}

				this.showConfirmModal(
					Utils.t('Delete Theme'),
					`${Utils.t('Are you sure you want to delete this theme?')} <span class="ThemeModalComponentStyle-highlightedText">${activeTheme.name}</span>? ${Utils.t('This action cannot be undone.')}`,
					() => {
						if (ThemeManager.deleteTheme(store, activeTheme.id)) {
							Storage.save(store);
							this.mountOrUpdateSelect(store, elements.selectContainer);

							const defaultTheme = ThemeManager.getById(store, 'default');
							if (defaultTheme) {
								Utils.applyVars(defaultTheme.variables);
								this.updateInputValues(defaultTheme);
								this.updateThemeInterface(defaultTheme);
							}
						}
					}
				);
			}, 'delete_theme');

			// Initialize rename handlers
			this.initRenameHandlers(elements);
		},

		updateThemeInterface(theme) {
			const renameInput = document.querySelector('[data-input="rename-input"]');
			const deleteBtn = document.querySelector('[data-button="delete-theme-button"]');
			const actionsContainer = document.querySelector('.ThemeSettingsComponentStyle-headerActions');

			if (renameInput) {
				renameInput.value = theme.name;
				renameInput.readOnly = true;

				// Clearing previous states
				renameInput.classList.remove('editing', 'disabled');

				// Adding necessary state
				if (theme.id === 'default') {
					renameInput.classList.add('disabled');
				}
			}

			if (deleteBtn) {
				if (theme.id === 'default') {
					deleteBtn.classList.add('ThemeButtonComponentStyle-disabled');
				} else {
					deleteBtn.classList.remove('ThemeButtonComponentStyle-disabled');
				}
			}

			if (actionsContainer) {
				if (theme.id === 'default') {
					actionsContainer.innerHTML = '';
				} else {
					// Recreate buttons if missing
					let editBtn = actionsContainer.querySelector('[data-button="rename-edit-button"]');
					let applyBtn = actionsContainer.querySelector('[data-button="rename-apply-button"]');
					let cancelBtn = actionsContainer.querySelector('[data-button="rename-cancel-button"]');

					if (!editBtn || !applyBtn || !cancelBtn) {
						// console.log('Creating rename buttons for theme:', theme.name);
						actionsContainer.innerHTML = `
							<div class="ThemeSettingsComponentStyle-squareActionButton ThemeSettingsComponentStyle-goldActionButton visible" data-button="rename-edit-button">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M498.5 77.85a244.3 244.3 0 0 0-64.35-64.35l-.22-.14C398-10.43 341.48.18 313.21 24.59l-.14.12c-2.7 2.38-12.47 11.16-21.08 18.91l-11.36 10.2-.17.15-22.39 20.45-.12.11C210.15 118.94 79.33 251.86 20.2 315a19.5 19.5 0 0 0-2.09 2.68 55.3 55.3 0 0 0-8.39 26.22c-1.51 22.1-3.36 44.33-5.15 65.87C3 429.28 1.42 447.71.14 465.75c-1 13.18 3.27 25.28 12 34.05A42.15 42.15 0 0 0 42.48 512c1.24 0 2.49-.05 3.75-.14 18.05-1.28 36.48-2.81 56-4.43 21.54-1.79 43.82-3.64 65.92-5.15a55.4 55.4 0 0 0 26.2-8.39 19.5 19.5 0 0 0 2.65-2.09c63.11-59.12 196-189.94 240.45-237.75l.11-.12L458 231.54l.15-.17L468.4 220c7.74-8.61 16.52-18.37 18.9-21.08l.11-.13c24.41-28.27 35-84.8 11.23-120.72zM99.08 469.58c-19.42 1.61-37.75 3.13-55.58 4.39h-.13c-1.94.15-3.51-.23-4.32-1s-1.18-2.38-1-4.32a.6.6 0 0 1 0-.13c1.26-17.83 2.78-36.17 4.39-55.59 1.69-20.3 3.42-41.26 4.89-62.18a24.5 24.5 0 0 1 3 6.38 2 2 0 0 0 .07.23c5.51 18 23.06 32.7 41.72 35h.24c12.59 1.36 25.78 14.55 27.14 27.14v.24c2.26 18.66 17 36.2 35 41.72l.24.07a24.8 24.8 0 0 1 6.65 3.17c-21 1.45-41.98 3.19-62.31 4.88m310.51-241.32c-39.23 42.21-148.16 149.8-215.78 214.28a66.7 66.7 0 0 0-28.27-17.44c-3.59-1.14-7.82-6.18-8.32-9.89-3.35-30.13-30.49-57.26-60.61-60.62-3.72-.49-8.75-4.72-9.9-8.31a66.5 66.5 0 0 0-17.25-28.09c64.48-67.62 172.07-176.56 214.29-215.78L306 82.09l1.55-1.38a786 786 0 0 1 65.13 58.57 788 788 0 0 1 58.62 65.18l-1.39 1.54zm49.12-54.35c-.39.45-1 1.11-1.71 1.92a834 834 0 0 0-57.47-63.41A836 836 0 0 0 336.17 55l1.92-1.72c18.81-16.16 56.46-20.35 74.77-8.28A203.7 203.7 0 0 1 467 99.14c12.07 18.32 7.88 55.97-8.29 74.77"/></svg>
							</div>
							<div class="ThemeSettingsComponentStyle-squareActionButton ThemeSettingsComponentStyle-greenActionButton hidden" data-button="rename-apply-button">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2L210.1 439.4c-10 10-26.2 10-36.2 0z"/></svg>
							</div>
							<div class="ThemeSettingsComponentStyle-squareActionButton ThemeSettingsComponentStyle-redActionButton hidden" data-button="rename-cancel-button">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M242.7 256l100.1-100.1c12.3-12.3 12.3-32.2 0-44.5l-22.2-22.2c-12.3-12.3-32.2-12.3-44.5 0L176 189.3 75.9 89.2c-12.3-12.3-32.2-12.3-44.5 0L9.2 111.4c-12.3 12.3-12.3 32.2 0 44.5L109.3 256 9.2 356.1c-12.3 12.3-12.3 32.2 0 44.5l22.2 22.2c12.3 12.3 32.2 12.3 44.5 0L176 322.7l100.1 100.1c12.3 12.3 32.2 12.3 44.5 0l22.2-22.2c12.3-12.3 12.3-32.2 0-44.5L242.7 256z"/></svg>
							</div>
						`;

						// Re-assign events
						this.rebindRenameEvents();
					} else {
						// console.log('Setting button visibility for theme:', theme.name);
						// Show only edit button for non-default themes
						editBtn.classList.remove('hidden');
						editBtn.classList.add('visible');
						applyBtn.classList.remove('visible');
						applyBtn.classList.add('hidden');
						cancelBtn.classList.remove('visible');
						cancelBtn.classList.add('hidden');
					}
				}
			}
		},

		// Rename functionality
		initRenameHandlers(elements) {
			const editHandler = () => this.startRenameMode();
			const applyHandler = () => this.finishRenameMode(true);
			const cancelHandler = () => this.finishRenameMode(false);
			const keyHandler = (e) => {
				if (!this.renameState.isEditing) return;
				
				if (e.key === 'Enter') {
					e.preventDefault();
					this.finishRenameMode(true);
				} else if (e.key === 'Escape') {
					e.preventDefault();
					this.finishRenameMode(false);
				}
			};

			this.bindEvent(elements.renameEdit, 'click', editHandler, 'rename_edit');
			this.bindEvent(elements.renameApply, 'click', applyHandler, 'rename_apply');
			this.bindEvent(elements.renameCancel, 'click', cancelHandler, 'rename_cancel');
			this.bindEvent(elements.renameInput, 'keydown', keyHandler, 'rename_keys');
		},

		startRenameMode() {
			// Get fresh input reference and save original name
			const fresh = this.getFreshElements();
			this.renameState.originalName = fresh.renameInput ? fresh.renameInput.value : '';
			this.renameState.isEditing = true;
			this.enterEditMode(fresh);
		},

		finishRenameMode(save = false) {
			if (!this.renameState.isEditing) return;

			// Get fresh references
			const fresh = this.getFreshElements();

			if (save) {
				// Apply changes
				const store = Storage.load();
				if (!store) return;

				const activeTheme = ThemeManager.getById(store, store.active);
				if (!activeTheme || activeTheme.id === 'default') return;

				const newName = fresh.renameInput ? fresh.renameInput.value.trim() : '';
				if (newName) {
					activeTheme.name = newName;
					activeTheme.timestamp = Utils.nowTs();
					Storage.save(store);
					// Update select
					this.mountOrUpdateSelect(store, fresh.selectContainer);
				} else {
					// If name is empty, restore original
					if (fresh.renameInput) fresh.renameInput.value = this.renameState.originalName;
				}
			} else {
				// Cancel changes - restore original name
				if (fresh.renameInput) fresh.renameInput.value = this.renameState.originalName;
			}

			this.renameState.isEditing = false;
			this.exitEditMode(fresh);
		},

		enterEditMode(elements) {
			// Switch input to edit mode
			if (elements.renameInput) {
				elements.renameInput.readOnly = false;
				elements.renameInput.classList.add('editing');
				elements.renameInput.focus();
				elements.renameInput.select();
			}

			// Switch buttons
			if (elements.renameEdit) {
				elements.renameEdit.classList.remove('visible');
				elements.renameEdit.classList.add('hidden');
			}
			if (elements.renameApply) {
				elements.renameApply.classList.remove('hidden');
				elements.renameApply.classList.add('visible');
			}
			if (elements.renameCancel) {
				elements.renameCancel.classList.remove('hidden');
				elements.renameCancel.classList.add('visible');
			}
		},

		exitEditMode(elements) {
			// Switch input to normal mode
			if (elements.renameInput) {
				elements.renameInput.readOnly = true;
				elements.renameInput.classList.remove('editing');

				// Clear selection and remove focus
				if (elements.renameInput.setSelectionRange) {
					elements.renameInput.setSelectionRange(0, 0);
				}
				elements.renameInput.blur();

				// Also clear any global text selection
				if (window.getSelection) {
					window.getSelection().removeAllRanges();
				}
			}

			// Switch buttons back
			if (elements.renameEdit) {
				elements.renameEdit.classList.remove('hidden');
				elements.renameEdit.classList.add('visible');
			}
			if (elements.renameApply) {
				elements.renameApply.classList.remove('visible');
				elements.renameApply.classList.add('hidden');
			}
			if (elements.renameCancel) {
				elements.renameCancel.classList.remove('visible');
				elements.renameCancel.classList.add('hidden');
			}
		},

		rebindRenameEvents() {
			const elements = {
				renameInput: document.querySelector('[data-input="rename-input"]'),
				renameEdit: document.querySelector('[data-button="rename-edit-button"]'),
				renameApply: document.querySelector('[data-button="rename-apply-button"]'),
				renameCancel: document.querySelector('[data-button="rename-cancel-button"]'),
				selectContainer: document.querySelector('[data-select="theme-select-container"]')
			};

			if (!elements.renameEdit || !elements.renameApply || !elements.renameCancel || !elements.renameInput) {
				return null;
			}

			// Reinitialize rename handlers
			this.initRenameHandlers(elements);
			return elements;
		},

		// Get fresh element references (avoids code duplication)
		getFreshElements() {
			return {
				renameInput: document.querySelector('[data-input="rename-input"]'),
				renameEdit: document.querySelector('[data-button="rename-edit-button"]'),
				renameApply: document.querySelector('[data-button="rename-apply-button"]'),
				renameCancel: document.querySelector('[data-button="rename-cancel-button"]'),
				selectContainer: document.querySelector('[data-select="theme-select-container"]')
			};
		},

		updateColorisValue(input, value) {
			// Directly set the value
			input.value = value;

			// Temporarily disable our handler to prevent a new theme from being created
			const originalHandler = input._themeInputHandler;
			if (originalHandler) {
				input.removeEventListener('input', originalHandler);
			}
			
			// Manually trigger input event to notify Coloris and other listeners
			const event = new Event('input', { bubbles: true });
			input.dispatchEvent(event);
			
			// Re-enable our handler
			if (originalHandler) {
				input.addEventListener('input', originalHandler);
			}
		},

		updateInputValues(theme) {
			VARS.forEach(def => {
				const input = this.inputsByKey.get(def.key);
				if (input) {
					let value = theme.variables?.[def.key] ?? '';
					if (def.type === 'length' && value.endsWith('rem')) {
						value = value.replace(/rem$/, '');
					}
					
					if (def.type === 'color' && value) {
						// Special handling for color inputs with Coloris
						this.updateColorisValue(input, value);
					} else {
						// Default update for other types
						input.value = value;
					}
				}
			});
		},
	};

	// ===== MENU INTEGRATION =====

	const MenuIntegration = {
		getElements() {
			return {
				menuContainer: document.querySelector(SELECTORS.menuContainer),
				contentContainer: document.querySelector(SELECTORS.contentContainer)
			};
		},

		findTabByText(tabText) {
			if (!tabText) return null;
			const menuItems = document.querySelectorAll('.SettingsMenuComponentStyle-menuItemOptions:not([data-module="SeveritiumSettingsTab"])');

			for (const item of menuItems) {
				const span = item.querySelector('span');
				if (span && span.textContent.trim() === tabText) {
					return item;
				}
			}
			return null;
		},

		updateActiveStates(activeElement) {
			document.querySelectorAll(SELECTORS.menuItem)
				.forEach(item => item.classList.remove('SettingsMenuComponentStyle-activeItemOptions'));
			activeElement?.classList.add('SettingsMenuComponentStyle-activeItemOptions');
		},

		showThemeContent() {
			const { contentContainer } = this.getElements();
			if (!contentContainer) return;

			if (!state.isThemeTabActive || !state.previousActiveTabText) {
				const activeTab = document.querySelector('.SettingsMenuComponentStyle-activeItemOptions:not([data-module="SeveritiumSettingsTab"])');
				if (activeTab) {
					const tabSpan = activeTab.querySelector('span');
					state.previousActiveTabText = tabSpan ? tabSpan.textContent.trim() : null;
				}
			}

			contentContainer.setAttribute('data-content', 'old');
			contentContainer.classList.add('content-hidden');
			document.querySelector('.SettingsComponentStyle-scrollingMenu[data-content="theme"]')?.remove();

			const themeContentElement = UI.createThemeContent();
			contentContainer.after(themeContentElement);
			UI.setupColorPicker();

			state.themeMenuItem = document.querySelector(`[data-module="${CONFIG.THEME_MODULE}"]`) || state.themeMenuItem;
			this.updateActiveStates(state.themeMenuItem);
			state.isThemeTabActive = true;
		},

		hideThemeContent() {
			const { contentContainer } = this.getElements();
			if (!contentContainer) return;

			document.querySelector('.SettingsComponentStyle-scrollingMenu[data-content="theme"]')?.remove();
			contentContainer.classList.remove('content-hidden');
			state.themeMenuItem?.classList.remove('SettingsMenuComponentStyle-activeItemOptions');
			state.isThemeTabActive = false;
			
			// Refresh select instance to avoid issues
			UI.selectInstance = null;
		},

		handleMenuClick(e) {
			const item = e.target.closest('.SettingsMenuComponentStyle-menuItemOptions');
			if (!item) return;

			if (item.getAttribute('data-module') === CONFIG.THEME_MODULE) {
				e.preventDefault();
				e.stopPropagation();
				this.showThemeContent();
				return;
			}

			if (state.isThemeTabActive) {
				this.hideThemeContent();
				const clickedTabSpan = item.querySelector('span');
				const clickedTabText = clickedTabSpan ? clickedTabSpan.textContent.trim() : null;

				if (clickedTabText === state.previousActiveTabText) {
					e.preventDefault();
					e.stopPropagation();
					item.classList.add('SettingsMenuComponentStyle-activeItemOptions');
				}
			}
		},

		addDelegation() {
			const { menuContainer } = this.getElements();
			if (!menuContainer) return;
			menuContainer.addEventListener('click', (e) => this.handleMenuClick(e), true);
		},

		createMenuItem() {
			const { menuContainer } = this.getElements();
			if (!menuContainer) return;

			menuContainer.querySelector(`[data-module="${CONFIG.THEME_MODULE}"]`)?.remove();
			const li = document.createElement('li');
			li.className = 'SettingsMenuComponentStyle-menuItemOptions';
			li.innerHTML = `<span>${Utils.t('Theme')}</span>`;
			li.setAttribute('data-module', CONFIG.THEME_MODULE);
			menuContainer.appendChild(li);
		},

		initialize() {
			const { menuContainer, contentContainer } = this.getElements();
			if (!menuContainer || !contentContainer) return;

			this.createMenuItem();
			this.addDelegation();
			if (state.isThemeTabActive) this.showThemeContent();
		}
	};

	// ===== MUTATION OBSERVER =====

	const Observer = {
		processMutations(mutations) {
			mutations.forEach(({ addedNodes, removedNodes }) => {
				addedNodes.forEach(node => {
					if (node.nodeType === 1 &&
						(node.matches?.(SELECTORS.container) || node.querySelector?.(SELECTORS.container))) {
						MenuIntegration.initialize();
						if (state.isThemeTabActive) {
							MenuIntegration.getElements().contentContainer?.classList.add('content-hidden');
						}
					}
				});

				removedNodes.forEach(node => {
					if (node.nodeType === 1 &&
						(node.matches?.(SELECTORS.container) || node.querySelector?.(SELECTORS.container))) {
						state.themeMenuItem = null;
					}
				});
			});
		},

		setup() {
			new MutationObserver(mutations =>
				requestAnimationFrame(() => this.processMutations(mutations))
			).observe(document.body, { childList: true, subtree: true });
		}
	};

	// ===== INITIALIZATION =====

	function init() {
		Observer.setup();
	}

	init();
})();