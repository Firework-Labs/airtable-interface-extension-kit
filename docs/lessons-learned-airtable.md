# Lessons Learned — Airtable Interface Extensions

Excerpts from the source project's session-by-session lessons doc. Filtered to entries that touch SDK behavior, antd integration, formula engineering, automation/batching, dark mode, SVG charting, and extension architecture. Business-logic lessons (prompt design, classification taxonomies, etc.) are intentionally excluded.

Each excerpt is tagged with the original session date for traceability.

---

## Extension architecture

### Custom Interface Extensions are a separate, newer SDK *(2026-03-08)*
Airtable's Interface Designer supports "Custom Interface Extension" as a layout element. These use a different SDK path (`@airtable/blocks/interface/ui` and `@airtable/blocks/interface/models`) with different API signatures than classic Blocks: `initializeBlock({ interface: () => ... })` instead of `initializeBlock(() => ...)`. Code is edited inline via "Edit Source" — no CLI needed.

### The "Edit Source" path bypasses Enterprise restrictions *(2026-03-08)*
Because code is edited directly in the Airtable UI (no PAT, no CLI), Enterprise PAT restrictions don't apply. This is the only viable deployment path for many corporate orgs. Trade-off: no npm package support, so all dependencies must be CDN-loaded or built from scratch.

### Airtable Edit Source is single-file only *(2026-03-09)*
The editor does not support `import './style.css'` or any multi-file structure. All CSS must be inlined — either via a `<style>` tag in JSX or inline style objects. The extension must be completely self-contained in one JS file. The kit's `build.sh` concatenation pattern is the workaround.

### Airtable Blocks SDK pins React 16 *(2026-03-08)*
The SDK bundles React 16.14.0. Recharts 2.x, antd 5.x, and most React 16+ libraries work. But hooks beyond the basics (`useState`/`useEffect`/`useMemo`/`useRef`), Suspense for data, and concurrent mode are unavailable. Design accordingly.

### Field lookup by name works in Interface Extensions *(2026-03-09)*
Despite some examples showing field-by-ID patterns, the SDK fully supports `table.getFieldByNameIfExists(name)`. IDs are still better for production stability (resilient to renames), but name-based lookup is much faster to develop with — no field-ID export step needed.

---

## SDK behavior & gotchas

### Interface Extensions restrict field access via Interface Designer config *(2026-03-09)*
`table.fields` does NOT return all fields in a table. It only returns fields configured for the extension element in the Interface Designer sidebar. If fields exist in the synced table but the extension can't see them, the fix is in the Interface Designer's element configuration — not in code. A diagnostic banner showing available vs. missing fields is essential for surfacing this.

### Diagnostic banners are worth keeping in production *(2026-03-09)*
The "Missing fields" banner with an expandable field list + base ID is invaluable for debugging field access issues. It immediately shows what the SDK can see, what it can't, and which base it's hitting — all without console access. Keep it in production.

### `useCustomProperties` / `getCustomProperties` not available in Edit Source *(2026-03-09)*
Despite appearing in official Airtable example code, calling `useCustomProperties()` or passing `getCustomProperties` to `initializeBlock()` causes a runtime error ("Something went wrong") in the Edit Source environment. Hardcoded table lookup via `base.getTableByNameIfExists()` is the working alternative.

### Conditional hook calls require component boundaries *(2026-03-09)*
React's rules of hooks prohibit calling `useRecords()` conditionally. When a table might not exist, wrap the hook call in a child component that only mounts when the table exists. The parent renders an inline empty state when the table is absent, avoiding the hook entirely.

### `useRecords` caches per hook instance, not per table *(2026-03-11)*
Secondary tables (non-primary data sources) in Interface Extensions don't live-update through `useRecords` — but the cache is per-hook-instance. Destroying and recreating a component that calls `useRecords` forces a fresh fetch. Working pattern: extract the secondary read into a child component and key it with a counter that increments on demand.

### `getCellValueAsString` needs Field objects, not strings, in `selectRecordsAsync` results *(2026-03-10)*
Passing string field names like `getCellValueAsString('Theme')` to records from `selectRecordsAsync` silently returns wrong values in Interface Extensions. Always resolve fields via `table.getFieldByNameIfExists()` first and pass the Field object.

### Airtable iframe remounts reset all React state — persist anything important *(2026-03-10)*
Airtable periodically remounts the extension iframe, which resets all `useState` to initial values. Persist anything important to `sessionStorage`. The same root cause manifests in many ways: tab resets, fullscreen exits, filter state loss, sort order resets.

### `useRecords` subscriptions crash if the table's primary field isn't exposed *(2026-03-11)*
The SDK's internal change propagation resolves the table's `primaryField` whenever any record changes. If the primary field isn't exposed in the Interface Designer, the SDK throws `No field with ID ... in table` — and crashes the entire extension, not just the affected component. Two-part fix: expose the primary field, AND only mount components that subscribe to secondary tables when their data is actually needed.

