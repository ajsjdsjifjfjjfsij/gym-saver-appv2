import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
        return NextResponse.json({ error: "Place ID is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "Google Maps API key not configured" },
            { status: 500 }
        );
    }

    try {
        console.log(`[Admin Place Details] Fetching details for: ${placeId}`);
        const url = `https://places.googleapis.com/v1/places/${placeId}`;
        const headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "location,formattedAddress",
            "Referer": "https://www.gymsaverapp.com"
        };

        const response = await fetch(url, { headers });
        const data = await response.json();

        if (!response.ok) {
            console.error("[Admin Place Details] API error:", data);
            return NextResponse.json(
                { error: "Failed to fetch place details", diagnostics: data },
                { status: response.status }
            );
        }

        return NextResponse.json({
            lat: data.location.latitude,
            lng: data.location.longitude,
            formattedAddress: data.formattedAddress,
        });
    } catch (error) {
        console.error("[Admin Place Details] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
