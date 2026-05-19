# Airtable Interface Extension Kit

This kit helps you build custom, code-powered elements inside Airtable's Interface Designer — without needing to be a developer. You describe what you want, your AI coding assistant builds it, and you paste the result into Airtable.

This is primarily a tool to help your AI Agent be more effective at crafting custom interface elements within Airtable's implementation of React, which means you'll be able to build interfaces that look and behave in ways that you would never be able to produce using only Airtable's standard set of elements, allowing you create user-friendly, purpose-built app experiences. While this is very freeing, it comes with a few caveats–the tips below are written especially for those new to Airtable and/or AI agent development:
- If you're not already using github, start using it.
- This kit comes with support for the [Ant Design v5 component library](https://5x.ant.design/components/overview/). It's a fantastic set of pre-designed, thoroughly tested UI components that can accommodate a very wide array of data display/entry types. Browse the component library for more details.  It's a good way to make sure you and your agent are on the same page about the UI nuances.   
- It's best to imagine the eventual future state, and prepare to get there iteratively. Work with your AI agent to help guide your work in a way that will help you make good decisions as you go. 
- Your AI agent can help you build out the data infrastructure in Airtable. Ask questions and challenge AI's suggestions. You'll learn along the way and sometimes it will make suggestions based on assumptions it just made up.  
- Start small with an MVP and work iteratively. Test. 
- Things will break along the way (this is why you test). Tell your AI agent what happened to help troubleshoot.
- Don't build features you don't need. 
- Get your users involved. Understand why you're building what you're building. Involve your users in the testing when the product is polished enough for them to 'see it'.
- Build features in small batches.
- Don't forget to test.

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

1. Download this kit to your computer as a project folder. (If you know git, you can clone it instead.)
2. Open the folder in your AI coding tool.
3. Paste this prompt to get started:

   > *I just set up an Airtable interface using the Airtable Interface Extension Kit (this folder). My table is called **[your table name]** and my key fields are **[your field names]**. Please read `CLAUDE.md` and `docs/porting-checklist.md`, then help me build and paste a working extension.*

Your agent will handle the technical setup from there and tell you when you have code ready to paste. To paste it: click your custom element in Airtable (blue box highlight), then choose **"Edit Source Code"** from the **Page > Custom** sidebar.

---

## Optional: Change the colors

The kit ships with a default color scheme (blue buttons, dark navy text). If you want to match your own brand colors, just tell your AI agent:

> *"Change the brand colors to [your color or hex code]."*

---

> **If you're an AI coding agent:** Read [CLAUDE.md](./CLAUDE.md) first, then [porting-checklist.md](./docs/porting-checklist.md).
