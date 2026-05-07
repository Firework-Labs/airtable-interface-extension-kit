// ═══════════════════════════════════════════════════════════════════════════
// hello-world bootstrapper.
// Composes AntdLoader → AntdThemeProvider → HelloWorldApp, then registers
// the tree with Airtable's initializeBlock.
// ═══════════════════════════════════════════════════════════════════════════

function Root() {
    return (
        <AntdLoader>
            <AntdThemeProvider>
                <HelloWorldApp />
            </AntdThemeProvider>
        </AntdLoader>
    );
}

initializeBlock({ interface: () => <Root /> });