### Always-mounted subscriptions to secondary tables are a crash vector *(2026-03-11)*
A component that's rendered unconditionally with a `useRecords(secondaryTable)` keeps an active subscription. When the table updates, the SDK's change propagation can crash. General principle: don't subscribe to tables you're not actively rendering.

---

## Formulas

### TRIM() is cheap insurance on formula parsing *(2026-03-07)*
All string-parsing formulas should wrap MID() in TRIM(). LLMs and copy-paste users occasionally insert leading/trailing whitespace. TRIM() costs nothing and prevents invisible parsing bugs that are hard to diagnose at scale.

### Tag naming convention prevents substring collisions by design *(2026-03-07)*
When building tag-based parsers (e.g., `[A1]value[/A1]`), use suffixes that sort *after* the closing bracket (`[A2T]` not `[A2_]`). `FIND("[A2]", ...)` will then never accidentally match `[A2T]` because `]` < `T` in ASCII. Worth documenting if you change tag naming conventions later.

### Boundary checks are the strongest single filter for paste quality *(2026-03-11)*
`LEFT(TRIM({Paste}), 7) = "[START]"` and `RIGHT(TRIM({Paste}), 5) = "[END]"` reject any paste with content before or after the expected block. This catches both "user pasted the system prompt" and "user pasted the entire response" cases, because both have text outside the expected boundaries.

### Nested IF prevents formula errors from cascading *(2026-03-11)*
Airtable's `AND()` evaluates all arguments regardless of earlier results. If closing tags don't exist, `MID()` produces a negative-length argument and errors. The standard pattern: `IF(AND(guard checks), IF(AND(content checks), "Valid", "Invalid"), "Invalid")`. Outer guard, inner validation.

### Airtable has no cross-table aggregate functions *(2026-03-11)*
Formulas are per-row only — no `COUNTROWS()`, no `SUM()` across a table. The only cross-table mechanism is Rollup/Count on linked records, which requires a link field on both tables. Synced tables can't have fields added, so cross-table aggregates from synced sources must be computed and written by a script.

---

## Automations & batching

### Script steps bypass the 100-record Find Records limit *(2026-03-10)*
Airtable automation's "Find Records" action returns up to 100 records. For larger datasets, use a "Run a script" step with `table.selectRecordsAsync()`. The script can also handle batch computation logic that no-code actions can't express.

### Two script steps bookending the AI step provide failure safety *(2026-03-10)*
A pre-AI script that queries data + formats the prompt (no writes) plus a post-AI script that handles writes is failure-safe: if the AI step fails, no data has been modified. Re-pressing the trigger retries cleanly.

### Token-mapped Update Record steps are fragile — prefer script-based writes *(2026-03-11)*
A separate Update Record step relying on the token picker to map script outputs to fields can silently break if a mapping drops during editing. Moving all post-batch updates into a script that already has table write access eliminates the configuration dependency. Script-based writes are explicit in code.

### `input.config()` can only be called once in Airtable automation scripts *(2026-03-10)*
Storing the result in a variable and referencing it throughout the script is the only working pattern. Adding a second call fails with "input.config may only be called once."

### Input variable casing must match exactly *(2026-03-10)*
`recordID` (capital D) in Airtable's UI vs. `input.config().recordId` (lowercase d) in the script returns `undefined` with no error — the script silently proceeds. Debugging requires `console.log(JSON.stringify(input.config()))`.

### Airtable doesn't allow action steps after a Repeating Group *(2026-03-10)*
The automation editor doesn't allow adding any action after a repeating group closes. Move post-loop work into the script that runs *before* the group, or into an Update Record action that runs before the group.

### Build automation steps one at a time — adding untested steps corrupts state *(2026-03-10)*
Adding multiple automation steps without testing each one can cause persistent "your request conflicted with another change" errors that don't resolve by refreshing. The pattern that works: add one step → test it → confirm green checkmark → add the next.

### Repeating Group "Current item" tokens are unreliable with AI-generated data *(2026-03-10)*
Referencing "Current item" fields from a Repeating Group iterating over "Generate Structured Data" output can fail with "your request conflicted with another change," even after deleting and re-adding. Working alternative: a single script step that JSON-parses the AI output and creates records in a `for` loop.

### "Run automation" buttons require Record Review or Record Detail layouts *(2026-03-10)*
Dashboard page types cannot host "Run automation" buttons — Airtable restricts this action to record-context layouts. Plan your Interface Designer layout accordingly.

### Synced tables force indirect state tracking *(2026-03-10)*
Synced (read-only) tables can't have fields like `Processed` checkboxes added. The workaround is a separate control table with offset counters: records are in creation order, and you track how many have been processed. Drifts if records are deleted from the source, mitigated by a Reset workflow.

### Delete old records in the same script that creates new ones *(2026-03-10)*
Putting deletion in an early script and creation in a later one leaves a window where the dashboard has no data while later steps run. Move deletion immediately before creation in the same script — shrinks the gap to seconds.

---

## Visual/SVG/charting

### SVG rendering works in Interface Extensions *(2026-03-08)*
`<svg>` elements render correctly inside a Custom Interface Extension. Bar charts, pie charts, and word clouds can all be built from scratch without a charting library. Pure-SVG is officially supported by the SDK.

