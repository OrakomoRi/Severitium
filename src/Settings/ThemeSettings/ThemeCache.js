/**
 * ThemeCache Module
 * Manages caching and dynamic updating of theme settings
 * Works via events to communicate with userscript for GM_setValue access
 */

class ThemeCache {
    constructor() {
        this.cacheKey = 'SeveritiumThemeCache';
        this.settingsKey = 'SeveritiumThemeSettings';
    }

    /**
     * Generate CSS content with current theme variables
     */
    generateThemeCSS(variables) {
        let css = ':root {\n';
        css += '\t/* Severitium Dynamic Theme Variables */\n';
        
        for (const [variable, value] of Object.entries(variables)) {
            css += `\t${variable}: ${value};\n`;
        }
        
        css += '}';
        return css;
    }

    /**
     * Update cached CSS with new theme variables via userscript events
     */
    updateThemeCache(variables) {
        const themeCSS = this.generateThemeCSS(variables);
        
        // Request userscript to update cache
        this.requestCacheUpdate(themeCSS, variables);
        
        // Also try localStorage as fallback
        this.updateLocalStorageCache(themeCSS, variables);
        
        console.log('Severitium: Theme cache update requested');
    }

    /**
     * Request userscript to update cache via events
     */
    requestCacheUpdate(themeCSS, variables) {
        const cacheEvent = new CustomEvent('severitium:updateThemeCache', {
            detail: {
                themeCSS: themeCSS,
                variables: variables,
                version: this.currentVersion,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(cacheEvent);
    }

    /**
     * Update localStorage cache as fallback
     */
    updateLocalStorageCache(themeCSS, variables) {
        if (typeof localStorage === 'undefined') return;
        
        try {
            // Try to get existing cache structure
            let cachedCSS = {};
            const existingCache = localStorage.getItem('SeveritiumCSS');
            if (existingCache) {
                cachedCSS = JSON.parse(existingCache);
            }
            
            // Update theme variables in cache
            cachedCSS['theme-variables'] = themeCSS;
            
            // Save back to localStorage
            localStorage.setItem('SeveritiumCSS', JSON.stringify(cachedCSS));
            localStorage.setItem(this.versionKey, this.currentVersion);
        } catch (e) {
            console.warn('Severitium: Failed to update localStorage cache:', e);
        }
    }

    /**
     * Apply theme variables immediately to the page
     */
    applyThemeVariables(variables) {
        // Apply to document root
        for (const [variable, value] of Object.entries(variables)) {
            document.documentElement.style.setProperty(variable, value);
        }
        
        // Also inject as style element for persistence
        this.injectThemeStyle(variables);
    }

    /**
     * Inject theme variables as a style element
     */
    injectThemeStyle(variables) {
        // Remove existing theme style
        const existingStyle = document.getElementById('severitium-dynamic-theme');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Create new style element
        const style = document.createElement('style');
        style.id = 'severitium-dynamic-theme';
        style.textContent = this.generateThemeCSS(variables);
        
        // Insert at the beginning of head to ensure it can be overridden
        document.head.insertBefore(style, document.head.firstChild);
    }

    /**
     * Load cached theme variables
     */
    loadCachedTheme() {
        const cachedCSS = GM_getValue('SeveritiumCSS', {});
        const themeCSS = cachedCSS['theme-variables'];
        
        if (themeCSS) {
            // Extract variables from cached CSS
            const variables = this.extractVariablesFromCSS(themeCSS);
            this.applyThemeVariables(variables);
            return variables;
        }
        
        return null;
    }

    /**
     * Extract CSS variables from CSS text
     */
    extractVariablesFromCSS(css) {
        const variables = {};
        const matches = css.match(/--[^:]+:[^;]+;/g);
        
        if (matches) {
            matches.forEach(match => {
                const [property, value] = match.split(':').map(s => s.trim());
                variables[property] = value.replace(';', '').trim();
            });
        }
        
        return variables;
    }

    /**
     * Check if theme cache needs to be invalidated
     */
    needsCacheInvalidation() {
        const cachedVersion = GM_getValue(this.versionKey, '');
        return cachedVersion !== this.currentVersion;
    }

    /**
     * Initialize theme caching system
     */
    init() {
        // Load cached theme on startup if available
        const cachedTheme = this.loadCachedTheme();
        
        if (cachedTheme) {
            console.log('Severitium: Loaded theme from cache');
        }
        
        return cachedTheme;
    }
}

// Export for use in other modules
window.SeveritiumThemeCache = ThemeCache;
