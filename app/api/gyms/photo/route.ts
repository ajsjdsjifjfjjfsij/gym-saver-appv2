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
    const photoName = searchParams.get("photo_name");

    if (!placeId && !photoName) {
        return NextResponse.json({ error: "place_id or photo_name is required" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ photoUrl: null }, { status: 200 });
    }

    try {
        const referer = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "https://www.gymsaverapp.com";

        let finalPhotoName = photoName;

        if (!finalPhotoName && placeId) {
            // Fetch place details (photos field only) from the new Places API
            const res = await fetch(
                `https://places.googleapis.com/v1/places/${placeId}`,
                {
                    headers: {
                        "X-Goog-Api-Key": apiKey,
                        "X-Goog-FieldMask": "photos",
                        "Referer": referer,
                    },
                    cache: "no-store",
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
            finalPhotoName = photos[0].name;
        }

        if (!finalPhotoName) {
            return NextResponse.json({ photoUrl: null }, { status: 200 });
        }

        // Now fetch the actual Media URI (lh3.googleusercontent.com)
        // This URI has no Referer restrictions, so the client can load it directly.
        const mediaRes = await fetch(
            `https://places.googleapis.com/v1/${finalPhotoName}/media?key=${apiKey}&maxHeightPx=1200&maxWidthPx=1600&skipHttpRedirect=true`,
            {
                headers: {
                    "Referer": referer,
                },
                cache: "no-store",
            }
        );

        if (!mediaRes.ok) {
            console.error(`[photo] Media API error ${mediaRes.status}`);
            return NextResponse.json({ photoUrl: null }, { status: 200 });
        }

        const mediaData = await mediaRes.json();
        const photoUrl = mediaData.photoUri;

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
