/**
 * Anti-Bot Detection Utility
 * Simplified to prevent false positives and client-side crashes.
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
    "slackbot",
    "snapchat",
    "whatsapp",
    "facebookexternalhit",
    "discordbot",
    "telegrambot",
    "applebot"
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
    const ua = nav.userAgent.toLowerCase();

    // Basic common bot indicators
    if (ua.includes("headless") || ua.includes("bot") || ua.includes("crawl")) return true;
    if (nav.webdriver) return true;

    return false;
};

export const isInAppBrowser = (): boolean => {
    if (typeof window === "undefined") return false;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isInstagram = userAgent.includes("Instagram");
    const isFacebook = userAgent.includes("FBAN") || userAgent.includes("FBAV");
    const isTikTok = userAgent.includes("TikTok") || userAgent.includes("Bytedance");
    return isInstagram || isFacebook || isTikTok;
};

export const getInAppBrowserType = (): string | null => {
    if (typeof window === "undefined") return null;
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (userAgent.includes("Instagram")) return "Instagram";
    if (userAgent.includes("FBAN") || userAgent.includes("FBAV")) return "Facebook";
    if (userAgent.includes("TikTok") || userAgent.includes("Bytedance")) return "TikTok";
    return null;
};

/**
 * Generates a dynamic, time-based secret for API requests.
 * Uses a secondary fallback secret known to the client.
 */
export const getDynamicSecret = (): string => {
    const ts = Math.floor(Date.now() / 1000 / 60);
    const secret = "gymsaver-secure-v1";
    const str = `${secret}:${ts}`;

    // SSR safe base64
    if (typeof window === "undefined") {
        return Buffer.from(str).toString('base64');
    }
    return btoa(str);
};
