// ═══════════════════════════════════════════════════════════════════════════
// HelloWorldApp — root component. Owns table resolution + diagnostics.
//
// Pattern:
//   1. useBase → look up the configured table by name
//   2. Build a list of issues for DiagnosticBanner (missing table, missing fields)
//   3. Mount the view ONLY when the table exists (useRecords is never conditional)
// ═══════════════════════════════════════════════════════════════════════════

function HelloWorldApp() {
    const base = useBase();
    const table = base.getTableByNameIfExists(TABLE_NAME);

    const issues = [];
    if (!table) {
        issues.push(
            `Table "${TABLE_NAME}" is not exposed in this Interface. ` +
            `Open Interface Designer → add the table, or update TABLE_NAME ` +
            `in extensions/hello-world/constants.jsx.`
        );
    } else {
        // Field-existence checks. table.fields only returns Interface
        // Designer-configured fields (SDK gotcha), so this surfaces
        // misconfiguration explicitly instead of silently rendering empty.
        if (!table.getFieldByNameIfExists(NAME_FIELD)) {
            issues.push(`Field "${NAME_FIELD}" not found on "${TABLE_NAME}".`);
        }
        if (!table.getFieldByNameIfExists(STATUS_FIELD)) {
            issues.push(`Field "${STATUS_FIELD}" (single-select) not found on "${TABLE_NAME}".`);
        }
    }

    return (
        <div style={{
            padding: 24,
            background: COLORS.bg,
            minHeight: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
            <h1 style={{
                fontSize: 24,
                fontWeight: 700,
                color: COLORS.textPrimary,
                marginTop: 0,
                marginBottom: 16,
            }}>
                Hello, world.
            </h1>
            <DiagnosticBanner issues={issues} />
            {table ? (
                <HelloWorldView table={table} />
            ) : (
                <AppLoadingSkeleton />
            )}
        </div>
    );
}
