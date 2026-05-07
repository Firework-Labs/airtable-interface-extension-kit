---
name: Airtable API pitfalls (supplemental)
description: API gotchas that supplement CLAUDE.md — silent failures and format details
type: feedback
---

## Linked record format: two different APIs, two different formats

- **REST API (PATCH/POST):** Use `["recXXX"]` string arrays. `[{id: "recXXX"}]` objects are silently ignored — record appears created but linked fields are empty, API returns 200 success.
- **Blocks SDK (`createRecordAsync`/`updateRecordAsync`):** Use `[{ id: "recXXX" }]` objects. Plain string arrays cause `invalid cell value` errors.

**Why:** Discovered REST API failure when seed data script created 61 records with empty linked fields (2026-03). Discovered Blocks SDK failure when applying the REST API rule to `createRecordAsync` (2026-04-17).
**How to apply:** Check which API you're calling. Scripting Extension scripts use the REST API format. Interface Extension components use the Blocks SDK format.

## Metadata API detail

Can't create: lookup, createdTime, rollup, count fields. Can't change field types or modify primary field formulas. Plan for manual UI steps. Table creation accepts ~10 fields max per call; add extras individually.

## Select field format in Records API

- Single select: plain string `"AMER"` (not `{name: "AMER"}`)
- Multiple select: plain string array `["CTV", "ITE"]` (not `[{name: "CTV"}]`)
- Exception: `updateRecordAsync` from SDK uses `[{ name: "value" }]` for multi-select writes
- `typecast: true` auto-creates missing options
