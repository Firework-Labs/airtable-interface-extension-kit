# Airtable SDK Gotchas (non-obvious failures)

These are SDK behaviors that fail silently or throw cryptic errors when you least expect them. Read this before adding code that touches `@airtable/blocks/interface/ui` — many of these have already cost a session of debugging time on the source project.

## Bootstrap & React

- **`expandRecord()` is a no-op** in Edit Source. The function imports without error, doesn't throw, and silently does nothing. Use Airtable deep links via `window.open()` instead (see `extensions/shared/helpers.jsx::openInAirtable`).

- **`useCustomProperties()` crashes** in Edit Source. Despite appearing in official examples, it errors at runtime ("Something went wrong"). Use `getTableByNameIfExists()` / `getFieldByNameIfExists()` and hardcode lookup-by-name.

- **`useRecords()` must never be conditional**. React's rules-of-hooks are enforced. When a table might not exist, gate via *component boundary* — only mount the child component when the table resolves. Same applies to any subscription hook.

- **Always-mounted subscriptions to secondary tables are a crash vector.** If `useRecords(secondaryTable)` is alive when its data updates, the SDK's change propagation can crash on missing primary fields. Only mount the subscriber while you actually need the data.

## Records & Fields

- **Record objects are mutable references.** `useMemo([record])` misses in-place cell updates after `updateRecordAsync`. The reference identity doesn't change. Don't memoize cheap computations that read cell values — recompute every render.

- **`table.fields` only returns Interface Designer-configured fields.** Even if a field exists in the underlying base, it isn't accessible until the operator adds it in the Interface Designer's element configuration. Surface this with a `<DiagnosticBanner>` instead of mysteriously rendering empty.

- **`getCellValueAsString` strips markdown** for `richText` fields. It returns the rendered plain text with `**`/`_`/etc. removed. To get the markdown source, use `getCellValue` (or our `getFieldValue` wrapper). For most field types the two methods are interchangeable, so this footgun only surfaces when a `richText` field enters the picture.

- **`useRecords` subscriptions crash if the table's primary field isn't exposed.** The SDK's internal change propagation resolves the primary field whenever any record changes. If the primary field isn't in the Interface Designer's exposed fields, the SDK throws `No field with ID ... in table` and crashes the entire extension. Always expose the primary field.

- **Interface Extensions don't live-update secondary table data.** `useRecords` reads initial data correctly from a secondary (non-primary) data source but doesn't react to changes. Workaround: extract the secondary read into a child component and key it with a counter that increments when you want a refresh. React unmounts the old component, mounts a new one, and the new `useRecords` returns current data.

- **`getCellValueAsString` needs Field objects, not name strings, when called on records from `selectRecordsAsync`.** Passing string field names like `getCellValueAsString('Theme')` silently returns wrong values. Always resolve via `table.getFieldByNameIfExists()` first and pass the Field object. (Records from `useRecords` accept either form.)

## Writes

- **`createRecordAsync({})` creates persistent blank records.** No "draft" mode exists. For "Add" workflows, link the user to the table view via `openInAirtable()` instead, or only create after the user has filled the required fields.

- **Table write permissions: "inline record editing" must be enabled per-table** in Interface Designer settings. `createRecordAsync` / `updateRecordAsync` will fail without it, with an error that doesn't immediately point at the missing setting.

- **Linked record format divergence.** Blocks SDK `createRecordAsync` requires `[{ id: "recXXX" }]` objects. The REST API PATCH uses `["recXXX"]` string arrays. Don't conflate the two — wrong format silently fails or returns "invalid cell value."

## Build & Edit Source

- **Edit Source is single-file only.** The editor does not support `import './style.css'` or any multi-file structure. All CSS must be inlined — either `<style>` tag in JSX or inline style objects. Bundle modular source files via `build.sh` concatenation; deploy the single output.

- **No npm package manager.** The Edit Source environment is a sandboxed JSX editor, not a build tool. Deps come in via CDN runtime injection (see `extensions/shared/cdn-loader.jsx`).

- **The Airtable Blocks SDK pins React 16.** Specifically 16.14.0. Hooks beyond `useState`/`useEffect`/`useMemo`/`useRef` are unavailable; no Suspense, no concurrent mode. Design accordingly.

- **CLI-based Blocks (`block release`) are blocked on Enterprise Airtable.** PATs with `block:manage` scope are restricted on Enterprise-owned bases. Edit Source is the only viable deployment path — which is what this kit is built for.

## Antd in the Iframe

The full antd canon lives in [`antd-in-iframe-canon.md`](antd-in-iframe-canon.md), but the headline rules:

- **`getPopupContainer={trigger => trigger.parentElement}`** is required on every popup-bearing antd component (Select, Dropdown, Tooltip, Cascader). Otherwise the popup portals to `document.body`, escapes the iframe scroll context, and clips badly.

- **antd 5 static APIs (`Modal.confirm()`, `message.success()`, `notification.open()`) fail silently in the iframe** — they portal outside the React tree and lose ConfigProvider context. Use the hook variants: `const [modal, modalContextHolder] = Modal.useModal();` then call `modal.confirm({...})` and render `{modalContextHolder}` inside JSX.

- **Antd destructuring inside component bodies, not at module scope.** `const { Input, Button } = window.antd;` inside the function. At module scope, `window.antd` may not be loaded yet.

- **`antd.Layout` needs `Layout.Sider`** for horizontal flex composition. For custom side panels, use plain `<div>` with `display: flex` instead of fighting the Layout API.

- **Overlay UIs always use `antd.Drawer`** (portal-based), never `position: absolute` inside `overflow: hidden` containers. The iframe will clip you.

## Other

- **Airtable iframe remounts reset all `useState`.** Persist anything important to `sessionStorage` and rehydrate via the `loadState`/`saveState` helpers. Active tab, filter selections, view mode, fullscreen state — anything the user expects to survive.

- **JSX transpiler quirks in the Edit Source environment.** The transpiler is conservative:
  - Use ternary `condition ? <X /> : null`, not `condition && <X />` (the latter sometimes leaks `false` as a child).
  - CSS values must be strings (`'12px'`), not bare numbers in some places.
  - Use `<div>` rather than `<span>` for absolute-positioned overlays — `span` defaults to `display: inline` and ignores width/height.
