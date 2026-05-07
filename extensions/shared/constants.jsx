// ═══════════════════════════════════════════════════════════════════════════
// SHARED DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════
//
// Edit brand.config.jsx, not this file. Generic design tokens only here.
// Project-specific tokens (status color maps, role orderings, business enums)
// belong in your extension's own constants.jsx.
//
// Build order: brand.config.jsx loads first, so BRAND and STORAGE_PREFIX are
// available here as top-level identifiers.

const COLORS = {
    bg: '#f7f8fa',
    white: '#ffffff',
    border: '#e8eaed',
    textPrimary: BRAND.primaryDark,
    textSecondary: '#5f6368',
    textMuted: '#9aa0a6',
    accent: BRAND.primary,
    accentLight: '#dce8fd',
    danger: '#c5221f',
    dangerLight: '#fce8e6',
};

const SHADOWS = {
    card: '0 1px 4px rgba(0,0,0,0.08)',
    cardHover: '0 2px 10px rgba(0,0,0,0.13)',
    panel: '-4px 0 20px rgba(0,0,0,0.08)',
};

// Airtable's choice-color palette mirrored as { bg, text } pairs.
// Use with helpers.getSelectChoiceColors() to render single/multi-select
// chips that match the colors users see in the Airtable grid.
const AIRTABLE_COLORS = {
    blueDark1:    { bg: '#cfdfff', text: '#2750ae' },
    blueLight1:   { bg: '#cfdfff', text: '#2750ae' },
    blueLight2:   { bg: '#d0f0fd', text: '#0b76b7' },
    cyanDark1:    { bg: '#c2f5e9', text: '#06786f' },
    cyanLight1:   { bg: '#c2f5e9', text: '#06786f' },
    cyanLight2:   { bg: '#d0f0fd', text: '#0b76b7' },
    grayDark1:    { bg: '#e0e0e0', text: '#444'    },
    grayLight1:   { bg: '#eee',    text: '#666'    },
    grayLight2:   { bg: '#eee',    text: '#666'    },
    greenDark1:   { bg: '#b9e4d0', text: '#1b6e3d' },
    greenLight1:  { bg: '#d1f7c4', text: '#2d7e41' },
    greenLight2:  { bg: '#d1f7c4', text: '#2d7e41' },
    orangeDark1:  { bg: '#fee2d5', text: '#b3490d' },
    orangeLight1: { bg: '#fee2d5', text: '#b3490d' },
    orangeLight2: { bg: '#ffdce5', text: '#b3490d' },
    pinkDark1:    { bg: '#ffdce5', text: '#b5215b' },
    pinkLight1:   { bg: '#ffdce5', text: '#b5215b' },
    pinkLight2:   { bg: '#ffdce5', text: '#b5215b' },
    purpleDark1:  { bg: '#ede2fe', text: '#6b2fa0' },
    purpleLight1: { bg: '#ede2fe', text: '#6b2fa0' },
    purpleLight2: { bg: '#ede2fe', text: '#6b2fa0' },
    redDark1:     { bg: '#ffdce5', text: '#ba1e45' },
    redLight1:    { bg: '#fee2d5', text: '#ba1e45' },
    redLight2:    { bg: '#ffdce5', text: '#ba1e45' },
    tealDark1:    { bg: '#c2f5e9', text: '#06786f' },
    tealLight1:   { bg: '#c2f5e9', text: '#06786f' },
    tealLight2:   { bg: '#c2f5e9', text: '#06786f' },
    yellowDark1:  { bg: '#ffeab6', text: '#8b6c10' },
    yellowLight1: { bg: '#ffeab6', text: '#8b6c10' },
    yellowLight2: { bg: '#ffeab6', text: '#8b6c10' },
};

// Neutral fallback for chips when no color is configured on a select choice
// (or when rendering a free-text label).
const CHIP_FALLBACK = { bg: '#f1f3f4', text: '#5f6368' };
