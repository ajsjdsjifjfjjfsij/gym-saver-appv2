import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/gyms/photo?place_id=ChIJ...
 *
 * Looks up the first photo for a given Google Place ID using the
 * Places API (New), and returns its media URL so gym cards can display
 * a real photo without storing references in Firestore.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("place_id");

    if (!placeId) {
        return NextResponse.json({ error: "place_id is required" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ photoUrl: null }, { status: 200 });
    }

    try {
        // The API key has HTTP referrer restrictions.
        // We must include a Referer header that matches the allowed domain.
        const referer = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "https://www.gymsaverapp.com";

        // Fetch place details (photos field only) from the new Places API
        const res = await fetch(
            `https://places.googleapis.com/v1/places/${placeId}`,
            {
                headers: {
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": "photos",
                    "Referer": referer,
                },
                // Cache for 24h so repeated renders don't hammer the API
                next: { revalidate: 86400 },
            }
        );

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[photo] Places API error ${res.status}:`, errText);
            return NextResponse.json({ photoUrl: null }, { status: 200 });
        }

        const data = await res.json();
        const photos = data.photos || [];

        if (photos.length === 0) {
            return NextResponse.json({ photoUrl: null }, { status: 200 });
        }

        // Build the media URL for the first (best) photo
        const photoName = photos[0].name; // e.g. "places/ChIJ.../photos/AUc7..."
        const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxHeightPx=600&maxWidthPx=800`;

        return NextResponse.json(
            { photoUrl },
            {
                headers: {
                    "Cache-Control": "public, max-age=86400, s-maxage=86400",
                },
            }
        );
    } catch (err) {
        console.error("[photo] Failed to fetch place photo:", err);
        return NextResponse.json({ photoUrl: null }, { status: 200 });
    }
}
