import { NextResponse } from "next/server"
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query as fsQuery, where, orderBy, limit as fsLimit, getDocs } from "firebase/firestore";

export const dynamic = "force-dynamic";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
const BASE_URL = "https://maps.googleapis.com/maps/api/place"

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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const query = searchParams.get("query") || "gym"
    const radius = searchParams.get("radius") || "50000" // Default 50km
    const source = searchParams.get("source") || "places" // 'places' or 'firestore'

    // ---------------------------------------------------------
    // 1. Initial Security Check (TOP LEVEL)
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

    if (!isValid) {
        const currentMin = Math.floor(now / 1000 / 60);
        console.warn(`[Security] Invalid token from IP: ${ip}. Token: "${dynamicToken}". serverTs: ${currentMin}. Referer: ${referer || 'none'}`);

        // TEMPORARY BYPASS: Allow requests while debugging 401 on live environment
        // return NextResponse.json({ error: "Unauthorized", debug: { serverTs: currentMin } }, { status: 401 })
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
        const normalizedQuery = (query || "").toLowerCase().replace(/\s/g, "");
        const isBrandQuery = normalizedQuery.includes("puregym") ||
            normalizedQuery.includes("jdgym") ||
            normalizedQuery.includes("thegym") ||
            normalizedQuery.includes("nuffield") ||
            normalizedQuery.includes("bannatyne") ||
            normalizedQuery.includes("anytimefitness") ||
            normalizedQuery.includes("jetts") ||
            normalizedQuery.includes("snapfitness") ||
            normalizedQuery.includes("everlastgym");

        if (source === "firestore") {
            // Calculate bounding box based on radius
            // 1 degree lat ~= 111 km
            const radiusInMeters = parseFloat(radius) || 50000;
            const radiusInKm = radiusInMeters / 1000;
            // Add 20% buffer to ensure we catch edge cases
            const latDelta = (radiusInKm / 111) * 1.2;

            const minLat = parseFloat(lat) - latDelta;
            const maxLat = parseFloat(lat) + latDelta;

            let q;
            if (isBrandQuery) {
                // BRAND BYPASS: If searching for a chain, don't limit by coordinates
                console.log(`[Backend] Brand query detected: "${query}". Bypassing geo-filter.`);
                q = fsQuery(
                    collection(db, "gyms"),
                    orderBy("name"), // Use name ordering instead for brand queries
                    fsLimit(500)
                );
            } else {
                q = fsQuery(
                    collection(db, "gyms"),
                    where("location.lat", ">=", minLat),
                    where("location.lat", "<=", maxLat),
                    orderBy("location.lat"),
                    fsLimit(10000) // Firestore maximum query limit is 10000
                );
            }

            // Fetch Approved Gym Listings from new flat structure
            const queryApprovedListings = fsQuery(
                collection(db, "pending_gym_listings"),
                where("status", "==", "approved")
            );

            const [snap, approvedSnap] = await Promise.all([
                getDocs(q),
                getDocs(queryApprovedListings) // Get all approved listings for now
            ]);

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
            });

            // Create a set of existing place_ids from the main firestoreResults for de-duplication
            const existingPlaceIds = new Set(firestoreResults.map(g => g.id));

            const centerLat = parseFloat(lat);
            const centerLng = parseFloat(lng);

            // Helper to calculate distance in meters (simple equirectangular approximation for performance)
            const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
                const R = 6371e3; // metres
                const φ1 = lat1 * Math.PI / 180;
                const φ2 = lat2 * Math.PI / 180;
                const Δφ = (lat2 - lat1) * Math.PI / 180;
                const Δλ = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            };

            const approvedListingsResults = approvedSnap.docs.map(doc => {
                const data = doc.data();
                const gymLat = data.lat !== undefined ? parseFloat(data.lat) : undefined;
                const gymLng = data.lng !== undefined ? parseFloat(data.lng) : undefined;
                const gymPlaceId = data.place_id || doc.id;

                // De-duplicate: If this gym is already in the main gyms database (via match), skip this result
                if (existingPlaceIds.has(gymPlaceId)) return null;

                // Visibility Bug Fix: If missing coordinates, DO NOT fall back to search center (it shows everywhere).
                // Just skip it for search results until it's properly geocoded.
                if (gymLat === undefined || gymLng === undefined || isNaN(gymLat) || isNaN(gymLng)) return null;

                // Distance Filtering: Ensure the approved listing is actually within the search radius
                // BRAND BYPASS: If searching for a chain, show all approved listings
                const distance = getDistance(centerLat, centerLng, gymLat, gymLng);
                if (distance > radiusInMeters && !isBrandQuery) return null;

                return {
                    id: gymPlaceId,
                    name: data.gym_name,
                    address: `${data.address}, ${data.city}, ${data.postcode}`,
                    rating: 5, // Default assumption or placeholder
                    user_ratings_total: 1,
                    type: "Gym",
                    priceLevel: "££",
                    lat: gymLat,
                    lng: gymLng,
                    open_now: true,
                    // Map generic things over
                    lowest_price: data.price_monthly,
                    memberships: {
                        [data.gym_name]: { price: data.price_monthly, url: data.join_link }
                    },
                    photos: data.media?.gymImageUrl ? [data.media.gymImageUrl] : [],
                    website: data.website || data.join_link,
                };
            }).filter((g): g is any => g !== null); // Filter out skipped/null entries

            // Merge sets
            const combinedResults = [...firestoreResults, ...approvedListingsResults].filter(g => {
                const data = g as any;
                const name = (data.name || "").toLowerCase();
                const website = (data.website || "").toLowerCase();

                // Filter out David Lloyd and Village Gym
                if (name.includes("david lloyd") || name.includes("village gym")) return false;

                // Filter out Better (GLL) by name prefix
                if (name.startsWith("better ") || name.includes("better gym") || name.includes("better:")) return false;

                // Filter out Better (GLL) by website domain
                if (website.includes("better.org.uk") || website.includes("gll.org")) return false;

                // Filter out Better (GLL) by membership plan names (e.g. 'Better Health UK (Monthly)')
                if (Array.isArray(data.memberships)) {
                    const hasBetterMembership = data.memberships.some((m: any) =>
                        typeof m.name === 'string' && m.name.toLowerCase().startsWith("better")
                    );
                    if (hasBetterMembership) return false;
                }

                return true;
            });

            return NextResponse.json(
                { results: combinedResults },
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
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.primaryType,places.regularOpeningHours,places.photos,places.websiteUri,places.googleMapsUri",
                "Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.gymsaverapp.com"
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

            const unwantedTerms = ["boxing", "kickboxing", "gymnastics", "training ground", "dance", "martial arts", "pizza", "restaurant", "pub", "bar", "cafe", "better gym", "better ", "david lloyd", "village gym"];
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
