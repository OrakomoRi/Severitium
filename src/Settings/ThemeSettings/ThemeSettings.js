/**
 * ThemeSettings Module
 * Adds dynamic theme customization to Severitium
 */

class ThemeSettings {
    constructor() {
        this.settingsContainer = null;
        this.menuContainer = null;
        this.isInitialized = false;
        this.storageKey = 'SeveritiumThemeSettings';
        this.defaultVariables = this.getDefaultVariables();
        this.currentVariables = this.loadSettings();
        
        // Initialize theme cache system
        this.themeCache = new (window.SeveritiumThemeCache || class {
            updateThemeCache() { console.warn('ThemeCache not available'); }
            applyThemeVariables() { console.warn('ThemeCache not available'); }
            init() { return null; }
        })();
        
        this.init();
    }

    /**
     * Get default CSS variables - request from userscript via events
     */
    getDefaultVariables() {
        // Try to get from userscript first
        const userscriptVars = this.requestVariablesFromUserscript();
        if (userscriptVars) {
            return userscriptVars;
        }
        
        // Fallback to hardcoded values (backup)
        return this.getFallbackVariables();
    }

    /**
     * Request variables from userscript via custom events (async)
     */
    requestVariablesFromUserscript() {
        return new Promise((resolve) => {
            let variables = null;
            let timeoutId = null;
            
            // Create custom event to request variables
            const requestEvent = new CustomEvent('severitium:requestVariables', {
                detail: { timestamp: Date.now() }
            });
            
            // Listen for response
            const responseHandler = (event) => {
                if (event.detail && (event.detail.variables || event.detail.error)) {
                    clearTimeout(timeoutId);
                    variables = event.detail.variables || {};
                    document.removeEventListener('severitium:variablesResponse', responseHandler);
                    resolve(variables);
                }
            };
            
            document.addEventListener('severitium:variablesResponse', responseHandler);
            
            // Set timeout for response
            timeoutId = setTimeout(() => {
                document.removeEventListener('severitium:variablesResponse', responseHandler);
                console.warn('Severitium: Variables request timed out, using fallback');
                resolve(null);
            }, 2000); // 2 second timeout for async loading
            
            // Dispatch request
            document.dispatchEvent(requestEvent);
        });
    }

