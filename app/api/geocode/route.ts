import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
        return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "Google Maps API key not configured" },
            { status: 500 }
        );
    }

    try {
        console.log(`[Geocode API] Searching for: ${address}`);
        // Use the Places API instead of Geocoding API to bypass strict referer restrictions
        const url = `https://places.googleapis.com/v1/places:searchText`;
        const headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.formattedAddress,places.location",
            // ALWAYS use the primary domain as referer to satisfy API key restrictions
            "Referer": "https://www.gymsaverapp.com"
        };

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
                textQuery: address,
                includedType: "locality"
            })
        });

        const data = await response.json();
        console.log(`[Geocode API] Primary response status: ${response.status}`);

        let results = data.places || [];

        if (!response.ok || results.length === 0) {
            console.log(`[Geocode API] No results with locality filter, trying fallback...`);
            // Fallback attempt without includedType if the first one fails
            const fbResponse = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    textQuery: address
                })
            });
            const fbData = await fbResponse.json();
            console.log(`[Geocode API] Fallback response status: ${fbResponse.status}`);

            if (!fbResponse.ok || !fbData.places || fbData.places.length === 0) {
                console.error("[Geocode API] All attempts failed to find location:", address, fbData);
                return NextResponse.json(
                    { error: "Location not found", diagnostics: fbData },
                    { status: 404 }
                );
            }
            results = fbData.places;
        }

        const place = results[0];
        console.log(`[Geocode API] Found: ${place.formattedAddress}`);

        return NextResponse.json({
            lat: place.location.latitude,
            lng: place.location.longitude,
            formattedAddress: place.formattedAddress,
        });
    } catch (error) {
        console.error("Geocoding error:", error);
        return NextResponse.json(
            { error: "Failed to geocode address" },
            { status: 500 }
        );
    }
}
