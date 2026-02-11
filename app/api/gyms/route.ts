import { NextResponse } from "next/server"

export const dynamic = "force-static";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
const BASE_URL = "https://maps.googleapis.com/maps/api/place"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const query = searchParams.get("query") || "gym"
    const radius = searchParams.get("radius") || "5000" // Default 5km

    // 1. Rate Limiting and Initial Security Check
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Poison Pill: If the IP is already flagged as a bot, feed it junk data
    const globalAny = global as any;
    const isLocalhost = ip === "::1" || ip === "127.0.0.1" || ip.includes("localhost");

    // Dev reset mechanism
    if (isLocalhost && searchParams.get("reset") === "true") {
        globalAny.blockedIPs = new Set();
        return NextResponse.json({ success: true, message: "Security list cleared" });
    }

    if (globalAny.blockedIPs?.has(ip) && !isLocalhost) {
        console.error(`🧪 FEEDING POISON to confirmed bot: ${ip}`);
        return NextResponse.json({
            results: Array(40).fill(null).map((_, i) => ({
                id: `trap-${i}-${Date.now()}`,
                name: "Elite Platinum Secure Fitness",
                address: "Verification Required",
                rating: 5.0,
                user_ratings_total: 8888,
                type: "Security Protocol",
                priceLevel: "££££",
                lat: 0,
                lng: 0,
                photo_reference: "bot-trap"
            })),
            warning: "Security Protocol Active"
        });
    }

    const now = Date.now()
    const timeWindow = 60 * 1000 // 1 minute
    const limit = 20 // 20 requests per minute per IP

    // Simple In-Memory cleanup (Not production scale but works for single instance)
    if (!globalAny.rateLimitMap) globalAny.rateLimitMap = new Map();
    const requestLog = globalAny.rateLimitMap.get(ip) || []
    const recentRequests = requestLog.filter((time: number) => now - time < timeWindow)

    if (recentRequests.length >= limit) {
        console.warn(`Rate limit exceeded for IP: ${ip}`)
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        )
    }

    // Update log
    recentRequests.push(now)
    globalAny.rateLimitMap.set(ip, recentRequests)

    // 2. Strict Browser Signal Validation
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""
    const secChUa = request.headers.get("sec-ch-ua") || ""

    // Block common bot User-Agents
    const botPatterns = [/bot/i, /crawler/i, /spider/i, /headless/i, /curl/i, /postman/i, /axios/i]
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
        console.warn(`Blocked bot User-Agent: ${userAgent} from IP: ${ip}`)
        return NextResponse.json({ error: "Access Denied" }, { status: 403 })
    }

    // Ensure referer is present in production (but don't require exact host match to avoid blocking legitimate requests)
    if (process.env.NODE_ENV === "production" && !referer) {
        console.warn(`Missing referer from IP: ${ip}`)
        return NextResponse.json({ error: "Access Denied" }, { status: 403 })
    }

    // 3. Dynamic Secret Validation (Bot Protection)
    const dynamicToken = request.headers.get("x-gymsaver-app-secret") || "";
    let isValid = false;

    try {
        const decoded = Buffer.from(dynamicToken, 'base64').toString('utf-8');
        const [secret, tsStr] = decoded.split(':');
        const clientTs = parseInt(tsStr);
        const serverTs = Math.floor(Date.now() / 1000 / 60);

        // Allow 5 minute window for clock drift
        if (
            (secret === process.env.NEXT_PUBLIC_APP_SECRET || secret === "gymsaver-secure-v1") &&
            Math.abs(serverTs - clientTs) <= 5
        ) {
            isValid = true;
        }
    } catch (e) {
        // Fallback for direct "gymsaver-secure-v1" if not base64 during dev
        if (dynamicToken === "gymsaver-secure-v1" || dynamicToken === process.env.NEXT_PUBLIC_APP_SECRET) {
            isValid = true;
        }
    }

    if (!isValid) {
        console.warn(`Invalid dynamic token from IP: ${ip}. Secret: ${process.env.NEXT_PUBLIC_APP_SECRET ? 'set' : 'missing'}`)
        return NextResponse.json({ error: "Unauthorized", debug: { serverTs: Math.floor(now / 1000 / 60) } }, { status: 401 })
    }

    if (!lat || !lng) {
        return NextResponse.json(
            { error: "Latitude and Longitude are required" },
            { status: 400 }
        )
    }

    const apiKey = GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Fallback to mock data if no API key is present
    if (!apiKey) {
        console.warn("GOOGLE_MAPS_API_KEY is not set. Returning mock data.")
        return NextResponse.json({
            results: [],
            warning: "No API Key provided. Using mock data in frontend.",
        })
    }

    try {
        const isSearch = !!query && query !== "gym";
        const endpoint = isSearch
            ? "https://places.googleapis.com/v1/places:searchText"
            : "https://places.googleapis.com/v1/places:searchNearby";

        const location = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
        };

        const body: any = isSearch
            ? {
                textQuery: query,
                locationBias: {
                    circle: {
                        center: location,
                        radius: parseFloat(radius)
                    }
                }
            }
            : {
                locationRestriction: {
                    circle: {
                        center: location,
                        radius: parseFloat(radius)
                    }
                },
                includedPrimaryTypes: ["gym", "fitness_center", "yoga_studio"]
            };

        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.primaryType,places.regularOpeningHours,places.photos,places.websiteUri,places.googleMapsUri"
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(`Google Maps API Error: ${res.status} - ${data.error?.message || res.statusText}`);
        }

        const places = data.places || [];

        // Strict Backend Filtering: Remove unwanted categories and keywords
        // Strict Backend Filtering: ALLOWED TYPES ONLY + Blocklist
        const ALLOWED_TYPES = [
            "gym",
            "fitness_center",
            "sports_club",
            "sports_complex",
            "yoga_studio",
            "pilates_studio",
            "athletic_field",
            "swimming_pool",
            "leisure_centre"
        ];

        const filteredPlaces = places.filter((place: any) => {
            const name = (place.displayName?.text || "").toLowerCase();
            const type = (place.primaryType || "").toLowerCase();

            // 1. Must match an allowed type
            // Google Places API (New) returns types like "fitness_center", "gym", etc.
            // We check if the primaryType is in our allowed list OR if it contains "fitness" or "gym" as a catch-all for variations.
            const isAllowedType = ALLOWED_TYPES.some(allowed => type === allowed || type.includes("gym") || type.includes("fitness"));

            if (!isAllowedType) return false;

            const unwantedTerms = ["boxing", "kickboxing", "gymnastics", "training ground", "dance", "martial arts", "pizza", "restaurant", "pub", "bar", "cafe"];

            // 2. Must NOT match blocklist (names or types)
            const hasUnwantedTerm = unwantedTerms.some(term => name.includes(term) || type.includes(term));

            return !hasUnwantedTerm;
        });

        const cleanedResults = filteredPlaces.map((place: any) => {
            // detailed URL construction happens below or in frontend. 
            // Using resource name directly relative to the google API requires a key. 
            // We'll pass the resource name.
            const photos = place.photos?.map((p: any) => p.name).slice(0, 5) || [];
            const photoResource = photos.length > 0 ? photos[0] : undefined;

            return {
                id: place.id,
                name: place.displayName?.text || "Unknown Gym",
                address: place.formattedAddress || "Unknown Address",
                rating: place.rating || 0,
                user_ratings_total: place.userRatingCount || 0,
                type: place.primaryType ? place.primaryType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : "Gym",
                priceLevel: place.priceLevel ? convertPriceLevel(place.priceLevel) : "££",
                lat: place.location.latitude,
                lng: place.location.longitude,
                open_now: place.regularOpeningHours?.openNow,
                weekday_text: place.regularOpeningHours?.weekdayDescriptions,
                photo_reference: photoResource,
                photos: photos,
                website: place.websiteUri,
                googleMapsUri: place.googleMapsUri,
            };
        });

        return NextResponse.json({ results: cleanedResults });
    } catch (error: any) {
        console.error("Error fetching gyms:", error);
        console.error("API Key used (first 5 chars):", GOOGLE_MAPS_API_KEY?.substring(0, 5));
        return NextResponse.json(
            { error: "Failed to fetch gyms", details: error.message },
            { status: 500 }
        );
    }
}

function convertPriceLevel(level: string): string {
    switch (level) {
        case "PRICE_LEVEL_INEXPENSIVE": return "£";
        case "PRICE_LEVEL_MODERATE": return "££";
        case "PRICE_LEVEL_EXPENSIVE": return "£££";
        case "PRICE_LEVEL_VERY_EXPENSIVE": return "££££";
        default: return "££";
    }
}
