# Pre-Publish Checklist

**Status (as of 2026-05-07):** Kit is built, locally committed (`0b4a4a1`), validated live in Airtable, and **not pushed**. Owner: `mikeklar` on GitHub. Eventual intent: make this **public**, but with one more genericization + safety pass first.

This file tracks the work that needs to happen before pushing to a public remote. Delete it once the kit ships.

---

## What's already been done

- The first-pass extraction from EUL Tracker explicitly stripped:
  - All `EUL_COLORS` / `midnightBlue` / `mediumBlue` brand color names
  - The `eul_` sessionStorage prefix (parameterized as `STORAGE_PREFIX`)
  - All EUL business semantics: `SELECTION_STATUSES`, `VETTING_STATUS_COLORS`, `ROLE_ORDER`, `getDisplayHeadshotUrl`
  - All references to "Storyteller", "Lab Detail", "EUL" in `*.jsx` and `*.md` (verified by `grep -ri "EUL\|Storyteller\|midnightBlue\|mediumBlue\|eul_"`, returns clean except inside `docs/lessons-learned-airtable.md`, where dated session excerpts are intentionally preserved with traceability tags but de-named)
- `memory/` was filtered to 5 portable files; project-specific entries (`user_role.md`, `project_*.md`, schema pointer) excluded
- `CLAUDE.md` was rewritten from scratch as a starter-kit orientation doc, not a port of EUL's

## What still needs a pass

### 1. Domain genericization — the lessons-learned doc carries the most residue

The file most likely to leak project shape is **`docs/lessons-learned-airtable.md`**. Each excerpt is dated and tagged "the source project" rather than "EUL Tracker," but several entries reference scenarios that hint at the source domain:

- "3,000 simultaneous form submissions" (Session 23, 25, 38) — implies enterprise-scale event
- "live presentation context," "fullscreen presentation mode," "facilitator," "live event debrief" (Sessions 23, 29, 30, 34, 35) — implies a corporate-learning / executive-event use case
- "AI Batch Control table," "Action Themes table," "AI-generated summaries" (Sessions 25–32) — specific to the EUL pipeline architecture

**Question to resolve:** how aggressively to genericize?
- **Option A (current):** keep concrete scenarios for didactic clarity ("when X happened, here's why"); just verify no proper nouns leak. Pro: more useful as a teaching doc. Con: a sufficiently motivated reader could connect the dots back to EUL.
- **Option B:** abstract every scenario to neutral framing ("a pipeline that processes form submissions at scale," "a presentation-mode use case"). Pro: maximum deniability. Con: loses the specificity that makes lessons memorable.

**Recommendation:** Option A with a one-paragraph disclaimer at the top of the doc ("Excerpts have been de-identified; specific scenarios reflect a real corporate-learning project"). But check with the user if any of the scenarios — especially the 3,000-participant scale + corporate-learning framing — touch confidentiality concerns.

### 2. Secrets / PII scan

Run with fresh eyes. None expected, but verify:

```bash
cd "/Users/michaelklar/Claude Cowork/airtable-interface-extension-kit"

# 1. Hardcoded tokens, API keys, base IDs
grep -rE "(pat[A-Za-z0-9]{16,}|key[A-Za-z0-9]{14,}|app[A-Za-z0-9]{14,}|tbl[A-Za-z0-9]{14,}|fld[A-Za-z0-9]{14,}|rec[A-Za-z0-9]{14,})" --include='*.jsx' --include='*.md' --include='*.json' .

# 2. Email addresses, names, internal URLs
grep -rE "@(cisco|fireworklabs|[a-z]+\.com)" --include='*.jsx' --include='*.md' --include='*.json' . | grep -v 'noreply@anthropic.com'
grep -rE "https?://[^/]*\.(internal|corp|cisco)\." --include='*.jsx' --include='*.md' --include='*.json' .

# 3. Common secret patterns
grep -rE "(password|secret|token|api[_-]?key)\s*[:=]" --include='*.jsx' --include='*.md' --include='*.json' .

# 4. Anything with `mikeklar` / `michaelklar` (filesystem paths shouldn't be in committed files)
grep -ri "mikeklar\|michaelklar" --include='*.jsx' --include='*.md' --include='*.json' .
```

Anything flagged should be redacted or replaced with placeholders.

### 3. Personal preferences scan

Look for opinions baked into the kit that should be choices, not defaults:

- **`.claude/settings.local.json`** — currently has `mikeklar`'s personal allowlist preferences (Bash commands, Context7 MCPs). For a public kit, this should either be removed entirely or shipped as an example named differently (`settings.example.json`?), since `settings.local.json` is conventionally per-developer. Consider: should this file be in `.gitignore` instead of committed?
- **`.gitignore`** — minimal, only excludes `extensions/output/*.bundle.jsx`. Public consumers may want broader defaults (`.DS_Store`, editor swap files, OS junk). Consider extending or noting this is intentional minimal.
- **`memory/` files** — these contain Michael's personal collaboration patterns ("Michael prefers terse answers," etc., depending on what's actually in the files). Re-read each file with fresh eyes; these are aimed at one user. For a public kit, they should either be removed or genericized into "patterns the kit's author found useful when working with Claude on this kind of project."
  - Specifically check: `feedback_airtable_jsx_patterns.md`, `feedback_interface_extensions.md`, `feedback_airtable_api.md`, `reference_context7_libs.md`, `reference_airtable_toolkit.md`. The `feedback_*` files are most likely to have personal voice.
- **README quickstart** — currently uses `$EDITOR` and assumes bash. Fine for a CLI-first audience but might confuse a less technical reader. Probably leave as-is; flag only if the user wants broader appeal.

### 4. License + author + contributing

A public repo needs:

- **`LICENSE`** — pick one. MIT is the common default for "use this however you want" starter kits. Apache 2.0 if patent grants matter. Decide and add.
- **README header** — currently no author / no license badge. Add a one-line "Made by [author]" + license badge.
- **`CONTRIBUTING.md`** — optional. Skip unless you want to invite PRs. If you do want PRs, a 10-line file explaining the build flow + "no npm by design" guardrail prevents drive-by toolchain changes.

### 5. Repo description + topics for `gh repo create`

Decide:
- **Description (one line, ≤350 chars):** suggested → "A starter kit for Airtable Custom Interface Extensions: SDK gotchas pre-documented, antd 5.x scaffolding, and a hello-world demo. Built from production project experience. No npm — pure CDN + bash concatenation."
- **Topics:** suggested → `airtable`, `airtable-extensions`, `interface-extensions`, `react`, `antd`, `starter-kit`

These get passed to `gh repo create --description "..." --add-topic ...`.

---

## When ready to push

After the above is resolved:

```bash
cd "/Users/michaelklar/Claude Cowork/airtable-interface-extension-kit"

# Sanity: clean tree, all the genericization pass commits in
git status
git log --oneline

# Create + push in one shot (public, mikeklar/airtable-interface-extension-kit)
gh repo create airtable-interface-extension-kit \
  --public \
  --source . \
  --remote origin \
  --push \
  --description "..." \
  --add-topic airtable \
  --add-topic airtable-extensions \
  --add-topic interface-extensions \
  --add-topic starter-kit

# Then delete this checklist
git rm PRE_PUBLISH_CHECKLIST.md
git commit -m "chore: remove pre-publish checklist (resolved)"
git push
```
