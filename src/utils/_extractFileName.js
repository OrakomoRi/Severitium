const GROUPS = {
	css: ['css'],
	js: ['js'],
	json: ['json'],
	image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff', 'avif'],
	html: ['html', 'htm'],
	xml: ['xml']
};

const EXTENSIONS = Object.fromEntries(
	Object.entries(GROUPS).flatMap(([type, list]) =>
		list.map(ext => [ext, type])
	)
);

/**
 * Extracts the file name from the URL and determines the file type based on extension.
 * 
 * @param {String} url - The URL to extract the file name from
 * @return {Object} An object containing the file name and its type
 */
export function _extractFileName(url) {

	const file = url.split('#')[0].split('?')[0].split('/').pop() || 'Unknown';

	const parts = file.split('.');
	const extension = parts.length > 1 ? parts.pop().toLowerCase() : '';

	const fileType = EXTENSIONS[extension] ?? 'unknown';

	const cleanFileName = parts.join('.') || file;

	return {
		fileName: cleanFileName,
		fileType
	};
}