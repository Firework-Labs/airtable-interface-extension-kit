# Hello-World Airtable Setup

What you need to configure in Airtable before the `hello-world` bundle will render anything useful. Resolves the chicken-and-egg of "I pasted the bundle, now what?"

## Minimal table schema

The `hello-world` extension expects a table called **`Records`** with these two fields:

| Field | Type | Notes |
|-------|------|-------|
| `Name` | Single line text | Primary field. Any value, can be empty. |
| `Status` | Single select | Any choices, any choice colors. The filter and chip rendering both use whatever you configure here. |

That's it. Add a few rows with different `Status` values to see filtering work.

## Interface Designer configuration

1. Open the Airtable base → **Interface Designer**.
2. Create a new Custom Interface (or open an existing one).
3. Add a **Custom Interface Extension** element.
4. Click **Edit Source** and paste the contents of `extensions/output/hello-world.bundle.jsx`.
5. In the element's **Source data** sidebar:
   - Set the table to **`Records`**.
   - Expose the fields: `Name`, `Status`, **and the primary field** (which is `Name` in this setup, but if you reorder columns make sure whatever's in column 1 is exposed — see [`airtable-sdk-gotchas.md`](airtable-sdk-gotchas.md) for why).
6. **Publish** the interface (otherwise live record reads may fail).

## Confirming it works

After paste + publish, the rendered extension should show:

- The header `Hello, world.` in your `BRAND.primaryDark` color.
- A `<MultiSelectFilter>` populated with whatever `Status` choices you defined (placeholder: "All Status").
- A grid/list/mini toggle (`<GridListToggle>`) on the right.
- One card per record, with the `Name` and a `<AttributeChip>` for the `Status` value matching Airtable's choice color.

If you don't see records:
- The `<DiagnosticBanner>` should tell you why (missing table, missing field).
- If the banner is empty but no records show, check that the table actually has rows — the empty-state message is `No records in "Records" yet`.

## Renaming the table

If you want to use an existing table with different field names, edit `extensions/hello-world/constants.jsx`:

```js
const TABLE_NAME = 'YourTableName';
const NAME_FIELD = 'Title';        // or whatever your text field is
const STATUS_FIELD = 'State';      // or whatever your single-select field is
```

Then rebuild: `bash extensions/hello-world/build.sh` and re-paste.

## Iterating

The kit's workflow is: edit source → run `build.sh` → re-paste into Edit Source → save. Airtable preserves the publication state across re-saves, so you don't need to re-publish after every iteration.
