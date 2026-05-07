# Build and Deploy

## Tech Stack

- **Airtable** Custom Interface Extension (the Edit Source path, not CLI Blocks).
- **React 16.14.0** — pinned by the Airtable SDK. No Suspense, no concurrent mode, no React 18+ hooks.
- **antd 5.22.7** — loaded at runtime via CDN injection (see `extensions/shared/cdn-loader.jsx`). v6.x is incompatible.
- **dayjs**, **marked@4.3.0**, **DOMPurify@3.0.8** — also CDN-injected. The pinned `marked` version is the last UMD-friendly major; v7+ is ESM-only and won't load via `<script>` tag.
- **Inline styles + Tailwind** — Tailwind classes work in the Edit Source environment, but the kit's components default to inline styles + `useDesignTokens()` for portability.
- **No npm packages.** Edit Source is a sandboxed JSX editor with no package manager. CDN loading via DOM injection is the only dependency mechanism.

## Why Edit Source (not the CLI)

The CLI-based Blocks workflow (`block init` → `block run` → `block release`) requires a Personal Access Token with `block:manage` scope. Many enterprise Airtable orgs block PATs on Enterprise-owned bases. The Edit Source path bypasses this entirely — code is edited inline in Interface Designer with no PAT, no CLI, and no deploy step beyond pasting.

Trade-off: no npm. The kit's CDN-loader pattern + `build.sh` concatenation is the workaround.

## Build pipeline

Modular source files in `extensions/shared/` and `extensions/<your-extension>/` are concatenated into a single `.bundle.jsx` for Airtable deployment. The build is a one-line `cat` invocation per extension.

**Build commands:**

```bash
bash extensions/<extension-name>/build.sh
# → extensions/output/<extension-name>.bundle.jsx
```

**Workflow:**
1. Edit modular source files
2. Run `build.sh`
3. Open the Custom Interface in Airtable → Edit Source
4. Paste `output/<extension-name>.bundle.jsx`
5. Test live → iterate

## Output directory convention

All built bundles end in `*.bundle.jsx` and live in `extensions/output/`. The `.gitignore` excludes them — they're build artifacts, not source. The convention is invariant: every built extension produces `<name>.bundle.jsx`.

## Concatenation order

The order is load-bearing: there are no `import`/`export` statements (everything is flat scope after concat), so any forward reference will fail at runtime. The canonical order:

1. **`shared/cdn-loader.jsx`** — React imports + window-bridging + `loadAntd` + `<AntdLoader>`
2. **`shared/brand.config.jsx`** — `BRAND`, `STORAGE_PREFIX` (must precede `constants.jsx` and `helpers.jsx`)
3. **`shared/constants.jsx`** — `COLORS`, `SHADOWS`, `AIRTABLE_COLORS`, `CHIP_FALLBACK` (reads `BRAND`)
4. **`shared/helpers.jsx`** — Field reads, sessionStorage, deep links (reads `STORAGE_PREFIX`, `AIRTABLE_COLORS`)
5. **`shared/components.jsx`** — `AttributeChip`, `DiagnosticBanner`, `MultiSelectFilter`, `GridListToggle`, `AppLoadingSkeleton`
6. **`shared/theme.jsx`** — `createAntdTheme`, `<AntdThemeProvider>`, `useDesignTokens` (reads `BRAND`, `COLORS`)
7. **`<extension>/constants.jsx`** — Extension-specific table names, status colors, business enums
8. **`<extension>/views/*.jsx`** — Components used by `app.jsx`
9. **`<extension>/app.jsx`** — Root app component, data loading
10. **`<extension>/theme.jsx`** — `<Root>` wrapping `<AntdLoader>` → `<AntdThemeProvider>` → `<App>`, plus `initializeBlock` (must be last)

The generated `build.sh` from `scripts/new-extension.sh` already encodes this order.

## Adding a new extension

```bash
bash scripts/new-extension.sh <name>
```

This scaffolds `extensions/<name>/` with stub `constants.jsx`, `app.jsx`, `theme.jsx`, `views/`, and a `build.sh`. The generated stubs build to a valid (though minimal) bundle out of the box — useful for confirming the kit is wired correctly before you start writing real code.

## Validating the bundle before paste

The kit's bundle is JSX, which Node can't parse without Babel. `node --check` will error with "Unknown file extension .jsx" and is *not* a valid validator.

Sanity checks that *are* valid:
- File exists and is non-empty
- `head -3` shows the React imports from `cdn-loader.jsx`
- `tail -3` shows the `initializeBlock` call from `<extension>/theme.jsx`
- Line count is in the 600–1000 range for a basic extension
- `grep -c "^function "` shows roughly 25–40 top-level functions

Real validation happens when you paste into Edit Source — the Airtable JSX transpiler will surface syntax errors with line numbers, and the runtime will surface logic errors via the in-iframe error boundary.

## Multi-extension projects

Some projects ship multiple Custom Interfaces (e.g., one main app + one event wizard + one bulk-import tool). Each extension gets its own `extensions/<name>/` folder with its own `build.sh`. They share `extensions/shared/` (and therefore the same brand) but compile to independent bundles, each pasted into a separate Custom Interface in Airtable.
