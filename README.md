# Builds branch

This is the `builds` branch containing **compiled artifacts** for all stable versions of the **Severitium** theme.

Each folder in the root represents a specific version and contains:

- `script.release.min.js` – minified JavaScript
- `style.release.min.css` – minified CSS

Additionally, the repository includes:

- `versions/versions.json` – complete version history with full Git commit hashes, dates, comments, and version numbers for all releases

Example structure:

```
├── 1.7.2+build16/
│ ├── script.release.min.js
│ └── style.release.min.css
├── 1.7.2+build17/
│ ├── script.release.min.js
│ └── style.release.min.css
```

## :repeat: Updates

Builds are generated **automatically** whenever the version in `release/severitium.user.js` is updated in the `main` branch.

## :link: Main Source

The main source code is located in the [`main` branch](https://github.com/OrakomoRi/Severitium/tree/main).

## :gear: Usage

Links from this branch can be used in `@require`, `@updateURL`, `@downloadURL`, etc., if you want to reference a specific stable/unstable version.

---

> :warning: Do not edit files in this branch manually — they will be overwritten by the next build.
