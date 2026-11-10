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

    const where: any = {};
    if (!isHrOrAdmin) {
      if (!currentEmp) {
        return NextResponse.json({ success: true, payslips: [] });
      }
      where.employeeId = currentEmp.employeeId;
    }

    const payslips = await prisma.payslip.findMany({
      where,
      include: {
        employee: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
            panNumber: true,
            bankAccount: true,
            bankName: true,
            pfNumber: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json({ success: true, payslips });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch payslips." }, { status: 500 });
  }
}
