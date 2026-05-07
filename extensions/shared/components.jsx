// ═══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function AttributeChip({ label, colorMap, fieldColors, forceOutline }) {
    const { Tag } = window.antd;
    let colors;
    if (colorMap && colorMap[label]) {
        colors = colorMap[label];
    } else if (fieldColors && fieldColors[label]) {
        colors = fieldColors[label];
    } else {
        colors = CHIP_FALLBACK;
    }
    return (
        <Tag
            bordered={!!forceOutline}
            style={{
                background: colors.bg,
                color: colors.text,
                border: forceOutline ? `1px solid ${COLORS.textPrimary}` : (colors.border ? `1px solid ${colors.border}` : 'none'),
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '12px',
                lineHeight: '18px',
                margin: 0,
            }}
        >
            {label || 'Unknown'}
        </Tag>
    );
}

function DiagnosticBanner({ issues }) {
    if (!issues || issues.length === 0) return null;
    const { Alert } = window.antd;
    return (
        <Alert
            type="warning"
            closable
            message="Configuration needed"
            description={<ul style={{ margin: 0, paddingLeft: '20px' }}>{issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>}
            style={{ marginBottom: '16px' }}
        />
    );
}

// ── Shared UI Components ────────────────────────────────────────────



function MultiSelectFilter({ label, options, selected, onChange }) {
    const { Select } = window.antd;
    const selectedSet = selected instanceof Set ? selected : new Set(selected);
    const value = selectedSet.size === 0 ? [] : [...selectedSet];

    function handleChange(vals) {
        onChange(new Set(vals || []));
    }

    const selectOptions = options.map(o => ({ label: o, value: o }));

    return (
        <Select
            mode="multiple"
            placeholder={`All ${label || ''}`}
            value={value}
            onChange={handleChange}
            options={selectOptions}
            maxTagCount={2}
            style={{ minWidth: 220, fontSize: '11px' }}
            getPopupContainer={trigger => trigger.parentElement}
        />
    );
}

function GridListToggle({ mode, onChange }) {
    const { Segmented } = window.antd;
    return (
        <Segmented
            value={mode}
            onChange={onChange}
            options={[
                { value: 'grid', label: '⊞' },
                { value: 'mini', label: '▦' },
                { value: 'list', label: '☰' },
            ]}
            size="small"
        />
    );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────
// Mimics the app layout (nav tabs + card grid) while useRecords data loads.
// Uses antd Skeleton with active shimmer for perceived performance.

function AppLoadingSkeleton() {
    const { Skeleton } = window.antd;
    // Mimic nav bar: logo placeholder + tab bar
    const navSkeleton = (
        <div style={{ marginBottom: '20px' }}>
            <Skeleton.Button active size="large" style={{ width: '120px', height: '40px', marginBottom: '12px' }} />
            <div style={{ display: 'flex', gap: '24px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '8px' }}>
                <Skeleton.Button active size="small" style={{ width: '100px' }} />
                <Skeleton.Button active size="small" style={{ width: '60px' }} />
            </div>
        </div>
    );
    // Mimic filter bar
    const filterSkeleton = (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <Skeleton.Input active size="default" style={{ width: '180px' }} />
            <Skeleton.Input active size="default" style={{ width: '150px' }} />
            <Skeleton.Input active size="default" style={{ width: '120px' }} />
        </div>
    );
    // Mimic card grid (6 cards in a 2×3 pattern)
    const cardSkeleton = (idx) => (
        <div key={idx} style={{
            flex: '1 1 380px', maxWidth: '500px',
            borderRadius: '8px', border: `1px solid ${COLORS.border}`,
            padding: '20px', background: COLORS.white,
        }}>
            <Skeleton active paragraph={{ rows: 3 }} />
        </div>
    );
    return (
        <div>
            {navSkeleton}
            {filterSkeleton}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {[0, 1, 2, 3, 4, 5].map(cardSkeleton)}
            </div>
        </div>
    );
}

