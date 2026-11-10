import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getISTTimeParts, isWeekendDay } from "@/lib/attendance";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Morning Attendance & Schedule Governance Audit:
 * 1. Checks all active interns and their allocated permanent employee trainers.
 * 2. If trainer hasn't scheduled/updated morning attendance by cutoff:
 *    - Sends HR intimation email to Trainer.
 *    - Sends escalation email to Founder.
 *    - Creates in-app alert for HR and Founder.
 * 3. If class is scheduled and intern hasn't punched in:
 *    - Sends reminder email from HR to intern candidate.
 */
export async function runMorningInternshipAudit(options?: { force?: boolean }) {
  const istNow = getISTTimeParts();
  const today = istNow.dateString;
  const isWeekend = isWeekendDay(today);

  if (isWeekend && !options?.force) {
    return {
      success: true,
      message: "Weekend (Saturday/Sunday): Week-Off in force. No morning audit required.",
      auditedCount: 0,
    };
  }

  // Fetch active interns
  const activeInterns = await prisma.internship.findMany({
    where: { status: "ACTIVE" },
    include: {
      schedules: {
        where: { date: today },
      },
      attendances: {
        where: { date: today },
      },
    },
  });

  const trainerAlertsSent: any[] = [];
  const internRemindersSent: any[] = [];
  const founderEscalationsSent: any[] = [];

  for (const intern of activeInterns) {
    const todaySchedule = intern.schedules[0];
    const todayAttendance = intern.attendances[0];

    // CASE 1: Trainer has not scheduled / updated attendance for today
    const hasSchedule = todaySchedule && todaySchedule.startTime && todaySchedule.status === "SCHEDULED";
    const hasAttendanceMarked = todayAttendance && todayAttendance.status !== "ABSENT";

    if (!hasSchedule && !hasAttendanceMarked) {
      const trainerEmail = intern.trainerEmail;
      const trainerName = intern.trainerName || intern.mentor || "Assigned Trainer";

      // 1. Email to Mentor / Trainer from HR
      if (trainerEmail) {
        const trainerHtml = `
          <div style="font-family: Arial, sans-serif; background: #07152E; color: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #F59E0B;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <span style="font-size: 24px; margin-right: 8px;">⚠️</span>
              <h2 style="color: #F59E0B; margin: 0;">INZOVATE HR NOTICE — Morning Intern Schedule & Attendance Missing</h2>
            </div>
            <p>Dear <strong>${trainerName}</strong>,</p>
            <p>This is an automated intimation from <strong>Inzovate Human Resources</strong>. You have not allocated or updated today's class schedule / morning attendance for your assigned intern candidate:</p>
            <div style="background: rgba(245,158,11,0.1); border-left: 4px solid #F59E0B; padding: 14px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Intern:</strong> ${intern.fullName} (<code>${intern.internId}</code>)</p>
              <p style="margin: 4px 0;"><strong>Domain:</strong> ${intern.domain}</p>
              <p style="margin: 4px 0;"><strong>College:</strong> ${intern.college}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${today}</p>
            </div>
            <p style="font-weight: bold; color: #FCD34D;">
              Policy Mandate: Trainers must provide their daily class timing intimation between 10:00 AM – 11:00 AM IST and verify punch-in/out records every morning.
            </p>
            <p style="font-size: 13px; color: #94A3B8;">
              Please log in to the <a href="http://localhost:3000/internship" style="color: #28C5F6;">Inzovate HRMS Portal</a> immediately to update the schedule.
            </p>
          </div>
        `;

        await sendEmail({
          to: trainerEmail,
          subject: `[INZOVATE HR ALERT] ⚠️ Action Required: Update Morning Intern Schedule for ${intern.fullName} (${today})`,
          html: trainerHtml,
        }).catch((e) => console.warn("Trainer email dispatch error:", e));

        trainerAlertsSent.push({ internId: intern.internId, trainerEmail });
      }

      // 2. Escalation Email to Founder
      const founderHtml = `
        <div style="font-family: Arial, sans-serif; background: #07152E; color: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #EF4444;">
          <h2 style="color: #EF4444; margin-top: 0;">INZOVATE EXECUTIVE ESCALATION — Trainer Attendance Missing</h2>
          <p>Dear Founder & Executive Board,</p>
          <p>The morning governance check has detected an unfulfilled scheduling obligation:</p>
          <div style="background: rgba(239,68,68,0.1); border-left: 4px solid #EF4444; padding: 14px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Trainer (Permanent Employee):</strong> ${trainerName} (${intern.trainerId || "N/A"})</p>
            <p style="margin: 4px 0;"><strong>Intern:</strong> ${intern.fullName} (<code>${intern.internId}</code>)</p>
            <p style="margin: 4px 0;"><strong>Domain:</strong> ${intern.domain}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> Morning class timing intimation has not been submitted within the mandatory 10:00 AM – 11:00 AM IST window (Current: ${istNow.timeString} IST).</p>
          </div>
          <p style="color: #94A3B8; font-size: 13px;">An intimation warning has been delivered to the trainer's email.</p>
        </div>
      `;

      await sendEmail({
        to: "founder@inzovate-technologies.com",
        subject: `[INZOVATE ESCALATION] 🚨 Trainer ${trainerName} has not scheduled morning attendance for ${intern.fullName} (${today})`,
        html: founderHtml,
      }).catch((e) => console.warn("Founder escalation email error:", e));

      founderEscalationsSent.push({ internId: intern.internId, trainerName });

      // 3. In-App Notification to HR & Super Admin users
      const leadershipUsers = await prisma.user.findMany({
        where: {
          OR: [
            { role: "SUPER_ADMIN" },
            { role: "HR_MANAGER" },
            { email: "founder@inzovate-technologies.com" },
            { email: "hr@inzovate-technologies.com" },
          ],
        },
        select: { id: true },
      });

      for (const u of leadershipUsers) {
        await prisma.notification.create({
          data: {
            userId: u.id,
            title: `HR Alert: Trainer ${trainerName} missing morning update`,
            message: `Trainer has not set schedule/marked attendance for intern ${intern.fullName} today (${today}).`,
            type: "INTERNSHIP",
            link: "/internship",
          },
        }).catch(() => {});
      }
    }

    // CASE 2: Class is scheduled, but intern hasn't punched in by the start time
    if (hasSchedule && (!todayAttendance || !todayAttendance.punchInTime)) {
      const [startH, startM] = (todaySchedule.startTime || "10:00").split(":").map(Number);
      const scheduleMinuteOfDay = startH * 60 + startM;
      const currentMinuteOfDay = istNow.hours * 60 + istNow.minutes;

      // If scheduled time has arrived or passed
      if (options?.force || currentMinuteOfDay >= scheduleMinuteOfDay) {
        const internReminderHtml = `
          <div style="font-family: Arial, sans-serif; background: #07152E; color: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #38BDF8;">
            <h2 style="color: #38BDF8; margin-top: 0;">INZOVATE ACADEMY — Punch-In Reminder</h2>
            <p>Hello <strong>${intern.fullName}</strong>,</p>
            <p>Your scheduled training session with <strong>${intern.trainerName || intern.mentor || "your Trainer"}</strong> was scheduled for <strong>${todaySchedule.startTime} IST</strong>.</p>
            <div style="background: rgba(56,189,248,0.1); border-left: 4px solid #38BDF8; padding: 14px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Date:</strong> ${today}</p>
              <p style="margin: 4px 0;"><strong>Scheduled Time:</strong> ${todaySchedule.startTime} – ${todaySchedule.endTime || "TBD"} IST</p>
              <p style="margin: 4px 0;"><strong>Topic:</strong> ${todaySchedule.topic || intern.domain}</p>
            </div>
            <p style="font-weight: bold; color: #7DD3FC;">
              Please log in to the HRMS portal and record your punch-in immediately to maintain your attendance streak.
            </p>
          </div>
        `;

        await sendEmail({
          to: intern.personalEmail,
          subject: `[INZOVATE HR REMINDER] ⏰ Training Session Started — Punch-in Required (${today})`,
          html: internReminderHtml,
        }).catch((e) => console.warn("Intern punch reminder error:", e));

        internRemindersSent.push({ internId: intern.internId, email: intern.personalEmail });
      }
    }
  }

  return {
    success: true,
    today,
    activeInternsCount: activeInterns.length,
    trainerAlertsSentCount: trainerAlertsSent.length,
    trainerAlertsSent,
    founderEscalationsSentCount: founderEscalationsSent.length,
    founderEscalationsSent,
    internRemindersSentCount: internRemindersSent.length,
    internRemindersSent,
  };
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const auditResult = await runMorningInternshipAudit({ force });
    return NextResponse.json(auditResult);
  } catch (err: any) {
    console.error("Morning audit GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to execute morning audit." }, { status: 500 });
  }
}

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
    const force = body.force !== false; // manual trigger forces check

    const auditResult = await runMorningInternshipAudit({ force });
    return NextResponse.json(auditResult);
  } catch (err: any) {
    console.error("Morning audit POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to execute morning audit." }, { status: 500 });
  }
}
