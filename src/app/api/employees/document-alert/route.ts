import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { sendEmail, buildDocumentPendingAlertEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Automated Document Compliance Sentinel: Checks all employees for missing onboarding documents
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
    const employeeId = body?.employeeId; // optional check for single employee or all

    const requiredDocs = [
      { key: "AADHAAR", label: "Aadhaar Card" },
      { key: "PAN", label: "PAN Card" },
      { key: "BANK_PASSBOOK", label: "Bank Passbook" },
      { key: "10TH_MARKSHEET", label: "10th Marksheet" },
      { key: "12TH_MARKSHEET", label: "12th Marksheet" },
      { key: "COLLEGE_MARKSHEET", label: "College Marksheet" },
      { key: "DEGREE_CERTIFICATE", label: "Consolidated Degree Certificate (UG/PG/Diploma)" },
    ];

    const where: any = {
      employmentStatus: "Active",
    };
    if (employeeId) {
      where.employeeId = employeeId;
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        documents: true,
      },
    });

    const flaggedEmployees: any[] = [];
    const now = new Date();

    for (const emp of employees) {
      const uploadedCats = emp.documents.map((d) => d.category.toUpperCase());
      const missing = requiredDocs
        .filter((r) => !uploadedCats.includes(r.key))
        .map((r) => r.label);

      if (missing.length > 0) {
        // Calculate days pending from dateOfJoining
        const joinDate = new Date(emp.dateOfJoining || emp.createdAt);
        const diffMs = now.getTime() - joinDate.getTime();
        const daysPending = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        flaggedEmployees.push({
          employeeId: emp.employeeId,
          fullName: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          dateOfJoining: emp.dateOfJoining,
          daysPending,
          missingDocs: missing,
        });
      }
    }

    if (flaggedEmployees.length > 0) {
      const settings = await prisma.companySettings.findUnique({ where: { id: "inzovate-settings" } });
      const hrEmail = settings?.smtpUser || "hr@inzovate-technologies.com";

      // Find HR Users for in-app alert
      const hrUsers = await prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "HR_MANAGER"] }, isActive: true },
        select: { id: true },
      });

      for (const item of flaggedEmployees) {
        // Notification
        for (const hr of hrUsers) {
          await prisma.notification.create({
            data: {
              userId: hr.id,
              title: `⚠️ Overdue Documents: ${item.fullName}`,
              message: `${item.fullName} (${item.employeeId}) has ${item.missingDocs.length} pending document(s) after ${item.daysPending} days: ${item.missingDocs.join(", ")}.`,
              type: "SYSTEM",
              link: "/employees",
            },
          });
        }

        // Email
        const emailHtml = buildDocumentPendingAlertEmail({
          employeeName: item.fullName,
          employeeId: item.employeeId,
          department: item.department,
          missingDocs: item.missingDocs,
          daysPending: item.daysPending,
          dateOfJoining: item.dateOfJoining,
        });

        await sendEmail({
          to: hrEmail,
          subject: `⚠️ Document Compliance Alert: ${item.fullName} (${item.employeeId}) Overdue Verification`,
          html: emailHtml,
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalFlagged: flaggedEmployees.length,
      flaggedEmployees,
      message: flaggedEmployees.length > 0
        ? `Document compliance alert triggered for ${flaggedEmployees.length} employee(s). Notifications & email sent to HR.`
        : "All active employees have completed mandatory document submissions.",
    });
  } catch (err: any) {
    console.error("Document check error:", err);
    return NextResponse.json({ error: err.message || "Failed to run document check." }, { status: 500 });
  }
}
