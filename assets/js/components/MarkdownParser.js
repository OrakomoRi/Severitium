/**
 * Modern Markdown Changelog Parser
 * Converts CHANGELOG.md to beautiful HTML using class-based approach
 */

class MarkdownParser {
	constructor() {
		this.emojiMap = {
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

		this.sectionConfig = {
			'added': {
				class: 'section-added',
				icon: 'add-circle-outline',
				color: '#4ade80'
			},
			'changed': {
				class: 'section-changed',
				icon: 'swap-horizontal-outline',
				color: '#3b82f6'
			},
			'fixed': {
				class: 'section-fixed',
				icon: 'checkmark-circle-outline',
				color: '#f59e0b'
			},
			'removed': {
				class: 'section-removed',
				icon: 'remove-circle-outline',
				color: '#ef4444'
			},
			'deprecated': {
				class: 'section-deprecated',
				icon: 'alert-triangle-outline',
				color: '#f97316'
			},
			'security': {
				class: 'section-security',
				icon: 'shield-outline',
				color: '#8b5cf6'
			}
		};
	}

	/**
	 * Parse emoji codes to Unicode symbols
	 * @param {string} text - Text with emoji codes
	 * @returns {string} Text with replaced emojis
	 */
	parseEmojis(text) {
		let result = text;
		for (const [code, emoji] of Object.entries(this.emojiMap)) {
			const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			result = result.replace(new RegExp(escapedCode, 'g'), emoji);
		}
		return result;
	}

	/**
	 * Parse inline code blocks and other markdown formatting
	 * @param {string} text - Text with markdown formatting
	 * @returns {string} Text with HTML formatting
	 */
	parseInlineFormatting(text) {
		let result = text;

		// Handle bold, italic, and links
		result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
		result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');
		result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
		result = result.replace(/_([^_]+)_/g, '<em>$1</em>');
		result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

		// Split text into code and non-code parts
		const parts = [];
		let lastIndex = 0;
		const codeRegex = /`([^`]+)`/g;
		let match;

		while ((match = codeRegex.exec(result)) !== null) {
			if (match.index > lastIndex) {
				const textBefore = result.substring(lastIndex, match.index);
				if (textBefore.trim()) {
					parts.push({ type: 'text', content: textBefore });
				}
			}

			parts.push({ type: 'code', content: match[1] });
			lastIndex = match.index + match[0].length;
		}

		if (lastIndex < result.length) {
			const textAfter = result.substring(lastIndex);
			if (textAfter.trim()) {
				parts.push({ type: 'text', content: textAfter });
			}
		}

		if (parts.length === 0) {
			parts.push({ type: 'text', content: result });
		}

		// Convert parts to HTML
		let htmlResult = '';
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];

			if (part.type === 'code') {
				htmlResult += `<span class="changelog__code">${part.content}</span>`;
			} else {
				const trimmedContent = part.content.trim();
				if (trimmedContent) {
					htmlResult += `<span class="changelog__text">${trimmedContent}</span>`;
				}
			}

			if (i < parts.length - 1) {
				htmlResult += '<span>&nbsp;</span>';
			}
		}

		return htmlResult;
	}

	/**
	 * Format date according to user's locale
	 * @param {string} dateString - Date in YYYY-MM-DD format
	 * @returns {string} Formatted date
	 */
	formatDate(dateString) {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString(navigator.language, {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch (error) {
			console.warn('Error parsing date:', dateString, error);
			return dateString;
		}
	}

	/**
	 * Get section configuration by name
	 * @param {string} sectionName - Section name (lowercase)
	 * @returns {object} Section configuration
	 */
	getSectionConfig(sectionName) {
		return this.sectionConfig[sectionName] || {
			class: 'section-other',
			icon: 'ellipsis-horizontal-outline',
			color: '#6b7280'
		};
	}

	/**
	 * Main parsing method - converts markdown to HTML
	 * @param {string} markdownContent - Source markdown content
	 * @returns {string} Formatted HTML
	 */
	parse(markdownContent) {
		const lines = markdownContent.split('\n');
		let html = '';
		let currentVersion = null;
		let currentSection = null;
		let listStack = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const trimmedLine = line.trim();

			if (!trimmedLine || trimmedLine === '# CHANGELOG') {
				continue;
			}

			// Version header
			if (trimmedLine.match(/^## /)) {
				while (listStack.length > 0) {
					html += '</ul>';
					listStack.pop();
				}
				if (currentSection) html += '</div>';
				if (currentVersion) html += '</div>';

				const versionMatch = trimmedLine.match(/^## \[([\d.]+)\] - (.+)$/) ||
					trimmedLine.match(/^## \[([^\]]+)\] - (.+)$/) ||
					trimmedLine.match(/^## ([^-]+) - (.+)$/);

				if (versionMatch) {
					const [, version, rawDate] = versionMatch;
					const formattedDate = this.formatDate(rawDate);
					currentVersion = version.trim();
					html += this.createVersionHeader(version.trim(), formattedDate);
				}
				currentSection = null;
				continue;
			}

			// Section headers
			if (trimmedLine.match(/^### /)) {
				while (listStack.length > 0) {
					html += '</ul>';
					listStack.pop();
				}
				if (currentSection) {
					html += '</div>';
				}

				const sectionName = trimmedLine.replace('### ', '').toLowerCase();
				const config = this.getSectionConfig(sectionName);
				currentSection = sectionName;
				html += this.createSectionHeader(config, trimmedLine.replace('### ', ''));
				continue;
			}

			// List items
			const listMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
			if (listMatch) {
				const [, indent, itemText] = listMatch;
				const currentIndent = Math.floor(indent.length / 2);
				html += this.processListItem(listStack, currentIndent, itemText);
				continue;
			}

			// Horizontal separator
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
				const parsedText = this.parseInlineFormatting(this.parseEmojis(trimmedLine));
				html += `<p class="changelog__paragraph">${parsedText}</p>`;
			}
		}

		// Close remaining tags
		while (listStack.length > 0) {
			html += '</ul>';
			listStack.pop();
		}
		if (currentSection) html += '</div>';
		if (currentVersion) html += '</div>';

		return html;
	}

	/**
	 * Create version header HTML
	 * @param {string} version - Version number
	 * @param {string} formattedDate - Formatted date
	 * @returns {string} HTML string
	 */
	createVersionHeader(version, formattedDate) {
		return `
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

