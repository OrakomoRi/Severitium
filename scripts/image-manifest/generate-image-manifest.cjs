const fs = require('fs');
const path = require('path');

const CONFIG = {
	imagesDir: path.join(__dirname, '..', '..', 'images'),
	outputFile: path.join(__dirname, '..', '..', 'site', 'config', 'image-manifest.json'),
	imageExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
	themeDirectories: { new: 'new', old: 'old' },
	manifestVersion: '1.0.0'
};

function isImageFile(filename) {
	return CONFIG.imageExtensions.includes(path.extname(filename).toLowerCase());
}

function getBaseName(filename) {
	return path.parse(filename).name;
}

function scanDirectory(dirPath) {
	try {
		if (!fs.existsSync(dirPath)) return [];
		return fs.readdirSync(dirPath).filter(isImageFile).sort();
	} catch (error) {
		console.error(`Error scanning directory ${dirPath}:`, error.message);
		return [];
	}
}

function matchFiles(newFiles, oldFiles) {
	const newBaseNames = new Map(newFiles.map(f => [getBaseName(f), f]));
	const oldBaseNames = new Map(oldFiles.map(f => [getBaseName(f), f]));

	const matched = [];
	const unmatchedNew = [];
	const unmatchedOld = [];

	for (const [baseName, newFile] of newBaseNames) {
		if (oldBaseNames.has(baseName)) {
			matched.push({ baseName, new: newFile, old: oldBaseNames.get(baseName) });
		} else {
			unmatchedNew.push(newFile);
		}
	}

	for (const [baseName, oldFile] of oldBaseNames) {
		if (!newBaseNames.has(baseName)) unmatchedOld.push(oldFile);
	}

	return { matched, unmatchedNew, unmatchedOld };
}

function discoverCategories() {
	try {
		return fs.readdirSync(CONFIG.imagesDir)
			.filter(item => fs.statSync(path.join(CONFIG.imagesDir, item)).isDirectory())
			.sort();
	} catch (error) {
		console.error('Error discovering categories:', error.message);
		return [];
	}
}

function processCategory(category) {
	const categoryPath = path.join(CONFIG.imagesDir, category);
	const newFiles = scanDirectory(path.join(categoryPath, CONFIG.themeDirectories.new));
	const oldFiles = scanDirectory(path.join(categoryPath, CONFIG.themeDirectories.old));

	if (newFiles.length === 0 && oldFiles.length === 0) {
		console.log(`${category}: No images found (skipped)`);
		return null;
	}

	const { matched, unmatchedNew, unmatchedOld } = matchFiles(newFiles, oldFiles);

	console.log(`${category}:`);
	console.log(`  Matched pairs: ${matched.length}`);
	if (unmatchedNew.length > 0) console.log(`  Only in new/: ${unmatchedNew.join(', ')}`);
	if (unmatchedOld.length > 0) console.log(`  Only in old/: ${unmatchedOld.join(', ')}`);

	const categoryData = { matched };

	if (unmatchedNew.length > 0 || unmatchedOld.length > 0) {
		categoryData.warnings = {};
		if (unmatchedNew.length > 0) categoryData.warnings.unmatchedNew = unmatchedNew;
		if (unmatchedOld.length > 0) categoryData.warnings.unmatchedOld = unmatchedOld;
	}

	return categoryData;
}

function generateManifest() {
	console.log('Scanning image directories...\n');

	const manifest = {
		version: CONFIG.manifestVersion,
		generated: new Date().toISOString(),
		categories: {}
	};

	const categories = discoverCategories();

	if (categories.length === 0) {
		console.warn('No categories found!');
		return manifest;
	}

	console.log(`Found ${categories.length} categories: ${categories.join(', ')}\n`);

	for (const category of categories) {
		const categoryData = processCategory(category);
		if (categoryData) manifest.categories[category] = categoryData;
	}

	return manifest;
}

function writeManifest(manifest) {
	try {
		const outputDir = path.dirname(CONFIG.outputFile);
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

		fs.writeFileSync(CONFIG.outputFile, JSON.stringify(manifest, null, 2), 'utf8');

		const totalCategories = Object.keys(manifest.categories).length;
		const totalMatched = Object.values(manifest.categories).reduce((sum, cat) => sum + cat.matched.length, 0);
		const categoriesWithWarnings = Object.values(manifest.categories).filter(cat => cat.warnings).length;

		console.log('\nManifest generated successfully!');
		console.log(`Saved to: ${path.relative(process.cwd(), CONFIG.outputFile)}`);
		console.log(`Total categories: ${totalCategories}`);
		console.log(`Total matched pairs: ${totalMatched}`);

		if (categoriesWithWarnings > 0) {
			console.log(`Categories with warnings: ${categoriesWithWarnings}`);
		}
	} catch (error) {
		throw new Error(`Failed to write manifest: ${error.message}`);
	}
}

function main() {
	try {
		console.log(`Image Manifest Generator v${CONFIG.manifestVersion}`);
		console.log('─'.repeat(60) + '\n');

		const manifest = generateManifest();
		writeManifest(manifest);

		console.log('\n' + '─'.repeat(60));
		console.log('Done!\n');

		process.exit(0);
	} catch (error) {
		console.error('\nError:', error.message);
		process.exit(1);
	}
}

if (require.main === module) main();

module.exports = { generateManifest, writeManifest, CONFIG };
