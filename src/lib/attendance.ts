import { prisma } from "@/lib/db";
import { sendEmail, buildFullTimeDailyAbsenteeEmail } from "@/lib/email";

/**
 * Inzovate HRMS — Authoritative Attendance & Grace Period Engine
 * Default Timezone: Asia/Kolkata (IST = UTC+5:30)
 * Standard Shift Start: 09:30 AM IST
 * Grace Period Cutoff: 09:45 AM IST (Inclusive boundary)
 * Standard Shift End: 17:00 (05:00 PM IST)
 */

export interface PunchInResult {
  status: "PRESENT" | "ABSENT" | "LATE";
  lateMinutes: number;
  isLate: boolean;
  timeStringIST: string;
  dateStringIST: string;
  notes: string;
}

export interface PunchOutResult {
  workedHours: number;
  earlyMinutes: number;
  isEarly: boolean;
  statusIfEarly: "ABSENT" | "PRESENT";
  timeStringIST: string;
  durationFormatted: string;
}

export interface AttendancePolicyConfig {
  shiftStartHour: number;     // 9
  shiftStartMinute: number;   // 30
  graceEndHour: number;       // 9
  graceEndMinute: number;     // 45
  shiftEndHour: number;       // 17
  shiftEndMinute: number;     // 0
  markAbsentIfLate: boolean;  // true under Inzovate default policy
}

export const DEFAULT_ATTENDANCE_POLICY: AttendancePolicyConfig = {
  shiftStartHour: 9,
  shiftStartMinute: 30,
  graceEndHour: 9,
  graceEndMinute: 45,
  shiftEndHour: 17,
  shiftEndMinute: 0,
  markAbsentIfLate: true,
};

/**
 * Converts a Date object or timestamp into IST hours, minutes, seconds
 */
export function getISTTimeParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  dateString: string;
  timeString: string;
} {
  // Asia/Kolkata is UTC+5:30 (330 minutes)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000;
  const istDate = new Date(utc + istOffset);

  const year = istDate.getFullYear();
  const month = istDate.getMonth() + 1;
  const day = istDate.getDate();
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const seconds = istDate.getSeconds();

  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateString = `${year}-${pad(month)}-${pad(day)}`;
  const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { year, month, day, hours, minutes, seconds, dateString, timeString };
}

/**
 * Evaluates punch-in against Inzovate shift and grace period policy
 */
export function evaluatePunchIn(
  punchTime: Date = new Date(),
  policy: AttendancePolicyConfig = DEFAULT_ATTENDANCE_POLICY
): PunchInResult {
  const ist = getISTTimeParts(punchTime);

  const punchMinutesFromMidnight = ist.hours * 60 + ist.minutes;
  const graceCutoffMinutesFromMidnight = policy.graceEndHour * 60 + policy.graceEndMinute;

  // Boundary check: Punch-in from 9:30 through 9:45 (inclusive) is on-time.
  // E.g. 09:45:00 is on time.
  const isAfterGraceBoundary =
    punchMinutesFromMidnight > graceCutoffMinutesFromMidnight ||
    (punchMinutesFromMidnight === graceCutoffMinutesFromMidnight && ist.seconds > 0);

  if (isAfterGraceBoundary) {
    const lateMinutes = punchMinutesFromMidnight - graceCutoffMinutesFromMidnight;
    const status = policy.markAbsentIfLate ? "ABSENT" : "LATE";
    const notes = `Late punch-in at ${ist.timeString} IST (${lateMinutes} min past 09:45 AM cutoff). Marked ${status} per Inzovate default policy. Regularization may be requested.`;

    return {
      status,
      lateMinutes,
      isLate: true,
      timeStringIST: ist.timeString,
      dateStringIST: ist.dateString,
      notes,
    };
  }

  return {
    status: "PRESENT",
    lateMinutes: 0,
    isLate: false,
    timeStringIST: ist.timeString,
    dateStringIST: ist.dateString,
    notes: `On-time punch-in recorded at ${ist.timeString} IST.`,
  };
}

/**
 * Evaluates punch-out and computes worked duration
 */
export function evaluatePunchOut(
  punchInTime: Date,
  punchOutTime: Date = new Date(),
  policy: AttendancePolicyConfig = DEFAULT_ATTENDANCE_POLICY
): PunchOutResult {
  const istOut = getISTTimeParts(punchOutTime);
  const diffMs = punchOutTime.getTime() - punchInTime.getTime();
  const workedHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);

  const punchOutMinutesFromMidnight = istOut.hours * 60 + istOut.minutes;
  const shiftEndMinutesFromMidnight = policy.shiftEndHour * 60 + policy.shiftEndMinute;

  let earlyMinutes = 0;
  if (punchOutMinutesFromMidnight < shiftEndMinutesFromMidnight) {
    earlyMinutes = shiftEndMinutesFromMidnight - punchOutMinutesFromMidnight;
  }

  const hoursPart = Math.floor(workedHours);
  const minsPart = Math.round((workedHours - hoursPart) * 60);
  const durationFormatted = `${hoursPart}h ${minsPart}m`;

  return {
    workedHours,
    earlyMinutes,
    isEarly: earlyMinutes > 0,
    statusIfEarly: earlyMinutes > 0 ? "ABSENT" : "PRESENT",
    timeStringIST: istOut.timeString,
    durationFormatted,
  };
}

