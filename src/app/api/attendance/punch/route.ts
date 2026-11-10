import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { evaluatePunchIn, evaluatePunchOut, getISTTimeParts } from "@/lib/attendance";
import { sendEmail, buildLateAttendanceEmail, buildEarlyDepartureEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Session expired or invalid" }, { status: 401 });
    }

    const body = await req.json();
    const { action, testClockISO, notes, latitude, longitude, accuracy, locationName } = body; // action: 'PUNCH_IN' | 'PUNCH_OUT'

    // Mandatory live location check: Geolocation is strictly required per enterprise policy
    const hasLiveLocation = typeof latitude === "number" && typeof longitude === "number";
    if (!hasLiveLocation && !testClockISO) {
      return NextResponse.json(
        {
          error:
            "Live GPS Location Required: You must enable browser/device location services to record attendance. Inzovate policy requires verified geofence or remote coordinates for all shift punch events.",
          requiresLocation: true,
        },
        { status: 400 }
      );
    }

    // Compute proximity to Inzovate Chennai HQ (13.0827° N, 80.2707° E)
    const HQ_LAT = 13.0827;
    const HQ_LNG = 80.2707;
    let locationTag = "Remote Site (GPS Recorded)";
    let distanceMeters = 0;
    if (hasLiveLocation) {
      const R = 6371e3;
      const φ1 = (latitude * Math.PI) / 180;
      const φ2 = (HQ_LAT * Math.PI) / 180;
      const Δφ = ((HQ_LAT - latitude) * Math.PI) / 180;
      const Δλ = ((HQ_LNG - longitude) * Math.PI) / 180;
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceMeters = Math.round(R * c);
      locationTag =
        distanceMeters <= 800
          ? `Inzovate HQ Geofence Verified (${distanceMeters}m from center)`
          : `Remote / Client Site (${(distanceMeters / 1000).toFixed(1)} km from HQ)`;
    }

    const gpsTelemetryNote = hasLiveLocation
      ? `[GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} ±${Math.round(accuracy || 10)}m | ${locationTag}]`
      : "[QA Simulated Location]";

    // Get current employee
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { userId: session.id },
          { employeeId: session.employeeId || "" },
          { companyEmail: session.email },
        ],
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "No active employee profile associated with this account." },
        { status: 404 }
      );
    }

    // Determine authoritative timestamp (supports test clock for QA verification)
    const authoritativeTime = testClockISO ? new Date(testClockISO) : new Date();
    const ist = getISTTimeParts(authoritativeTime);
    const today = ist.dateString;

    // Check existing record for today
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.employeeId,
          date: today,
        },
      },
    });

    // Check if user is exempt from punching (Director or Founder)
    // Note: Marimuthu N (CMO) is specifically required to punch in/out and is tracked for late in / early out alerts
    const userDes = (employee.designation || "").toLowerCase();
    const userRole = (session.role || "").toLowerCase();
    const isMarimuthu =
      employee.companyEmail === "marimuthu@inzovate-technologies.com" ||
      employee.employeeId === "INZ-EXEC-005";

    const isExempt =
      !isMarimuthu &&
      (userDes.includes("director") ||
        userDes.includes("founder") ||
        userDes.includes("ceo") ||
        (userRole === "super_admin" &&
          (userDes.includes("director") || userDes.includes("admin") || userDes.includes("executive"))));

    if (isExempt) {
      return NextResponse.json(
        {
          error: "Directors and Founders are exempt from attendance punching.",
          isExempt: true,
        },
        { status: 403 }
      );
    }

    // Compute standard daily base rate for penalty calculations (22 working days)
    const dailyGross = employee.grossSalary > 0 ? Math.round(employee.grossSalary / 22) : 1200;

    if (action === "PUNCH_IN") {
      // Prevent duplicate punch-in ONLY if user is already actively clocked in
      if (existing && existing.punchInTime && !existing.punchOutTime) {
        return NextResponse.json(
          {
            error: `Active shift in progress: You already punched in at ${getISTTimeParts(new Date(existing.punchInTime)).timeString} IST. Please punch out first before punching in again.`,
          },
          { status: 400 }
        );
      }

      const isRePunchIn = !!(existing && existing.punchInTime && existing.punchOutTime);
      const punchEval = evaluatePunchIn(authoritativeTime);

      // Automated Salary Deduction Calculation for Late Arrival (> 09:45 AM Cutoff)
      let lateDeductionAmount = 0;
      let lateDeductionReason = "";
      if (punchEval.isLate) {
        if (punchEval.lateMinutes <= 30) {
          lateDeductionAmount = Math.max(250, Math.round(dailyGross * 0.25));
          lateDeductionReason = `Quarter-day LOP penalty (${punchEval.lateMinutes}m late past 09:45 AM)`;
        } else {
          lateDeductionAmount = Math.max(500, Math.round(dailyGross * 0.5));
          lateDeductionReason = `Half-day LOP penalty (${punchEval.lateMinutes}m late past 09:45 AM)`;
        }
      }

      const punchInNoteCombined = [
        notes || punchEval.notes,
        gpsTelemetryNote,
        lateDeductionAmount > 0
          ? `[AI Auto Salary Deduction: ₹${lateDeductionAmount.toLocaleString("en-IN")} (${lateDeductionReason})]`
          : null,
      ]
        .filter(Boolean)
        .join(" | ");

      let record;
      if (isRePunchIn) {
        // Multiple Punch-In: User is starting another work interval today!
        const existingNotes = existing.punchInNotes || "";
        const updatedNotes = `${existingNotes} | [Re-In ${punchEval.timeStringIST} IST] ${gpsTelemetryNote}`;

        record = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            punchInTime: authoritativeTime,
            punchOutTime: null, // Reset punchOutTime so user is actively clocked in again!
            punchInNotes: updatedNotes,
            // Keep existing status if already marked PRESENT
            status: existing.status === "PRESENT" ? "PRESENT" : punchEval.status,
          },
        });
      } else {
        // First punch-in of the day
        record = await prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: employee.employeeId,
              date: today,
            },
          },
          update: {
            punchInTime: authoritativeTime,
            punchOutTime: null,
            status: punchEval.status,
            lateMinutes: punchEval.lateMinutes,
            punchInNotes: punchInNoteCombined,
          },
          create: {
            employeeId: employee.employeeId,
            date: today,
            punchInTime: authoritativeTime,
            status: punchEval.status,
            lateMinutes: punchEval.lateMinutes,
            punchInNotes: punchInNoteCombined,
          },
        });
      }

      // Universal Late Arrival Detection (Shift Start: 09:30 AM IST):
      // WHOEVER punches in late (> 09:30 AM IST or past grace cutoff), an automated alert email is dispatched to hr@inzovate-technologies.com
      const istMinutesFromMidnight = ist.hours * 60 + ist.minutes;
      const shiftStartMinutes = 9 * 60 + 30; // 09:30 AM IST
      const isLateArrival = istMinutesFromMidnight > shiftStartMinutes || punchEval.isLate;
      const lateMinutesCount = Math.max(
        punchEval.lateMinutes,
        istMinutesFromMidnight > shiftStartMinutes ? istMinutesFromMidnight - shiftStartMinutes : 0
      );

      // If late arrival, dispatch automated email and high-priority notifications to HR
      if (isLateArrival) {
        // 1. Send email alert to HR with full employee details, timestamp, delay, and GPS coordinates
        const emailHtml = buildLateAttendanceEmail({
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          department: employee.department,
          date: today,
          scheduledTime: "09:30:00 (09:30 AM IST)",
          actualPunchTime: punchEval.timeStringIST,
          lateMinutes: lateMinutesCount,
          status: punchEval.status === "PRESENT" ? "LATE" : punchEval.status,
          deductionAmount: lateDeductionAmount,
          gpsCoords: hasLiveLocation
            ? {
                latitude,
                longitude,
                accuracy,
                locationName: locationTag,
              }
            : undefined,
        });

        await sendEmail({
          to: "hr@inzovate-technologies.com",
          subject: `[INZOVATE HR ALERT] ⚠️ Late Arrival Notice — ${employee.firstName} ${employee.lastName} (${employee.designation || employee.department}) — (${lateMinutesCount}m late | Punch: ${punchEval.timeStringIST} IST) — ${today}`,
          html: emailHtml,
        });

        // 2. In-app notification to all HR Managers and Super Admins
        const hrPersonnel = await prisma.user.findMany({
          where: { role: { in: ["HR_MANAGER", "SUPER_ADMIN"] } },
        });

        for (const hr of hrPersonnel) {
          await prisma.notification.create({
            data: {
              userId: hr.id,
              title: `⚠️ Late Punch-In Alert: ${employee.firstName} ${employee.lastName}`,
              message: `${employee.firstName} ${employee.lastName} (${employee.department} - ${employee.designation}) punched in late at ${punchEval.timeStringIST} IST (${lateMinutesCount} mins past 09:30 AM shift start). Auto alert dispatched to hr@inzovate-technologies.com. Location: ${locationTag}.`,
              type: "ATTENDANCE",
              link: "/attendance",
            },
          });
        }
      }

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          userEmail: session.email,
          action: isRePunchIn ? "ATTENDANCE_RE_PUNCH_IN" : "ATTENDANCE_PUNCH_IN",
          module: "ATTENDANCE",
          details: `${isRePunchIn ? "Re-punched in" : "Punched in"} at ${punchEval.timeStringIST} IST. Status: ${punchEval.status}. Delay: ${punchEval.lateMinutes}m. Location: ${locationTag}. ${lateDeductionAmount > 0 ? `Auto LOP: ₹${lateDeductionAmount}.` : ""}`,
        },
      });

      return NextResponse.json({
        success: true,
        action: "PUNCH_IN",
        isRePunchIn,
        attendance: record,
        evaluation: punchEval,
        lateDeductionAmount,
        locationTag,
        hrAlertSent: !isRePunchIn && punchEval.isLate,
      });
    } else if (action === "PUNCH_OUT") {
      // Must have an active punch-in (punchInTime set and not already punched out)
      if (!existing || !existing.punchInTime) {
        return NextResponse.json(
          { error: "Cannot punch out: No active punch-in recorded for today." },
          { status: 400 }
        );
      }

      if (existing.punchOutTime) {
        return NextResponse.json(
          {
            error: `You are not currently clocked in. You already punched out at ${getISTTimeParts(new Date(existing.punchOutTime)).timeString} IST. You can punch in again to start a new work interval.`,
          },
          { status: 400 }
        );
      }

      const punchOutEval = evaluatePunchOut(
        new Date(existing.punchInTime),
        authoritativeTime
      );

      // Accumulate worked hours across multiple sessions
      const previousWorkedHours = existing.workedHours || 0;
      const totalAccumulatedHours = Math.round((previousWorkedHours + punchOutEval.workedHours) * 100) / 100;

      const hoursPart = Math.floor(totalAccumulatedHours);
      const minsPart = Math.round((totalAccumulatedHours - hoursPart) * 60);
      const totalDurationFormatted = `${hoursPart}h ${minsPart}m`;

      // Automated Salary Deduction for Early Departure (< 05:00 PM IST)
      let earlyDeductionAmount = 0;
      if (punchOutEval.earlyMinutes > 0) {
        // Standard shift: 450 work minutes
        earlyDeductionAmount = Math.max(
          150,
          Math.round((punchOutEval.earlyMinutes / 450) * dailyGross)
        );
      }

      const sessionNote = `Out at ${punchOutEval.timeStringIST} IST (+${punchOutEval.durationFormatted}, Total: ${totalDurationFormatted}) ${gpsTelemetryNote} ${
        earlyDeductionAmount > 0
          ? `| [AI Auto Early Exit Deduction: ₹${earlyDeductionAmount} (${punchOutEval.earlyMinutes}m early)]`
          : ""
      }`;
      const updatedPunchOutNotes = existing.punchOutNotes
        ? `${existing.punchOutNotes} | ${sessionNote}`
        : sessionNote;

      // Rule: Punch-out before 5:00 PM (17:00 IST) is marked ABSENT
      // UNLESS Super Admin or HR has approved access/override.
      let finalStatus = existing.status;
      if (punchOutEval.earlyMinutes > 0) {
        if (existing.regularizationStatus === "APPROVED") {
          finalStatus = "PRESENT"; // Super Admin / HR override active
        } else {
          finalStatus = "ABSENT"; // Marked ABSENT due to early punch-out before 5:00 PM
        }
      }

      const record = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          punchOutTime: authoritativeTime,
          workedHours: totalAccumulatedHours,
          earlyMinutes: punchOutEval.earlyMinutes,
          status: finalStatus,
          punchOutNotes: notes || updatedPunchOutNotes,
        },
      });

      // Universal Early Punch-Out Detection (Shift End: 17:00 / 05:00 PM IST):
      // WHOEVER punches out early before 05:00 PM, an automated alert email is dispatched to hr@inzovate-technologies.com
      let hrAlertSent = false;
      const istOutMinutesFromMidnight = ist.hours * 60 + ist.minutes;
      const shiftEndMinutes = 17 * 60; // 17:00 IST
      const isEarlyPunchOut = punchOutEval.earlyMinutes > 0 || istOutMinutesFromMidnight < shiftEndMinutes;
      const effectiveEarlyMinutes = Math.max(
        punchOutEval.earlyMinutes,
        istOutMinutesFromMidnight < shiftEndMinutes ? shiftEndMinutes - istOutMinutesFromMidnight : 0
      );

      if (isEarlyPunchOut) {
        hrAlertSent = true;
        const isDual = (existing.lateMinutes || 0) > 0;

        // 1. Send email alert to HR with full employee details, early departure duration, and GPS coordinates
        const earlyEmailHtml = buildEarlyDepartureEmail({
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          department: employee.department,
          date: today,
          scheduledEndTime: "17:00:00 (05:00 PM IST)",
          actualPunchOutTime: punchOutEval.timeStringIST,
          earlyMinutes: effectiveEarlyMinutes,
          lateMinutes: existing.lateMinutes || 0,
          markedStatus: finalStatus,
          workedHours: punchOutEval.workedHours,
          durationFormatted: punchOutEval.durationFormatted,
          deductionAmount: earlyDeductionAmount,
          gpsCoords: hasLiveLocation
            ? {
                latitude,
                longitude,
                accuracy,
                locationName: locationTag,
              }
            : undefined,
        });

        const subjectLine = isDual
          ? `[INZOVATE HR ALERT] ⚠️ Dual Shift Violation (Late In & Early Out) — ${employee.firstName} ${employee.lastName} (${employee.designation || employee.department}) — (${effectiveEarlyMinutes}m early | Status: ${finalStatus}) — ${today}`
          : `[INZOVATE HR ALERT] ⚠️ Early Punch-Out Notice (Before 05:00 PM) — ${employee.firstName} ${employee.lastName} (${employee.designation || employee.department}) — (${effectiveEarlyMinutes}m early | Punch: ${punchOutEval.timeStringIST} IST) — ${today}`;

        await sendEmail({
          to: "hr@inzovate-technologies.com",
          subject: subjectLine,
          html: earlyEmailHtml,
        });

        // 2. In-app notification to all HR Managers and Super Admins
        const hrPersonnel = await prisma.user.findMany({
          where: { role: { in: ["HR_MANAGER", "SUPER_ADMIN"] } },
        });

        for (const hr of hrPersonnel) {
          await prisma.notification.create({
            data: {
              userId: hr.id,
              title: isDual
                ? `⚠️ Dual Violation: ${employee.firstName} ${employee.lastName}`
                : `⚠️ Early Punch-Out Alert: ${employee.firstName} ${employee.lastName}`,
              message: isDual
                ? `${employee.firstName} ${employee.lastName} (${employee.department} - ${employee.designation}) punched in late (${existing.lateMinutes}m) AND punched out early at ${punchOutEval.timeStringIST} IST (${effectiveEarlyMinutes}m before 5 PM). Marked ${finalStatus}. Auto alert dispatched to hr@inzovate-technologies.com.`
                : `${employee.firstName} ${employee.lastName} (${employee.department} - ${employee.designation}) punched out early at ${punchOutEval.timeStringIST} IST (${effectiveEarlyMinutes} mins before 05:00 PM shift end). Status: ${finalStatus}. Auto alert dispatched to hr@inzovate-technologies.com. Location: ${locationTag}.`,
              type: "ATTENDANCE",
              link: "/attendance",
            },
          });
        }
      }

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          userEmail: session.email,
          action: "ATTENDANCE_PUNCH_OUT",
          module: "ATTENDANCE",
          details: `Punched out at ${punchOutEval.timeStringIST} IST. Worked: ${punchOutEval.durationFormatted}. Early: ${punchOutEval.earlyMinutes}m. Location: ${locationTag}. ${earlyDeductionAmount > 0 ? `Auto LOP: ₹${earlyDeductionAmount}.` : ""} ${hrAlertSent ? "Alert sent to HR." : ""}`,
        },
      });

      return NextResponse.json({
        success: true,
        action: "PUNCH_OUT",
        attendance: record,
        evaluation: {
          ...punchOutEval,
          workedHours: totalAccumulatedHours,
          durationFormatted: totalDurationFormatted,
        },
        earlyDeductionAmount,
        locationTag,
        hrAlertSent,
      });
    }

    return NextResponse.json({ error: "Invalid action. Use PUNCH_IN or PUNCH_OUT." }, { status: 400 });
  } catch (err: any) {
    console.error("Punch error:", err);
    return NextResponse.json({ error: "Failed to record punch event." }, { status: 500 });
  }
}
