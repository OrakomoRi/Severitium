# Image Manifest Generator

Scans `images/` and generates a JSON manifest mapping matched image pairs between `new/` and `old/` theme directories. Files are matched by base name, allowing different formats per theme.

## Usage

```bash
npm run manifest
# or
node scripts/image-manifest/generate-image-manifest.cjs
```

Run this script whenever you add, remove, or rename images.

## Output

Generates `assets/config/image-manifest.json`:

```json
{
  "version": "1.0.0",
  "generated": "2025-10-05T12:00:00.000Z",
  "categories": {
    "battle": {
      "matched": [
        { "baseName": "battlechat", "new": "battlechat.png", "old": "battlechat.gif" }
      ],
      "warnings": {
        "unmatchedNew": ["file-only-in-new.png"],
        "unmatchedOld": ["file-only-in-old.gif"]
      }
    }
  }
}
```

`warnings` is only present when unmatched files exist.

## Expected directory structure

```
images/
└── <category>/
    ├── new/
    └── old/
```

## File matching

Files are matched by base name (extension ignored):

```
new/button.png  +  old/button.gif  →  matched
new/icon.png    +  (no old file)   →  unmatchedNew
```
