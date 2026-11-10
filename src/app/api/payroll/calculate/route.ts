import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { calculatePayroll } from "@/lib/payroll";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Access Denied: Only HR and Administrators can run payroll." }, { status: 403 });
    }

    const { month = new Date().getMonth() + 1, year = new Date().getFullYear(), workingDays = 22 } = await req.json();

    // 1. Fetch all active employees
    const employees = await prisma.employee.findMany({
      where: { employmentStatus: "Active" },
    });

    if (employees.length === 0) {
      return NextResponse.json({ error: "No active employees found to process payroll." }, { status: 400 });
    }

    // 2. Upsert PayrollPeriod
    const period = await prisma.payrollPeriod.upsert({
      where: {
        month_year: { month: Number(month), year: Number(year) },
      },
      update: {
        status: "REVIEW",
        processedAt: new Date(),
      },
      create: {
        month: Number(month),
        year: Number(year),
        status: "REVIEW",
        processedAt: new Date(),
      },
    });

    let totalPeriodGross = 0;
    let totalPeriodDeductions = 0;
    let totalPeriodNet = 0;

    const generatedPayslips = [];

    // 3. Calculate for each employee
    for (const emp of employees) {
      // Find unapproved absences in the month for LOP
      const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
      const absentDaysCount = await prisma.attendance.count({
        where: {
          employeeId: emp.employeeId,
          date: { startsWith: monthPrefix },
          status: "ABSENT",
          regularizationStatus: { not: "APPROVED" },
        },
      });

      const calculation = calculatePayroll({
        basicSalary: emp.basicSalary,
        hra: emp.hra,
        specialAllowance: emp.specialAllowance,
        conveyance: emp.conveyance,
        bonuses: 0,
        workingDays: Number(workingDays),
        unpaidDays: absentDaysCount,
      });

      totalPeriodGross += calculation.grossSalary;
      totalPeriodDeductions += calculation.totalDeductions;
      totalPeriodNet += calculation.netSalary;

      const payslip = await prisma.payslip.upsert({
        where: {
          employeeId_month_year: {
            employeeId: emp.employeeId,
            month: Number(month),
            year: Number(year),
          },
        },
        update: {
          payrollPeriodId: period.id,
          workingDays: calculation.workingDays,
          paidDays: calculation.paidDays,
          unpaidDays: calculation.unpaidDays,
          basicSalary: calculation.basicSalary,
          hra: calculation.hra,
          specialAllowance: calculation.specialAllowance,
          conveyance: calculation.conveyance,
          grossSalary: calculation.grossSalary,
          employeePf: calculation.employeePf,
          employerPf: calculation.employerPf,
          esi: calculation.esi,
          professionalTax: calculation.professionalTax,
          tds: calculation.tds,
          lopDeduction: calculation.lopDeduction,
          totalDeductions: calculation.totalDeductions,
          netSalary: calculation.netSalary,
          status: "GENERATED",
        },
        create: {
          payrollPeriodId: period.id,
          employeeId: emp.employeeId,
          month: Number(month),
          year: Number(year),
          workingDays: calculation.workingDays,
          paidDays: calculation.paidDays,
          unpaidDays: calculation.unpaidDays,
          basicSalary: calculation.basicSalary,
          hra: calculation.hra,
          specialAllowance: calculation.specialAllowance,
          conveyance: calculation.conveyance,
          grossSalary: calculation.grossSalary,
          employeePf: calculation.employeePf,
          employerPf: calculation.employerPf,
          esi: calculation.esi,
          professionalTax: calculation.professionalTax,
          tds: calculation.tds,
          lopDeduction: calculation.lopDeduction,
          totalDeductions: calculation.totalDeductions,
          netSalary: calculation.netSalary,
          status: "GENERATED",
        },
      });

      generatedPayslips.push(payslip);
    }

    // Update totals on PayrollPeriod
    await prisma.payrollPeriod.update({
      where: { id: period.id },
      data: {
        totalGross: totalPeriodGross,
        totalDeductions: totalPeriodDeductions,
        totalNet: totalPeriodNet,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userEmail: session.email,
        action: "PAYROLL_CALCULATED",
        module: "PAYROLL",
        details: `Calculated payroll for ${month}/${year}. Total Net: ₹${totalPeriodNet.toLocaleString("en-IN")} across ${employees.length} employees.`,
      },
    });

    return NextResponse.json({
      success: true,
      period: {
        ...period,
        totalGross: totalPeriodGross,
        totalDeductions: totalPeriodDeductions,
        totalNet: totalPeriodNet,
      },
      count: generatedPayslips.length,
    });
  } catch (err: any) {
    console.error("Payroll calculation error:", err);
    return NextResponse.json({ error: "Failed to calculate payroll." }, { status: 500 });
  }
}
