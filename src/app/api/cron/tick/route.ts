import { NextRequest, NextResponse } from "next/server";
import { getISTTimeParts, processDailyFullTimeAbsentees } from "@/lib/attendance";
import { runMorningInternshipAudit } from "@/app/api/internship/morning-audit/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const simulatedHour = searchParams.get("hour") ? parseInt(searchParams.get("hour")!, 10) : null;
    const simulatedMinute = searchParams.get("minute") ? parseInt(searchParams.get("minute")!, 10) : null;
    const targetDate = searchParams.get("date") || undefined;
    const force = searchParams.get("force") === "true";

    const ist = getISTTimeParts();
    const effectiveHour = simulatedHour !== null ? simulatedHour : ist.hours;
    const effectiveMinute = simulatedMinute !== null ? simulatedMinute : ist.minutes;

    const results: any = {
      timestampIST: `${ist.dateString} ${ist.timeString} IST`,
      effectiveHour,
      effectiveMinute,
    };

    // 1. At 09:45 AM (or forced): Full-Time Employee Absentee Check
    if (force || (effectiveHour === 9 && effectiveMinute >= 45 && effectiveMinute <= 50)) {
      results.fullTimeScan = await processDailyFullTimeAbsentees({
        targetDate,
        forceOnWeekend: force,
      });
    }

    // 2. At 10:30 AM (or forced): Internship Trainer Morning Schedule & Attendance Audit
    if (force || (effectiveHour === 10 && effectiveMinute >= 30 && effectiveMinute <= 45)) {
      results.internshipMorningAudit = await runMorningInternshipAudit({ force });
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Cron tick failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
