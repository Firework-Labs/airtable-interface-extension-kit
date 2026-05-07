# UX Conventions

Patterns that have proven themselves across many sessions of Airtable Interface Extension work. Consistency across views is a UX feature in itself — adopt these defaults unless you have a specific reason to deviate.

## Filter semantics

**Empty filter set = show all.** The kit's filter components (`MultiSelectFilter`) use a `Set` for selection. The view-side predicate is:

```js
const filtered = records.filter(r => {
    if (statusFilter.size === 0) return true;       // empty = show all
    return statusFilter.has(r.getCellValueAsString('Status'));
});
```

This matches Airtable's own filter behavior — the user clears all selections and sees everything. The alternative (empty = show none) creates a stranded "no matches" state every time the filter is reset.

## sessionStorage for UI state

The Airtable iframe occasionally remounts, which resets all `useState` to initial values. Anything the user expects to survive across page reloads needs persistence:

- Active tab / view
- Filter selections
- Grid/list view mode
- Search queries
- Fullscreen state
- Sort orderings

Use the kit's `loadState` / `saveState` helpers (sessionStorage-backed, namespaced by `STORAGE_PREFIX`):

```js
const [filter, setFilter] = useState(() => new Set(loadState('myView.filter', [])));
useEffect(() => { saveState('myView.filter', [...filter]); }, [filter]);
```

`sessionStorage` (not `localStorage`) is the right choice — state should survive iframe remounts within a session but not leak across browser sessions.

## Skeleton loading, not Spin

Use `<AppLoadingSkeleton>` (or component-level antd `<Skeleton>`) instead of antd `<Spin>` while data loads. Skeletons mimic the layout you're about to render, so the user sees the same shape grow content rather than a spinner replaced by entirely new layout. Less perceived latency, less layout thrash.

## `key={resourceId}` on Drawers

When a Drawer represents a single record (e.g., a person detail panel), key the Drawer by the record ID:

```jsx
<Drawer key={selectedPersonId} open={!!selectedPersonId} ...>
    <PersonDetail personId={selectedPersonId} />
</Drawer>
```

Without the key, internal Drawer state (form values, scroll position, expanded sections) leaks across selections — open record A, edit a field, switch to record B, see record B with record A's edits still in the form.

## Controlled Collapse with explicit `activeKey`

When a click handler needs to atomically open a Collapse panel (e.g., "+ Add Note" should both open the Notes panel AND focus the textarea), the Collapse must be controlled:

```jsx
const [activeKey, setActiveKey] = useState([]);
<Collapse activeKey={activeKey} onChange={setActiveKey}>
    ...
</Collapse>
```

Otherwise the click handler races against the Collapse's internal state and the form renders inside a hidden panel.

## Search debouncing — know the threshold

For lists under ~1,000 records, no debouncing is needed. `useState` + `filter()` on every keystroke is imperceptibly fast. Add `useDeferredValue` or `useTransition` only when you measure dropped frames.

For lists over ~1,000 records, virtualize the list (the kit doesn't ship a virtualization helper — use antd's `Table` with `virtual` prop, or `react-window` via CDN if needed).

## In-flight guards on async writes

Click handlers that call `createRecordAsync` / `updateRecordAsync` should guard against double-fire (user impatiently clicks twice):

```js
const inFlight = useRef(false);
async function save() {
    if (inFlight.current) return;
    inFlight.current = true;
    try { await table.createRecordAsync({...}); }
    finally { inFlight.current = false; }
}
```

Disabling the button visually is also fine, but the ref guard catches keyboard-triggered double-fires too.

## DiagnosticBanner over silent failure

When a configured table or field is missing, **always** surface it via `<DiagnosticBanner>` rather than rendering empty or crashing. The banner pattern:

```jsx
const issues = [];
if (!table) issues.push(`Table "${TABLE_NAME}" not exposed in this Interface.`);
if (table && !table.getFieldByNameIfExists('Status')) {
    issues.push(`Field "Status" not found on "${TABLE_NAME}".`);
}
return (
    <>
        <DiagnosticBanner issues={issues} />
        {table && <YourView table={table} />}
    </>
);
```

This single pattern resolves ~50% of "the extension isn't working" reports — the operator sees exactly what's missing.

## Image fallbacks

The kit doesn't ship a `getDisplayHeadshotUrl`-style helper because every project's image-fallback policy is different (attachment vs. URL field, primary vs. alt source, thumbnail vs. full-size). The recommended pattern:

```js
function getDisplayImageUrl(record, table) {
    const altPreferred = getFieldValue(record, table, 'Use Alternate Image');
    const attachments = getFieldValue(record, table, 'Image') || [];
    const directoryUrl = getFieldString(record, table, 'ImageURL');

    function pickAttachment(att) {
        return att.thumbnails?.large?.url ?? att.url;
    }

    if (altPreferred && attachments.length) return pickAttachment(attachments[0]);
    if (directoryUrl) return directoryUrl;
    if (attachments.length) return pickAttachment(attachments[0]);
    return null;
}
```

Put this in your extension's `helpers.jsx` (not `shared/`), since the field names are project-specific.

## Color & chips

- Single/multi-select cell values render as chips via `<AttributeChip>` with colors from `getSelectChoiceColors()`. This makes chips visually match the Airtable grid — operators don't need to learn a second color vocabulary.
- For neutral "tag-like" labels (region, level, custom labels), use `<AttributeChip>` with no `colorMap` — it falls back to `CHIP_FALLBACK` (light gray).

## Tooltips on dense iconography

Avatar grids, action icon rows, and other dense UI benefit from `<Tooltip>` showing the underlying record name + role. Cheap to add (~2 LOC per element) and dramatically reduces the "what does this represent" friction.
