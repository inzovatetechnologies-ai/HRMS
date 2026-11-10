import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getISTTimeParts, isWeekendDay } from "@/lib/attendance";
import { sendEmail, buildIntern3WayAbsentEmail } from "@/lib/email";

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
    const istNow = getISTTimeParts();
    const date = body.date || istNow.dateString;

    if (isWeekendDay(date) && !body.forceOnWeekend) {
      return NextResponse.json({
        success: true,
        message: "Weekend: Saturday and Sunday are Week-Offs. No intern absence checks required.",
      });
    }

    // Fetch all active interns
    const activeInterns = await prisma.internship.findMany({
      where: { status: "ACTIVE" },
      include: {
        schedules: { where: { date } },
        attendances: { where: { date } },
      },
    });

    const absentAlerts: any[] = [];

    for (const intern of activeInterns) {
      const att = intern.attendances[0];
      const sched = intern.schedules[0];

      // If already attended or leave was intimated, skip
      if (att?.punchInTime || att?.leaveIntimated || att?.status === "LEAVE") {
        continue;
      }

      // If alert was already sent today, skip
      if (att?.threeWayAlertSent) {
        continue;
      }

      // Mark as ABSENT
      await prisma.internAttendance.upsert({
        where: {
          internId_date: {
            internId: intern.internId,
            date,
          },
        },
        update: {
          status: "ABSENT",
          threeWayAlertSent: true,
          notes: "Automated Absent: Did not attend scheduled training session. Missed classes will not be repeated.",
        },
        create: {
          internshipId: intern.id,
          internId: intern.internId,
          date,
          status: "ABSENT",
          threeWayAlertSent: true,
          notes: "Automated Absent: Did not attend scheduled training session. Missed classes will not be repeated.",
        },
      });

      // 3-Way Email Alert Dispatch
      // 1. Intern Email
      // 2. Trainer Email
      // 3. HR Email
      const emailHtml = buildIntern3WayAbsentEmail({
        internName: intern.fullName,
        internId: intern.internId,
        domain: intern.domain,
        trainerName: intern.trainerName || intern.mentor || "Assigned Trainer",
        date,
        scheduledTime: sched?.startTime && sched?.endTime ? `${sched.startTime} – ${sched.endTime} IST` : undefined,
      });

      const recipients = [intern.personalEmail, "hr@inzovate-technologies.com"];
      if (intern.trainerEmail) {
        recipients.push(intern.trainerEmail);
      }

      await sendEmail({
        to: recipients.join(", "),
        subject: `[INZOVATE ACADEMY] ⚠️ Mandatory Absence Notice — ${intern.fullName} (${intern.internId}) Missed Scheduled Class — ${date}`,
        html: emailHtml,
      });

      absentAlerts.push({
        internId: intern.internId,
        internName: intern.fullName,
        trainerEmail: intern.trainerEmail,
        studentEmail: intern.personalEmail,
      });
    }

    return NextResponse.json({
      success: true,
      date,
      absentAlertsCount: absentAlerts.length,
      absentAlerts,
    });
  } catch (err: any) {
    console.error("Intern absentee check error:", err);
    return NextResponse.json({ error: err.message || "Failed to execute intern absentee check." }, { status: 500 });
  }
}
