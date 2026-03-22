import { NextResponse } from "next/server";
import { Resend } from "resend";

// Intelligently fallback to prevent crashing if the env doesn't map instantly
const resend = new Resend(process.env.RESEND_API_KEY || "missing_key");

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { targetEmails, subject, messageHtml } = body;

        // Validation Gatekeepers
        if (!targetEmails || !Array.isArray(targetEmails) || targetEmails.length === 0) {
            return NextResponse.json({ error: "Missing Target Emails payload array." }, { status: 400 });
        }
        if (!subject || !messageHtml) {
            return NextResponse.json({ error: "Missing broadcast subject or html." }, { status: 400 });
        }

        // Resend batch API natively requires mapping an array of configuration objects.
        const chunkLimit = 100; // Resend allows a strict max 100 limit per batch matrix.
        const boundedEmails = targetEmails.slice(0, chunkLimit); // Protecting against immediate unverified spam bursts

        const batchPayload = boundedEmails.map((email: string) => ({
            from: "GymSaver Admin <admin@gymsaverapp.com>",
            to: [email],
            subject: subject,
            html: messageHtml
        }));

        // Fire Matrix
        const data = await resend.batch.send(batchPayload);

        return NextResponse.json({ success: true, count: boundedEmails.length, data });
    } catch (error: any) {
        console.error("Failed to fire batch broadcast email:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
