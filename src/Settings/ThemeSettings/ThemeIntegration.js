/**
 * ThemeIntegration Module
 * Handles integration between theme settings and userscript
 * This file contains the bridge code that should be in the userscript context
 */

// Bridge for theme settings - works only in userscript context
if (typeof GM_setValue !== 'undefined' && typeof GM_getValue !== 'undefined') {
    
    /**
     * Parse CSS to extract variables
     */
    function parseVariablesFromCSS(cssText) {
        const variables = {};
        
        if (!cssText) return variables;
        
        // Extract variables from :root block
        const rootMatch = cssText.match(/:root\s*{([^}]*)}/);
        if (rootMatch) {
            const rootContent = rootMatch[1];
            const varMatches = rootContent.match(/--[^:;]+:[^;]+;/g);
            
            if (varMatches) {
                varMatches.forEach(match => {
                    const [property, value] = match.split(':').map(s => s.trim());
                    if (property && value) {
                        variables[property] = value.replace(';', '').trim();
                    }
                });
            }
        }
        
        return variables;
    }

    /**
     * Get current variables from Variables.css via CDN or cache
     */
    function getCurrentVariablesFromCache() {
        const currentVersion = (typeof GM_info !== 'undefined' && GM_info.script) ? GM_info.script.version : '1.0.0';
        
        // Try to load from CDN first
        const variablesUrl = `https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/${currentVersion}/variables.json`;
        
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: variablesUrl,
                timeout: 5000, // 5 second timeout
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            const data = JSON.parse(response.responseText);
                            if (data.variables) {
                                console.log('Severitium: Loaded variables from CDN:', Object.keys(data.variables).length, 'variables');
                                resolve(data.variables);
                                return;
                            }
                        } catch (e) {
                            console.warn('Severitium: Failed to parse variables from CDN:', e);
                        }
                    }
                    
                    // Fallback to parsing from cached CSS
                    console.log('Severitium: CDN failed, falling back to cached CSS parsing');
                    const fallbackVariables = parseVariablesFromCachedCSS();
                    resolve(fallbackVariables);
                },
                onerror: function(error) {
                    console.warn('Severitium: CDN request failed, falling back to cached CSS:', error);
                    const fallbackVariables = parseVariablesFromCachedCSS();
                    resolve(fallbackVariables);
                },
                ontimeout: function() {
                    console.warn('Severitium: CDN request timed out, falling back to cached CSS');
                    const fallbackVariables = parseVariablesFromCachedCSS();
                    resolve(fallbackVariables);
                }
            });
        });
    }

    /**
     * Fallback: Parse variables from cached CSS
     */
    function parseVariablesFromCachedCSS() {
        const cachedCSS = GM_getValue('SeveritiumCSS', {});
        const mainCSS = cachedCSS['main'] || '';
        
        // Try to extract variables from main CSS
        return parseVariablesFromCSS(mainCSS);
    }

    // Event listener for variables request
    document.addEventListener('severitium:requestVariables', async (event) => {
        try {
            const variables = await getCurrentVariablesFromCache();
            
            // Respond with variables
            const responseEvent = new CustomEvent('severitium:variablesResponse', {
                detail: {
                    variables: variables,
                    timestamp: Date.now(),
                    source: 'userscript'
                }
            });
            
            document.dispatchEvent(responseEvent);
        } catch (error) {
            console.error('Severitium: Failed to get variables:', error);
            
            // Respond with empty variables on error
            const responseEvent = new CustomEvent('severitium:variablesResponse', {
                detail: {
                    variables: {},
                    timestamp: Date.now(),
                    source: 'userscript',
                    error: error.message
                }
            });
            
            document.dispatchEvent(responseEvent);
        }
    });

    // Event listener for theme settings request
    document.addEventListener('severitium:requestThemeSettings', (event) => {
        const settings = GM_getValue('SeveritiumThemeSettings', null);
        let parsedSettings = null;
        
        if (settings) {
            try {
                parsedSettings = JSON.parse(settings);
            } catch (e) {
                console.warn('Severitium: Failed to parse theme settings from GM storage');
            }
        }
        
        // Respond with settings
        const responseEvent = new CustomEvent('severitium:themeSettingsResponse', {
            detail: {
                settings: parsedSettings,
                timestamp: Date.now(),
                source: 'userscript'
            }
        });
        
        document.dispatchEvent(responseEvent);
    });

    // Event listener for saving theme settings
    document.addEventListener('severitium:saveThemeSettings', (event) => {
        if (event.detail && event.detail.settings) {
            try {
                GM_setValue('SeveritiumThemeSettings', JSON.stringify(event.detail.settings));
                console.log('Severitium: Theme settings saved to GM storage');
            } catch (e) {
                console.error('Severitium: Failed to save theme settings:', e);
            }
        }
    });

    // Event listener for cache update
    document.addEventListener('severitium:updateThemeCache', (event) => {
        if (event.detail && event.detail.themeCSS) {
            try {
                // Get current cached CSS
                const cachedCSS = GM_getValue('SeveritiumCSS', {});
                
                // Update theme variables in cache
                cachedCSS['theme-variables'] = event.detail.themeCSS;
                
                // Save back to cache
                GM_setValue('SeveritiumCSS', cachedCSS);
                GM_setValue('SeveritiumThemeCacheVersion', event.detail.version || '1.0.0');
                
                console.log('Severitium: Theme cache updated via userscript');
                
                // Optional: Inject updated CSS immediately
                const existingStyle = document.getElementById('severitium-dynamic-theme');
                if (existingStyle) {
                    existingStyle.textContent = event.detail.themeCSS;
                } else {
                    const style = document.createElement('style');
                    style.id = 'severitium-dynamic-theme';
                    style.textContent = event.detail.themeCSS;
                    document.head.insertBefore(style, document.head.firstChild);
                }
            } catch (e) {
                console.error('Severitium: Failed to update theme cache:', e);
            }
        }
    });

    console.log('Severitium: Theme integration bridge initialized');
} else {
    console.warn('Severitium: Theme integration requires userscript context (GM_setValue/GM_getValue not available)');
}

// Auto-initialize theme settings when the script loads
(function initThemeSettings() {
    // Wait for DOM to be ready
    function initWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    function init() {
        // Check if ThemeSettings class is available
        if (typeof ThemeSettings !== 'undefined') {
            // Initialize theme settings
            if (!window.severitiumThemeSettings) {
                window.severitiumThemeSettings = new ThemeSettings();
                console.log('Severitium: Theme settings initialized');
            }
        } else {
            console.warn('Severitium: ThemeSettings class not found');
        }
    }

    // Start initialization
    initWhenReady();
})();
