/**
 * Severitium Website JavaScript
 * Handles version fetching and download link generation
 */

/**
 * Fetch the latest stable version from GitHub Pages
 * @returns {Promise<string>} URL to the latest stable version
 */
async function getLatestVersion() {
	const timestamp = new Date().getTime();
	try {
		const response = await fetch(`https://orakomori.github.io/Severitium/src/_preload/stable.json?t=${timestamp}`);
		const data = await response.json();

		if (data.versions && data.versions.length > 0) {
			const latestVersion = data.versions[data.versions.length - 1];
			return latestVersion.link;
		}
	} catch (error) {
		console.error('Error fetching latest version:', error);
		return `https://orakomori.github.io/Severitium/release/severitium.user.js?t=${timestamp}`;
	}

	// Fallback
	return `https://orakomori.github.io/Severitium/release/severitium.user.js?t=${timestamp}`;
}

/**
 * Initialize download buttons with proper URLs
 */
async function initializeDownloadButtons() {
	// Quick download buttons
	const latestBtn = document.getElementById('latest-btn');
	const stableBtn = document.getElementById('stable-btn');
	
	if (latestBtn) {
		// Remove href and add click handler for dynamic timestamp generation
		latestBtn.removeAttribute('href');
		latestBtn.addEventListener('click', function(e) {
			e.preventDefault();
			const timestamp = new Date().getTime();
			window.open(`https://orakomori.github.io/Severitium/release/severitium.user.js?t=${timestamp}`, '_blank');
		});
	}
	
	if (stableBtn) {
		const stableLink = await getLatestVersion();
		stableBtn.href = stableLink;
	}
	
	// Main install button
	const installButton = document.getElementById('install-script-btn');
	if (installButton) {
		const latestLink = await getLatestVersion();
		installButton.href = latestLink;
	}
}

/**
 * Initialize the website when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
	console.log('🖤 Severitium website loaded');
	initializeDownloadButtons();
});
