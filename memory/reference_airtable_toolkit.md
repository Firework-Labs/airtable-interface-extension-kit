---
name: Airtable Interface Extension Toolkit
description: GitHub repo with comprehensive SDK skill doc, 18 pitfalls, field type reference, and reusable helpers for Airtable Interface Extensions
type: reference
---

**Repo:** https://github.com/victoriaplummer/airtable-interface-extension-toolkit

**Key resource:** `SKILL.md` in the repo root — comprehensive reference covering:
- All 18 pitfalls (import paths, permission checks, array overwrite, checkbox null, O(n²) lookups, etc.)
- Complete FieldType cell value read/write reference table
- Performance patterns (Map-based lookups, useMemo, batch writes)
- SDK hook inventory: `useRunInfo`, `useSession`, `useColorScheme`, `useSynced`, `useGlobalConfig`
- `loadScriptFromURLAsync()` / `loadCSSFromURLAsync()` for CDN library loading

**When to use:** Reference when building new extensions or debugging SDK behavior. The pitfall list is more complete than our project memory — cross-check there first when hitting unexpected behavior.
