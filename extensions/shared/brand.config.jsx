// ═══════════════════════════════════════════════════════════════════════════
// BRAND CONFIG — edit this file to brand the kit for your project.
// ═══════════════════════════════════════════════════════════════════════════
//
// This file is concatenated into every extension bundle (see build.sh order),
// so the constants defined here are available to constants.jsx, helpers.jsx,
// theme.jsx, and your own extension code.
//
// The Airtable Edit Source environment has no env vars or process.env, so
// all build-time configuration lives in JSX const files like this one.

const BRAND = {
    // Primary brand color — used as antd's colorPrimary (buttons, focus rings,
    // tab indicator, links, etc.). Most visible color in the UI.
    primary: '#3070e7',                  // TODO: set your brand primary

    // Darker brand color — used for primary text (high contrast on white)
    // and for chip outlines. Roughly your "logo color" or "header background".
    primaryDark: '#07182d',              // TODO: set your brand primary-dark

    // Accent color — secondary highlights, hover states, badges. May equal
    // primary if you only have one brand color.
    accent: '#3070e7',                   // TODO: set your brand accent (often = primary)
};

// sessionStorage key prefix — namespaces this app's persisted UI state
// (filter selections, view modes, etc.) from any other Airtable extension
// running in the same iframe origin.
const STORAGE_PREFIX = 'kit_';           // TODO: e.g., 'myproj_'
