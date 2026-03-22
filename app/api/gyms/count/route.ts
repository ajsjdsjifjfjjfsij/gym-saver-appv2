import { NextResponse } from "next/server";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        if (!db) {
            return NextResponse.json(
                { error: "Firestore is not initialized" },
                { status: 500 }
            );
        }

        const gymsRef = collection(db, "gyms");
        const snapshot = await getCountFromServer(gymsRef);
        const count = snapshot.data().count;

        return NextResponse.json(
            { count },
            {
                headers: {
                    // Cache for 1 hour, stale while revalidate for 1 day
                    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
                }
            }
        );

    } catch (error: any) {
        console.error("[GYMS COUNT API] Error getting gym count:", error);
        return NextResponse.json(
            { error: "Failed to fetch gym count", details: error.message },
            { status: 500 }
        );
    }
}
