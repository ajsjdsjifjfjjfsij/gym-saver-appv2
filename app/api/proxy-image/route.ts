import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        const response = await fetch(imageUrl, {
            headers: {
                "Referer": "https://www.gymsaverapp.com"
            }
        });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("content-type") || "image/jpeg");
        headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=86400");
        headers.set("Access-Control-Allow-Origin", "*");

        return new NextResponse(buffer, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error("Proxy image error:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
