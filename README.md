# Airtable Interface Extension Kit

A starter kit for building Airtable Custom Interfaces with React + antd. Distilled from a production project, with the SDK gotchas already neutralized and the shared scaffold already in place.

Made by Michael Klar. Released under the [MIT License](LICENSE).

## Quickstart

```bash
git clone <this-repo> my-project
cd my-project

# 1. Set your brand
$EDITOR extensions/shared/brand.config.jsx
#   - BRAND.primary, BRAND.primaryDark, BRAND.accent
#   - STORAGE_PREFIX (e.g., 'myproj_')

# 2. Set your demo table name
$EDITOR extensions/hello-world/constants.jsx
#   - TABLE_NAME = '<your Airtable table>'

# 3. Build the demo bundle
bash extensions/hello-world/build.sh
# → extensions/output/hello-world.bundle.jsx

# 4. In Airtable: Interface Designer → Add Custom Interface → Edit Source → paste
# 5. Configure the Interface to expose your table + fields
# 6. Confirm the navbar paints, records load, and view-mode persists across reload
```

To scaffold additional extensions:

```bash
bash scripts/new-extension.sh my-other-extension
```

## What's in this kit

- **`extensions/shared/`** — Reusable, brand-parameterized scaffolding: CDN loader (antd 5.22.7 + dayjs + marked + DOMPurify), generic design tokens, helpers for field reads / linked records / sessionStorage state, and an antd theme factory.
- **`extensions/hello-world/`** — Demo extension exercising every shared component end-to-end. Use it as a template.
- **`scripts/new-extension.sh`** — Generator for new extension folders.
- **`docs/`** — Topical docs distilled from ~10 sessions of footgun-trigger experience: SDK gotchas, API patterns, the antd-in-iframe canon, build/deploy, UX conventions, lessons learned.
- **`memory/`** — Portable Nimbalyst memory files. If you open the kit in Nimbalyst, these load automatically.
- **`.claude/settings.example.json`** — Starter permission allowlist for Claude Code. Copy to `.claude/settings.local.json` to activate (Claude Code reads only the `.local` filename). The starter is intentionally minimal: add your project's domains (your Airtable base URLs, the Airtable docs site `airtable.com`, internal tools, etc.) as needed.

## Where to learn more

- **Cloning for a new project?** Read [`docs/porting-checklist.md`](docs/porting-checklist.md).
- **Before adding code?** Read [`docs/airtable-sdk-gotchas.md`](docs/airtable-sdk-gotchas.md). Many of the SDK's failure modes are silent (no error, just wrong behavior).
- **Hitting an antd issue?** [`docs/antd-in-iframe-canon.md`](docs/antd-in-iframe-canon.md).
- **Working with the Airtable REST or Blocks SDK API?** [`docs/airtable-api-patterns.md`](docs/airtable-api-patterns.md).
