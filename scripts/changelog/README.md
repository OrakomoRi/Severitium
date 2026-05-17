# Changelog Generator

Generates a Markdown changelog by comparing two Git refs. Detects added, changed, and removed modules by diffing file trees between refs.

## Usage

```bash
node scripts/changelog/generate-changelog.cjs [from] [to] [--with-libs]
```

| Argument | Default | Description |
|---|---|---|
| `from` | latest Git tag | Starting ref (tag or commit) |
| `to` | `HEAD` | Ending ref |
| `--with-libs` | off | Include changes under `src/libs/modules/` |

```bash
node scripts/changelog/generate-changelog.cjs v1.9.2 v1.9.3
node scripts/changelog/generate-changelog.cjs v1.9.2 HEAD --with-libs
node scripts/changelog/generate-changelog.cjs v1.9.2
```

## Output

Writes Markdown to stdout. The version placeholder must be filled in manually.

```markdown
## [MAJOR.MINOR.PATCH] - 2026-05-17

### Added

- Battle
  - BattleEnd

### Changed

- Garage
  - DescriptionBlock
  - UpgradesBlock

### Removed

- Shop
  - PurchaseScreen
```

If files outside `src/modules/` and `src/libs/modules/` were changed, they are listed in an HTML comment block at the end.

## Module detection

A file path is attributed to a module if it matches:

```
src/modules/<Category>/<Module>/...   ->  grouped under Category / Module
src/libs/modules/<Lib>/...            ->  grouped under Libs (requires --with-libs)
```

Status (Added / Changed / Removed) is determined by comparing the file trees of both refs, not by the Git status flags.

## Expected source structure

```
src/
├── modules/
│   └── <Category>/
│       └── <Module>/
└── libs/
    └── modules/
        └── <Lib>/
```
