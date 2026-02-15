import { NextResponse } from "next/server"

export const dynamic = "force-dynamic";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
const BASE_URL = "https://maps.googleapis.com/maps/api/place"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const query = searchParams.get("query") || "gym"
    const radius = searchParams.get("radius") || "50000" // Default 50km
    const source = searchParams.get("source") || "places" // 'places' or 'firestore'

    // ---------------------------------------------------------
    // 1. Rate Limiting and Initial Security Check (TOP LEVEL)
    // ---------------------------------------------------------
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const globalAny = global as any;
    const isLocalhost = ip === "::1" || ip === "127.0.0.1" || ip.includes("localhost");

    // Dev reset mechanism
    if (isLocalhost && searchParams.get("reset") === "true") {
        globalAny.blockedIPs = new Set();
        return NextResponse.json({ success: true, message: "Security list cleared" });
    }

    // Poison Pill Check
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

    recentRequests.push(now)
    globalAny.rateLimitMap.set(ip, recentRequests)

    // ---------------------------------------------------------
    // 2. Strict Browser Signal Validation
    // ---------------------------------------------------------
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""

    const botPatterns = [/bot/i, /crawler/i, /spider/i, /headless/i, /curl/i, /postman/i, /axios/i]
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
        console.warn(`Blocked bot User-Agent: ${userAgent} from IP: ${ip}`)
        return NextResponse.json({ error: "Access Denied" }, { status: 403 })
    }

    // ---------------------------------------------------------
    // 3. Dynamic Secret Validation (Bot Protection)
    // ---------------------------------------------------------
    const dynamicToken = request.headers.get("x-gymsaver-app-secret") || "";
    let isValid = false;

    try {
        const decoded = Buffer.from(dynamicToken, 'base64').toString('utf-8');
        const [secret, tsStr] = decoded.split(':');
        const clientTs = parseInt(tsStr);
        const serverTs = Math.floor(Date.now() / 1000 / 60);

        // Relax tolerance to 10 minutes to handle clock drift
        if (
            (secret === process.env.APP_SECRET || secret === "gymsaver-secure-v1") &&
            Math.abs(serverTs - clientTs) <= 10
        ) {
            isValid = true;
        }
    } catch (e) {
        if (dynamicToken === "gymsaver-secure-v1" || dynamicToken === process.env.APP_SECRET) {
            isValid = true;
        }
    }

    // Secondary check: If no token but is production, require referer
    // If token IS valid, we can relax the referer requirement (e.g. for some mobile browsers)
    if (!isValid) {
        if (process.env.NODE_ENV === "production" && !referer) {
            console.warn(`Missing referer from IP: ${ip}`)
            // return NextResponse.json({ error: "Access Denied" }, { status: 403 })
        }

        console.warn(`Invalid dynamic token from IP: ${ip}. Secret: ${process.env.APP_SECRET ? 'set' : 'missing'}`)
        return NextResponse.json({ error: "Unauthorized", debug: { serverTs: Math.floor(now / 1000 / 60) } }, { status: 401 })
    }

    // ---------------------------------------------------------
    // 4. Parameter Validation
    // ---------------------------------------------------------
    if (!lat || !lng) {
        return NextResponse.json(
            { error: "Latitude and Longitude are required" },
            { status: 400 }
        )
    }

    // ---------------------------------------------------------
    // 5. Data Fetching (Firestore or Places)
    // ---------------------------------------------------------
    try {
        if (source === "firestore") {
            // Dynamic imports to save bundle size if not used
            const { getFirestore, collection, query: fsQuery, where, orderBy, limit: fsLimit, getDocs } = await import("firebase/firestore");
            const { initializeApp, getApps, getApp } = await import("firebase/app");
            // NOTE: Removed server-side auth import to prevent 500 errors in serverless environment without Admin SDK

            const firebaseConfig = {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            };

            const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            const db = getFirestore(app);

            // Calculate bounding box based on radius
            // 1 degree lat ~= 111 km
            const radiusInMeters = parseFloat(radius) || 50000;
            const radiusInKm = radiusInMeters / 1000;
            // Add 20% buffer to ensure we catch edge cases
            const latDelta = (radiusInKm / 111) * 1.2;

            const minLat = parseFloat(lat) - latDelta;
            const maxLat = parseFloat(lat) + latDelta;

            const q = fsQuery(
                collection(db, "gyms"),
                where("location.lat", ">=", minLat),
                where("location.lat", "<=", maxLat),
                orderBy("location.lat"),
                fsLimit(1000) // Increase limit to ensure we get all gyms in the radius
            );

            const snap = await getDocs(q);
            const firestoreResults = snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: data.place_id || doc.id,
                    ...data,
                    lat: data.location?.lat !== undefined ? data.location.lat : data.lat,
                    lng: data.location?.lng !== undefined ? data.location.lng : data.lng,
                    rating: data.rating || 0,
                    user_ratings_total: data.user_ratings_total || 0,
                };
            }).filter(g => {
                const data = g as any;
                const name = (data.name || "").toLowerCase();
                // Hide if name starts with "better " or contains "better gym"
                // Also check for "better:"
                return !name.startsWith("better ") && !name.includes("better gym") && !name.includes("better:");
            });

            return NextResponse.json(
                { results: firestoreResults },
                {
                    headers: {
                        "Cache-Control": "no-store, max-age=0"
                    }
                }
            );
        }

        // Google Places API Fallback
        const apiKey = GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                results: [],
                warning: "No API Key provided. Using mock data in frontend.",
            })
        }

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
        const ALLOWED_TYPES = [
            "gym", "fitness_center", "sports_club", "sports_complex",
            "yoga_studio", "pilates_studio", "athletic_field",
            "swimming_pool", "leisure_centre"
        ];

        const filteredPlaces = places.filter((place: any) => {
            const name = (place.displayName?.text || "").toLowerCase();
            const type = (place.primaryType || "").toLowerCase();
            const isAllowedType = ALLOWED_TYPES.some(allowed => type === allowed || type.includes("gym") || type.includes("fitness"));

            if (!isAllowedType) return false;

            const unwantedTerms = ["boxing", "kickboxing", "gymnastics", "training ground", "dance", "martial arts", "pizza", "restaurant", "pub", "bar", "cafe", "better gym", "better "];
            return !unwantedTerms.some(term => name.includes(term) || type.includes(term));
        });

        const cleanedResults = filteredPlaces.map((place: any) => {
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
