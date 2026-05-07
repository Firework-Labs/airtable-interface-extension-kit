// ═══════════════════════════════════════════════════════════════════════════
// SHARED THEME — antd ConfigProvider factory + design-token hook.
// ═══════════════════════════════════════════════════════════════════════════
//
// Bootstrap (Root + initializeBlock) lives in your extension's own theme.jsx,
// not here. This file only exposes:
//   - createAntdTheme(brand) — pure factory returning an antd theme config
//   - AntdThemeProvider — wraps children in <ConfigProvider> using BRAND
//   - useDesignTokens() — read antd's runtime tokens as semantic names

// Pure factory: brand palette → antd theme config object.
// Pull this out (rather than inlining tokens) so the same brand can produce
// alternate themes (e.g., dark mode) without forking the provider.
function createAntdTheme(brand) {
    return {
        token: {
            colorPrimary: brand.primary,
            borderRadius: 6,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            colorText: brand.primaryDark,
            colorBgLayout: COLORS.bg,
            colorBorderSecondary: COLORS.border,
            colorTextSecondary: COLORS.textSecondary,
            colorTextTertiary: COLORS.textMuted,
            colorError: COLORS.danger,
            colorErrorBg: COLORS.dangerLight,
        },
    };
}

function AntdThemeProvider({ children }) {
    const { ConfigProvider } = window.antd;
    return (
        <ConfigProvider theme={createAntdTheme(BRAND)}>
            {children}
        </ConfigProvider>
    );
}

// Use inside components to replace direct COLORS/SHADOWS reads with antd's
// runtime token resolution. The COLORS const remains as a fallback for code
// outside React components (utilities, top-level constants).
function useDesignTokens() {
    const { token } = window.antd.theme.useToken();
    return {
        bg: token.colorBgLayout,
        white: token.colorBgContainer,
        border: token.colorBorderSecondary,
        textPrimary: token.colorText,
        textSecondary: token.colorTextSecondary,
        textMuted: token.colorTextTertiary,
        accent: token.colorPrimary,
        accentLight: token.colorPrimaryBg,
        danger: token.colorError,
        dangerLight: token.colorErrorBg,
        shadowCard: token.boxShadowTertiary,
        shadowPanel: token.boxShadow,
        token,
    };
}
