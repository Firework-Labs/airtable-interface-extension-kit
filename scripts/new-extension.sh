#!/bin/bash
# Scaffold a new extension folder under extensions/<name>/ with stub source
# files and a build.sh that concatenates the canonical kit pipeline.
#
# Usage: bash scripts/new-extension.sh <name>
# Example: bash scripts/new-extension.sh hello-world

set -e

NAME="$1"
if [ -z "$NAME" ]; then
    echo "Usage: $0 <extension-name>" >&2
    exit 1
fi

# Resolve repo root (parent of scripts/) so the script works from any cwd.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/extensions/$NAME"

if [ -e "$DIR" ]; then
    echo "Error: $DIR already exists" >&2
    exit 1
fi

mkdir -p "$DIR/views"
touch "$DIR/views/.gitkeep"

# ─── constants.jsx ──────────────────────────────────────────────────────────
cat > "$DIR/constants.jsx" <<'EOF'
// Project-specific constants for this extension.
// Status color maps, role orderings, business enums go here — not in shared/.

const TABLE_NAME = 'Records';   // TODO: your Airtable table
EOF

# ─── app.jsx ────────────────────────────────────────────────────────────────
cat > "$DIR/app.jsx" <<'EOF'
// Root app component for this extension.
// Owns data loading (useBase, useRecords, lookup maps) and routes to views.

function App() {
    const base = useBase();
    const table = base.getTableByNameIfExists(TABLE_NAME);
    const issues = [];
    if (!table) issues.push(`Table "${TABLE_NAME}" not found in this Interface`);

    return (
        <div style={{ padding: 16, background: COLORS.bg, minHeight: '100vh' }}>
            <DiagnosticBanner issues={issues} />
            {table && <div>TODO: render your view here.</div>}
        </div>
    );
}
EOF

# ─── theme.jsx ──────────────────────────────────────────────────────────────
cat > "$DIR/theme.jsx" <<'EOF'
// Per-extension bootstrapper.
// Composes AntdLoader (loads CDN deps) → AntdThemeProvider (applies BRAND) →
// App, then hands the tree to Airtable's initializeBlock.

function Root() {
    return (
        <AntdLoader>
            <AntdThemeProvider>
                <App />
            </AntdThemeProvider>
        </AntdLoader>
    );
}

initializeBlock({ interface: () => <Root /> });
EOF

# ─── build.sh ───────────────────────────────────────────────────────────────
cat > "$DIR/build.sh" <<EOF
#!/bin/bash
# Build $NAME extension from modular source files.
# Output: ../output/$NAME.bundle.jsx (paste this into Airtable Edit Source)
#
# Concatenation order (no forward references — flat scope after concat):
#   shared deps → brand → constants → helpers → components → theme
#   → ext constants → views → app → ext theme (initializeBlock last)

set -e
shopt -s nullglob   # empty views/ glob expands to nothing instead of literal
cd "\$(dirname "\$0")"

cat \\
  ../shared/cdn-loader.jsx \\
  ../shared/brand.config.jsx \\
  ../shared/constants.jsx \\
  ../shared/helpers.jsx \\
  ../shared/components.jsx \\
  ../shared/theme.jsx \\
  constants.jsx \\
  views/*.jsx \\
  app.jsx \\
  theme.jsx \\
  > ../output/$NAME.bundle.jsx

echo "✓ Built output/$NAME.bundle.jsx (\$(wc -l < ../output/$NAME.bundle.jsx | tr -d ' ') lines)"
EOF

chmod +x "$DIR/build.sh"

echo "✓ Scaffolded extensions/$NAME/"
echo "  - constants.jsx, app.jsx, theme.jsx, views/, build.sh"
echo ""
echo "Next steps:"
echo "  1. Edit extensions/$NAME/constants.jsx → set TABLE_NAME"
echo "  2. Add views in extensions/$NAME/views/*.jsx"
echo "  3. Wire view(s) into app.jsx"
echo "  4. Run: bash extensions/$NAME/build.sh"
