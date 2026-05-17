# Variables Builder

Copies `src/modules/_variables/variables.css` to `dist/`, produces a minified version, and exports all CSS custom properties to a JSON file.

## Usage

```bash
npm run build:vars
# or
node scripts/build-variables/build-variables.cjs
```

If `src/modules/_variables/variables.css` does not exist, the script exits without error.

## Output

| File | Description |
|---|---|
| `dist/variables.css` | Source file copied as-is |
| `dist/variables.min.css` | Minified bundle (via csso) |
| `dist/variables.json` | All custom properties as a JSON object |

The output directory can be overridden with the `OUTPUT_DIR` environment variable.

## JSON format

```json
{
  "version": "1.9.3",
  "timestamp": "2026-05-17T00:00:00.000Z",
  "variables": {
    "--color-primary": "#1a1a2e",
    "--font-size-base": "14px"
  }
}
```

The `version` field is read from the `VERSION` environment variable, falling back to `version` in `package.json`.

## Variable parsing

Only properties declared directly inside the top-level `:root { }` block are extracted. Nested rules, media queries, and properties outside `:root` are not included in the JSON output.
