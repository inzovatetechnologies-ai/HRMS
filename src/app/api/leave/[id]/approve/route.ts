import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { sendEmail, buildLeaveStatusEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const leaveId = params.id;
    const { action, comments } = await req.json(); // action: 'APPROVE' | 'REJECT'

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: "Leave request not found." }, { status: 404 });
    }

    // Protection: Employee must never approve their own leave
    if (leaveRequest.employee.userId === session.id) {
      return NextResponse.json(
        { error: "Access Denied: You cannot approve or reject your own leave request." },
        { status: 403 }
      );
    }

    const currentRole = session.role;
    let updatedRequest;

    if (leaveRequest.status === "PENDING_TL") {
      // Must be Team Leader, HR Manager, or Super Admin
      if (!["TEAM_LEAD", "HR_MANAGER", "SUPER_ADMIN"].includes(currentRole)) {
        return NextResponse.json(
          { error: "Access Denied: Only Team Leaders or Administrators can provide first-level approval." },
          { status: 403 }
        );
      }

      if (action === "APPROVE") {
        updatedRequest = await prisma.leaveRequest.update({
          where: { id: leaveId },
          data: {
            status: "PENDING_HR", // Advanced to HR for second level approval!
            tlApprovalStatus: "APPROVED",
            tlComments: comments || "Approved by Team Leader",
            tlApprovedAt: new Date(),
          },
        });
      } else {
        updatedRequest = await prisma.leaveRequest.update({
          where: { id: leaveId },
          data: {
            status: "REJECTED",
            tlApprovalStatus: "REJECTED",
            tlComments: comments || "Rejected by Team Leader",
            tlApprovedAt: new Date(),
          },
        });
      }
    } else if (leaveRequest.status === "PENDING_HR") {
      // Must be HR Manager or Super Admin
      if (!["HR_MANAGER", "SUPER_ADMIN", "ADMIN"].includes(currentRole)) {
        return NextResponse.json(
          { error: "Access Denied: Only HR Managers or Super Admins can provide second-level HR approval." },
          { status: 403 }
        );
      }

      if (action === "APPROVE") {
        updatedRequest = await prisma.leaveRequest.update({
          where: { id: leaveId },
          data: {
            status: "APPROVED",
            hrApprovalStatus: "APPROVED",
            hrComments: comments || "Approved by HR",
            hrApprovedAt: new Date(),
            finalDecisionBy: session.fullName,
          },
        });

        // Deduct leave balance upon final HR approval!
        const balance = await prisma.leaveBalance.findUnique({
          where: {
            employeeId_year: {
              employeeId: leaveRequest.employeeId,
              year: new Date().getFullYear(),
            },
          },
        });

        if (balance) {
          const type = leaveRequest.leaveType.toLowerCase();
          const days = leaveRequest.totalDays;

          if (type.includes("casual")) {
            await prisma.leaveBalance.update({
              where: { id: balance.id },
              data: { casualLeave: Math.max(0, balance.casualLeave - days) },
            });
          } else if (type.includes("sick")) {
            await prisma.leaveBalance.update({
              where: { id: balance.id },
              data: { sickLeave: Math.max(0, balance.sickLeave - days) },
            });
          } else if (type.includes("earned") || type.includes("privilege")) {
            await prisma.leaveBalance.update({
              where: { id: balance.id },
              data: { earnedLeave: Math.max(0, balance.earnedLeave - days) },
            });
          }
        }
      } else {
        updatedRequest = await prisma.leaveRequest.update({
          where: { id: leaveId },
          data: {
            status: "REJECTED",
            hrApprovalStatus: "REJECTED",
            hrComments: comments || "Rejected by HR",
            hrApprovedAt: new Date(),
            finalDecisionBy: session.fullName,
          },
        });
      }
    } else {
      return NextResponse.json(
        { error: `This leave request is already finalized (${leaveRequest.status}).` },
        { status: 400 }
      );
    }

    // Send email and in-app notification to employee
    const finalDecision = action === "APPROVE" ? "APPROVED" : "REJECTED";
    await sendEmail({
      to: leaveRequest.employee.companyEmail,
      subject: `Leave Request ${finalDecision} — ${leaveRequest.leaveType}`,
      html: buildLeaveStatusEmail({
        employeeName: `${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName}`,
        leaveType: leaveRequest.leaveType,
        dates: `${leaveRequest.startDate} to ${leaveRequest.endDate}`,
        status: finalDecision,
        approverName: session.fullName,
        approverRole: session.role,
        comments: comments || "No comments provided",
      }),
    });

    await prisma.notification.create({
      data: {
        userId: leaveRequest.employee.user.id,
        title: `Leave Request ${finalDecision}`,
        message: `Your ${leaveRequest.leaveType} was ${finalDecision.toLowerCase()} by ${session.fullName}.`,
        type: "LEAVE",
        link: "/leave",
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userEmail: session.email,
        action: `LEAVE_${action}D`,
        module: "LEAVE",
        details: `${session.fullName} (${session.role}) ${action.toLowerCase()}d leave for ${leaveRequest.employeeId}`,
      },
    });

    return NextResponse.json({ success: true, leaveRequest: updatedRequest });
  } catch (err: any) {
    console.error("Leave approval error:", err);
    return NextResponse.json({ error: "Failed to process leave approval." }, { status: 500 });
  }
}
