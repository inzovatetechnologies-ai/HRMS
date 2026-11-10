import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { processDailyFullTimeAbsentees } from "@/lib/attendance";

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
    const { targetDate, forceOnWeekend } = body;

    const result = await processDailyFullTimeAbsentees({
      targetDate,
      forceOnWeekend: Boolean(forceOnWeekend),
    });

    return NextResponse.json({
      success: true,
      message: result.isWeekend
        ? "Shift check skipped: Saturday/Sunday are protected company Week-Offs."
        : `09:45 AM Cutoff scan complete. ${result.absentCount} employee(s) recorded as ABSENT. Intimation dispatched to hr@inzovate-technologies.com.`,
      result,
    });
  } catch (err: any) {
    console.error("Absentee check error:", err);
    return NextResponse.json({ error: err.message || "Failed to execute absentee check." }, { status: 500 });
  }
}
