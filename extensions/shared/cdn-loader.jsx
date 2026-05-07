import React, { useState, useMemo, useEffect, useRef } from 'react';
import { initializeBlock, useBase, useRecords } from '@airtable/blocks/interface/ui';

// ─── CDN Loader ─────────────────────────────────────────────────────────────
// Loads Ant Design 5.x at runtime via DOM injection. The antd UMD build
// expects window.React, window.ReactDOM, and window.dayjs as globals.
// Airtable provides React via module import but may not set window globals,
// so we bridge them before loading antd.

// Bridge React global — antd's UMD factory checks window.React
if (!window.React) window.React = React;
// ReactDOM: try to find it from Airtable's environment
try { if (!window.ReactDOM) window.ReactDOM = require('react-dom'); } catch (e) {}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Script load failed: ' + url));
        document.head.appendChild(s);
    });
}

function loadCSS(url) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = resolve;
        link.onerror = () => reject(new Error('CSS load failed: ' + url));
        document.head.appendChild(link);
    });
}

const CDN = 'https://cdn.jsdelivr.net/npm';
const ANTD_VERSION = '5.22.7';
const DAYJS_VERSION = '1.11.13';
const MARKED_VERSION = '4.3.0';        // last UMD-friendly major; v7+ is ESM-only
const DOMPURIFY_VERSION = '3.0.8';
const ANTD_JS = `${CDN}/antd@${ANTD_VERSION}/dist/antd.min.js`;
const ANTD_CSS = `${CDN}/antd@${ANTD_VERSION}/dist/reset.css`;
const DAYJS_JS = `${CDN}/dayjs@${DAYJS_VERSION}/dayjs.min.js`;
const MARKED_JS = `${CDN}/marked@${MARKED_VERSION}/marked.min.js`;
const DOMPURIFY_JS = `${CDN}/dompurify@${DOMPURIFY_VERSION}/dist/purify.min.js`;

// Singleton promise so multiple mounts don't re-trigger loading.
// Loads antd + dayjs + marked + DOMPurify together. marked/DOMPurify only
// power markdown rendering for richText fields (when used) — loading them
// in the shared deps bundle keeps the loader simple and only costs ~30KB gz.
let _antdLoadPromise = null;
function loadAntd() {
    if (_antdLoadPromise) return _antdLoadPromise;
    _antdLoadPromise = (async () => {
        // dayjs must load before antd (antd's UMD expects window.dayjs)
        if (!window.dayjs) await loadScript(DAYJS_JS);
        // Load antd JS + CSS + marked + DOMPurify in parallel
        await Promise.all([
            loadScript(ANTD_JS),
            loadCSS(ANTD_CSS),
            window.marked ? Promise.resolve() : loadScript(MARKED_JS),
            window.DOMPurify ? Promise.resolve() : loadScript(DOMPURIFY_JS),
        ]);
    })();
    return _antdLoadPromise;
}

function AntdLoader({ children }) {
    const [ready, setReady] = useState(!!window.antd && !!window.marked && !!window.DOMPurify);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (window.antd && window.marked && window.DOMPurify) { setReady(true); return; }
        loadAntd()
            .then(() => {
                if (!window.antd) throw new Error('antd loaded but did not initialize (window.React or window.ReactDOM may be missing)');
                setReady(true);
            })
            .catch(err => setError(err.message));
    }, []);

    if (error) {
        return (
            <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', color: '#c5221f' }}>
                Failed to load UI library: {error}
            </div>
        );
    }
    if (!ready) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', fontFamily: 'system-ui, sans-serif', color: '#5f6368',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>⟳</div>
                    <div>Loading…</div>
                </div>
            </div>
        );
    }
    return children;
}

// Convenience accessor — use after AntdLoader confirms ready
function antd() { return window.antd; }

