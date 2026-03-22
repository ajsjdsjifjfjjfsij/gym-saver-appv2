import { NextResponse } from "next/server";
import { Resend } from "resend";

// Resend initialization (Uses process.env.RESEND_API_KEY when available)
// Use a fallback to prevent crashing if the user hasn't added the key to .env yet
const resend = new Resend(process.env.RESEND_API_KEY || "missing_key");

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { targetEmail, gymName } = body;

        if (!targetEmail) {
            return NextResponse.json({ error: "Missing Target Email" }, { status: 400 });
        }

        const data = await resend.emails.send({
            from: "GymSaver Admin <admin@gymsaverapp.com>",
            to: [targetEmail],
            subject: "Your Gym Partner Account is Verified!",
            html: `
                <div style="font-family: sans-serif; color: #111;">
                    <h2 style="color: #6BD85E;">You're In!</h2>
                    <p>Hello ${gymName || 'Gym Partner'},</p>
                    <p>Great news! Your Gym Partner account on GymSaver has been officially verified by our administration team.</p>
                    <p>You now have full access to the <strong>Partner Dashboard</strong>.</p>
                    <p>You can instantly log in and start pitching exclusive membership offers to proactive users looking for a gym in your area.</p>
                    <br/>
                    <a href="https://gymsaverapp.com/partner/dashboard" style="background-color: #6BD85E; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px;">Access Live Bounties</a>
                    <br/><br/>
                    <p>Best regards,</p>
                    <p>The GymSaver Team</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Failed to send approval email:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
