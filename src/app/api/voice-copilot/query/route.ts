import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { resolveVoiceIntent } from "@/lib/voice";
import { getISTTimeParts, evaluatePunchIn, evaluatePunchOut } from "@/lib/attendance";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const { transcript = "", language = "ta-IN" } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "Voice transcript is empty." }, { status: 400 });
    }

    const resolution = resolveVoiceIntent(transcript, language);
    const isTamil = resolution.language.startsWith("ta");

    let liveDataSummary: any = null;
    let enrichedResponse = resolution.spokenResponse;
    let actionExecuted: any = null;

    // Handle Direct Voice Action: Punch In
    if (resolution.intent === "PUNCH_IN") {
      const employee = await prisma.employee.findFirst({
        where: {
          OR: [
            { userId: session.id },
            { employeeId: session.employeeId || "" },
            { companyEmail: session.email },
          ],
        },
      });

      if (employee) {
        const ist = getISTTimeParts();
        const today = ist.dateString;
        const authoritativeTime = new Date();

        const existing = await prisma.attendance.findUnique({
          where: {
            employeeId_date: {
              employeeId: employee.employeeId,
              date: today,
            },
          },
        });

        const userDes = (employee.designation || "").toLowerCase();
        const userRole = (session.role || "").toLowerCase();
        const isExempt =
          userDes.includes("director") ||
          userDes.includes("founder") ||
          userDes.includes("ceo") ||
          (userRole === "super_admin" && (userDes.includes("director") || userDes.includes("admin") || userDes.includes("executive")));

        if (isExempt) {
          enrichedResponse = isTamil
            ? "நீங்கள் இயக்குநர்/நிறுவனர் பிரிவில் இருப்பதால் வருகை பதிவு செய்ய தேவையில்லை."
            : "As an Executive Director/Founder, you are exempt from attendance punching.";
          actionExecuted = { status: "EXEMPT" };
        } else if (existing && existing.punchInTime && !existing.punchOutTime) {
          enrichedResponse = isTamil
            ? `நீங்கள் ஏற்கனவே பணி நேரத்தில் உள்ளீர்கள் (${getISTTimeParts(new Date(existing.punchInTime)).timeString} IST). பணி இடைவேளைக்கு 'Punch Out' சொல்லவும்.`
            : `You are currently clocked in since ${getISTTimeParts(new Date(existing.punchInTime)).timeString} IST. Say 'Punch Out' to end this interval.`;
          actionExecuted = { status: "ALREADY_PUNCHED", record: existing };
        } else {
          const isRePunchIn = !!(existing && existing.punchInTime && existing.punchOutTime);
          const punchEval = evaluatePunchIn(authoritativeTime);

          let record;
          if (isRePunchIn) {
            record = await prisma.attendance.update({
              where: { id: existing.id },
              data: {
                punchInTime: authoritativeTime,
                punchOutTime: null,
                punchInNotes: `${existing.punchInNotes || ""} | [Voice Re-In ${punchEval.timeStringIST} IST]`,
              },
            });
          } else {
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
                punchInNotes: "Punched via Voice AI Copilot",
              },
              create: {
                employeeId: employee.employeeId,
                date: today,
                punchInTime: authoritativeTime,
                status: punchEval.status,
                lateMinutes: punchEval.lateMinutes,
                punchInNotes: "Punched via Voice AI Copilot",
              },
            });
          }

          enrichedResponse = isTamil
            ? `வருகை பதிவு வெற்றிகரமாக முடிந்தது! நேரம்: ${punchEval.timeStringIST} IST.`
            : `Punch in successful at ${punchEval.timeStringIST} IST! You are now on shift.`;
          actionExecuted = { status: "PUNCHED_IN", record };
        }
      }
    }

    // Handle Direct Voice Action: Punch Out
    if (resolution.intent === "PUNCH_OUT") {
      const employee = await prisma.employee.findFirst({
        where: {
          OR: [
            { userId: session.id },
            { employeeId: session.employeeId || "" },
            { companyEmail: session.email },
          ],
        },
      });

      if (employee) {
        const ist = getISTTimeParts();
        const today = ist.dateString;
        const authoritativeTime = new Date();

        const userDes = (employee.designation || "").toLowerCase();
        const userRole = (session.role || "").toLowerCase();
        const isExempt =
          userDes.includes("director") ||
          userDes.includes("founder") ||
          userDes.includes("ceo") ||
          (userRole === "super_admin" && (userDes.includes("director") || userDes.includes("admin") || userDes.includes("executive")));

        if (isExempt) {
          enrichedResponse = isTamil
            ? "நீங்கள் இயக்குநர்/நிறுவனர் பிரிவில் இருப்பதால் வருகை பதிவு செய்ய தேவையில்லை."
            : "As an Executive Director/Founder, you are exempt from attendance punching.";
          actionExecuted = { status: "EXEMPT" };
        } else {
          const existing = await prisma.attendance.findUnique({
            where: {
              employeeId_date: {
                employeeId: employee.employeeId,
                date: today,
              },
            },
          });

          if (!existing || !existing.punchInTime) {
            enrichedResponse = isTamil
              ? "நீங்கள் இன்னும் இன்று வருகை பதிவு செய்யவில்லை."
              : "You have not punched in yet today.";
            actionExecuted = { status: "NOT_PUNCHED_IN" };
          } else if (existing.punchOutTime) {
            enrichedResponse = isTamil
              ? `நீங்கள் இப்போது பணி இடைவேளையில் உள்ளீர்கள் (மொத்தம்: ${existing.workedHours} மணி நேரம்). மீண்டும் பணி தொடங்க 'Punch In' சொல்லவும்.`
              : `You are not currently clocked in. Total worked so far: ${existing.workedHours} hrs. Say 'Punch In' to resume shift.`;
            actionExecuted = { status: "ALREADY_PUNCHED_OUT", record: existing };
          } else {
            const evalOut = evaluatePunchOut(new Date(existing.punchInTime), authoritativeTime);
            const totalAccumulatedHours = Math.round(((existing.workedHours || 0) + evalOut.workedHours) * 100) / 100;
            const hoursPart = Math.floor(totalAccumulatedHours);
            const minsPart = Math.round((totalAccumulatedHours - hoursPart) * 60);
            const totalDurationFormatted = `${hoursPart}h ${minsPart}m`;

            const record = await prisma.attendance.update({
              where: { id: existing.id },
              data: {
                punchOutTime: authoritativeTime,
                workedHours: totalAccumulatedHours,
                punchOutNotes: `${existing.punchOutNotes || ""} | Out at ${evalOut.timeStringIST} IST (+${evalOut.durationFormatted})`,
              },
            });

            enrichedResponse = isTamil
              ? `பணி முடிவு பதிவு செய்யப்பட்டது! இன்று நீங்கள் பணிபுரிந்த மொத்த நேரம்: ${totalDurationFormatted}.`
              : `Punch out recorded! Total worked time today: ${totalDurationFormatted}.`;
            actionExecuted = { status: "PUNCHED_OUT", record };
          }
        }
      }
    }

    // Handle Live Database Queries
    if (resolution.dataQuery === "MY_ATTENDANCE_STATUS") {
      const today = getISTTimeParts().dateString;
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
        enrichedResponse = isTamil
          ? "உங்கள் ஊழியர் சுயவிவரம் கண்டறியப்படவில்லை."
          : "Your employee profile was not found.";
      } else {
        const att = await prisma.attendance.findUnique({
          where: {
            employeeId_date: {
              employeeId: employee.employeeId,
              date: today,
            },
          },
        });

        if (!att || !att.punchInTime) {
          enrichedResponse = isTamil
            ? "நீங்கள் இன்று இன்னும் வருகை பதிவு செய்யவில்லை."
            : "You have not clocked in yet today.";
        } else if (att.punchOutTime) {
          enrichedResponse = isTamil
            ? `இன்று நீங்கள் ${att.workedHours} மணி நேரம் பணிபுரிந்துள்ளீர்கள். பணி முடிவு நேரம்: ${getISTTimeParts(new Date(att.punchOutTime)).timeString}.`
            : `You worked ${att.workedHours} hours today. Punched out at ${getISTTimeParts(new Date(att.punchOutTime)).timeString} IST.`;
        } else {
          enrichedResponse = isTamil
            ? `நீங்கள் இன்று ${getISTTimeParts(new Date(att.punchInTime)).timeString} மணிக்கு வருகை பதிவு செய்துள்ளீர்கள் (நிலை: ${att.status}). தற்போது பணி நடைபெற்றுக் கொண்டிருக்கிறது.`
            : `You punched in today at ${getISTTimeParts(new Date(att.punchInTime)).timeString} IST (Status: ${att.status}). Shift currently active.`;
        }
        liveDataSummary = { attendance: att };
      }
    } else if (resolution.dataQuery === "MY_LEAVE_BALANCE") {
      const employee = await prisma.employee.findFirst({
        where: {
          OR: [
            { userId: session.id },
            { employeeId: session.employeeId || "" },
            { companyEmail: session.email },
          ],
        },
      });

      if (employee) {
        const bal = await prisma.leaveBalance.findFirst({
          where: { employeeId: employee.employeeId },
          orderBy: { year: "desc" },
        });

        if (bal) {
          const totalAvail = bal.casualLeave + bal.sickLeave + bal.earnedLeave;
          enrichedResponse = isTamil
            ? `உங்களுக்கு மொத்தம் ${totalAvail} நாட்கள் விடுப்பு இருப்பு உள்ளது. (CL: ${bal.casualLeave}, SL: ${bal.sickLeave}, EL: ${bal.earnedLeave}, WFH: ${bal.wfhAvailable} நாட்கள்).`
            : `You have ${totalAvail} days of leave remaining: ${bal.casualLeave} Casual, ${bal.sickLeave} Sick, ${bal.earnedLeave} Earned, and ${bal.wfhAvailable} Work-from-Home days.`;
          liveDataSummary = { balance: bal };
        } else {
          enrichedResponse = isTamil ? "விடுப்பு இருப்பு: CL 12, SL 10, EL 15 நாட்கள்." : "Default quota: 12 Casual, 10 Sick, 15 Earned days.";
        }
      }
    } else if (resolution.dataQuery === "MY_PAYSLIP") {
      const employee = await prisma.employee.findFirst({
        where: {
          OR: [
            { userId: session.id },
            { employeeId: session.employeeId || "" },
            { companyEmail: session.email },
          ],
        },
      });

      if (employee) {
        const payslip = await prisma.payslip.findFirst({
          where: { employeeId: employee.employeeId },
          orderBy: [{ year: "desc" }, { month: "desc" }],
        });

        if (payslip) {
          enrichedResponse = isTamil
            ? `உங்கள் சமீபத்திய மாத நிகர சம்பளம் ரூபாய் ${payslip.netSalary.toLocaleString("en-IN")} ஆகும் (மொத்த சம்பளம்: ₹${payslip.grossSalary.toLocaleString("en-IN")}).`
            : `Your latest net monthly salary is ₹${payslip.netSalary.toLocaleString("en-IN")} with gross earnings of ₹${payslip.grossSalary.toLocaleString("en-IN")}.`;
          liveDataSummary = { payslip };
        } else {
          enrichedResponse = isTamil
            ? `உங்கள் அடிப்படை சம்பளம் ரூபாய் ${employee.basicSalary.toLocaleString("en-IN")} மற்றும் மொத்த சம்பளம் ₹${employee.grossSalary.toLocaleString("en-IN")}.`
            : `Your registered basic salary is ₹${employee.basicSalary.toLocaleString("en-IN")} (Gross: ₹${employee.grossSalary.toLocaleString("en-IN")}).`;
        }
      }
    } else if (resolution.dataQuery === "ACTIVE_INTERNS") {
      const activeCount = await prisma.internship.count({ where: { status: "ACTIVE" } });
      const totalCount = await prisma.internship.count();
      enrichedResponse = isTamil
        ? `தற்போது ${activeCount} மாணவர்கள் நேரடி பயிற்சியில் உள்ளனர் (மொத்த பதிவு: ${totalCount}).`
        : `Currently ${activeCount} interns are active across technical tracks out of ${totalCount} enrolled trainees.`;
      liveDataSummary = { activeInterns: activeCount, totalInterns: totalCount };
    } else if (resolution.dataQuery === "OPEN_JOBS") {
      const openCount = await prisma.jobPosting.count({ where: { status: "OPEN" } });
      enrichedResponse = isTamil
        ? `தற்போது ${openCount} புதிய வேலைவாய்ப்புகள் ஆட்சேர்ப்புக்காக திறக்கப்பட்டுள்ளன.`
        : `There are currently ${openCount} open job positions accepting candidate applications.`;
      liveDataSummary = { openJobs: openCount };
    } else if (resolution.dataQuery === "ATTENDANCE_TODAY") {
      const today = getISTTimeParts().dateString;
      const presentCount = await prisma.attendance.count({
        where: { date: today, status: { in: ["PRESENT", "LATE"] } },
      });
      const absentCount = await prisma.attendance.count({
        where: { date: today, status: "ABSENT" },
      });
      const totalActive = await prisma.employee.count({
        where: { employmentStatus: "Active" },
      });

      liveDataSummary = { present: presentCount, absent: absentCount, total: totalActive, date: today };
      if (isTamil) {
        enrichedResponse = `இன்று ${presentCount} ஊழியர்கள் பணிக்கு வந்துள்ளனர். ${absentCount} பேர் வரவில்லை (மொத்த ஊழியர்கள்: ${totalActive}).`;
      } else {
        enrichedResponse = `Today, ${presentCount} employees are present and ${absentCount} are marked absent out of ${totalActive} active personnel.`;
      }
    } else if (resolution.dataQuery === "PENDING_LEAVE") {
      const pendingCount = await prisma.leaveRequest.count({
        where: { status: { in: ["PENDING_TL", "PENDING_HR"] } },
      });
      liveDataSummary = { pendingCount };
      if (isTamil) {
        enrichedResponse = `தற்போது ${pendingCount} விடுப்பு விண்ணப்பங்கள் ஒப்புதலுக்காக காத்திருக்கின்றன.`;
      } else {
        enrichedResponse = `There are currently ${pendingCount} pending leave applications awaiting approval in the system.`;
      }
    } else if (resolution.dataQuery === "OUTSTANDING_FEES") {
      const internships = await prisma.internship.findMany({
        select: { remainingBalance: true, amountPaid: true },
      });
      let totalRemaining = 0;
      let totalPaid = 0;
      internships.forEach((i) => {
        totalRemaining += i.remainingBalance;
        totalPaid += i.amountPaid;
      });

      liveDataSummary = { totalRemaining, totalPaid };
      if (isTamil) {
        enrichedResponse = `மாணவர்களின் மொத்த கட்டண நிலுவைத் தொகை ரூபாய் ${totalRemaining.toLocaleString("en-IN")} ஆகும். வசூலிக்கப்பட்ட தொகை ரூபாய் ${totalPaid.toLocaleString("en-IN")}.`;
      } else {
        enrichedResponse = `The total outstanding internship balance is ₹${totalRemaining.toLocaleString("en-IN")}. Total collected so far is ₹${totalPaid.toLocaleString("en-IN")}.`;
      }
    }

    // Log AI interaction metadata
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userEmail: session.email,
        action: "VOICE_COPILOT_QUERY",
        module: "AI",
        details: `Voice prompt: "${transcript}" -> Resolved to ${resolution.intent} (${resolution.language})`,
      },
    });

    return NextResponse.json({
      success: true,
      resolution: {
        ...resolution,
        spokenResponse: enrichedResponse,
      },
      actionExecuted,
      liveDataSummary,
    });
  } catch (err: any) {
    console.error("Voice Copilot error:", err);
    return NextResponse.json({ error: "Failed to process voice query." }, { status: 500 });
  }
}
