import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getISTTimeParts, isWeekendDay } from "@/lib/attendance";

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
    const internId = searchParams.get("internId");
    const rawDate = searchParams.get("date");
    const all = searchParams.get("all") === "true" || rawDate === "ALL";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (internId && internId !== "ALL") where.internId = internId;

    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    } else if (!all && rawDate && rawDate !== "ALL") {
      where.date = rawDate;
    } else if (!all && !rawDate && !internId) {
      // Default to today only if no internId and no date parameter is passed
      where.date = getISTTimeParts().dateString;
    }

    const attendances = await prisma.internAttendance.findMany({
      where,
      include: {
        internship: {
          select: {
            id: true,
            internId: true,
            fullName: true,
            personalEmail: true,
            domain: true,
            trainerName: true,
            college: true,
            startDate: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    const presentCount = attendances.filter((a) => a.status === "PRESENT").length;
    const absentCount = attendances.filter((a) => a.status === "ABSENT").length;
    const leaveCount = attendances.filter((a) => a.status === "LEAVE").length;
    const totalHours = attendances.reduce((acc, a) => acc + (a.workedHours || 0), 0);

    return NextResponse.json({
      success: true,
      totalCount: attendances.length,
      summary: {
        presentCount,
        absentCount,
        leaveCount,
        totalHours: Math.round(totalHours * 10) / 10,
      },
      attendances,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch intern attendance." }, { status: 500 });
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
    const { action, internId, internFeedback, trainerFeedback, notes, testClockISO } = body; // action: 'PUNCH_IN' | 'PUNCH_OUT' | 'SUBMIT_TRAINER_FEEDBACK'

    // Find intern record
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
      return NextResponse.json({ error: "Intern profile not found." }, { status: 404 });
    }

    const authoritativeTime = testClockISO ? new Date(testClockISO) : new Date();
    const ist = getISTTimeParts(authoritativeTime);
    const today = ist.dateString;

    if (action === "TRAINER_UPDATE_ATTENDANCE") {
      const { punchInStr, punchOutStr, status, workedHours: customHours, date: targetDateInput } = body;
      const targetDate = targetDateInput || today;

      let pIn: Date | null = null;
      let pOut: Date | null = null;
      if (punchInStr) {
        pIn = new Date(`${targetDate}T${punchInStr}:00+05:30`);
      }
      if (punchOutStr) {
        pOut = new Date(`${targetDate}T${punchOutStr}:00+05:30`);
      }

      let computedWorkedHours = Number(customHours) || 0;
      if (!computedWorkedHours && pIn && pOut) {
        const diffMs = pOut.getTime() - pIn.getTime();
        computedWorkedHours = Math.max(0.5, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
      }

      const updateData: any = {
        status: status || "PRESENT",
      };
      if (pIn) updateData.punchInTime = pIn;
      if (pOut) updateData.punchOutTime = pOut;
      if (computedWorkedHours) updateData.workedHours = computedWorkedHours;
      if (trainerFeedback) updateData.trainerFeedback = trainerFeedback.trim();
      if (internFeedback) updateData.internFeedback = internFeedback.trim();
      if (notes) updateData.notes = notes;

      const record = await prisma.internAttendance.upsert({
        where: {
          internId_date: {
            internId: intern.internId,
            date: targetDate,
          },
        },
        update: updateData,
        create: {
          internshipId: intern.id,
          internId: intern.internId,
          date: targetDate,
          punchInTime: pIn || authoritativeTime,
          punchOutTime: pOut,
          workedHours: computedWorkedHours,
          status: status || "PRESENT",
          trainerFeedback: trainerFeedback ? trainerFeedback.trim() : null,
          internFeedback: internFeedback ? internFeedback.trim() : null,
          notes: notes || `Marked by Mentor (${session.email})`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Attendance & timing for ${intern.fullName} successfully updated by Mentor.`,
        attendance: record,
      });
    }

    if (action === "SUBMIT_TRAINER_FEEDBACK") {
      // Trainer submitting topics taught today
      if (!trainerFeedback || !trainerFeedback.trim()) {
        return NextResponse.json({ error: "Please enter what you taught the student today." }, { status: 400 });
      }

      const updated = await prisma.internAttendance.upsert({
        where: {
          internId_date: {
            internId: intern.internId,
            date: today,
          },
        },
        update: {
          trainerFeedback: trainerFeedback.trim(),
        },
        create: {
          internshipId: intern.id,
          internId: intern.internId,
          date: today,
          status: "PRESENT",
          trainerFeedback: trainerFeedback.trim(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Trainer teaching feedback recorded successfully.",
        attendance: updated,
      });
    }

    if (action === "PUNCH_IN") {
      const record = await prisma.internAttendance.upsert({
        where: {
          internId_date: {
            internId: intern.internId,
            date: today,
          },
        },
        update: {
          punchInTime: authoritativeTime,
          status: "PRESENT",
          notes: notes || `Class started at ${ist.timeString} IST`,
        },
        create: {
          internshipId: intern.id,
          internId: intern.internId,
          date: today,
          punchInTime: authoritativeTime,
          status: "PRESENT",
          notes: notes || `Class started at ${ist.timeString} IST`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Punch-in recorded at ${ist.timeString} IST. Remember to submit learning feedback upon completion!`,
        attendance: record,
      });
    }

    if (action === "PUNCH_OUT") {
      // MANDATORY REQUIREMENT:
      // Intern MUST submit what they learned today in order to punch out!
      if (!internFeedback || !internFeedback.trim()) {
        return NextResponse.json(
          {
            error:
              "Mandatory Learning Feedback Required: You must enter what you learned in today's session before punching out.",
            requiresFeedback: true,
          },
          { status: 400 }
        );
      }

      const existing = await prisma.internAttendance.findUnique({
        where: {
          internId_date: {
            internId: intern.internId,
            date: today,
          },
        },
      });

      if (!existing || !existing.punchInTime) {
        return NextResponse.json(
          { error: "Cannot punch out: No punch-in record found for today's session." },
          { status: 400 }
        );
      }

      const diffMs = authoritativeTime.getTime() - new Date(existing.punchInTime).getTime();
      const workedHours = Math.max(0.5, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);

      const record = await prisma.internAttendance.update({
        where: { id: existing.id },
        data: {
          punchOutTime: authoritativeTime,
          workedHours,
          internFeedback: internFeedback.trim(),
          trainerFeedback: trainerFeedback ? trainerFeedback.trim() : existing.trainerFeedback,
          status: "PRESENT",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Punch-out successful! Learning feedback recorded. Total session duration: ${workedHours} hours.`,
        attendance: record,
      });
    }

    return NextResponse.json({ error: "Invalid action. Permitted: PUNCH_IN, PUNCH_OUT, SUBMIT_TRAINER_FEEDBACK" }, { status: 400 });
  } catch (err: any) {
    console.error("Intern attendance error:", err);
    return NextResponse.json({ error: err.message || "Failed to process intern attendance." }, { status: 500 });
  }
}
