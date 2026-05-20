# Docs Redesign — Non-developer README + EUL Tracker Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the kit approachable for non-developer humans by rewriting README.md around an Airtable-first UI walkthrough, burying branding as optional, and directing AI agents to existing technical docs — while removing the one EUL Tracker reference from CLAUDE.md.

**Architecture:** Three file edits, no code changes. README.md is a full rewrite. CLAUDE.md is a one-line fix. docs/porting-checklist.md gets a two-line header note. All other files are untouched.

**Tech Stack:** Markdown only.

---

### Task 1: Fix the EUL Tracker reference in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (line 62 — the "Receiving Contributions" section)

**Step 1: Make the edit**

In `CLAUDE.md`, find and replace this line in the "Receiving Contributions" section:

Old (line 62):
```
2. **Filter:** The consuming project's Claude session evaluates the entry against a contribution rubric (pattern reusable by any consumer; see the EUL Tracker project's `docs/kit-contribution-rubric.md` for the canonical version).
```

New:
```
2. **Filter:** The consuming project's Claude session evaluates the entry against its own contribution rubric (pattern reusable by any consumer; the rubric lives in the consuming project's `docs/` folder).
```

**Step 2: Verify**

```bash
grep -r "EUL Tracker" .
```
Expected: no output.

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: remove EUL Tracker reference from CLAUDE.md"
```

---

### Task 2: Add agent-facing note to porting-checklist.md

**Files:**
- Modify: `docs/porting-checklist.md` (top of file, before "# Porting Checklist")

**Step 1: Add the note**

Prepend the following two lines before the existing `# Porting Checklist` heading:

```markdown
> **This document is for AI coding agents.** If you're a human getting started, read the [README](../README.md) instead.

```

The file should now start:
```markdown
> **This document is for AI coding agents.** If you're a human getting started, read the [README](../README.md) instead.

# Porting Checklist
```

**Step 2: Verify**

Open `docs/porting-checklist.md` and confirm the blockquote appears before the heading. No other content should change.

**Step 3: Commit**

```bash
git add docs/porting-checklist.md
git commit -m "docs: mark porting-checklist as agent-facing reference"
```

---

### Task 3: Rewrite README.md

**Files:**
- Modify: `README.md` (full rewrite)

**Step 1: Replace with the new content**

Replace the entire contents of `README.md` with the following:

````markdown
# Airtable Interface Extension Kit

This kit helps you build custom, code-powered elements inside Airtable's Interface Designer — without needing to be a developer. You describe what you want, your AI coding assistant builds it, and you paste the result into Airtable.

Released under the [MIT License](LICENSE).

---

## Part 1: Set up your interface in Airtable

These steps happen entirely inside Airtable. No code yet.

**Create a base**

1. In Airtable, create a new Base and choose **"Build an app on your own"**.

**Create an interface**

2. Click **Interfaces** in the top bar.
3. If prompted, click **"Build it yourself"**, then **"Build an interface"**. Give it a name and click **Next**.
4. In the **Choose Layout** window, scroll down and select **Blank**, then click **Finish**.

**Add elements**

5. In your new interface, click the **Add element** button at the bottom.
6. Add a **Record Picker** element.

**Use Omni to generate a custom element**

7. Open **Omni** — the sunburst icon just below the Airtable logo in the left sidebar. Omni is Airtable's AI assistant.
8. In the Omni chat field, click the **Tools** button and select **"Generate a custom element"**.
9. Describe what you'd like to build. For example:
   > *"Create a React page that displays a rotating dial showing the number of records in 'Table 1'."*
10. Omni will show you a plan. Click **"Build it"** and wait a minute or two.
11. Once the custom element appears, close Omni.

**Connect the code editor**

12. Click the area of the page where your new custom element lives. It should highlight with a blue box. *(Don't click the heading above it — that selects the whole section. Click the element itself.)*
13. In the right sidebar you'll see a column headed **Page > Custom**. Click the **"…"** next to that header and choose **"Edit Source Code"**. This is where you'll paste code later.

**Make your data visible**

14. Go back to **Page > Custom** in the right sidebar. Under **Data**, click the gear icon next to **Fields** and toggle on every field you want to be able to see or edit.
15. Under **User actions**, toggle on **"Edit records inline"** and **"Add/delete records inline"**.
16. If your base has more than one table, there'll be a table selector inside the Fields gear — switch between tables and enable each one.

You're done in Airtable for now.

---

## Part 2: Connect your AI coding tool

You'll need an AI coding assistant — [Claude Code](https://claude.ai/code), [Cursor](https://www.cursor.com/), or VS Code with GitHub Copilot all work well.

1. Download or clone this kit to your computer as a project folder.
2. Open the folder in your AI coding tool.
3. Paste this prompt to get started:

   > *I just set up an Airtable interface using the Airtable Interface Extension Kit (this folder). My table is called **[your table name]** and my key fields are **[your field names]**. Please read `CLAUDE.md` and `docs/porting-checklist.md`, then help me build and paste a working extension.*

Your agent will handle the technical setup from there and tell you when you have code ready to paste into Airtable's Edit Source Code panel.

---

## Optional: Change the colors

The kit ships with a default color scheme (blue buttons, dark navy text). If you want to match your own brand colors, just tell your AI agent:

> *"Change the brand colors to [your color or hex code]."*

---

> **If you're an AI coding agent:** Read [`CLAUDE.md`](./CLAUDE.md) first, then [`docs/porting-checklist.md`](./docs/porting-checklist.md).
````

**Step 2: Verify**

Open `README.md` and confirm:
- No bash code blocks in the human-facing sections
- Branding appears only in the "Optional" section near the bottom
- The agent line is the last line
- No references to EUL Tracker, `$EDITOR`, or `extensions/output/`

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for non-developer audience"
```

---

### Task 4: Verify the full change set

**Step 1: Check for stray project references**

```bash
grep -r "EUL Tracker" .
grep -r "EUL" . --include="*.md"
```
Expected: no output.

**Step 2: Confirm agent line is in README**

```bash
grep "AI coding agent" README.md
```
Expected: one match on the last line.

**Step 3: Confirm porting-checklist has the agent note**

```bash
head -3 docs/porting-checklist.md
```
Expected: blockquote is the first line.

**Step 4: Final commit if any loose ends**

If everything looks good and there's nothing left staged, no commit needed. If there are any minor fixes, stage and commit them:

```bash
git add -p
git commit -m "docs: cleanup after README redesign"
```
