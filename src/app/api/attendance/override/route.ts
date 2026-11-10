import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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

    // Clearance check: Only Super Admin, Admin, and HR Head can grant override access
    const isAuthorized = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.role);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Access Denied: Only Super Admin and HR Manager can approve and override absence." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { attendanceId, action = "APPROVE_OVERRIDE", overrideReason } = body;

    if (!attendanceId) {
      return NextResponse.json({ error: "Missing required attendanceId parameter." }, { status: 400 });
    }

    const record = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { employee: true },
    });

    if (!record) {
      return NextResponse.json({ error: "Attendance record not found." }, { status: 404 });
    }

    const previousStatus = record.status;
    const nowISO = new Date().toISOString();
    const reasonText = overrideReason?.trim() || "Official Management Approval & Clearance Granted";

    if (action === "APPROVE_OVERRIDE") {
      // Flips ABSENT / LATE to PRESENT!
      const updatedNotes = `${record.punchInNotes || ""} | [Approved & Access Granted by ${session.role} (${session.email}) - Absence Cleared to PRESENT. Reason: ${reasonText}]`;

      const updated = await prisma.attendance.update({
        where: { id: attendanceId },
        data: {
          status: "PRESENT", // Clears Absent status!
          regularizationStatus: "APPROVED",
          regularizationReason: reasonText,
          punchInNotes: updatedNotes,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          userEmail: session.email,
          action: "ATTENDANCE_OVERRIDE_GRANTED",
          module: "ATTENDANCE",
          details: `Cleared absence for ${record.employee.firstName} ${record.employee.lastName} on ${record.date}. Status changed from ${previousStatus} to PRESENT. Reason: ${reasonText}`,
        },
      });

      // Notification for Employee
      if (record.employee.userId) {
        await prisma.notification.create({
          data: {
            userId: record.employee.userId,
            title: "Absence Penalty Overridden & Approved",
            message: `Your attendance on ${record.date} has been regularized to PRESENT by ${session.role}. Absence penalty removed.`,
            type: "ATTENDANCE",
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Absence successfully cleared! ${record.employee.firstName} ${record.employee.lastName} is now marked as PRESENT for ${record.date}.`,
        record: updated,
      });
    } else {
      // Reject override
      const updated = await prisma.attendance.update({
        where: { id: attendanceId },
        data: {
          regularizationStatus: "REJECTED",
          regularizationReason: reasonText,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Absence override rejected. Employee remains marked as ABSENT.",
        record: updated,
      });
    }
  } catch (error: any) {
    console.error("Attendance override error:", error);
    return NextResponse.json({ error: error.message || "Failed to process attendance override." }, { status: 500 });
  }
}
