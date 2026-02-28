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
        // Use the Places API instead of Geocoding API to bypass strict referer restrictions
        // that block the Geocoding API from server-side calls without a specific IP/Backend key.
        const url = `https://places.googleapis.com/v1/places:searchText`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "places.formattedAddress,places.location",
                // Pass a referer to satisfy the key's HTTP referer restrictions
                "Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.gymsaverapp.com"
            },
            body: JSON.stringify({
                textQuery: address,
                includedType: "locality" // Optional: helps prioritize cities/towns over generic businesses
            })
        });

        const data = await response.json();

        if (!response.ok || !data.places || data.places.length === 0) {
            // Fallback attempt without includedType if the first one fails
            const fbResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": "places.formattedAddress,places.location",
                    "Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.gymsaverapp.com"
                },
                body: JSON.stringify({
                    textQuery: address
                })
            });
            const fbData = await fbResponse.json();

            if (!fbResponse.ok || !fbData.places || fbData.places.length === 0) {
                return NextResponse.json(
                    { error: "Location not found" },
                    { status: 404 }
                );
            }
            data.places = fbData.places;
        }

        const place = data.places[0];

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
