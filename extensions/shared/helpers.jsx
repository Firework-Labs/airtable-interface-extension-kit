// ═══════════════════════════════════════════════════════════════════════════
// SHARED HELPERS — generic field reads, sessionStorage, Airtable deep links.
// ═══════════════════════════════════════════════════════════════════════════
//
// Build order: brand.config.jsx + constants.jsx must precede this file, so
// STORAGE_PREFIX, AIRTABLE_COLORS, and CHIP_FALLBACK are all in scope.

// ─── Session Storage Helpers ────────────────────────────────────────────────

function saveState(key, value) {
    try { sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value)); } catch (e) {}
}

function loadState(key, fallback) {
    try {
        const v = sessionStorage.getItem(STORAGE_PREFIX + key);
        return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
}

// ─── Data Helpers ───────────────────────────────────────────────────────────

// Read raw cell value (object/array/etc. — preserves linked-record arrays,
// attachment arrays, richText markdown source, etc.).
//
// Footgun reminder: getCellValueAsString strips markdown for richText fields.
// To get the markdown source of a richText cell, use getFieldValue, not
// getFieldString. (See docs/airtable-sdk-gotchas.md.)
function getFieldValue(record, table, fieldName) {
    const field = table.getFieldByNameIfExists(fieldName);
    if (!field) return null;
    return record.getCellValue(field);
}

// Read cell value as a display string (rendered text for richText, names
// for collaborators, comma-joined for multi-select, etc.).
function getFieldString(record, table, fieldName) {
    const field = table.getFieldByNameIfExists(fieldName);
    if (!field) return '';
    return record.getCellValueAsString(field);
}

// Extract record IDs from a linked-record cell, returning [] if empty/missing.
function getLinkedIds(record, table, fieldName) {
    const val = getFieldValue(record, table, fieldName);
    if (!val || !Array.isArray(val)) return [];
    return val.map(v => v.id);
}

function formatDateTimeWithTZ(record, table, fieldName) {
    const raw = getFieldValue(record, table, fieldName);
    if (!raw) return '';
    try {
        const d = new Date(raw);
        if (isNaN(d)) return getFieldString(record, table, fieldName);
        return d.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit',
            timeZoneName: 'short',
        });
    } catch (e) {
        return getFieldString(record, table, fieldName);
    }
}

// ─── Airtable deep links ────────────────────────────────────────────────────
// expandRecord() is a no-op in Edit Source (silent failure — see docs/).
// Use these to open records in Airtable proper instead.

function openInAirtable(baseId, tableId, recordId) {
    const url = recordId
        ? `https://airtable.com/${baseId}/${tableId}/${recordId}`
        : `https://airtable.com/${baseId}/${tableId}`;
    // Named window reuses the same tab for repeated opens
    window.open(url, 'airtable_edit');
}

// Opens an Airtable record in a sized popup window (not a new tab).
// Returns a cleanup function. Calls onClose when the popup is closed.
function openAirtablePopup(baseId, tableId, recordId, onClose) {
    const url = `https://airtable.com/${baseId}/${tableId}/${recordId}`;
    const w = 750, h = 550;
    const left = window.screenX + Math.round((window.outerWidth - w) / 2);
    const top = window.screenY + Math.round((window.outerHeight - h) / 2);
    const popup = window.open(url, 'airtable_attach', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
    if (!popup) {
        // Popup blocked — fall back to tab
        window.open(url, 'airtable_edit');
        return () => {};
    }
    const interval = setInterval(() => {
        if (popup.closed) {
            clearInterval(interval);
            if (onClose) onClose();
        }
    }, 500);
    return () => clearInterval(interval);
}

// ─── Misc ───────────────────────────────────────────────────────────────────

function groupBy(items, keyFn) {
    const groups = {};
    for (const item of items) {
        const key = keyFn(item);
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    }
    return groups;
}

// Build a label → { bg, text } map from a single/multi-select field's
// configured choices, using Airtable's own choice colors. Pass the result to
// <AttributeChip fieldColors={...} /> so chips match the Airtable grid.
function getSelectChoiceColors(table, fieldName) {
    const field = table.getFieldByNameIfExists(fieldName);
    if (!field || !field.options || !field.options.choices) return {};
    const map = {};
    for (const choice of field.options.choices) {
        map[choice.name] = (choice.color && AIRTABLE_COLORS[choice.color]) || CHIP_FALLBACK;
    }
    return map;
}

// Project-specific data resolvers (e.g., displaying images, computing
// person/event display names) belong in your extension's own helpers, not
// here. The shared layer should know nothing about your schema.