/**
 * Returns true if the given date is Saturday (6) or Sunday (0) — Inzovate standard Week-Off
 */
export function isWeekendDay(dateOrStr: Date | string = new Date()): boolean {
  let date: Date;
  if (typeof dateOrStr === "string") {
    // Parse YYYY-MM-DD
    const parts = dateOrStr.split("-").map(Number);
    date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  } else {
    date = dateOrStr;
  }
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Executes the 09:45 AM Shift Cutoff scan for all full-time employees.
 * On weekends (Sat/Sun), returns early (Week-Off).
 * Any non-exempt employee without a punch-in is recorded as ABSENT in DB,
 * and an intimation email is dispatched to hr@inzovate-technologies.com.
 */
export async function processDailyFullTimeAbsentees(options?: {
  targetDate?: string;
  forceOnWeekend?: boolean;
}) {
  const istNow = getISTTimeParts();
  const dateStr = options?.targetDate || istNow.dateString;

  if (isWeekendDay(dateStr) && !options?.forceOnWeekend) {
    return {
      success: true,
      isWeekend: true,
      message: `Today (${dateStr}) is Saturday/Sunday (Company Week-Off). Shift absentee check skipped per Inzovate policy.`,
      absentEmployees: [],
    };
  }

  // 1. Fetch active employees (excluding Founder/Co-Founder who are exempt)
  const activeStaff = await prisma.employee.findMany({
    where: {
      employmentStatus: "Active",
      employmentType: { not: "Intern" },
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      department: true,
      designation: true,
      grossSalary: true,
      companyEmail: true,
    },
  });

  // 2. Fetch existing attendance records for the date
  const attendances = await prisma.attendance.findMany({
    where: { date: dateStr },
  });

  const absentStaff: Array<{
    name: string;
    employeeId: string;
    department: string;
    designation: string;
    grossSalary: number;
    lopDeductionEstimate: number;
  }> = [];

  for (const emp of activeStaff) {
    const des = (emp.designation || "").toLowerCase();
    const isExempt =
      des.includes("founder") ||
      (des.includes("director") && !des.includes("assistant")) ||
      des.includes("managing director");

    if (isExempt) continue;

    const existingAtt = attendances.find((a) => a.employeeId === emp.employeeId);

    // If employee hasn't punched in or was already evaluated absent
    if (!existingAtt || !existingAtt.punchInTime) {
      const dailyGross = Math.round((emp.grossSalary || 45000) / 22);
      absentStaff.push({
        name: `${emp.firstName} ${emp.lastName}`,
        employeeId: emp.employeeId,
        department: emp.department,
        designation: emp.designation,
        grossSalary: emp.grossSalary || 45000,
        lopDeductionEstimate: dailyGross,
      });

      // Upsert record in database as ABSENT
      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: emp.employeeId,
            date: dateStr,
          },
        },
        update: {
          status: "ABSENT",
          punchInNotes: "Automated Absent: No punch-in recorded by 09:45 AM cutoff",
        },
        create: {
          employeeId: emp.employeeId,
          date: dateStr,
          status: "ABSENT",
          punchInNotes: "Automated Absent: No punch-in recorded by 09:45 AM cutoff",
        },
      });
    }
  }

  // 3. Dispatch Email Alert to HR
  if (absentStaff.length > 0) {
    const emailHtml = buildFullTimeDailyAbsenteeEmail({
      date: dateStr,
      timeStringIST: istNow.timeString,
      absentCount: absentStaff.length,
      totalActiveStaff: activeStaff.length,
      absentEmployees: absentStaff,
    });

    await sendEmail({
      to: "hr@inzovate-technologies.com",
      subject: `[INZOVATE HR ALERT] ⚠️ Daily Absentee Notice (09:45 AM Grace Cutoff) — ${absentStaff.length} Staff Absent — ${dateStr}`,
      html: emailHtml,
    });

    // Create In-App Notification for HR Managers and Super Admins
    try {
      const hrUsers = await prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "HR_MANAGER"] } },
        select: { id: true },
      });

      for (const hr of hrUsers) {
        await prisma.notification.create({
          data: {
            userId: hr.id,
            title: `Daily Absentee Intimation (${dateStr})`,
            message: `${absentStaff.length} employee(s) failed to punch in by the 09:45 AM cutoff and were recorded as ABSENT. Email sent to hr@inzovate-technologies.com.`,
            type: "ATTENDANCE",
            link: "/attendance",
          },
        });
      }
    } catch (notifErr) {
      console.warn("Notification notice:", notifErr);
    }
  }

  return {
    success: true,
    isWeekend: false,
    date: dateStr,
    totalActiveStaff: activeStaff.length,
    absentCount: absentStaff.length,
    absentEmployees: absentStaff,
  };
}

