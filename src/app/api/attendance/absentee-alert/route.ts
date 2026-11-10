import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { getISTTimeParts } from "@/lib/attendance";

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

    const istNow = getISTTimeParts();
    const today = istNow.dateString;

    // 1. Fetch all active employees (excluding directors who are exempt)
    const allEmployees = await prisma.employee.findMany({
      where: { employmentStatus: "Active" },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        department: true,
        designation: true,
        companyEmail: true,
      },
    });

    // 2. Fetch today's attendances
    const todayAttendances = await prisma.attendance.findMany({
      where: { date: today },
    });

    // 3. Find employees who haven't punched in
    const unPunchedEmployees = allEmployees.filter((emp) => {
      const isDirector =
        emp.designation.toLowerCase().includes("director") ||
        emp.designation.toLowerCase().includes("founder") ||
        emp.designation.toLowerCase().includes("ceo");
      if (isDirector) return false;

      const record = todayAttendances.find((a) => a.employeeId === emp.employeeId);
      return !record || !record.punchInTime || record.status === "ABSENT";
    });

    const targetHREmail = "hr@inzovate-technologies.com";

    // 4. Construct rich HTML Email content for HR
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07152E; color: #E2E8F0; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #0B1F3A; border-radius: 16px; border: 1px solid rgba(40, 197, 246, 0.3); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #071A38 0%, #0F2B5C 50%, #1769FF 100%); padding: 24px; color: #ffffff; text-align: center; border-bottom: 2px solid #28C5F6; }
    .header h2 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; }
    .content { padding: 24px; background: #081B36; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: rgba(239, 68, 68, 0.2); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.4); text-transform: uppercase; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .table th { text-align: left; padding: 10px 8px; color: #94A3B8; border-bottom: 2px solid rgba(255,255,255,0.1); }
    .table td { padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.07); color: #F8FAFC; }
    .footer { padding: 16px 24px; background: #051226; font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid rgba(255,255,255,0.07); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>INZOVATE TECHNOLOGIES</h2>
      <p style="margin: 0; font-size: 12px; color: #94A3B8;">Workforce Presence Alert • Absentee / Non-Punch Notification</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; color: #CBD5E1;">Dear HR Team (<strong style="color: #28C5F6;">${targetHREmail}</strong>),</p>
      <p style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
        The automated Inzovate HRMS Shift Monitor has detected that the following employee(s) have <strong style="color: #F43F5E;">NOT punched in</strong> as of <strong style="color: #F8FAFC;">${istNow.timeString} IST</strong> on <strong style="color: #F8FAFC;">${today}</strong>.
      </p>

      ${
        unPunchedEmployees.length === 0
          ? `<p style="color: #10B981; font-weight: bold; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">All scheduled staff members are present and accounted for.</p>`
          : `
      <table class="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>ID</th>
            <th>Department</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${unPunchedEmployees
            .map(
              (emp) => `
          <tr>
            <td><strong>${emp.firstName} ${emp.lastName}</strong><br><span style="font-size: 10px; color: #94A3B8;">${emp.designation}</span></td>
            <td><code style="color: #28C5F6;">${emp.employeeId}</code></td>
            <td>${emp.department}</td>
            <td><span class="badge">Absent / Not Punched</span></td>
          </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      `
      }

      <p style="font-size: 12px; color: #94A3B8; margin-top: 20px;">
        As per company policy, Loss of Pay (LOP) or regularization request must be filed if legitimate justification exists.
      </p>
    </div>
    <div class="footer">
      Inzovate Technologies Private Limited • CIN: U62011TZ2025PTC036329 • Autonomous Shift Telemetry
    </div>
  </div>
</body>
</html>
    `;

    // 5. Dispatch Email to hr@inzovate-technologies.com
    await sendEmail({
      to: targetHREmail,
      subject: `[INZOVATE HR ALERT] Absentee Notice: ${unPunchedEmployees.length} Employee(s) Not Punched In (${today})`,
      html: emailHtml,
      metadata: {
        date: today,
        unPunchedCount: unPunchedEmployees.length,
        unPunchedIds: unPunchedEmployees.map((e) => e.employeeId),
      },
    });

    // 6. Record In-App System Notification for HR / Super Admin
    try {
      if (session.id) {
        await prisma.notification.create({
          data: {
            userId: session.id,
            title: "HR Absentee Alert Dispatched",
            message: `Absentee summary dispatched to ${targetHREmail} for ${unPunchedEmployees.length} staff member(s) lacking shift punch on ${today}.`,
            type: "ATTENDANCE",
          },
        });
      }
    } catch (e) {
      console.warn("Notification logging notice:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Absentee notification sent to ${targetHREmail} successfully.`,
      targetHREmail,
      unPunchedCount: unPunchedEmployees.length,
      unPunchedEmployees: unPunchedEmployees.map((e) => ({
        name: `${e.firstName} ${e.lastName}`,
        employeeId: e.employeeId,
        department: e.department,
      })),
    });
  } catch (error: any) {
    console.error("Failed to dispatch absentee email alert to HR:", error);
    return NextResponse.json(
      { error: "Failed to dispatch absentee email alert to HR.", details: error.message },
      { status: 500 }
    );
  }
}
