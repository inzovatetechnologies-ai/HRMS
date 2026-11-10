import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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

    const currentEmp = await prisma.employee.findFirst({
      where: {
        OR: [{ userId: session.id }, { employeeId: session.employeeId || "" }],
      },
    });

    const isHrOrAdmin = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.role);
    const isTeamLead = session.role === "TEAM_LEAD";

    let where: any = {};

    if (isHrOrAdmin) {
      // HR and Super Admin view all company leave requests
      where = {};
    } else if (isTeamLead && currentEmp) {
      // Team lead views requests from team members reporting to them, plus their own
      where = {
        OR: [
          { employee: { reportingToId: currentEmp.employeeId } },
          { employeeId: currentEmp.employeeId },
        ],
      };
    } else if (currentEmp) {
      // Normal employee views only their own leave requests
      where = { employeeId: currentEmp.employeeId };
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch user's leave balances
    let balances = null;
    if (currentEmp) {
      balances = await prisma.leaveBalance.findUnique({
        where: {
          employeeId_year: {
            employeeId: currentEmp.employeeId,
            year: new Date().getFullYear(),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      leaveRequests,
      balances,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch leave requests." }, { status: 500 });
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

    const currentEmp = await prisma.employee.findFirst({
      where: {
        OR: [{ userId: session.id }, { employeeId: session.employeeId || "" }],
      },
    });

    if (!currentEmp) {
      return NextResponse.json({ error: "No employee profile found." }, { status: 404 });
    }

    const { leaveType, startDate, endDate, totalDays, reason } = await req.json();

    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Missing required leave fields." }, { status: 400 });
    }

    // Create leave request with mandatory sequential routing: starts at PENDING_TL
    const request = await prisma.leaveRequest.create({
      data: {
        employeeId: currentEmp.employeeId,
        leaveType,
        startDate,
        endDate,
        totalDays: Number(totalDays) || 1,
        reason,
        status: "PENDING_TL",
        tlApprovalStatus: "PENDING",
        hrApprovalStatus: "PENDING",
      },
    });

    // Notify Team Leader or HR
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: "Leave Request Submitted",
        message: `Your request for ${leaveType} (${totalDays} days) has been routed to your Team Leader for approval.`,
        type: "LEAVE",
        link: "/leave",
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userEmail: session.email,
        action: "LEAVE_APPLICATION_SUBMITTED",
        module: "LEAVE",
        details: `Submitted ${leaveType} from ${startDate} to ${endDate} (${totalDays} days).`,
      },
    });

    return NextResponse.json({ success: true, leaveRequest: request });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to apply for leave." }, { status: 500 });
  }
}
