/**
	 * Extracts the file name from the URL in the format "Folder/FileName"
	 * and determines the file type (CSS or image).
	 * 
	 * @param {string} url - The full URL of the file
	 * @returns {{fileName: string, fileType: string}} - Extracted file name and type
	 */
function _extractFileName(url) {
	let match;
	let fileType = '(Unknown)';

	// Check if the URL is an image
	if (url.includes('/src/.images/')) {
		match = url.match(/\/src\/\.images\/[^/]+\/([^/]+\/[^/.]+)/);
		fileType = '(image)';
	}
	// Otherwise, assume it's a CSS file
	else {
		match = url.match(/\/src\/([^/]+(?:\/[^/]+)*)\//);
		fileType = '(CSS)';
	}

	return {
		fileName: match ? match[1] : "Unknown",
		fileType
	};
}