/**
 * Calculates a complete monthly calendar breakdown for an individual employee:
 * - Differentiates Saturday & Sunday as Week-Offs (Non-working, protected days)
 * - Accounts for Present, Late, Absent, Leave days
 * - Calculates Loss of Pay (LOP) and salary impact
 */
export async function calculateEmployeeAttendanceReport(
  employeeId: string,
  month: number,
  year: number
) {
  const employee = await prisma.employee.findUnique({
    where: { employeeId },
    include: { user: true },
  });

  if (!employee) return null;

  // Days in month
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const monthPad = String(month).padStart(2, "0");

  const startDateStr = `${year}-${monthPad}-01`;
  const endDateStr = `${year}-${monthPad}-${String(totalDaysInMonth).padStart(2, "0")}`;

  const records = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: {
        gte: startDateStr,
        lte: endDateStr,
      },
    },
  });

  const dailyBreakdown: Array<{
    date: string;
    dayOfWeek: string;
    dayNumber: number;
    isWeekend: boolean;
    status: "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT" | "ON_LEAVE" | "WEEK_OFF" | "UPCOMING";
    punchIn: string | null;
    punchOut: string | null;
    workedHours: number;
    notes: string | null;
  }> = [];

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayStr = getISTTimeParts().dateString;

  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let weekOffCount = 0;
  let totalWorkedHours = 0;

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayPad = String(day).padStart(2, "0");
    const dStr = `${year}-${monthPad}-${dayPad}`;
    const dObj = new Date(year, month - 1, day, 12, 0, 0);
    const dayOfWeek = dayNames[dObj.getDay()];
    const isWk = dObj.getDay() === 0 || dObj.getDay() === 6;

    const existing = records.find((r) => r.date === dStr);

    let status: any = "UPCOMING";
    let punchIn: string | null = null;
    let punchOut: string | null = null;
    let workedHours = 0;
    let notes: string | null = null;

    if (isWk) {
      status = "WEEK_OFF";
      weekOffCount++;
      notes = "Company Week-Off (Saturday/Sunday)";
    } else if (existing) {
      status = existing.status || "ABSENT";
      punchIn = existing.punchInTime ? new Date(existing.punchInTime).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : null;
      punchOut = existing.punchOutTime ? new Date(existing.punchOutTime).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : null;
      workedHours = existing.workedHours || 0;
      totalWorkedHours += workedHours;
      notes = existing.punchInNotes || existing.punchOutNotes || null;

      if (status === "PRESENT") presentCount++;
      else if (status === "LATE") { lateCount++; presentCount++; }
      else if (status === "ABSENT") absentCount++;
      else if (status === "ON_LEAVE") leaveCount++;
    } else if (dStr < todayStr) {
      // Past weekday with no punch is counted as ABSENT
      status = "ABSENT";
      absentCount++;
      notes = "Unpunched workday (Marked Absent)";
    } else {
      status = "UPCOMING";
    }

    dailyBreakdown.push({
      date: dStr,
      dayOfWeek,
      dayNumber: day,
      isWeekend: isWk,
      status,
      punchIn,
      punchOut,
      workedHours,
      notes,
    });
  }

  const standardWorkingDays = totalDaysInMonth - weekOffCount;
  const grossSalary = employee.grossSalary || 45000;
  const dailyGross = standardWorkingDays > 0 ? Math.round(grossSalary / standardWorkingDays) : 0;
  const lopDeduction = absentCount * dailyGross;
  const estimatedNet = Math.max(0, grossSalary - lopDeduction);

  return {
    employee: {
      id: employee.id,
      employeeId: employee.employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      designation: employee.designation,
      companyEmail: employee.companyEmail,
      dateOfJoining: employee.dateOfJoining,
      grossSalary,
      dailyGross,
    },
    period: {
      month,
      year,
      monthName: new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long" }),
      totalDaysInMonth,
      standardWorkingDays,
      weekOffCount,
    },
    summary: {
      presentCount,
      lateCount,
      absentCount,
      leaveCount,
      totalWorkedHours: Math.round(totalWorkedHours * 10) / 10,
      lopDeduction,
      estimatedNet,
    },
    dailyBreakdown,
  };
}

