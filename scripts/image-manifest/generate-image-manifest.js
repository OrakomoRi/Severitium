/**
 * Image Manifest Generator
 * 
 * Automatically scans all image directories and generates a JSON manifest file
 * that maps image pairs between 'new' and 'old' theme directories.
 * 
 * @description
 * This script discovers all categories by scanning the images/ directory,
 * then for each category it matches files from new/ and old/ subdirectories
 * by base filename (ignoring extensions). This allows the gallery to support
 * different image formats (e.g., file.png in new/, file.gif in old/).
 * 
 * @usage
 * Run this script whenever you add, remove, or rename images:
 *   node scripts/generate-image-manifest.js
 * 
 * Or add to package.json scripts:
 *   "scripts": {
 *     "manifest": "node scripts/generate-image-manifest.js"
 *   }
 * 
 * @output
 * Creates assets/config/image-manifest.json with structure:
 * {
 *   "version": "1.0.0",
 *   "generated": "2025-10-05T...",
 *   "categories": {
 *     "battle": {
 *       "matched": [{ baseName, new, old }],
 *       "warnings": { unmatchedNew, unmatchedOld }
 *     }
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
	/** Base directory containing all image categories */
	imagesDir: path.join(__dirname, '..', '..', 'images'),

	/** Output file path for the generated manifest */
	outputFile: path.join(__dirname, '..', '..', 'assets', 'config', 'image-manifest.json'),

	/** Supported image file extensions */
	imageExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],

	/** Theme subdirectory names */
	themeDirectories: {
		new: 'new',
		old: 'old'
	},

	/** Manifest version for compatibility tracking */
	manifestVersion: '1.0.0'
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a filename has a supported image extension
 * @param {string} filename - The filename to check
 * @returns {boolean} True if the file is a supported image type
 */
function isImageFile(filename) {
	const ext = path.extname(filename).toLowerCase();
	return CONFIG.imageExtensions.includes(ext);
}

/**
 * Extract base name from filename (without extension)
 * @param {string} filename - The filename with extension
 * @returns {string} The base name without extension
 * @example getBaseName('image.png') => 'image'
 */
function getBaseName(filename) {
	return path.parse(filename).name;
}

/**
 * Scan a directory and return list of image files
 * @param {string} dirPath - Absolute path to the directory
 * @returns {string[]} Array of image filenames (not full paths)
 */
function scanDirectory(dirPath) {
	try {
		if (!fs.existsSync(dirPath)) {
			return [];
		}

		const files = fs.readdirSync(dirPath);
		return files.filter(isImageFile).sort();
	} catch (error) {
		console.error(`Error scanning directory ${dirPath}:`, error.message);
		return [];
	}
}

/**
 * Match files from two directories by base name
 * @param {string[]} newFiles - Array of filenames from new/ directory
 * @param {string[]} oldFiles - Array of filenames from old/ directory
 * @returns {Object} Object with matched pairs and unmatched files
 */
function matchFiles(newFiles, oldFiles) {
	const newBaseNames = new Map(newFiles.map(f => [getBaseName(f), f]));
	const oldBaseNames = new Map(oldFiles.map(f => [getBaseName(f), f]));

	const matched = [];
	const unmatchedNew = [];
	const unmatchedOld = [];

	// Find matches
	for (const [baseName, newFile] of newBaseNames) {
		if (oldBaseNames.has(baseName)) {
			matched.push({
				baseName,
				new: newFile,
				old: oldBaseNames.get(baseName)
			});
		} else {
			unmatchedNew.push(newFile);
		}
	}

	// Find old files without new counterpart
	for (const [baseName, oldFile] of oldBaseNames) {
		if (!newBaseNames.has(baseName)) {
			unmatchedOld.push(oldFile);
		}
	}

	return { matched, unmatchedNew, unmatchedOld };
}

// ============================================================================
// Category Processing
// ============================================================================

/**
 * Discover all category directories in the images folder
 * @returns {string[]} Array of category names
 */
function discoverCategories() {
	try {
		const items = fs.readdirSync(CONFIG.imagesDir);
		return items.filter(item => {
			const itemPath = path.join(CONFIG.imagesDir, item);
			return fs.statSync(itemPath).isDirectory();
		}).sort();
	} catch (error) {
		console.error('Error discovering categories:', error.message);
		return [];
	}
}

/**
 * Process a single category and return its manifest data
 * @param {string} category - Category name
 * @returns {Object|null} Category manifest data or null if empty
 */
