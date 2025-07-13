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
		match = url.match(/\/src\/\.images\/[^/]+\/([^/]+\/[^/.]+)/);
	} else if (url.includes('/src/')) {
		// Pattern for source files: /src/folder/filename.ext
		match = url.match(/\/src\/([^/]+(?:\/[^/]+)*)\//);
	} else if (url.includes('/release/')) {
		// Pattern for release files: /release/data/version/filename.ext
		match = url.match(/\/release\/data\/[^/]+\/([^/.]+)/);
	} else {
		// Generic pattern for any URL - extract filename from the end
		match = url.match(/\/([^/]+\.[^/?]+)(?:\?|$)/);
	}

	const fileName = match ? match[1] : 'Unknown';

	// Determine file type based on file extension
	// Handle multiple extensions like .release.css, .min.js, etc.
	const parts = fileName.split('.');
	let extension = '';

	// Find the actual file extension (last part after dots)
	if (parts.length >= 2) {
		// Check for common suffixes before the actual extension
		const lastPart = parts[parts.length - 1].toLowerCase();
		const secondLastPart = parts[parts.length - 2].toLowerCase();

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
		// No extension found
		extension = '';
	}

	switch (extension) {
		case 'css':
			fileType = '(CSS)';
			break;
		case 'js':
			fileType = '(JS)';
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
		default:
			// If no extension or unknown extension, try to determine from URL path
			if (url.includes('/src/.images/')) {
				fileType = '(Image)';
			} else if (url.includes('/src/') && url.includes('.css')) {
				fileType = '(CSS)';
			} else if (url.includes('/src/') && url.includes('.js')) {
				fileType = '(JS)';
			} else if (url.includes('.css')) {
				fileType = '(CSS)';
			} else if (url.includes('.js')) {
				fileType = '(JS)';
			} else if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.svg') || url.includes('.webp')) {
				fileType = '(Image)';
			} else {
				fileType = '(Unknown)';
			}
			break;
	}

	return {
		fileName,
		fileType
	};
}