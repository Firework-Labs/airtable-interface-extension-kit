// ═══════════════════════════════════════════════════════════════════════════
// HelloWorldView — exercises every shared component end-to-end.
//
// Smoke test for: AntdLoader, DiagnosticBanner, AppLoadingSkeleton,
// MultiSelectFilter, AttributeChip, GridListToggle, saveState/loadState,
// getSelectChoiceColors, useDesignTokens.
// ═══════════════════════════════════════════════════════════════════════════

function HelloWorldView({ table }) {
    const records = useRecords(table);
    const tokens = useDesignTokens();

    const [statusFilter, setStatusFilter] = useState(
        () => new Set(loadState('helloWorld.statusFilter', []))
    );
    const [viewMode, setViewMode] = useState(
        () => loadState('helloWorld.viewMode', 'grid')
    );

    useEffect(() => {
        saveState('helloWorld.statusFilter', [...statusFilter]);
    }, [statusFilter]);

    useEffect(() => {
        saveState('helloWorld.viewMode', viewMode);
    }, [viewMode]);

    const statusColors = useMemo(
        () => getSelectChoiceColors(table, STATUS_FIELD),
        [table]
    );

    const statusOptions = useMemo(
        () => Object.keys(statusColors),
        [statusColors]
    );

    // Empty filter set = show all (kit's filter convention).
    const filtered = records.filter(r => {
        if (statusFilter.size === 0) return true;
        const status = r.getCellValueAsString(STATUS_FIELD);
        return statusFilter.has(status);
    });

    const isGrid = viewMode === 'grid' || viewMode === 'mini';
    const cardWidth = viewMode === 'mini' ? 180 : 280;

    return (
        <div>
            <div style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: 20,
            }}>
                <MultiSelectFilter
                    label={STATUS_FIELD}
                    options={statusOptions}
                    selected={statusFilter}
                    onChange={setStatusFilter}
                />
                <div style={{ marginLeft: 'auto' }}>
                    <GridListToggle mode={viewMode} onChange={setViewMode} />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div style={{
                    padding: 40,
                    textAlign: 'center',
                    color: tokens.textMuted,
                    border: `1px dashed ${tokens.border}`,
                    borderRadius: 8,
                }}>
                    {records.length === 0
                        ? `No records in "${TABLE_NAME}" yet — add one in Airtable.`
                        : `No records match the current filter.`}
                </div>
            ) : isGrid ? (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                }}>
                    {filtered.map(r => (
                        <RecordCard
                            key={r.id}
                            record={r}
                            statusColors={statusColors}
                            width={cardWidth}
                            tokens={tokens}
                        />
                    ))}
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}>
                    {filtered.map(r => (
                        <RecordRow
                            key={r.id}
                            record={r}
                            statusColors={statusColors}
                            tokens={tokens}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function RecordCard({ record, statusColors, width, tokens }) {
    const name = record.getCellValueAsString(NAME_FIELD) || '(unnamed)';
    const status = record.getCellValueAsString(STATUS_FIELD);
    return (
        <div style={{
            width,
            padding: 16,
            background: tokens.white,
            border: `1px solid ${tokens.border}`,
            borderRadius: 8,
            boxShadow: SHADOWS.card,
        }}>
            <div style={{
                fontWeight: 600,
                fontSize: 14,
                color: tokens.textPrimary,
                marginBottom: 8,
            }}>
                {name}
            </div>
            {status && (
                <AttributeChip label={status} fieldColors={statusColors} />
            )}
        </div>
    );
}

function RecordRow({ record, statusColors, tokens }) {
    const name = record.getCellValueAsString(NAME_FIELD) || '(unnamed)';
    const status = record.getCellValueAsString(STATUS_FIELD);
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: tokens.white,
            border: `1px solid ${tokens.border}`,
            borderRadius: 6,
        }}>
            <div style={{
                flex: 1,
                fontSize: 13,
                color: tokens.textPrimary,
            }}>
                {name}
            </div>
            {status && (
                <AttributeChip label={status} fieldColors={statusColors} />
            )}
        </div>
    );
}
