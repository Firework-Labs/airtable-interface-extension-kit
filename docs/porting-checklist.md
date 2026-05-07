# Porting Checklist

Step-by-step from `git clone` to a working extension pasted in Airtable. ~10–15 minutes if you have an Airtable base ready and ~5 if you've already done it once.

## 1. Clone the kit

```bash
git clone <kit-url> my-project
cd my-project
git remote remove origin   # or set new origin to your project's repo
```

(If you cloned via filesystem copy from a sibling repo, `git remote -v` may already be empty — skip the remote remove.)

## 2. Brand the shared layer

Edit `extensions/shared/brand.config.jsx`:

- `BRAND.primary` — your brand's main color. Becomes antd's `colorPrimary` (buttons, focus rings, tabs, links).
- `BRAND.primaryDark` — your brand's dark color. Becomes the primary text color and chip outline.
- `BRAND.accent` — secondary highlight color (often the same as `primary`).
- `STORAGE_PREFIX` — a short namespace string (e.g., `'myproj_'`) used to namespace `sessionStorage` keys.

These are the only edits required in `extensions/shared/`. Everything else flows from these constants.

## 3. Configure the demo extension's data shape

Edit `extensions/hello-world/constants.jsx`:

- `TABLE_NAME` — the Airtable table the demo will read from (default `'Records'`).
- `NAME_FIELD` — single line text field for record names (default `'Name'`).
- `STATUS_FIELD` — single-select field for status chips (default `'Status'`).

If you don't have a table yet, see [`hello-world-airtable-setup.md`](hello-world-airtable-setup.md) for the minimal schema to create.

## 4. Build the demo bundle

```bash
bash extensions/hello-world/build.sh
```

You should see:

```
✓ Built output/hello-world.bundle.jsx (~777 lines)
```

If the build fails, check that `extensions/shared/` still has all 6 expected files (cdn-loader, brand.config, constants, helpers, components, theme).

## 5. Paste into Airtable

1. Open your Airtable base → **Interface Designer**.
2. Add a Custom Interface (or open an existing one).
3. Add a **Custom Interface Extension** element to a page.
4. Click **Edit Source** on the element.
5. Replace the default code with the contents of `extensions/output/hello-world.bundle.jsx`.
6. Save.

## 6. Configure the Interface to expose your data

In the element's **Source data** sidebar:

- Set the table to `TABLE_NAME` (default `Records`).
- Expose the fields the bundle needs: `Name`, `Status`, **and the table's primary field** (the SDK crashes if the primary field isn't exposed — see [`airtable-sdk-gotchas.md`](airtable-sdk-gotchas.md)).
- If you intend to write records (which the demo doesn't, but later extensions might), enable **inline record editing** under the table's settings.

Publish the interface.

## 7. Verify

The rendered extension should show:

- The "Hello, world." header in your brand-dark color.
- A `Status` filter that reflects your table's choices.
- A grid/list/mini view-mode toggle.
- One card per record, with chip colors matching the Airtable choice colors.

If the `<DiagnosticBanner>` reports issues, follow its guidance — it will tell you exactly which table/field is missing.

## 8. Confirm sessionStorage persistence

Toggle the view mode to "list" or "mini," reload the page (or close + reopen the Interface). The view mode should survive.

Apply a filter, reload. The filter selection should survive.

If neither persists, check that `STORAGE_PREFIX` in `brand.config.jsx` is a valid string and that `sessionStorage` isn't blocked by your browser settings for the Airtable iframe.

## 9. Scaffold additional extensions

```bash
bash scripts/new-extension.sh my-other-extension
```

This creates `extensions/my-other-extension/` with stub `constants.jsx`, `app.jsx`, `theme.jsx`, `views/`, and `build.sh` — all using the canonical shared scaffold.

## 10. Replace this kit's CLAUDE.md with your project's

The kit ships with a generic `CLAUDE.md` that points to the topical `docs/` files. For your project, **rewrite this file from scratch** (don't try to diff against the kit's version):

- Project Overview — what your app does
- Schema — your tables, key fields, business rules
- Active plans — current work-in-progress, deferred items
- Project-specific conventions

Keep `docs/airtable-sdk-gotchas.md`, `docs/airtable-api-patterns.md`, and `docs/antd-in-iframe-canon.md` — they remain accurate for any Airtable + antd Interface Extension project. Delete or repurpose the others as needed.

## Common stumbles

| Symptom | Cause | Fix |
|---------|-------|-----|
| `<DiagnosticBanner>` says "Table not found" | Table name in `constants.jsx` doesn't match Airtable | Edit `constants.jsx` and rebuild, or rename the Airtable table |
| Extension crashes with "No field with ID …" | Primary field isn't exposed in Interface Designer | Open the element's Source data sidebar and add the table's first column |
| Cards render but no chip colors | `Status` field has no choice colors set | Open the Airtable field options and set choice colors |
| Filter selection doesn't persist on reload | Browser blocking sessionStorage in iframes | Try a different browser; or check Airtable iframe permissions |
| Bundle file is empty | `extensions/shared/` is missing files | Run `ls extensions/shared/` — you should see 6 `.jsx` files |
