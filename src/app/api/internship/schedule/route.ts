import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getISTTimeParts, isWeekendDay } from "@/lib/attendance";
import { sendEmail, buildTrainerScheduleReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

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
    const date = searchParams.get("date") || getISTTimeParts().dateString;
    const internId = searchParams.get("internId");

    const where: any = { date };
    if (internId) {
      where.internId = internId;
    }

    const schedules = await prisma.internDailySchedule.findMany({
      where,
      include: {
        internship: {
          select: {
            id: true,
            internId: true,
            fullName: true,
            personalEmail: true,
            domain: true,
            trainerId: true,
            trainerName: true,
            trainerEmail: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      date,
      isWeekend: isWeekendDay(date),
      schedules,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch class schedules." }, { status: 500 });
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

    const body = await req.json();

    // Handler for automated reminder dispatch
    if (body.action === "REMIND_TRAINERS") {
      const istNow = getISTTimeParts();
      const today = istNow.dateString;

      if (isWeekendDay(today)) {
        return NextResponse.json({
          success: true,
          message: "Weekend: Saturday and Sunday are Week-Offs. No trainer schedule reminders required.",
        });
      }

      const activeInterns = await prisma.internship.findMany({
        where: {
          status: "ACTIVE",
          trainerEmail: { not: null },
        },
        include: {
          schedules: {
            where: { date: today },
          },
        },
      });

      const remindersDispatched: any[] = [];

      for (const intern of activeInterns) {
        const todaySchedule = intern.schedules[0];
        // If not scheduled or pending
        if (!todaySchedule || !todaySchedule.startTime) {
          if (!todaySchedule?.reminderSent && intern.trainerEmail) {
            const reminderHtml = buildTrainerScheduleReminderEmail({
              trainerName: intern.trainerName || "Trainer",
              internName: intern.fullName,
              internId: intern.internId,
              domain: intern.domain,
              date: today,
            });

            await sendEmail({
              to: intern.trainerEmail,
              subject: `[INZOVATE ACADEMY] ⏰ Action Required: Allocate Today's Class Timing for ${intern.fullName} (${intern.domain})`,
              html: reminderHtml,
            });

            // Upsert schedule entry with reminderSent = true
            await prisma.internDailySchedule.upsert({
              where: {
                internId_date: {
                  internId: intern.internId,
                  date: today,
                },
              },
              update: {
                reminderSent: true,
                reminderSentAt: new Date(),
              },
              create: {
                internshipId: intern.id,
                internId: intern.internId,
                trainerId: intern.trainerId,
                trainerEmail: intern.trainerEmail,
                date: today,
                status: "PENDING",
                reminderSent: true,
                reminderSentAt: new Date(),
              },
            });

            remindersDispatched.push({
              internId: intern.internId,
              internName: intern.fullName,
              trainerEmail: intern.trainerEmail,
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        remindersDispatchedCount: remindersDispatched.length,
        remindersDispatched,
      });
    }

    // Standard schedule creation / update
    const { internId, date, startTime, endTime, topic, meetingLink } = body;
    const targetDate = date || getISTTimeParts().dateString;

    if (!internId || !startTime || !endTime) {
      return NextResponse.json({ error: "internId, startTime and endTime are required." }, { status: 400 });
    }

    // Validate 12-hour window: 09:00 to 20:00 (08:00 PM)
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    if (startH < 9 || (startH === 20 && startM > 0) || startH > 20) {
      return NextResponse.json(
        { error: "Class start time must be between 09:00 AM and 08:00 PM (12-hour permissible window)." },
        { status: 400 }
      );
    }

    if (endH < 9 || (endH === 20 && endM > 0) || endH > 20) {
      return NextResponse.json(
        { error: "Class end time must be within the 09:00 AM to 08:00 PM permissible window." },
        { status: 400 }
      );
    }

    if (startH * 60 + startM >= endH * 60 + endM) {
      return NextResponse.json({ error: "Class end time must be after start time." }, { status: 400 });
    }

    const intern = await prisma.internship.findFirst({
      where: { OR: [{ id: internId }, { internId }] },
    });

    if (!intern) {
      return NextResponse.json({ error: `Intern ${internId} not found.` }, { status: 404 });
    }

    const schedule = await prisma.internDailySchedule.upsert({
      where: {
        internId_date: {
          internId: intern.internId,
          date: targetDate,
        },
      },
      update: {
        startTime,
        endTime,
        topic: topic || `${intern.domain} Practical Training`,
        status: "SCHEDULED",
        trainerId: intern.trainerId,
        trainerEmail: intern.trainerEmail,
        allocatedAt: new Date(),
      },
      create: {
        internshipId: intern.id,
        internId: intern.internId,
        trainerId: intern.trainerId,
        trainerEmail: intern.trainerEmail,
        date: targetDate,
        startTime,
        endTime,
        topic: topic || `${intern.domain} Practical Training`,
        status: "SCHEDULED",
        allocatedAt: new Date(),
      },
    });

    // Notify Intern by Email
    try {
      const internNotificationHtml = `
        <div style="font-family: Arial, sans-serif; background: #07152E; color: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #28C5F6;">
          <h2 style="color: #28C5F6; margin-top: 0;">INZOVATE ACADEMY — Class Scheduled</h2>
          <p>Hello <strong>${intern.fullName}</strong>,</p>
          <p>Your trainer <strong>${intern.trainerName || "Assigned Trainer"}</strong> has scheduled today's training session:</p>
          <div style="background: rgba(40,197,246,0.1); padding: 14px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Date:</strong> ${targetDate}</p>
            <p style="margin: 4px 0;"><strong>Session Timing:</strong> <span style="font-size: 16px; color: #28C5F6; font-weight: bold;">${startTime} – ${endTime} IST</span></p>
            <p style="margin: 4px 0;"><strong>Topic:</strong> ${topic || intern.domain}</p>
            <p style="margin: 4px 0;"><strong>Trainer:</strong> ${intern.trainerName || intern.mentor}</p>
          </div>
          <p style="color: #94A3B8; font-size: 13px;">
            Please ensure you punch in on time at the scheduled start time. 
            <em>Remember: Upon class completion, you must provide feedback on what you learned today in order to punch out.</em>
          </p>
        </div>
      `;

      // 1. Notify Intern by Email
      await sendEmail({
        to: intern.personalEmail,
        subject: `[INZOVATE ACADEMY] 📅 Class Scheduled: ${startTime} - ${endTime} IST (${targetDate})`,
        html: internNotificationHtml,
      });

      // 2. Broadcast to HR & Founder
      const broadcastHtml = `
        <div style="font-family: Arial, sans-serif; background: #07152E; color: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #28C5F6;">
          <h2 style="color: #28C5F6; margin-top: 0;">INZOVATE ACADEMY — Daily Class Schedule Broadcast</h2>
          <p>A new class session has been scheduled and broadcasted:</p>
          <div style="background: rgba(40,197,246,0.1); padding: 14px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Intern:</strong> ${intern.fullName} (<code>${intern.internId}</code>)</p>
            <p style="margin: 4px 0;"><strong>Domain:</strong> ${intern.domain}</p>
            <p style="margin: 4px 0;"><strong>Trainer / Mentor:</strong> ${intern.trainerName || intern.mentor || "Assigned Trainer"}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${targetDate}</p>
            <p style="margin: 4px 0;"><strong>Class Timing:</strong> <span style="font-size: 15px; color: #28C5F6; font-weight: bold;">${startTime} – ${endTime} IST</span></p>
            <p style="margin: 4px 0;"><strong>Topic:</strong> ${topic || intern.domain}</p>
          </div>
          <p style="color: #94A3B8; font-size: 13px;">Automated broadcast to Founder & HR Operations.</p>
        </div>
      `;

      await sendEmail({
        to: "hr@inzovate-technologies.com",
        subject: `[INZOVATE ACADEMY] 📅 Class Broadcast: ${intern.fullName} (${startTime} - ${endTime} IST)`,
        html: broadcastHtml,
      }).catch(() => {});

      await sendEmail({
        to: "founder@inzovate-technologies.com",
        subject: `[INZOVATE ACADEMY] 📅 Class Broadcast: ${intern.fullName} (${startTime} - ${endTime} IST)`,
        html: broadcastHtml,
      }).catch(() => {});

      // In-app Notification for Founder and HR users
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
            title: `Class Scheduled: ${intern.fullName}`,
            message: `${intern.trainerName || "Trainer"} scheduled class today (${startTime} - ${endTime} IST): ${topic || intern.domain}`,
            type: "INTERNSHIP",
            link: "/internship",
          },
        }).catch(() => {});
      }
    } catch (notifErr) {
      console.warn("Intern class schedule email notice:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: `Class schedule for ${intern.fullName} saved (${startTime} - ${endTime} IST).`,
      schedule,
    });
  } catch (err: any) {
    console.error("Schedule error:", err);
    return NextResponse.json({ error: err.message || "Failed to save class schedule." }, { status: 500 });
  }
}
