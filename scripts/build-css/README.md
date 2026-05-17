# CSS Builder

Collects all `.css` files from the source tree, concatenates them in a defined order, and writes a full and a minified bundle to `dist/`.

## Usage

```bash
npm run build:css
# or
node scripts/build-css/build-css.cjs
```

## Output

| File | Description |
|---|---|
| `dist/style.release.css` | Concatenated, unminified bundle |
| `dist/style.release.min.css` | Minified bundle (via csso) |

The output directory can be overridden with the `OUTPUT_DIR` environment variable.

## Collection order

Files are collected in this order, sorted alphabetically within each group:

1. `src/libs/`
2. `src/core/`
3. `src/utils/`
4. `src/modules/` (all subdirectories except `_variables`)

Files matching `*.min.css` are excluded. The `_variables` subdirectory inside `src/modules/` is excluded because variables are built separately by [build-variables](../build-variables/README.md).
