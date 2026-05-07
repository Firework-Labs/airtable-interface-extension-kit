# Airtable Interface Extension Kit

> **⚠ Not yet pushed to a remote.** Before publishing publicly, work through [PRE_PUBLISH_CHECKLIST.md](./PRE_PUBLISH_CHECKLIST.md) — covers a fresh-eyes pass for genericization, secrets/PII, personal preferences, license, and the `gh repo create` command.

## Project Overview

This is a **starter kit**, not a working app. It packages the project-agnostic SDK gotchas, antd-iframe rules, and reusable React/antd scaffolding from a production Airtable Custom Interface project, so a new project can clone, brand, and build a working extension in one sitting. When this kit is cloned for a real project, the consuming project should rewrite this file from scratch (don't diff against the kit's version).

## Tech Stack

Airtable Custom Interface (Edit Source path), React 16.14.0 (SDK constraint), antd 5.22.7 + dayjs + marked + DOMPurify via CDN runtime injection, bash concatenation builds. **No npm.**

## Critical reading

Before adding code, read [airtable-sdk-gotchas.md](./docs/airtable-sdk-gotchas.md). Many of the SDK's failure modes are silent — wrong behavior with no error.

| Doc | When to read |
| --- | --- |
| [airtable-sdk-gotchas.md](./docs/airtable-sdk-gotchas.md) | Before any code that touches `useRecords`, `useBase`, `getCellValue*`, `createRecordAsync`, `updateRecordAsync` |
| [airtable-api-patterns.md](./docs/airtable-api-patterns.md) | Before writing linked-record updates, formula fields, or automation scripts |
| [antd-in-iframe-canon.md](./docs/antd-in-iframe-canon.md) | Before adding any antd component that uses popups, modals, messages, or layouts |
| [build-and-deploy.md](./docs/build-and-deploy.md) | When the build/concat order doesn't match what you expect, or when adding new shared deps |
| [ux-conventions.md](./docs/ux-conventions.md) | When designing a new view (filter semantics, persistence, drawer keys, etc.) |
| [lessons-learned-airtable.md](./docs/lessons-learned-airtable.md) | For deeper context on why specific gotchas exist (cite the original session date for traceability) |
| [porting-checklist.md](./docs/porting-checklist.md) | First-time clone: clone → brand → build → paste workflow |
| [hello-world-airtable-setup.md](./docs/hello-world-airtable-setup.md) | What table schema the demo expects |

## Key Files

| File | Purpose |
| --- | --- |
| `extensions/shared/cdn-loader.jsx` | React bridging, CDN script/CSS loading, `<AntdLoader>` |
| `extensions/shared/brand.config.jsx` | `BRAND` palette + `STORAGE_PREFIX` — **single edit point for branding** |
| `extensions/shared/constants.jsx` | Generic design tokens (`COLORS`, `SHADOWS`, `AIRTABLE_COLORS`, `CHIP_FALLBACK`) |
| `extensions/shared/helpers.jsx` | Field reads, sessionStorage, deep links, `groupBy`, `getSelectChoiceColors` |
| `extensions/shared/components.jsx` | `AttributeChip`, `DiagnosticBanner`, `MultiSelectFilter`, `GridListToggle`, `AppLoadingSkeleton` |
| `extensions/shared/theme.jsx` | `createAntdTheme(brand)` factory, `<AntdThemeProvider>`, `useDesignTokens` |
| `extensions/hello-world/` | Demo extension — copy as a template for new extensions |
| `extensions/output/` | Build output (gitignored) — paste these into Airtable Edit Source |
| `scripts/new-extension.sh` | Generator — creates a new `extensions/<name>/` from canonical template |

## Build

```bash
bash extensions/<extension-name>/build.sh
# → extensions/output/<extension-name>.bundle.jsx
```

Concatenation order is load-bearing — see `docs/build-and-deploy.md` if you add a new shared file.

## Conventions

- Edit modular source files, **never edit \****`output/`**\*\* files**.
- New extensions get scaffolded via `scripts/new-extension.sh <name>`.
- Persist UI state via `loadState`/`saveState` (sessionStorage, namespaced by `STORAGE_PREFIX`).
- Surface missing tables/fields via `<DiagnosticBanner>`, never silent rendering.
- antd popup components require `getPopupContainer={trigger => trigger.parentElement}` — see the antd canon doc.
