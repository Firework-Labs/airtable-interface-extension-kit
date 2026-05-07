# Airtable API Patterns

Format-and-shape rules that aren't well-documented in the SDK reference but are required for code to actually work. Cross-reference with [`airtable-sdk-gotchas.md`](airtable-sdk-gotchas.md) for the silent-failure modes.

## Linked Records

**Blocks SDK / Interface Extensions** (when calling `createRecordAsync` / `updateRecordAsync`):

```js
await table.createRecordAsync({
    'Linked Field': [{ id: 'recXXXXXXXXXXXXXX' }],   // ✅ object array
});
```

**REST API / Scripting Extension** (when calling fetch PATCH / POST):

```js
{
    fields: {
        'Linked Field': ['recXXXXXXXXXXXXXX'],       // ✅ string array
    },
}
```

Conflating the two is the most common silent-write failure. Plain strings cause `invalid cell value` from the SDK; object arrays succeed but the linked records don't actually get linked via REST PATCH.

## Formulas

- **Always wrap linked fields in `ARRAYJOIN()`** when reading them in formulas. Otherwise you'll get array-as-string artifacts in the cell value.

- **`AND()` evaluates all arguments regardless of earlier results.** If a later argument depends on an earlier one being true (e.g., MID() with positions computed from FIND()), the cascade fails on absent data. Use nested `IF(AND(guard checks), IF(AND(content checks), "Valid", "Invalid"), "Invalid")`.

- **TRIM() is cheap insurance on string parsing.** LLM-generated content occasionally has stray whitespace; TRIM() costs nothing and prevents invisible parsing bugs.

- **Per-row only — no cross-table aggregates.** Airtable formulas have no `COUNTROWS()`, no `SUM()` across a table. The only cross-table mechanism is Rollup/Count on linked records, which requires a link field on both tables. For aggregates from synced (read-only) tables, you must compute the value in a script and write it.

## Select Fields

- **Single-select write format:** plain strings (`'AMER'`), not `{ name: 'AMER' }` objects.
- **Multi-select write format:** array of `{ name }` objects (`[{ name: 'AMER' }, { name: 'EMEA' }]`). Empty array `[]` clears.
- **Use `typecast: true`** when writing values that may not yet exist as choices — Airtable will auto-create the option.

## Metadata API gaps

Calls that look like they should work but don't:

- Cannot create lookup, createdTime, rollup, or count fields via the Metadata API. Create them in the Airtable UI.
- Cannot change a field's type via the Metadata API. Delete and recreate.

## Synced Tables

- Synced tables are read-only. No fields can be added, no cells can be written.
- This means you can't add a checkbox on a synced table to track per-row processing state. Workarounds: separate control table with offset counters, or auto-link new records via automation.
- Synced base changes can rename tables. The source base's "Responses" can become "SYNC - Submissions" in the target. Surface table names via the DiagnosticBanner so misconfiguration is visible.

## Airtable Choice Colors

Airtable's single/multi-select fields each have a `color` string (e.g., `'blueDark1'`, `'greenLight2'`). The kit's `extensions/shared/constants.jsx::AIRTABLE_COLORS` maps every choice color to a `{ bg, text }` pair. Use `helpers.getSelectChoiceColors(table, 'FieldName')` to build a label → color map for a specific field, then pass to `<AttributeChip fieldColors={...} />` so chips visually match the Airtable grid.

## Automation Scripts

- **`input.config()` can only be called once per script.** Store the result in a const at the top of the script.
- **Input variable casing must match exactly.** `recordID` (capital D) in the UI vs. `input.config().recordId` (lowercase d) silently returns `undefined`.
- **Run-script steps bypass the 100-record `Find Records` limit.** Use `table.selectRecordsAsync()` for full datasets.
- **No actions allowed after a Repeating Group closes.** Move post-processing into the script that's already inside the group, or into an Update Record action that runs before the group.
- **"Run automation" buttons require Record Review or Record Detail layouts** in the Interface Designer. Dashboard layouts can't host them.
