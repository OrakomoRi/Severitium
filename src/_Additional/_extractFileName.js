/**
 * Extracts the file name from the URL and determines the file type based on extension.
 * Handles files with suffixes like .release.css, .min.js, etc.
 * Works with any URL including external sources.
 * 
 * @param {string} url - The full URL of the file
 * @returns {{fileName: string, fileType: string}} - Extracted file name and type
 */
function _extractFileName(url) {
	let match;
	let fileType = '(Unknown)';

	// Extract file name from URL - handle various URL patterns
	if (url.includes('/src/.images/')) {
		// Pattern for images: /src/.images/season/folder/filename.ext
		match = url.match(/\/src\/\.images\/[^/]+\/([^/]+\/[^/?.]+(?:\.[^/?]+)?)/);
		if (!match) {
			// Fallback for direct image files
			match = url.match(/\/src\/\.images\/.*\/([^/?]+\.[^/?]+)/);
		}
	} else if (url.includes('orakomori.github.io')) {
		// Pattern for GitHub Pages: orakomori.github.io/Severitium/path/filename.ext
		match = url.match(/orakomori\.github\.io\/Severitium\/.*\/([^/?]+\.[^/?]+)/);
		if (!match) {
			// Fallback for orakomori.github.io URLs
			match = url.match(/orakomori\.github\.io\/.*\/([^/?]+\.[^/?]+)/);
		}
	} else if (url.includes('cdn.jsdelivr.net')) {
		// Pattern for jsDelivr CDN: cdn.jsdelivr.net/gh/user/repo@branch/path/filename.ext
		match = url.match(/cdn\.jsdelivr\.net\/gh\/[^/]+\/[^/]+@[^/]+\/.*\/([^/?]+\.[^/?]+)/);
	} else if (url.includes('/src/')) {
		// Pattern for source files: /src/folder/filename.ext
		match = url.match(/\/src\/.*\/([^/?]+\.[^/?]+)/);
		if (!match) {
			// Fallback for src folders
			match = url.match(/\/src\/([^/]+(?:\/[^/]+)*)\//);
		}
	} else if (url.includes('/release/')) {
		// Pattern for release files: /release/data/version/filename.ext
		match = url.match(/\/release\/(?:data\/)?[^/]+\/([^/?]+\.[^/?]+)/);
		if (!match) {
			// Fallback for release files without extension in match group
			match = url.match(/\/release\/data\/[^/]+\/([^/.]+)/);
		}
	} else {
		// Generic pattern for any URL - extract filename from the end
		match = url.match(/\/([^/?]+\.[^/?]+)(?:\?|$)/);
	}

	const fileName = match ? match[1] : 'Unknown';

	// Clean fileName from query parameters if they weren't handled by regex
	const cleanFileName = fileName.split('?')[0].split('#')[0];

	// Determine file type based on file extension
	// Handle multiple extensions like .release.css, .min.js, etc.
	const parts = cleanFileName.split('.');
	let extension = '';

	// Find the actual file extension (last part after dots)
	if (parts.length >= 2) {
		// Check for common suffixes before the actual extension
		const lastPart = parts[parts.length - 1].toLowerCase();
		const secondLastPart = parts.length >= 3 ? parts[parts.length - 2].toLowerCase() : '';

		// Common suffixes that come before the actual extension
		const suffixes = ['release', 'min', 'prod', 'dev', 'debug', 'bundle', 'chunk'];

		if (suffixes.includes(secondLastPart)) {
			// File has a suffix like .release.css, .min.js
			extension = lastPart;
		} else {
			// Regular file extension
			extension = lastPart;
		}
	} else if (parts.length === 1) {
		// No extension found, try to extract from URL
		const urlExtMatch = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
		extension = urlExtMatch ? urlExtMatch[1].toLowerCase() : '';
	}

	switch (extension) {
		case 'css':
			fileType = '(CSS)';
			break;
		case 'js':
			fileType = '(JS)';
			break;
		case 'json':
			fileType = '(JSON)';
			break;
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'gif':
		case 'svg':
		case 'webp':
		case 'ico':
		case 'bmp':
		case 'tiff':
		case 'avif':
			fileType = '(Image)';
			break;
		case 'html':
		case 'htm':
			fileType = '(HTML)';
			break;
		case 'xml':
			fileType = '(XML)';
			break;
		default:
			// If no extension or unknown extension, try to determine from URL path and content
			if (url.includes('/src/.images/') || url.includes('/.images/')) {
				fileType = '(Image)';
			} else if (url.includes('/src/') && (url.includes('.css') || url.toLowerCase().includes('style'))) {
				fileType = '(CSS)';
			} else if (url.includes('/src/') && (url.includes('.js') || url.toLowerCase().includes('script'))) {
				fileType = '(JS)';
			} else if (url.includes('.css') || url.toLowerCase().includes('style')) {
				fileType = '(CSS)';
			} else if (url.includes('.js') || url.toLowerCase().includes('script')) {
				fileType = '(JS)';
			} else if (url.includes('.json') || url.toLowerCase().includes('json')) {
				fileType = '(JSON)';
			} else if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.svg') || url.includes('.webp')) {
				fileType = '(Image)';
			} else if (cleanFileName.toLowerCase().includes('image') || url.toLowerCase().includes('image')) {
				fileType = '(Image)';
			} else {
				fileType = '(Unknown)';
			}
			break;
	}

	return {
		fileName: cleanFileName || fileName,
		fileType
	};
}