    /**
     * Fallback variables (extracted from Variables.css)
     */
    getFallbackVariables() {
        return {
            // Main theme colors
            '--severitium-main-color': 'rgb(233, 67, 67)',
            
            // Theme text colors
            '--severitium-white-text-color': 'rgb(255, 255, 255)',
            '--severitium-dark-white-text-color': 'rgb(225, 225, 225)',
            '--severitium-extra-light-gray-text-color': 'rgb(200, 200, 200)',
            '--severitium-light-gray-text-color': 'rgb(150, 150, 150)',
            '--severitium-black-text-color': 'rgb(0, 0, 0)',
            '--severitium-red-text-color': 'rgb(255, 100, 100)',
            '--severitium-gold-text-color': 'rgb(255, 185, 100)',
            '--severitium-yellow-text-color': 'rgb(225, 205, 75)',
            '--severitium-green-text-color': 'rgb(110, 255, 100)',
            '--severitium-blue-text-color': 'rgb(100, 170, 255)',
            '--severitium-orange-text-color': 'rgb(255, 150, 100)',
            '--severitium-purple-text-color': 'rgb(200, 115, 225)',
            '--severitium-light-blue-text-color': 'rgb(120, 190, 225)',
            
            // Some highlighting colors
            '--severitium-friend-color': 'rgb(202, 104, 219)',
            '--severitium-crystal-color': 'rgb(100, 185, 225)',
            '--severitium-tancoin-color': 'rgb(225, 190, 85)',
            '--severitium-ruby-color': 'rgb(255, 125, 125)',

            // Theme backgrounds
            '--severitium-dark-transparent-background1': 'rgba(0, 0, 0, .5)',
            '--severitium-dark-transparent-background2': 'rgba(0, 0, 0, .25)',
            '--severitium-dark-transparent-background3': 'rgba(0, 0, 0, .1)',
            '--severitium-dark-transparent-background4': 'rgba(0, 0, 0, .75)',
            '--severitium-light-transparent-background1': 'rgba(255, 255, 255, .5)',
            '--severitium-light-transparent-background2': 'rgba(255, 255, 255, .25)',
            '--severitium-light-transparent-background3': 'rgba(255, 255, 255, .1)',
            '--severitium-red-transparent-background1': 'rgba(255, 0, 0, .1)',
            
            // Theme additional colors
            '--severitium-white-color': 'rgb(255, 255, 255)',
            '--severitium-extra-light-gray-color': 'rgb(200, 200, 200)',
            '--severitium-light-gray-color': 'rgb(150, 150, 150)',
            '--severitium-gray-color': 'rgb(100, 100, 100)',
            '--severitium-dark-gray-color': 'rgb(50, 50, 50)',
            '--severitium-black-color': 'rgb(0, 0, 0)',
            '--severitium-light-green-color': 'rgb(75, 255, 58)',
            '--severitium-green-color': 'rgb(75, 200, 75)',
            '--severitium-dark-green-color': 'rgb(62, 121, 62)',
            '--severitium-red-color': 'rgb(225, 75, 75)',
            '--severitium-yellow-color': 'rgb(225, 205, 75)',
            '--severitium-orange-color': 'rgb(225, 165, 75)',
            '--severitium-light-blue-color': 'rgb(75, 162, 225)',
            '--severitium-purple-color': 'rgb(165, 30, 200)',
            '--severitium-blue-color': 'rgb(110, 100, 255)',

            // Theme button colors
            '--severitium-gray-button-background': 'rgba(225, 225, 225, .2)',
            '--severitium-gray-button-color': 'rgb(255, 255, 255)',
            '--severitium-gray-button-border-color': 'rgba(255, 255, 255, .25)',
            '--severitium-gray-button-border-color-hover': 'rgba(255, 255, 255, .75)',
            '--severitium-green-button-background': 'rgba(27, 242, 67, 0.2)',
            '--severitium-green-button-background-hover': 'rgba(27, 242, 67, 0.4)',
            '--severitium-green-button-color': 'rgb(112, 232, 114)',
            '--severitium-green-button-border-color': 'rgba(27, 242, 67, .25)',
            '--severitium-green-button-border-color-hover': 'rgba(27, 242, 67, .75)',
            '--severitium-red-button-background': 'rgba(242, 27, 27, 0.2)',
            '--severitium-red-button-color': 'rgb(255, 148, 148)',
            '--severitium-red-button-border-color': 'rgba(242, 27, 27, .25)',
            '--severitium-red-button-border-color-hover': 'rgba(242, 27, 27, .75)',
            '--severitium-gold-button-background': 'rgba(242, 192, 27, 0.2)',
            '--severitium-gold-button-color': 'rgb(255, 226, 169)',
            '--severitium-gold-button-border-color': 'rgba(242, 192, 27, .25)',
            '--severitium-gold-button-border-color-hover': 'rgba(242, 192, 27, .75)',
            '--severitium-blue-button-background': 'rgba(27, 120, 242, 0.2)',
            '--severitium-blue-button-color': 'rgb(169, 182, 255)',
            '--severitium-blue-button-border-color': 'rgba(27, 120, 242, .25)',
            '--severitium-blue-button-border-color-hover': 'rgba(27, 120, 242, .75)',

            // Theme colors for battle tab
            '--severitium-tab-background': 'rgba(0, 0, 0, .5)',
            '--severitium-tab-main-border-color': 'rgb(150, 150, 150)',
            '--severitium-tab-borders-color': 'rgb(80, 80, 80)',
            '--severitium-tab-borders-hover-color': 'rgb(200, 200, 200)',
            '--severitium-tab-header-border-color': 'rgb(100, 100, 100)',
            '--severitium-tab-other-string-background': 'rgba(50, 50, 50, .25)',
            '--severitium-tab-self-string-background': 'rgba(255, 255, 255, .25)',
            '--severitium-tab-nickname-color': 'rgb(200, 200, 200)',
            '--severitium-tab-nickname-hover-color': 'rgb(255, 255, 255)',
            
            // Theme metrics
            '--severitium-border-radius': '.25em'
        };
    }

