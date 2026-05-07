---
name: Context7 Library References
description: Context7 library IDs for Airtable Blocks SDK and Airtable Scripting — use during implementation
type: reference
---

## Context7 Libraries for Airtable Interface Extension Implementation

| Library | Context7 ID | Snippets | Use for |
|---|---|---|---|
| Airtable Blocks SDK | `/airtable/blocks` | 317 | Extension lifecycle, `useRecords`, `useBase`, record CRUD |
| Airtable Scripting | `/websites/airtable_developers_scripting` | 355 | Migration scripts, automation scripts |
| Airtable Web API | `/websites/airtable_developers_web_api` | 1,219 | REST API for external integrations (if needed) |

**Note:** Ant Design 5.x is loaded at runtime via CDN (`antd@5.22.7`). v6.x is incompatible (bundles own React, crashes iframe). No npm — CDN loading via DOM injection.

**How to apply:** Query these Context7 libraries during implementation for up-to-date API patterns and component examples.
