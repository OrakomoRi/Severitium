# :gear: ThemeSettings

Dynamic theme settings module for Severitium. Adds a custom settings tab to the game's settings menu and allows real-time modification of CSS variables without page reload.

## :star2: Features

- :sparkles: **Dynamic Theme Customization** - Real-time preview of variable changes
- :floppy_disk: **Persistent Storage** - Settings saved between sessions
- :rocket: **Performance Optimized** - Debounced cache updates, minimal DOM manipulation
- :art: **Rich Color Interface** - Color pickers with hex/rgb support
- :inbox_tray: **Import/Export** - Share theme configurations
- :arrows_clockwise: **Cache Integration** - Seamlessly integrates with Severitium's caching system
- :iphone: **Responsive Design** - Works on different screen sizes

## :hammer_and_wrench: Technical Details

### Event-Based Architecture
The module uses a custom event system to communicate between regular JavaScript and userscript context:

- **Theme Variables**: Extracted from cached CSS via events to userscript
- **Settings Storage**: Uses GM_setValue through events for persistence 
- **Cache Updates**: Real-time cache updates via userscript integration
- **Fallback System**: localStorage used when userscript context unavailable

### Caching System
- Extends Severitium's main CSS cache with `variables` section
- Uses debounced updates (500ms) for performance
- Integrates with existing `GM_setValue`/`GM_getValue` storage via events
- Automatic fallback to localStorage in non-userscript environments

### Variable Management
- Dynamically loads variables from Variables.css via userscript
- Real-time DOM updates via `document.documentElement.style.setProperty()`
- Fallback injection of `<style>` elements for persistence
- Supports all CSS variable types (colors, backgrounds, metrics)

### UI Components
- Color picker with hex/rgb conversion
- Range sliders for numeric values
- Text inputs with validation
- Export/import functionality

## :art: Customizable Variables

The module provides UI for all Severitium theme variables:

### Main Colors
- Primary theme color
- Text colors (white, gray, colored variants)
- Special highlighting colors (friends, currencies)

### UI Elements
- Button backgrounds and borders
- Background transparencies
- Border radius and metrics

### Battle Tab
- Tab-specific colors and backgrounds
