# Image Manifest System

This directory contains utilities for managing the gallery image manifest system.

## Overview

The gallery uses a **manifest-based approach** for discovering images instead of runtime file scanning. This provides:

- ⚡ **Fast Loading** - One JSON file load vs hundreds of HTTP HEAD requests
- 🎯 **Accuracy** - Guaranteed to match files that exist in both themes
- 🔄 **Automation** - Automatically discovers new categories and files
- 🧹 **Clean Console** - No 404 errors from probing for files

## How It Works

```
images/
├── battle/
│   ├── new/
│   │   ├── battlechat.png
│   │   └── battlepause.gif
│   └── old/
│       ├── battlechat.png
│       └── battlepause.gif
└── ...

         ↓ (Run script)

assets/config/image-manifest.json
{
  "version": "1.0.0",
  "generated": "2025-10-05T12:00:00Z",
  "categories": {
    "battle": {
      "matched": [
        { "baseName": "battlechat", "new": "battlechat.png", "old": "battlechat.png" },
        { "baseName": "battlepause", "new": "battlepause.gif", "old": "battlepause.gif" }
      ]
    }
  }
}
```

## Usage

### Generate Manifest

Run the generator script whenever you:
- Add new images
- Remove images  
- Rename images
- Create new categories

```bash
node scripts/image-manifest/generate-image-manifest.js
```

Or add to `package.json`:

```json
{
  "scripts": {
    "manifest": "node scripts/image-manifest/generate-image-manifest.js"
  }
}
```

Then run:
```bash
npm run manifest
```

### Output

The script will:
1. Scan all directories in `images/`
2. Match files between `new/` and `old/` subdirectories
3. Generate `assets/config/image-manifest.json`
4. Display statistics and warnings

Example output:
```
🎨 Image Manifest Generator v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Scanning image directories...

📁 Found 11 categories: battle, challenges, clan, containers, entrance, friends, general, lobby, quests, settings, shop

✅ battle:
   📦 Matched pairs: 3
✅ challenges:
   📦 Matched pairs: 2
...

✨ Manifest generated successfully!
📄 Saved to: assets/config/image-manifest.json
📊 Total categories: 11
🖼️  Total matched pairs: 87

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Done! Run this script again when you add/remove images.
```

## Manifest Format

### Structure

```json
{
  "version": "1.0.0",
  "generated": "2025-10-05T12:00:00.000Z",
  "categories": {
    "category-name": {
      "matched": [
        {
          "baseName": "filename-without-extension",
          "new": "filename-with-extension.png",
          "old": "filename-with-extension.gif"
        }
      ],
      "warnings": {
        "unmatchedNew": ["file-only-in-new.png"],
        "unmatchedOld": ["file-only-in-old.gif"]
      }
    }
  }
}
```

### Fields

- **version** - Manifest format version for compatibility
- **generated** - ISO timestamp of generation
- **categories** - Map of category names to category data
  - **matched** - Array of image pairs that exist in both themes
    - **baseName** - Filename without extension (for matching)
    - **new** - Actual filename in `new/` directory
    - **old** - Actual filename in `old/` directory
  - **warnings** - Optional object with unmatched files
    - **unmatchedNew** - Files only in `new/` directory
    - **unmatchedOld** - Files only in `old/` directory

## File Matching

Files are matched by **base name** (filename without extension):

```
new/button.png  +  old/button.gif  →  ✅ Matched (baseName: "button")
new/icon.png    +  old/icon.png    →  ✅ Matched (baseName: "icon")
new/logo.svg    +  (no old file)   →  ⚠️  Unmatched
(no new file)   +  old/legacy.png  →  ⚠️  Unmatched
```

This allows:
- Different formats between themes (PNG in new, GIF in old)
- Automatic updates when formats change
- Clean warnings for incomplete pairs

## Integration

### GalleryManager.js

The gallery component loads the manifest on initialization:

```javascript
async loadImages() {
  // Fetch pre-generated manifest
  const manifest = await this.fetchManifest();
  
  // Process matched image pairs
  for (const [category, data] of Object.entries(manifest.categories)) {
    for (const imageData of data.matched) {
      this.images.push({
        category,
        filename: imageData.new,
        title: this.formatTitle(imageData.new),
        newPath: `images/${category}/new/${imageData.new}`,
        oldPath: `images/${category}/old/${imageData.old}`
      });
    }
  }
}
```

### Category Selector

Categories are automatically populated from the manifest:

```javascript
setupCategorySelector() {
  // Extract unique categories from loaded images
  const categories = [...new Set(this.images.map(img => img.category))];
  
  // Build selector options with translations
  // No hardcoded category list needed!
}
```

## Workflow

### Adding New Images

1. Add image files to appropriate directories:
   ```
   images/battle/new/newimage.png
   images/battle/old/newimage.png
   ```

2. Regenerate manifest:
   ```bash
   node scripts/image-manifest/generate-image-manifest.js
   ```

3. Commit both images and updated manifest:
   ```bash
   git add images/ assets/config/image-manifest.json
   git commit -m "Add new battle images"
   ```

### Adding New Category

1. Create directory structure:
   ```
   images/new-category/
   ├── new/
   │   └── image.png
   └── old/
       └── image.png
   ```

2. Regenerate manifest:
   ```bash
   node scripts/image-manifest/generate-image-manifest.js
   ```

3. Add translations (optional but recommended):
   ```json
   // assets/lang/en.json
   {
     "gallery": {
       "new-category": "New Category"
     }
   }
   ```

4. Category automatically appears in gallery!

## Troubleshooting

### "Failed to load gallery images"

**Cause:** Manifest file is missing or invalid

**Solution:**
```bash
node scripts/image-manifest/generate-image-manifest.js
```

### "No images found"

**Cause:** Manifest has no matched pairs

**Solution:**
1. Check that images exist in both `new/` and `old/` directories
2. Ensure filenames match (ignoring extensions)
3. Regenerate manifest

### Warnings about unmatched files

**Cause:** Image exists in only one theme directory

**Solution:**
1. Add matching file to the other directory, OR
2. Remove the orphaned file if it's not needed

Example:
```
⚠️ battle:
   📦 Matched pairs: 3
   ⚠️ Only in new/: newfeature.png
```

Means: Add `images/battle/old/newfeature.png` (any format)

## Benefits

### Before (Runtime Discovery)

```javascript
// ❌ Problems:
- Hardcoded file list
- Hardcoded categories
- Hundreds of HTTP requests
- 404 errors in console
- Slow loading
- Manual updates needed
```

### After (Manifest System)

```javascript
// ✅ Benefits:
+ Automatic discovery
+ Single HTTP request
+ No 404 errors
+ Fast loading
+ Run script once per update
+ Scales to any number of images
```

## Advanced

### Custom Manifest Location

Edit `CONFIG.outputFile` in `generate-image-manifest.js`:

```javascript
const CONFIG = {
  outputFile: path.join(__dirname, '..', 'custom', 'path', 'manifest.json'),
  // ...
};
```

Then update `GalleryManager.js`:

```javascript
async fetchManifest() {
  const manifestPath = 'custom/path/manifest.json';
  // ...
}
```

### CI/CD Integration

Add to GitHub Actions workflow:

```yaml
name: Generate Manifest
on:
  push:
    paths:
      - 'images/**'

jobs:
  manifest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: node scripts/generate-image-manifest.js
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "Update image manifest"
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Regenerate manifest if images changed
if git diff --cached --name-only | grep -q "^images/"; then
  node scripts/image-manifest/generate-image-manifest.js
  git add assets/config/image-manifest.json
fi
```

## Support

For issues or questions:
1. Check the script output for specific errors
2. Verify file structure matches expected format
3. Ensure Node.js is installed (`node --version`)
4. Check that files have correct extensions

---

**Last Updated:** October 2025  
**Script Version:** 1.0.0  
**Maintained by:** Severitium Team
