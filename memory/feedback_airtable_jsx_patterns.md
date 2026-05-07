---
name: feedback_airtable_jsx_patterns
description: Airtable Interface Extension JSX patterns that avoid runtime crashes in the non-standard transpiler
type: feedback
---

Airtable's Edit Source uses a non-standard JSX transpiler. Certain patterns that work in standard React cause runtime crashes ("Something went wrong") in Airtable:

1. **Use ternary `{x ? <div>...</div> : null}` instead of `{x && <div>...</div>}`** — the `&&` short-circuit can return empty string `""` to the render tree, crashing the iframe.
2. **Use string CSS values** — `'0px'` not `0`, `'600'` not `600` for fontWeight, etc. Numeric style values may be mishandled.
3. **Use `<div>` for block-level overlays**, not `<span>` — more predictable layout behavior in the Airtable iframe.

**Why:** First attempt with `&&` + numeric CSS crashed Airtable with opaque "Something went wrong" error. Switching to ternary + string values fixed it immediately.

**How to apply:** Always use these safe patterns in any code destined for Airtable Edit Source. Review all new JSX before build for `&&` conditional renders and numeric CSS values.