	/**
	 * Create section header HTML
	 * @param {object} config - Section configuration
	 * @param {string} title - Section title
	 * @returns {string} HTML string
	 */
	createSectionHeader(config, title) {
		return `
			<div class="changelog__section changelog__section--${config.class}">
				<div class="changelog__section-title">
					<ion-icon name="${config.icon}"></ion-icon>
					${title}
				</div>
		`;
	}

	/**
	 * Process list item with nesting support
	 * @param {Array} listStack - Current list stack
	 * @param {number} currentIndent - Current indentation level
	 * @param {string} itemText - Item text
	 * @returns {string} HTML string
	 */
	processListItem(listStack, currentIndent, itemText) {
		let html = '';

		// Adjust list stack
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

		const parsedText = this.parseInlineFormatting(this.parseEmojis(itemText));
		html += `<li class="changelog__item"><span class="changelog__marker"></span><span>${parsedText}</span></li>`;

		return html;
	}

	/**
	 * Close all remaining tags
	 * @param {Array} listStack - List stack
	 * @param {string} currentSection - Current section
	 * @param {string} currentVersion - Current version
	 * @returns {string} HTML string
	 */
	closeTags(listStack, currentSection, currentVersion) {
		let html = '';
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
	 * @param {string} url - GitHub raw URL
	 * @returns {Promise<string>} Source markdown content
	 */
	async fetchFromUrl(url = 'https://raw.githubusercontent.com/OrakomoRi/Severitium/main/CHANGELOG.md') {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.text();
		} catch (error) {
			console.error('Error fetching changelog:', error);
			throw error;
		}
	}
}

export default MarkdownParser;