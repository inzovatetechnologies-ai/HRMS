import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetEmail = body.to || "hr@inzovate-technologies.com";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #07152E; color: #FFFFFF; border-radius: 12px; max-width: 500px;">
        <h2 style="color: #22D3EE; margin-top: 0;">INZOVATE HRMS — Test Email</h2>
        <p>This is a verification test email dispatched from Inzovate HRMS.</p>
        <p><strong>Status:</strong> SMTP connection active & authenticated.</p>
        <p><strong>Dispatched To:</strong> ${targetEmail}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;" />
        <small style="color: #94A3B8;">INZOVATE TECHNOLOGIES PRIVATE LIMITED</small>
      </div>
    `;

    const result = await sendEmail({
      to: targetEmail,
      subject: `[INZOVATE TEST] Live SMTP Mail Delivery Check — ${new Date().toLocaleTimeString("en-IN")}`,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to deliver email via SMTP server.",
          simulated: result.simulated,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${targetEmail}!`,
      messageId: result.messageId,
      simulated: result.simulated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send test email" }, { status: 500 });
  }
}
