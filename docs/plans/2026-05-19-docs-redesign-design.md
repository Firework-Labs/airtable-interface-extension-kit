---
title: Docs Redesign — Non-developer README + EUL Tracker cleanup
date: 2026-05-19
status: approved
---

## Goal

Make the kit approachable for non-developer humans working with an AI coding agent. The README is currently developer-oriented (git clone, bash, $EDITOR). This redesign inverts the primary audience: humans first, AI agents directed to existing technical docs.

## What changes

### README.md — full rewrite

New structure:
1. **Intro** (2–3 sentences) — what the kit is, who it's for, no jargon
2. **Part 1: Set up in Airtable** — full UI walkthrough (create base, create interface, use Omni to generate a custom element, edit source code, expose data fields)
3. **Part 2: Connect your AI coding tool** — open this folder in Claude Code / Cursor / VS Code with Copilot; provide a starter prompt the user can paste
4. **Optional: Change the colors** — 2 sentences, at the bottom; default colors already work (blue + dark navy)
5. **One line for AI agents** (visually separated): *"If you're an AI coding agent: read `CLAUDE.md`, then `docs/porting-checklist.md`."*

Branding is removed from the primary flow entirely. It is optional and mentioned last.

### CLAUDE.md — one-line fix

Remove the reference to "the EUL Tracker project's `docs/kit-contribution-rubric.md`" in the Receiving Contributions section. Replace with a generic description of where the rubric lives in consuming projects.

### docs/porting-checklist.md — minimal change

Add a note at the top: this document is for AI coding agents, not humans. The 10-step content is correct and stays as-is. Agents are directed here from the README's agent line.

### docs/hello-world-airtable-setup.md — no changes

Remains accurate agent reference.

## What does NOT change

- All technical docs in `docs/` (sdk-gotchas, api-patterns, antd-in-iframe-canon, build-and-deploy, ux-conventions, lessons-learned)
- All source files under `extensions/`
- `scripts/new-extension.sh`
- `brand.config.jsx` (defaults are already in place; no TODO removal needed — the TODOs are appropriate guidance for agents)

## Airtable UI walkthrough steps (for README Part 1)

Source: provided by product owner 2026-05-19.

1. Create a new Base → choose "Build an app on your own"
2. Navigate to Interfaces tab → "Build it yourself" → "Build an interface" → name it → Next
3. Choose Layout → scroll to Blank → Finish
4. Click "Add element" → add a "Record Picker" element
5. Open Omni (sunburst icon, left sidebar) → Tools → "Generate a custom element" → describe what you want in chat (e.g., "Create a React page that displays a rotating dial showing the quantity of records in 'Table 1'")
6. Omni presents a plan → click "Build it" → wait 1–2 minutes
7. Close Omni once the custom interface appears
8. **Edit the code:** Click the area where the custom element lives (blue highlight box — not the heading above it) → right sidebar shows "Page > Custom" → click "…" → "Edit Source Code" — this is where bundle code gets pasted
9. **Expose data:** Back to Page > Custom → Data → click the gear next to Fields → toggle on all fields you want visible/editable → Under "User actions": toggle on "Edit records inline" and "Add/delete records inline" → if multiple tables, switch between them in the Fields gear to enable each

## Starter agent prompt (for README Part 2)

> I just set up an Airtable interface using the Airtable Interface Extension Kit (this folder). My table is called [table name] and my fields are [field names]. Please read CLAUDE.md and docs/porting-checklist.md, then help me build and paste a working extension.
