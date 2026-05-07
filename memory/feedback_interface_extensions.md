---
name: Airtable Interface Extension constraints (supplemental)
description: SDK patterns and CDN loading details that supplement CLAUDE.md — code snippets and edge cases
type: feedback
originSessionId: 2a09c04f-54d3-4b21-b9e1-e39bbba29c05
---
## CDN loading dependency order (code pattern)

```js
if (!window.React) window.React = React;
try { if (!window.ReactDOM) window.ReactDOM = require('react-dom'); } catch (e) {}
// dayjs MUST load before antd (antd UMD checks window.dayjs at parse time)
if (!window.dayjs) await loadScript(DAYJS_JS);
await Promise.all([loadScript(ANTD_JS), loadCSS(ANTD_CSS)]);
if (!window.antd) throw new Error('antd failed to initialize');
```

**Failure mode:** antd's `onload` fires even when initialization fails internally. Always verify `window.antd` exists.

## SDK init pattern

- Import: `@airtable/blocks/interface/ui` (NOT `@airtable/blocks/ui`)
- Init: `initializeBlock({ interface: () => <App /> })`
- `useRecords(table)` takes a Table directly — no `selectRecords()` query

## Additional edge cases

- Checkbox fields return `null` (not `false`) when unchecked — use `!value` or `=== true`
- `useRunInfo()` → `isDevelopmentMode` — gate diagnostic panels to dev mode
- View-level data is inaccessible — Interface Extensions only see table-level records; all filtering/sorting must be in code
- `loadScriptFromURLAsync` does NOT exist in Interface Extensions SDK — use manual DOM injection
- `sessionStorage` survives Airtable iframe remounts — wrap in try/catch for edge cases

## antd 5 static APIs fail silently in the Airtable iframe

**Why:** Static `Modal.confirm()`, `notification.open()`, `message.success()` portal to `document.body` outside the React tree — they lose ConfigProvider context (theme tokens, design system) and sometimes render off-screen or not at all. Symptom: clicking the trigger does nothing, no console error.

**Fix:** Use the hook variants and render their context holder into JSX:
```jsx
const [modal, modalContextHolder] = Modal.useModal();
const [messageApi, messageContextHolder] = message.useMessage();
// ...
return (
    <div>
        {messageContextHolder}
        {modalContextHolder}
        {/* ... */}
    </div>
);
// Then call modal.confirm({...}) and messageApi.success(...)
```

**Joins the existing `getPopupContainer={trigger => trigger.parentElement}` rule** for Select/Dropdown/Tooltip/Cascader — same root cause (portals outside the iframe-scoped React tree).