### SVG donut charts via stroke-dasharray are simple once the math is right *(2026-03-09)*
The `<circle>` + `stroke-dasharray` + `stroke-dashoffset` technique for donut charts is cleaner than SVG path arcs. Each segment gets `strokeDasharray="${segLen} ${circumference - segLen}"` and `strokeDashoffset={-cumulativeLength}`, with `rotate(-90)` to start at 12 o'clock.

### Tag cloud beats Wordle-style word cloud in pure SVG *(2026-03-09)*
A Wordle-style spiral layout requires collision detection and iterative placement — complex without d3-cloud. A tag cloud (horizontal words in centered rows, sized by frequency) is simpler, more readable, and still visually communicates word frequencies. Use `Math.sqrt(count / maxCount)` for font scaling so the highest-frequency word doesn't dominate.

### Annotated donuts replace legend tables for presentation readability *(2026-03-09)*
Donuts with leader lines from each segment to positioned labels are more visually immediate than separate legend tables. The label distribution algorithm splits labels into left/right columns based on segment midpoint angle, then nudges overlapping labels apart with a multi-pass spacing algorithm. Cap at ~8 segments and roll the rest into "Other" — the chart breaks visually beyond that.

### SVG width caps cause misaligned donut centers *(2026-03-11)*
If two donut components cap their SVG at different max widths, their centers end up at different X positions when rendered side-by-side. When passing an explicit `donutSize` (e.g., for presentation mode), use the full passed width instead of the cap. Preserve the cap for non-fullscreen views.

---

## Dark mode

### Dark-mode chart colors need a separate tint sequence *(2026-03-10)*
Light-mode bars using dark-tint colors are nearly invisible on dark backgrounds. The fix is mode-aware tint selection — a `getColors(isDark)` function that returns brighter tints in dark mode. Donut strokes are wide enough (~28px) to maintain visibility across modes; thin bars are not.

### Brand color system should map dark/light modes to different secondary colors *(2026-03-09)*
Some brand colors (e.g., a bright cyan) read well on dark backgrounds but wash out on white. The opposite color is the opposite. A `getColors()` returning a mode-dependent `accent` property lets components stay mode-agnostic.

---

## Presentation/Fullscreen

### CSS-based fullscreen is more reliable than the native Fullscreen API inside iframes *(2026-03-10)*
The native API (`document.requestFullscreen`) randomly exits inside Airtable's iframe — likely caused by parent-frame DOM operations or focus shifts. Use `position: fixed` + `z-index: 9999` as the visual layer and call the native API as a fire-and-forget bonus for hiding browser chrome. React state is the source of truth.

### Missing `fullscreenchange` listener causes desync between native fullscreen and CSS overlay *(2026-03-11)*
The native API can exit independently of the app (Escape key, security dialogs). Without a `fullscreenchange` listener, the app's fullscreen state stays `true` while native fullscreen is gone, causing inconsistent behavior. Listen for the event and sync state when native fullscreen exits.

### CSS zoom is the simplest path to presentation-scale dashboards *(2026-03-10)*
For a fullscreen "slide" experience, CSS `zoom` scales everything proportionally — text, charts, spacing, SVG — without changing component code. The zoom factor is `min(viewportWidth, viewportHeight * 16/9) / 960`. `clientWidth` returns pre-zoom dimensions, so chart sizing hooks work without adjustment.

### Fullscreen API availability in iframes is permission-dependent *(2026-03-10)*
The Fullscreen API requires `allowfullscreen` on the containing iframe. Whether the host (e.g., Airtable) sets this is unknown until tested. Auto-hide the trigger button via `document.fullscreenEnabled` so there's zero impact if the API is unavailable.

---

## Misc

### Locally installed fonts work in extension iframes *(2026-03-09)*
CSS `font-family` resolves via the browser's OS font registry, not via network requests. Locally installed fonts (corporate brand fonts, etc.) are available even inside the extension iframe. Get the exact family name from the TTF metadata (nameID=1), don't guess from the filename.

### Real data reveals issues test data never shows *(2026-03-11)*
Test data has clean, consistent values and a manageable number of categories. Real data reveals: too many categories cluttering charts, template-placeholder leakage from formula errors, truncated/corrupted form submissions. Always plan for messier inputs than your test data.

### Allowlist filtering beats fuzzy matching for known-set fields *(2026-03-11)*
For fields with a fixed valid set (e.g., a 6-option multiple-choice), filter via an allowlist instead of fuzzy-matching corrupted values. Allowlists don't guess — they drop invalid entries. The trade-off (lost records) is acceptable because the data quality issue should be fixed at source.

### Auto-loaded context should match current work phase *(2026-03-09, refined 2026-03-10)*
A growing CLAUDE.md / AGENTS.md becomes a tax on every message. Split into a slim, current-phase orientation file plus archived history docs that agents read on demand. The auto-loaded context should answer "what is this, what's the status, where do things live, and what will bite me" — not serve as a component reference or full project history.
