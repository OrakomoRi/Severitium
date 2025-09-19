/**
 * Markdown Changelog Parser
 * Converts CHANGELOG.md to beautiful HTML
 */

/**
 * Emoji dictionary for parsing GitHub-style emoji codes
 * You can easily add new emojis following the format ':code:': 'emoji'
 */
const EMOJI_MAP = {
	':tada:': '🎉',
	':heart:': '❤️',
	':rocket:': '🚀',
	':bug:': '🐛',
	':sparkles:': '✨',
	':fire:': '🔥',
	':hammer:': '🔨',
	':wrench:': '🔧',
	':art:': '🎨',
	':zap:': '⚡',
	':boom:': '💥',
	':lipstick:': '💄',
	':construction:': '🚧',
	':green_heart:': '💚',
	':arrow_up:': '⬆️',
	':arrow_down:': '⬇️',
	':pushpin:': '📌',
	':memo:': '📝',
	':package:': '📦',
	':heavy_plus_sign:': '➕',
	':heavy_minus_sign:': '➖',
	':heavy_check_mark:': '✅',
	':x:': '❌',
	':white_check_mark:': '✅',
	':warning:': '⚠️',
	':rotating_light:': '🚨',
	':bulb:': '💡',
	':mag:': '🔍',
	':gear:': '⚙️',
	':shield:': '🛡️',
	':star:': '⭐',
	':thumbsup:': '👍',
	':thumbsdown:': '👎'
};

/**
 * Changelog section configuration
 * Defines icons and CSS classes for different types of changes
 */
const SECTION_CONFIG = {
	'added': {
		class: 'section-added',
		icon: 'add-circle-outline',
		color: '#4ade80' // Green for added
	},
	'changed': {
		class: 'section-changed', 
		icon: 'swap-horizontal-outline',
		color: '#3b82f6' // Blue for changes
	},
	'fixed': {
		class: 'section-fixed',
		icon: 'checkmark-circle-outline', 
		color: '#f59e0b' // Yellow for fixes
	},
	'removed': {
		class: 'section-removed',
		icon: 'remove-circle-outline',
		color: '#ef4444' // Red for removed
	},
	'deprecated': {
		class: 'section-deprecated',
		icon: 'alert-triangle-outline',
		color: '#f97316' // Orange for deprecated
	},
	'security': {
		class: 'section-security',
		icon: 'shield-outline',
		color: '#8b5cf6' // Purple for security
	}
};

/**
 * Parse emoji codes to Unicode symbols
 * @param {string} text - Text with emoji codes
 * @returns {string} Text with replaced emojis
 */
function parseEmojis(text) {
	let result = text;
	for (const [code, emoji] of Object.entries(EMOJI_MAP)) {
		// Escape special characters in regex
		const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		result = result.replace(new RegExp(escapedCode, 'g'), emoji);
	}
	return result;
}

/**
 * Format date according to user's locale
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
	try {
		const date = new Date(dateString);
		// Use user's locale for date formatting
		return date.toLocaleDateString(navigator.language, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} catch (error) {
		console.warn('Error parsing date:', dateString, error);
		return dateString; // Return original string if parsing fails
	}
}

/**
 * Get section configuration by name
 * @param {string} sectionName - Section name (lowercase)
 * @returns {object} Section configuration
 */
function getSectionConfig(sectionName) {
	return SECTION_CONFIG[sectionName] || {
		class: 'section-other',
		icon: 'ellipsis-horizontal-outline',
		color: '#6b7280' // Gray for unknown sections
	};
}

/**
 * Main changelog parsing function - converts markdown to HTML
 * @param {string} markdownContent - Source markdown content
 * @returns {string} Formatted HTML
 */
