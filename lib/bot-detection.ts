/**
 * Anti-Bot Detection Utility
 * Designed to detect common automation frameworks and headless browsers.
 */

export const SEARCH_ENGINE_BOTS = [
    "google",
    "bing",
    "slurp",
    "duckduckbot",
    "baiduspider",
    "yandex",
    "sogou",
    "crawler",
    "lighthouse",
    "adsbot",
    "mediapartners",
    "storebot",
    "facebot",
    "twitterbot",
    "linkedinbot",
    "slackbot"
];

export const isSearchEngineBot = (userAgent?: string): boolean => {
    if (typeof window === "undefined" && !userAgent) return false;
    const ua = (userAgent || (typeof window !== "undefined" ? window.navigator.userAgent : "")).toLowerCase();
    if (!ua) return false;
    return SEARCH_ENGINE_BOTS.some(bot => ua.includes(bot));
}

export const isBot = (): boolean => {
    if (typeof window === "undefined") return false;

    // 0. Search Engine Allowlist
    if (isSearchEngineBot()) {
        return false;
    }

    const nav = window.navigator;
    // ...
    if (nav.webdriver) return true;

    // 2. Headless Chrome Heuristics
    // Headless Chrome often has inconsistent window globals
    const isChrome = !!(window as any).chrome;
    if (isChrome && !nav.languages) return true;
    if (isChrome && nav.languages.length === 0) return true;

    // 4. Automation Marker Check (Common in Selenium/Puppeteer)
    const botMarkers = [
        "__webdriver_evaluate",
        "__selenium_evaluate",
        "__webdriver_unwrapped",
        "__webdriver_signature",
        "__driver_evaluate",
        "__driver_unwrapped",
        "__fxdriver_evaluate",
        "__fxdriver_unwrapped",
        "__fxdriver_signature",
        "cdc_adoQbhYu0PLY6tpxEWP_Phi", // Common Chromedriver marker
    ];

    for (const marker of botMarkers) {
        if (marker in window || marker in document) return true;
    }

    // 5. Canvas Fingerprint Check (Headless Chrome often renders canvas differently)
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("GymSaver Anti-Bot", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("GymSaver Anti-Bot", 4, 17);
            const result = canvas.toDataURL();
            // Headless browsers sometimes return empty or very simple data URLs if GPU is disabled
            if (result.length < 100) return true;
        }
    } catch (e) {
        // Some bots block canvas access entirely
        return true;
    }

    // 6. WebGL Vendor Check
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as WebGLRenderingContext);
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                // Generic or software renderers are red flags
                if (vendor.includes("Google Inc.") && renderer.includes("SwiftShader")) return true;
                if (renderer.toLowerCase().includes("llvmpipe")) return true;
                if (renderer.toLowerCase().includes("software")) return true;
            }
        }
    } catch (e) {
        // Ignore WebGL errors as some legitimate browsers might have it disabled
    }

    // 7. User Agent Presence & Headless Markers
    if (!nav.userAgent || nav.userAgent.includes("HeadlessChrome") || nav.userAgent.includes("jsdom")) return true;

    return false;
};

/**
 * Generates a dynamic, time-based secret for API requests.
 * Uses a secondary fallback secret known to the client.
 */
export const getDynamicSecret = (): string => {
    const ts = Math.floor(Date.now() / 1000 / 60);
    const secret = "gymsaver-secure-v1";
    return btoa(`${secret}:${ts}`);
};
