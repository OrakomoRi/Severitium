# Icons Builder

Scans `src/assets/images/svg/` recursively, encodes each SVG as a `data:` URI, and outputs a CSS file that declares every icon as a custom property on `:root`.

## Usage

```bash
npm run build:icons
# or
node scripts/build-icons/build-icons.cjs
```

## Output

| File | Description |
|---|---|
| `dist/icons.release.css` | Full CSS with all icon variables |
| `dist/icons.release.min.css` | Minified bundle (via csso) |

The output directory can be overridden with the `OUTPUT_DIR` environment variable.

## Variable naming

Each variable name is derived from the SVG file path relative to `src/assets/images/svg/`, with path separators replaced by `-` and the result lowercased:

```
src/assets/images/svg/battle/chat.svg  ->  --severitium-battle-chat-icon
src/assets/images/svg/ui/close.svg     ->  --severitium-ui-close-icon
```

Characters other than `a-z`, `0-9`, `-`, and `_` are stripped. If two files produce the same name, a warning is printed to stderr and the last one wins.

## SVG encoding

SVGs are inlined as `url('data:image/svg+xml,...')`. Before encoding, the script:

- Collapses whitespace sequences to a single space
- Replaces `'` with `"` (URL-safe quoting inside the `url()` wrapper)
- Percent-encodes `#` and `&`

## Expected source structure

```
src/assets/images/svg/
└── <group>/
    └── <name>.svg
```