    /**
     * Initialize the theme settings module
     */
    init() {
        // Set up debounced cache update
        this.updateCacheDebounced = this.debounce(() => {
            this.themeCache.updateThemeCache(this.currentVariables);
        }, 500);
        
        // Try to load cached theme first
        const cachedTheme = this.themeCache.init();
        if (cachedTheme) {
            // Merge cached theme with current variables
            this.currentVariables = { ...this.currentVariables, ...cachedTheme };
        }
        
        // Wait for the settings page to appear
        this.waitForSettingsPage();
        
        // Apply current settings on init
        this.applyVariables();
    }

    /**
     * Wait for settings page elements to appear
     */
    waitForSettingsPage() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    const settingsBlock = document.querySelector('.SettingsComponentStyle-blockContentOptions');
                    if (settingsBlock && !this.isInitialized) {
                        this.initializeSettingsTab();
                        this.isInitialized = true;
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Initialize the custom settings tab
     */
    initializeSettingsTab() {
        const menuContainer = document.querySelector('.SettingsMenuComponentStyle-blockMenuOptions');
        const contentContainer = document.querySelector('.SettingsComponentStyle-containerBlock .SettingsComponentStyle-scrollingMenu');
        
        if (!menuContainer || !contentContainer) {
            console.warn('Severitium: Settings containers not found');
            return;
        }

        this.menuContainer = menuContainer;
        this.contentContainer = contentContainer;

        // Create menu item
        this.createMenuItem();
    }

    /**
     * Create the theme settings menu item
     */
    createMenuItem() {
        const menuItem = document.createElement('div');
        menuItem.className = 'SettingsMenuComponentStyle-menuItemOptions severitium-theme-settings-menu';
        menuItem.innerHTML = '<span>Тема Severitium</span>';

        // Add click handler (async)
        menuItem.addEventListener('click', async () => {
            try {
                await this.showThemeSettings();
            } catch (error) {
                console.error('Severitium: Error showing theme settings:', error);
                this.contentContainer.innerHTML = '<div class="severitium-error">Ошибка загрузки настроек темы</div>';
            }
        });

        // Insert as the last menu item
        this.menuContainer.appendChild(menuItem);
    }

    /**
     * Show theme settings content (async)
     */
    async showThemeSettings() {
        // Remove active class from other menu items
        const menuItems = this.menuContainer.querySelectorAll('.SettingsMenuComponentStyle-menuItemOptions');
        menuItems.forEach(item => item.classList.remove('activeitem'));

        // Add active class to our item
        const ourMenuItem = this.menuContainer.querySelector('.severitium-theme-settings-menu');
        ourMenuItem.classList.add('activeitem');

        // Clear content and show loading
        this.contentContainer.innerHTML = '<div class="severitium-loading">Загрузка настроек темы...</div>';
        
        // Load variables asynchronously
        await this.initializeVariables();
        
        // Show settings content
        this.createSettingsContent();
    }

    /**
     * Initialize variables asynchronously
     */
    async initializeVariables() {
        try {
            this.logEvent('Loading theme variables...');
            
            // Load default variables
            this.defaultVariables = await this.requestVariablesFromUserscript();
            
            if (!this.defaultVariables) {
                this.logEvent('Warning: Could not load default variables, using fallback');
                this.defaultVariables = {};
            }
            
            // Load user overrides from cache
            this.userOverrides = this.cache.getCachedVariables() || {};
            
            this.logEvent('Theme variables loaded successfully');
        } catch (error) {
            console.error('Severitium: Failed to load theme variables:', error);
            this.defaultVariables = {};
            this.userOverrides = {};
        }
    }

    /**
     * Create the settings content interface
     */
    createSettingsContent() {
        const content = document.createElement('div');
        content.className = 'severitium-theme-settings-content';
        
        content.innerHTML = `
            <div class="AccountSettingsComponentStyle-commonBlock">
                <p class="AccountSettingsComponentStyle-textHeadlineOptions">Настройки темы Severitium</p>
                
                <div class="severitium-settings-section">
                    <h3>Основные цвета</h3>
                    <div class="severitium-color-grid">
                        ${this.createColorInput('--severitium-main-color', 'Основной цвет темы')}
                    </div>
                </div>

                <div class="severitium-settings-section">
                    <h3>Цвета текста</h3>
                    <div class="severitium-color-grid">
                        ${this.createColorInput('--severitium-white-text-color', 'Белый текст')}
                        ${this.createColorInput('--severitium-dark-white-text-color', 'Тёмно-белый текст')}
                        ${this.createColorInput('--severitium-extra-light-gray-text-color', 'Очень светло-серый текст')}
                        ${this.createColorInput('--severitium-light-gray-text-color', 'Светло-серый текст')}
                        ${this.createColorInput('--severitium-red-text-color', 'Красный текст')}
                        ${this.createColorInput('--severitium-gold-text-color', 'Золотой текст')}
                        ${this.createColorInput('--severitium-yellow-text-color', 'Жёлтый текст')}
                        ${this.createColorInput('--severitium-green-text-color', 'Зелёный текст')}
                        ${this.createColorInput('--severitium-blue-text-color', 'Синий текст')}
                        ${this.createColorInput('--severitium-orange-text-color', 'Оранжевый текст')}
                        ${this.createColorInput('--severitium-purple-text-color', 'Фиолетовый текст')}
                        ${this.createColorInput('--severitium-light-blue-text-color', 'Светло-синий текст')}
                    </div>
                </div>

                <div class="severitium-settings-section">
                    <h3>Специальные цвета</h3>
                    <div class="severitium-color-grid">
                        ${this.createColorInput('--severitium-friend-color', 'Цвет друзей')}
                        ${this.createColorInput('--severitium-crystal-color', 'Цвет кристаллов')}
                        ${this.createColorInput('--severitium-tancoin-color', 'Цвет танкоинов')}
                        ${this.createColorInput('--severitium-ruby-color', 'Цвет рубинов')}
                    </div>
                </div>

                <div class="severitium-settings-section">
                    <h3>Дополнительные цвета</h3>
                    <div class="severitium-color-grid">
                        ${this.createColorInput('--severitium-white-color', 'Белый')}
                        ${this.createColorInput('--severitium-light-gray-color', 'Светло-серый')}
                        ${this.createColorInput('--severitium-gray-color', 'Серый')}
                        ${this.createColorInput('--severitium-dark-gray-color', 'Тёмно-серый')}
                        ${this.createColorInput('--severitium-black-color', 'Чёрный')}
                        ${this.createColorInput('--severitium-green-color', 'Зелёный')}
                        ${this.createColorInput('--severitium-red-color', 'Красный')}
                        ${this.createColorInput('--severitium-yellow-color', 'Жёлтый')}
                        ${this.createColorInput('--severitium-orange-color', 'Оранжевый')}
                        ${this.createColorInput('--severitium-light-blue-color', 'Светло-синий')}
                        ${this.createColorInput('--severitium-purple-color', 'Фиолетовый')}
                        ${this.createColorInput('--severitium-blue-color', 'Синий')}
                    </div>
                </div>

                <div class="severitium-settings-section">
                    <h3>Кнопки</h3>
                    <div class="severitium-color-grid">
                        ${this.createColorInput('--severitium-gray-button-color', 'Серая кнопка - текст')}
                        ${this.createColorInput('--severitium-green-button-color', 'Зелёная кнопка - текст')}
                        ${this.createColorInput('--severitium-red-button-color', 'Красная кнопка - текст')}
                        ${this.createColorInput('--severitium-gold-button-color', 'Золотая кнопка - текст')}
                        ${this.createColorInput('--severitium-blue-button-color', 'Синяя кнопка - текст')}
                    </div>
                </div>

                <div class="severitium-settings-section">
                    <h3>Боевая вкладка</h3>
                    <div class="severitium-color-grid">
                        ${this.createColorInput('--severitium-tab-main-border-color', 'Основная граница')}
                        ${this.createColorInput('--severitium-tab-borders-color', 'Границы')}
                        ${this.createColorInput('--severitium-tab-borders-hover-color', 'Границы при наведении')}
                        ${this.createColorInput('--severitium-tab-header-border-color', 'Граница заголовка')}
                        ${this.createColorInput('--severitium-tab-nickname-color', 'Цвет никнейма')}
                        ${this.createColorInput('--severitium-tab-nickname-hover-color', 'Никнейм при наведении')}
                    </div>
                </div>

                <div class="severitium-settings-section">
                    <h3>Метрики</h3>
                    <div class="severitium-metrics-grid">
                        ${this.createRangeInput('--severitium-border-radius', 'Радиус границ', '0em', '1em', '0.05em')}
                    </div>
                </div>

                <div class="severitium-settings-actions">
                    <button class="severitium-btn severitium-btn-primary" onclick="window.severitiumThemeSettings.saveSettings()">
                        Сохранить настройки
                    </button>
                    <button class="severitium-btn severitium-btn-secondary" onclick="window.severitiumThemeSettings.resetToDefaults()">
                        Сбросить к значениям по умолчанию
                    </button>
                    <button class="severitium-btn severitium-btn-secondary" onclick="window.severitiumThemeSettings.exportSettings()">
                        Экспорт настроек
                    </button>
                    <input type="file" id="severitium-import-input" accept=".json" style="display: none;" onchange="window.severitiumThemeSettings.importSettings(event)">
                    <button class="severitium-btn severitium-btn-secondary" onclick="document.getElementById('severitium-import-input').click()">
                        Импорт настроек
                    </button>
                </div>
            </div>
        `;

        this.contentContainer.appendChild(content);
        this.attachEventListeners();
    }

    /**
     * Create a color input field
     */
    createColorInput(variable, label) {
        const currentValue = this.currentVariables[variable] || this.defaultVariables[variable];
        const colorValue = this.rgbToHex(currentValue);
        
        return `
            <div class="severitium-color-input">
                <label for="${variable}">${label}</label>
                <div class="severitium-color-input-wrapper">
                    <input type="color" 
                           id="${variable}" 
                           value="${colorValue}"
                           data-variable="${variable}"
                           class="severitium-color-picker">
                    <input type="text" 
                           value="${currentValue}"
                           data-variable="${variable}"
                           class="severitium-color-text"
                           placeholder="rgb(255, 255, 255)">
                </div>
            </div>
        `;
    }

    /**
     * Create a range input field
     */
    createRangeInput(variable, label, min, max, step) {
        const currentValue = this.currentVariables[variable] || this.defaultVariables[variable];
        const numericValue = parseFloat(currentValue);
        
        return `
            <div class="severitium-range-input">
                <label for="${variable}">${label}</label>
                <div class="severitium-range-input-wrapper">
                    <input type="range" 
                           id="${variable}" 
                           min="${parseFloat(min)}"
                           max="${parseFloat(max)}"
                           step="${parseFloat(step)}"
                           value="${numericValue}"
                           data-variable="${variable}"
                           class="severitium-range-slider">
                    <input type="text" 
                           value="${currentValue}"
                           data-variable="${variable}"
                           class="severitium-range-text">
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners to input elements
     */
    attachEventListeners() {
        // Color pickers
        const colorPickers = this.contentContainer.querySelectorAll('.severitium-color-picker');
        colorPickers.forEach(picker => {
            picker.addEventListener('input', (e) => this.onColorChange(e));
        });

        // Color text inputs
        const colorTexts = this.contentContainer.querySelectorAll('.severitium-color-text');
        colorTexts.forEach(text => {
            text.addEventListener('input', (e) => this.onColorTextChange(e));
            text.addEventListener('blur', (e) => this.validateColorText(e));
        });

        // Range sliders
        const rangeSliders = this.contentContainer.querySelectorAll('.severitium-range-slider');
        rangeSliders.forEach(slider => {
            slider.addEventListener('input', (e) => this.onRangeChange(e));
        });

        // Range text inputs
        const rangeTexts = this.contentContainer.querySelectorAll('.severitium-range-text');
        rangeTexts.forEach(text => {
            text.addEventListener('input', (e) => this.onRangeTextChange(e));
        });
    }

    /**
     * Handle color picker changes
     */
    onColorChange(event) {
        const variable = event.target.dataset.variable;
        const hexValue = event.target.value;
        const rgbValue = this.hexToRgb(hexValue);
        
        // Update the corresponding text input
        const textInput = this.contentContainer.querySelector(`.severitium-color-text[data-variable="${variable}"]`);
        if (textInput) {
            textInput.value = rgbValue;
        }
        
        // Apply the change immediately
        this.currentVariables[variable] = rgbValue;
        this.applyVariable(variable, rgbValue);
    }

    /**
     * Handle color text input changes
     */
    onColorTextChange(event) {
        const variable = event.target.dataset.variable;
        const textValue = event.target.value;
        
        this.currentVariables[variable] = textValue;
        this.applyVariable(variable, textValue);
        
        // Try to update color picker if it's a valid color
        const colorPicker = this.contentContainer.querySelector(`.severitium-color-picker[data-variable="${variable}"]`);
        if (colorPicker) {
            try {
                const hexValue = this.rgbToHex(textValue);
                colorPicker.value = hexValue;
            } catch (e) {
                // Invalid color format, ignore
            }
        }
    }

    /**
     * Handle range slider changes
     */
    onRangeChange(event) {
        const variable = event.target.dataset.variable;
        const value = event.target.value + 'em';
        
        // Update the corresponding text input
        const textInput = this.contentContainer.querySelector(`.severitium-range-text[data-variable="${variable}"]`);
        if (textInput) {
            textInput.value = value;
        }
        
        // Apply the change immediately
        this.currentVariables[variable] = value;
        this.applyVariable(variable, value);
    }

    /**
     * Handle range text input changes
     */
    onRangeTextChange(event) {
        const variable = event.target.dataset.variable;
        const textValue = event.target.value;
        
        this.currentVariables[variable] = textValue;
        this.applyVariable(variable, textValue);
        
        // Try to update range slider
        const rangeSlider = this.contentContainer.querySelector(`.severitium-range-slider[data-variable="${variable}"]`);
        if (rangeSlider) {
            const numericValue = parseFloat(textValue);
            if (!isNaN(numericValue)) {
                rangeSlider.value = numericValue;
            }
        }
    }

    /**
     * Validate color text input
     */
    validateColorText(event) {
        const input = event.target;
        const value = input.value;
        
        // Basic validation for rgb() format
        const rgbRegex = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;
        const rgbaRegex = /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[01]?\.?\d*\s*\)$/;
        
        if (!rgbRegex.test(value) && !rgbaRegex.test(value) && !value.startsWith('#')) {
            input.style.borderColor = 'var(--severitium-red-color)';
        } else {
            input.style.borderColor = '';
        }
    }

    /**
     * Apply a single CSS variable
     */
    applyVariable(variable, value) {
        document.documentElement.style.setProperty(variable, value);
        
        // Update cache immediately
        this.updateCacheDebounced();
    }

    /**
     * Apply all variables to the document
     */
    applyVariables() {
        // Use theme cache system for applying variables
        this.themeCache.applyThemeVariables(this.currentVariables);
        
        // Update cache
        this.updateCacheDebounced();
    }

    /**
     * Save current settings - use events to communicate with userscript
     */
    saveSettings() {
        // Save to regular localStorage first (fallback)
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentVariables));
        }
        
        // Request userscript to save via events
        this.requestUserscriptSave();
        
        // Update theme cache immediately if available
        if (this.themeCache && typeof this.themeCache.updateThemeCache === 'function') {
            this.themeCache.updateThemeCache(this.currentVariables);
        }
        
        // Show confirmation
        if (window.Swal) {
            Swal.fire({
                title: 'Настройки сохранены!',
                text: 'Ваши настройки темы были успешно сохранены и применены.',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        } else {
            alert('Настройки сохранены!');
        }
    }

    /**
     * Request userscript to save settings via custom events
     */
    requestUserscriptSave() {
        const saveEvent = new CustomEvent('severitium:saveThemeSettings', {
            detail: {
                settings: this.currentVariables,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(saveEvent);
    }

    /**
     * Load settings - try userscript first, then localStorage
     */
    loadSettings() {
        // Try to get from userscript via events
        const userscriptSettings = this.requestSettingsFromUserscript();
        if (userscriptSettings) {
            return { ...this.defaultVariables, ...userscriptSettings };
        }
        
        // Fallback to localStorage
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                try {
                    return { ...this.defaultVariables, ...JSON.parse(saved) };
                } catch (e) {
                    console.warn('Severitium: Failed to parse saved settings from localStorage, using defaults');
                }
            }
        }
        
        return { ...this.defaultVariables };
    }

    /**
     * Request settings from userscript via custom events
     */
    requestSettingsFromUserscript() {
        let settings = null;
        
        // Create custom event to request settings
        const requestEvent = new CustomEvent('severitium:requestThemeSettings', {
            detail: { timestamp: Date.now() }
        });
        
        // Listen for response
        const responseHandler = (event) => {
            if (event.detail && event.detail.settings) {
                settings = event.detail.settings;
            }
        };
        
        document.addEventListener('severitium:themeSettingsResponse', responseHandler, { once: true });
        
        // Dispatch request
        document.dispatchEvent(requestEvent);
        
        // Give userscript 100ms to respond
        const startTime = Date.now();
        while (Date.now() - startTime < 100 && !settings) {
            // Busy wait for sync response
        }
        
        document.removeEventListener('severitium:themeSettingsResponse', responseHandler);
        
        return settings;
    }

    /**
     * Reset to default values
     */
    resetToDefaults() {
        this.currentVariables = { ...this.defaultVariables };
        this.applyVariables();
        
        // Update UI if settings are open
        if (this.contentContainer.querySelector('.severitium-theme-settings-content')) {
            this.contentContainer.innerHTML = '';
            this.createSettingsContent();
        }
        
        // Show confirmation
        if (window.Swal) {
            Swal.fire({
                title: 'Настройки сброшены!',
                text: 'Все настройки темы были сброшены к значениям по умолчанию.',
                icon: 'info',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        } else {
            alert('Настройки сброшены к значениям по умолчанию!');
        }
    }

    /**
     * Export settings to JSON file
     */
    exportSettings() {
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            settings: this.currentVariables
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `severitium-theme-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Import settings from JSON file
     */
    importSettings(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.settings) {
                    // Merge with defaults to ensure all variables are present
                    this.currentVariables = { ...this.defaultVariables, ...data.settings };
                    this.applyVariables();
                    
                    // Update UI if settings are open
                    if (this.contentContainer.querySelector('.severitium-theme-settings-content')) {
                        this.contentContainer.innerHTML = '';
                        this.createSettingsContent();
                    }
                    
                    if (window.Swal) {
                        Swal.fire({
                            title: 'Настройки импортированы!',
                            text: 'Настройки темы были успешно загружены из файла.',
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                    } else {
                        alert('Настройки импортированы!');
                    }
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                if (window.Swal) {
                    Swal.fire({
                        title: 'Ошибка импорта!',
                        text: 'Не удалось прочитать файл настроек. Проверьте формат файла.',
                        icon: 'error'
                    });
                } else {
                    alert('Ошибка импорта! Проверьте формат файла.');
                }
            }
        };
        reader.readAsText(file);
        
        // Reset input
        event.target.value = '';
    }

    /**
     * Update cache with current settings (deprecated, use themeCache system)
     */
    updateCache() {
        console.warn('updateCache is deprecated, using themeCache system instead');
        this.themeCache.updateThemeCache(this.currentVariables);
    }

    /**
     * Generate CSS content with current variables (deprecated, use themeCache system)
     */
    generateCSSContent() {
        console.warn('generateCSSContent is deprecated, using themeCache system instead');
        return this.themeCache.generateThemeCSS(this.currentVariables);
    }

    /**
     * Convert RGB to HEX
     */
    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return '#000000';
        
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    /**
     * Convert HEX to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return 'rgb(0, 0, 0)';
        
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Debounce function to limit how often a function can be called
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.severitiumThemeSettings = new ThemeSettings();
    });
} else {
    window.severitiumThemeSettings = new ThemeSettings();
}