function processCategory(category) {
	const categoryPath = path.join(CONFIG.imagesDir, category);
	const newPath = path.join(categoryPath, CONFIG.themeDirectories.new);
	const oldPath = path.join(categoryPath, CONFIG.themeDirectories.old);

	// Scan both theme directories
	const newFiles = scanDirectory(newPath);
	const oldFiles = scanDirectory(oldPath);

	// Skip empty categories
	if (newFiles.length === 0 && oldFiles.length === 0) {
		console.log(`⚠️  ${category}: No images found (skipped)`);
		return null;
	}

	// Match files between themes
	const { matched, unmatchedNew, unmatchedOld } = matchFiles(newFiles, oldFiles);

	// Log category results
	console.log(`✅ ${category}:`);
	console.log(`   📦 Matched pairs: ${matched.length}`);

	if (unmatchedNew.length > 0) {
		console.log(`   ⚠️  Only in new/: ${unmatchedNew.join(', ')}`);
	}
	if (unmatchedOld.length > 0) {
		console.log(`   ⚠️  Only in old/: ${unmatchedOld.join(', ')}`);
	}

	// Return category data
	const categoryData = { matched };

	// Only include warnings if there are unmatched files
	if (unmatchedNew.length > 0 || unmatchedOld.length > 0) {
		categoryData.warnings = {};
		if (unmatchedNew.length > 0) categoryData.warnings.unmatchedNew = unmatchedNew;
		if (unmatchedOld.length > 0) categoryData.warnings.unmatchedOld = unmatchedOld;
	}

	return categoryData;
}

// ============================================================================
// Manifest Generation
// ============================================================================

/**
 * Generate the complete image manifest
 * @returns {Object} The generated manifest object
 */
function generateManifest() {
	console.log('🔍 Scanning image directories...\n');

	// Initialize manifest structure
	const manifest = {
		version: CONFIG.manifestVersion,
		generated: new Date().toISOString(),
		categories: {}
	};

	// Discover and process all categories
	const categories = discoverCategories();

	if (categories.length === 0) {
		console.warn('⚠️  No categories found!');
		return manifest;
	}

	console.log(`📁 Found ${categories.length} categories: ${categories.join(', ')}\n`);

	// Process each category
	for (const category of categories) {
		const categoryData = processCategory(category);
		if (categoryData) {
			manifest.categories[category] = categoryData;
		}
	}

	return manifest;
}

/**
 * Write manifest to file with proper formatting
 * @param {Object} manifest - The manifest object to write
 */
function writeManifest(manifest) {
	try {
		// Ensure output directory exists
		const outputDir = path.dirname(CONFIG.outputFile);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Write formatted JSON
		const manifestJson = JSON.stringify(manifest, null, 2);
		fs.writeFileSync(CONFIG.outputFile, manifestJson, 'utf8');

		// Calculate statistics
		const totalCategories = Object.keys(manifest.categories).length;
		const totalMatched = Object.values(manifest.categories)
			.reduce((sum, cat) => sum + cat.matched.length, 0);
		const categoriesWithWarnings = Object.values(manifest.categories)
			.filter(cat => cat.warnings).length;

		// Log success
		console.log('\n✨ Manifest generated successfully!');
		console.log(`📄 Saved to: ${path.relative(process.cwd(), CONFIG.outputFile)}`);
		console.log(`📊 Total categories: ${totalCategories}`);
		console.log(`🖼️  Total matched pairs: ${totalMatched}`);

		if (categoriesWithWarnings > 0) {
			console.log(`⚠️  Categories with warnings: ${categoriesWithWarnings}`);
			console.log('    (See manifest for details on unmatched files)');
		}
	} catch (error) {
		throw new Error(`Failed to write manifest: ${error.message}`);
	}
}

// ============================================================================
// Main Execution
// ============================================================================

/**
 * Main entry point
 */
function main() {
	try {
		console.log('🎨 Image Manifest Generator v' + CONFIG.manifestVersion);
		console.log('━'.repeat(60) + '\n');

		const manifest = generateManifest();
		writeManifest(manifest);

		console.log('\n' + '━'.repeat(60));
		console.log('✅ Done! Run this script again when you add/remove images.\n');

		process.exit(0);
	} catch (error) {
		console.error('\n❌ Error generating manifest:', error.message);
		console.error(error.stack);
		process.exit(1);
	}
}

// Run if executed directly
if (require.main === module) {
	main();
}

// Export for potential use as a module
module.exports = { generateManifest, writeManifest, CONFIG };
