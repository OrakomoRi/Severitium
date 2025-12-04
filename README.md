# Severitium builds

This is the `builds` branch containing **compiled artifacts** and **version metadata** for the Severitium theme.

## 📦 What's Inside

### Version Artifacts
Each version is stored in its own directory under `versions/` containing:

- `script.release.min.js` — Minified JavaScript bundle
- `style.release.min.css` — Minified CSS bundle
- `variables.css` — Theme CSS variables (unminified)
- `variables.min.css` — Theme CSS variables (minified)
- `variables.json` — Theme variables in JSON format for programmatic access

### Version Registry
- **`versions.json`** — Complete version history with metadata (commit hash, date, message)
- **`stable.json`** — Registry of stable releases only (following [SemVer]) with direct download links

### Deployment Configuration
- **`vercel.json`** — CDN caching and CORS headers for optimal delivery

## 📂 Directory Structure

```
builds/
├── README.md                        # This file
├── versions.json                    # All versions (stable + dev/alpha/beta/rc)
├── stable.json                      # Stable versions only
├── vercel.json                      # Deployment configuration
└── versions/
    ├── 1.6.0/                       # Version family 1.6.0
    │   ├── 1.6.0-alpha/             # Alpha builds
    │   ├── 1.6.0-alpha10/
    │   └── ...
    ├── 1.6.1/                       # Version family 1.6.1
    │   ├── 1.6.1/                   # Stable release
    │   │   ├── script.release.min.js
    │   │   ├── style.release.min.css
    │   │   ├── variables.css
    │   │   ├── variables.min.css
    │   │   └── variables.json
    │   ├── 1.6.1+build10/           # Development builds
    │   ├── 1.6.1+build11/
    │   └── ...
    ├── 1.7.2/                       # Version family 1.7.2
    │   └── 1.7.2/                   # Stable release
    └── 1.8.3/                       # Version family 1.8.3
        └── ...
```

## 🔄 Automated Build Process

Builds are generated automatically via GitHub Actions when `release/severitium.user.js` is updated in the [`main` branch](https://github.com/OrakomoRi/Severitium/tree/main).

**Build Workflow:**
1. Extract version from userscript
2. Validate if version is stable (matches [SemVer] pattern: `X.Y.Z`)
3. Compile and minify all source files
4. Extract CSS variables to JSON
5. Push artifacts to `builds` branch
6. Update version registries
7. Create GitHub Release (stable versions only)

## 🔗 Usage

### CDN Links (via jsDelivr)
```javascript
// Latest stable version
https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/stable.json

// Specific version artifacts (format: versions/{MAJOR.MINOR.PATCH}/{MAJOR.MINOR.PATCH}/file)
https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/versions/1.7.2/1.7.2/script.release.min.js
https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/versions/1.7.2/1.7.2/style.release.min.css
https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/versions/1.7.2/1.7.2/variables.json

// Development build example
https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/versions/1.6.1/1.6.1+build10/script.release.min.js
```

### Userscript Integration
Use these links in your userscript metadata:
```javascript
// @updateURL    https://raw.githubusercontent.com/OrakomoRi/Severitium/main/release/severitium.user.js
// @downloadURL  https://raw.githubusercontent.com/OrakomoRi/Severitium/main/release/severitium.user.js
// @require      https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/versions/1.7.2/1.7.2/script.release.min.js
```

## 📋 Version Registry Format

### `versions.json`
Contains **all versions** (including dev builds):
```json
{
  "versions": [
    {
      "version": "1.7.2+build16",
      "date": "2025-07-14",
      "comment": "1.7.2+build16 feat: moved auto-release and build-theme into one yml: auto-build-and-release",
      "hash": "abc123"
    }
  ]
}
```

### `stable.json`
Contains **stable versions only** with direct links:
```json
{
  "versions": [
    {
      "version": "1.7.2",
      "date": "2025-04-01",
      "hash": "abc123",
      "link": "https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@abc123/release/severitium.user.js"
    }
  ]
}
```

## ⚠️ Important Notes

- **Do not manually edit files** in this branch — they are automatically generated and will be overwritten
- Stable versions follow [Semantic Versioning][SemVer] (`MAJOR.MINOR.PATCH`)
- Development builds use version suffixes: `+buildN`, `-alpha`, `-beta`, `-rc`
- Only stable versions trigger GitHub Releases

## 📚 Related Resources

- [Main Repository](https://github.com/OrakomoRi/Severitium/tree/main) — Source code and development
- [Releases](https://github.com/OrakomoRi/Severitium/releases) — Stable version releases
- [Website](https://orakomori.github.io/Severitium/) — Installation guide and documentation

[SemVer]: https://semver.org/
