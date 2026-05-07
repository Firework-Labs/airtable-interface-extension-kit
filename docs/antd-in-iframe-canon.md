# Antd in the Iframe — Canon

Antd 5.x is the kit's default UI library, loaded at runtime via CDN inside the Airtable Custom Interface iframe. Several of antd's defaults assume direct page ownership; in an iframe, those defaults break in ways that look like antd bugs but are actually environment mismatches. The rules below are non-negotiable canon.

## Version pin

- **antd 5.22.7** — pinned in `extensions/shared/cdn-loader.jsx`. **Do not upgrade to 6.x** without testing — antd 6 bundles its own React, which crashes the iframe (the bundled React conflicts with Airtable's React 16).

## Popups: `getPopupContainer` is required

Every antd component that renders a portaled popup needs:

```jsx
<Select
    getPopupContainer={trigger => trigger.parentElement}
    ...
/>
```

Applies to: `Select`, `Dropdown`, `Tooltip`, `Popconfirm`, `Cascader`, `DatePicker`, `TimePicker`, `Popover`, `AutoComplete`, `Menu` (when used standalone).

**Why:** Without this, antd portals popups to `document.body`, which exists *outside* the iframe scroll context. The popup either disappears, clips against iframe edges, or appears in the wrong viewport position.

## Static APIs fail silently — use hook variants

These antd 5 static APIs **don't work** in the iframe:

```js
// ❌ FAILS SILENTLY in the iframe
Modal.confirm({ title: '...' });
message.success('Saved!');
notification.open({ message: '...' });
```

The portals land outside the React tree, lose `ConfigProvider` context, and may not render at all — but no error is thrown.

**Use the hook variants instead:**

```jsx
const [modal, modalContextHolder] = Modal.useModal();
const [messageApi, messageContextHolder] = message.useMessage();

return (
    <>
        {modalContextHolder}
        {messageContextHolder}
        <button onClick={() => {
            modal.confirm({ title: 'Sure?', onOk: () => {} });
            messageApi.success('Saved');
        }}>
            Click
        </button>
    </>
);
```

The `*ContextHolder` elements anchor the portal *inside* the React tree, preserving theme + ConfigProvider context.

## Antd destructuring: inside component bodies, not at module scope

```jsx
// ❌ At module scope: window.antd may not be loaded yet
const { Input, Button } = window.antd;

function MyComponent() { ... }
```

```jsx
// ✅ Inside the function body: AntdLoader has confirmed antd is ready
function MyComponent() {
    const { Input, Button } = window.antd;
    return <Input />;
}
```

This works because the kit's `AntdLoader` only renders children once `window.antd` exists.

## Layout

- **`antd.Layout` requires `Layout.Sider`** for horizontal flex composition. There's no `Layout.Side` or `Layout.Right`.
- For custom side panels (drawers that aren't Drawer, side rails, etc.), **use plain `<div>` with `display: flex`** — fighting the Layout API costs more than rolling it.

## Overlays

- **Always use `antd.Drawer`** (portal-based) for overlay UIs.
- **Never** use `position: absolute` inside an `overflow: hidden` container — the iframe will clip your overlay against the parent's scroll bounds.
- Drawer state needs `key={resourceId}` so the drawer remounts cleanly when the represented resource changes (otherwise stale state leaks across selections).

## Theme

- The kit's `extensions/shared/theme.jsx` exposes `<AntdThemeProvider>` (wraps `<ConfigProvider>` reading from `BRAND`) and `useDesignTokens()` (reads tokens from antd's runtime).
- Inside React components, **prefer `useDesignTokens()` over the static `COLORS` const** so dark-mode swaps (if you add them) and brand changes flow through automatically.
- Outside React (helpers, top-level constants), the `COLORS` const is the fallback.

## Choice-color chips

Use `<AttributeChip>` with `fieldColors={getSelectChoiceColors(table, 'FieldName')}` to render single/multi-select values whose chip colors match Airtable's choice-color palette. The `AIRTABLE_COLORS` map in `extensions/shared/constants.jsx` mirrors Airtable's full palette.
