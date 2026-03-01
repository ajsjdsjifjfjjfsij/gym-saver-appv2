"use client";

/**
 * Centalisated utility to resolve the API Base URL.
 * In Web (localhost/Vercel): Use relative URL ("").
 * In Capacitor (Native/File): Use the production Vercel URL.
 */
export function getApiBaseUrl(): string {
    if (typeof window === "undefined") {
        return "https://www.gymsaverapp.com";
    }

    const isNative = window.location.protocol === "file:" ||
        window.location.hostname === "localhost" && Boolean(process.env.NEXT_PUBLIC_FORCE_PROD_API);

    // If we are in a native app context, we must call the absolute production URL
    if (isNative) {
        return "https://www.gymsaverapp.com";
    }

    // Otherwise (Vercel/Web), use relative pathing to ensure cookies/auth headers work naturally
    return "";
}