function parseChangelog(markdownContent) {
	const lines = markdownContent.split('\n');
	let html = '';
	let currentVersion = null;
	let currentSection = null;
	let listStack = []; // Stack for tracking nested lists

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmedLine = line.trim();

		// Skip header and empty lines at the beginning
		if (!trimmedLine || trimmedLine === '# CHANGELOG') {
			continue;
		}

		// Version header (## [1.8.0] - 2025-09-16)
		if (trimmedLine.match(/^## \[[\d.]+\]/)) {
			// Close all open lists and sections
			while (listStack.length > 0) {
				html += '</ul>';
				listStack.pop();
			}
			if (currentSection) html += '</div>';
			if (currentVersion) html += '</div>';

			const versionMatch = trimmedLine.match(/^## \[([\d.]+)\] - (.+)$/);
			if (versionMatch) {
				const [, version, rawDate] = versionMatch;
				const formattedDate = formatDate(rawDate);
				currentVersion = version;
				html += `
					<div class="changelog__version">
						<div class="changelog__version-header">
							<div class="changelog__version-title">
								<ion-icon name="pricetag-outline"></ion-icon>
								Version ${version}
							</div>
							<div class="changelog__version-date">${formattedDate}</div>
						</div>
				`;
			}
			currentSection = null;
			continue;
		}

		// Section headers (### Added, ### Changed, etc.)
		if (trimmedLine.match(/^### /)) {
			// Close all open lists
			while (listStack.length > 0) {
				html += '</ul>';
				listStack.pop();
			}
			if (currentSection) {
				html += '</div>';
			}

			const sectionName = trimmedLine.replace('### ', '').toLowerCase();
			const config = getSectionConfig(sectionName);

			currentSection = sectionName;
			html += `
				<div class="changelog__section changelog__section--${config.class}">
					<div class="changelog__section-title">
						<ion-icon name="${config.icon}"></ion-icon>
						${trimmedLine.replace('### ', '')}
					</div>
			`;
			continue;
		}

		// Process list items with nesting support
		const listMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
		if (listMatch) {
			const [, indent, itemText] = listMatch;
			// Determine nesting level (every 2 spaces = 1 level)
			const currentIndent = Math.floor(indent.length / 2);

			// Adjust list stack based on nesting level
			while (listStack.length > currentIndent + 1) {
				html += '</ul>';
				listStack.pop();
			}

			// Start new list if needed
			if (listStack.length === currentIndent) {
				const listClass = currentIndent === 0 ? 'changelog__list' : `changelog__list changelog__list--nested-${currentIndent}`;
				html += `<ul class="${listClass}">`;
				listStack.push(currentIndent);
			}

			// Add list item with emoji parsing (all items are uniform)
			const parsedText = parseEmojis(itemText);
			html += `<li class="changelog__item">${parsedText}</li>`;
			continue;
		}

		// Horizontal line separator for versions (---)
		if (trimmedLine === '---') {
			while (listStack.length > 0) {
				html += '</ul>';
				listStack.pop();
			}
			if (currentSection) {
				html += '</div>';
				currentSection = null;
			}
			if (currentVersion) {
				html += '</div>';
				currentVersion = null;
			}
			continue;
		}

		// Regular paragraphs
		if (trimmedLine && !trimmedLine.match(/^[#-]/)) {
			const parsedText = parseEmojis(trimmedLine);
			html += `<p class="changelog__paragraph">${parsedText}</p>`;
		}
	}

	// Close all remaining open tags
	while (listStack.length > 0) {
		html += '</ul>';
		listStack.pop();
	}
	if (currentSection) html += '</div>';
	if (currentVersion) html += '</div>';

	return html;
}

/**
 * Load changelog from GitHub
 * @returns {Promise<string>} Source markdown content
 */
async function fetchChangelog() {
	try {
		const response = await fetch('https://raw.githubusercontent.com/OrakomoRi/Severitium/main/CHANGELOG.md');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.text();
	} catch (error) {
		console.error('Error fetching changelog:', error);
		throw error;
	}
}

// Export functions for use in main.js
window.ChangelogParser = {
	parseChangelog,
	fetchChangelog,
	parseEmojis,
	formatDate
};