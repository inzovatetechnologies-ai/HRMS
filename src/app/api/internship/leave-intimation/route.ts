import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getISTTimeParts } from "@/lib/attendance";
import { sendEmail, buildInternLeaveIntimationEmail } from "@/lib/email";

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

    const body = await req.json();
    const { internId, reason, date } = body;

    const targetDate = date || getISTTimeParts().dateString;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Please provide a reason for taking leave." }, { status: 400 });
    }

    let intern: any = null;
    if (internId) {
      intern = await prisma.internship.findFirst({
        where: { OR: [{ id: internId }, { internId }] },
      });
    } else if (session.role === "INTERN") {
      intern = await prisma.internship.findUnique({
        where: { personalEmail: session.email },
      });
    }

    if (!intern) {
      return NextResponse.json({ error: "Intern record not found." }, { status: 404 });
    }

    // Upsert InternAttendance as LEAVE
    const attendance = await prisma.internAttendance.upsert({
      where: {
        internId_date: {
          internId: intern.internId,
          date: targetDate,
        },
      },
      update: {
        status: "LEAVE",
        leaveIntimated: true,
        leaveReason: reason.trim(),
        notes: `Prior leave intimated: ${reason.trim()}`,
      },
      create: {
        internshipId: intern.id,
        internId: intern.internId,
        date: targetDate,
        status: "LEAVE",
        leaveIntimated: true,
        leaveReason: reason.trim(),
        notes: `Prior leave intimated: ${reason.trim()}`,
      },
    });

    // Send email notification to Trainer and HR
    const emailHtml = buildInternLeaveIntimationEmail({
      internName: intern.fullName,
      internId: intern.internId,
      domain: intern.domain,
      trainerName: intern.trainerName || "Assigned Trainer",
      date: targetDate,
      reason: reason.trim(),
    });

    const emailRecipients = ["hr@inzovate-technologies.com"];
    if (intern.trainerEmail) {
      emailRecipients.push(intern.trainerEmail);
    }

    await sendEmail({
      to: emailRecipients.join(", "),
      subject: `[INZOVATE ACADEMY] ℹ️ Prior Leave Intimation: ${intern.fullName} (${intern.internId}) — ${targetDate}`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Leave intimation submitted successfully. Trainer and HR have been notified.",
      attendance,
    });
  } catch (err: any) {
    console.error("Leave intimation error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit leave intimation." }, { status: 500 });
  }
}
