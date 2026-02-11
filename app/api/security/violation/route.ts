import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const ip = request.headers.get("x-forwarded-for") || "unknown"

        console.error(`🚨 SECURITY VIOLATION: Bot detected from IP: ${ip}. Reason: ${body.reason}`)

        // In a real app, we would flag the IP in a database.
        // For this demo/instance, we use a global set (same as gyms API)
        const globalAny = global as any;
        if (!globalAny.blockedIPs) globalAny.blockedIPs = new Set();
        globalAny.blockedIPs.add(ip);

        return NextResponse.json({ success: true, flagged: true })
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
}
