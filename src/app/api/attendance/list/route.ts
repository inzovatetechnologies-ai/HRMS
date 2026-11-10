import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getISTTimeParts } from "@/lib/attendance";

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
    const summary = searchParams.get("summary");
    const date = searchParams.get("date"); // YYYY-MM-DD
    const employeeId = searchParams.get("employeeId");
    const month = searchParams.get("month"); // YYYY-MM

    const istNow = getISTTimeParts();
    const today = istNow.dateString;

    // Fast-path for shift bar / floating widgets that only need current employee today's status
    if (summary === "today") {
      const currentEmp = await prisma.employee.findFirst({
        where: {
          OR: [{ userId: session.id }, { employeeId: session.employeeId || "" }],
        },
      });

      let userTodayRecord = null;
      if (currentEmp) {
        userTodayRecord = await prisma.attendance.findUnique({
          where: {
            employeeId_date: {
              employeeId: currentEmp.employeeId,
              date: today,
            },
          },
        });
      }

      const userDes = (currentEmp?.designation || "").toLowerCase();
      const userRole = (session.role || "").toLowerCase();
      const isMarimuthu =
        currentEmp?.companyEmail === "marimuthu@inzovate-technologies.com" ||
        currentEmp?.employeeId === "INZ-EXEC-005";
      const isExempt =
        !isMarimuthu &&
        (userDes.includes("director") ||
          userDes.includes("founder") ||
          userDes.includes("ceo") ||
          (userRole === "super_admin" &&
            (userDes.includes("director") || userDes.includes("admin") || userDes.includes("executive"))));

      return NextResponse.json({
        success: true,
        records: [],
        today,
        currentTimeIST: istNow.timeString,
        userTodayRecord,
        isExempt,
        userRole: session.role,
        currentEmployee: currentEmp
          ? {
              employeeId: currentEmp.employeeId,
              firstName: currentEmp.firstName,
              lastName: currentEmp.lastName,
              department: currentEmp.department,
              designation: currentEmp.designation,
            }
          : null,
      });
    }

    // Build filter based on role scoping
    const where: any = {};

    // Normal employees can only view their own records unless authorized
    const isElevated = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "TEAM_LEAD"].includes(session.role);
    if (!isElevated) {
      where.employee = {
        userId: session.id,
      };
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    if (date) {
      where.date = date;
    } else if (month) {
      where.date = { startsWith: month };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
            workLocation: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: 100,
    });

    // Check today's status for the current user
    let userTodayRecord = null;
    const currentEmp = await prisma.employee.findFirst({
      where: {
        OR: [{ userId: session.id }, { employeeId: session.employeeId || "" }],
      },
    });

    if (currentEmp) {
      userTodayRecord = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId: currentEmp.employeeId,
            date: today,
          },
        },
      });
    }

    const userDes = (currentEmp?.designation || "").toLowerCase();
    const userRole = (session.role || "").toLowerCase();
    const isMarimuthu =
      currentEmp?.companyEmail === "marimuthu@inzovate-technologies.com" ||
      currentEmp?.employeeId === "INZ-EXEC-005";
    const isExempt =
      !isMarimuthu &&
      (userDes.includes("director") ||
        userDes.includes("founder") ||
        userDes.includes("ceo") ||
        (userRole === "super_admin" &&
          (userDes.includes("director") || userDes.includes("admin") || userDes.includes("executive"))));

    return NextResponse.json({
      success: true,
      records,
      today,
      currentTimeIST: istNow.timeString,
      userTodayRecord,
      isExempt,
      userRole: session.role,
      currentEmployee: currentEmp
        ? {
            employeeId: currentEmp.employeeId,
            firstName: currentEmp.firstName,
            lastName: currentEmp.lastName,
            department: currentEmp.department,
            designation: currentEmp.designation,
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch attendance data." }, { status: 500 });
  }
}
