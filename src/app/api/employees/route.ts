import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, hashPassword, validateEmailForRole } from "@/lib/auth";
import { sendEmail, buildDocumentPendingAlertEmail } from "@/lib/email";

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
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (department && department !== "ALL") {
      where.department = department;
    }
    if (status && status !== "ALL") {
      where.employmentStatus = status;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { employeeId: { contains: search } },
        { companyEmail: { contains: search } },
        { designation: { contains: search } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            role: true,
            isActive: true,
            avatarUrl: true,
          },
        },
        documents: {
          select: {
            id: true,
            category: true,
            fileName: true,
            verificationStatus: true,
            degreeType: true,
            degreeTitle: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: { employeeId: "asc" },
    });

    return NextResponse.json({ success: true, employees });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch employees." }, { status: 500 });
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

    // Allow internal authorized staff
    if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Access Denied: Insufficient permissions." }, { status: 403 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      companyEmail,
      phone,
      department,
      designation,
      role = "EMPLOYEE",
      dateOfJoining,
      basicSalary = 40000,
      hra = 20000,
      specialAllowance = 10000,
      workLocation = "Chennai Headquarters",
      avatarUrl = null,
      reportingToId = null,
      reportingToName = null,
      teamLeadName = null,
      documents = [], // array of { category, fileName, fileUrl }
    } = body;

    // Validate email domain policy
    const emailCheck = validateEmailForRole(companyEmail, role);
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: companyEmail.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    // Generate next sequential employee ID: INZ-EMP-XXXX
    const allEmps = await prisma.employee.findMany({ select: { employeeId: true } });
    let maxIdNum = 1000;
    for (const e of allEmps) {
      const match = e.employeeId.match(/INZ-EMP-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIdNum) maxIdNum = num;
      }
    }
    const nextEmpId = `INZ-EMP-${maxIdNum + 1}`;

    const defaultPasswordHash = await hashPassword("Inzovate@2026");
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const gross = Number(basicSalary) + Number(hra) + Number(specialAllowance) + 3000;
    const joiningDate = dateOfJoining || new Date().toISOString().split("T")[0];

    // Create user and employee in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: companyEmail.trim().toLowerCase(),
          passwordHash: defaultPasswordHash,
          fullName,
          role,
          avatarUrl: avatarUrl || null,
          department,
          designation,
          phone,
          emailVerified: true,
        },
      });

      const emp = await tx.employee.create({
        data: {
          employeeId: nextEmpId,
          userId: user.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          companyEmail: companyEmail.trim().toLowerCase(),
          phone,
          department,
          designation,
          reportingToId,
          reportingToName,
          teamLeadName,
          dateOfJoining: joiningDate,
          workLocation,
          basicSalary: Number(basicSalary),
          hra: Number(hra),
          specialAllowance: Number(specialAllowance),
          conveyance: 3000,
          grossSalary: gross,
        },
      });

      await tx.leaveBalance.create({
        data: {
          employeeId: nextEmpId,
          year: new Date().getFullYear(),
          casualLeave: 12,
          sickLeave: 10,
          earnedLeave: 15,
        },
      });

      // Insert any uploaded documents
      if (Array.isArray(documents) && documents.length > 0) {
        for (const doc of documents) {
          if (doc.category && (doc.fileUrl || doc.fileName)) {
            await tx.employeeDocument.create({
              data: {
                employeeId: nextEmpId,
                category: doc.category,
                fileName: doc.fileName || `${doc.category}_Document`,
                fileUrl: doc.fileUrl || "data:text/plain;base64,VkVSSUZJRUQ=",
                verificationStatus: "VERIFIED",
              },
            });
          }
        }
      }

      return { user, employee: emp };
    });

    // Mandatory Document Compliance Check (PAN, Aadhaar, 10th, 12th)
    const uploadedCategories = Array.isArray(documents) ? documents.map((d: any) => d.category?.toUpperCase()) : [];
    const requiredDocs = [
      { key: "PAN", label: "PAN Card" },
      { key: "AADHAAR", label: "Aadhaar Card" },
      { key: "10TH_MARKSHEET", label: "10th Marksheet" },
      { key: "12TH_MARKSHEET", label: "12th Marksheet" },
    ];
    const missingDocs = requiredDocs
      .filter((req) => !uploadedCategories.includes(req.key))
      .map((req) => req.label);

    // If documents are missing, send automated email & notification to HR
    if (missingDocs.length > 0) {
      try {
        // Find HR Users
        const hrUsers = await prisma.user.findMany({
          where: { role: { in: ["SUPER_ADMIN", "HR_MANAGER"] }, isActive: true },
          select: { id: true, email: true },
        });

        // Create in-app notification for HR
        for (const hr of hrUsers) {
          await prisma.notification.create({
            data: {
              userId: hr.id,
              title: "⚠️ Missing Onboarding Documents Alert",
              message: `New employee ${fullName} (${nextEmpId}) is missing: ${missingDocs.join(", ")}.`,
              type: "SYSTEM",
              link: "/employees",
            },
          });
        }

        // Send Email to HR
        const settings = await prisma.companySettings.findUnique({ where: { id: "inzovate-settings" } });
        const hrEmail = settings?.smtpUser || "hr@inzovate-technologies.com";
        const emailHtml = buildDocumentPendingAlertEmail({
          employeeName: fullName,
          employeeId: nextEmpId,
          department,
          missingDocs,
          daysPending: 0,
          dateOfJoining: joiningDate,
        });

        await sendEmail({
          to: hrEmail,
          subject: `⚠️ Document Compliance Alert: ${fullName} (${nextEmpId}) Missing Documents`,
          html: emailHtml,
        });
      } catch (notifyErr) {
        console.warn("Document compliance notification error:", notifyErr);
      }
    }

    // Safe Audit log
    try {
      let dbUserId: string | null = null;
      if (session.id) {
        const u = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true } });
        if (u) dbUserId = u.id;
      }
      await prisma.auditLog.create({
        data: {
          userId: dbUserId,
          userEmail: session.email || "admin@inzovate-technologies.com",
          action: "EMPLOYEE_CREATED",
          module: "EMPLOYEES",
          details: `Created employee ${nextEmpId} (${fullName}) in ${department} with reporting manager ${reportingToName || "N/A"} and TL ${teamLeadName || "N/A"}. Missing docs: ${missingDocs.length}`,
        },
      });
    } catch (auditErr) {
      console.warn("Audit notice:", auditErr);
    }

    return NextResponse.json({
      success: true,
      ...result,
      missingDocuments: missingDocs,
    });
  } catch (err: any) {
    console.error("Create employee error:", err);
    return NextResponse.json({ error: err.message || "Failed to create employee profile." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const body = await req.json();
    const {
      employeeId,
      firstName,
      lastName,
      phone,
      department,
      designation,
      role,
      employmentStatus,
      workLocation,
      basicSalary,
      hra,
      specialAllowance,
      avatarUrl,
      reportingToName,
      teamLeadName,
    } = body;

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const existingEmp = await prisma.employee.findFirst({
      where: {
        OR: [
          { employeeId },
          { id: employeeId },
        ],
      },
      include: { user: true },
    });

    if (!existingEmp) {
      return NextResponse.json({ error: `Employee ${employeeId} not found.` }, { status: 404 });
    }

    const isSelf = existingEmp.userId === session.id;
    const isPrivileged = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "TEAM_LEAD"].includes(session.role);

    if (!isSelf && !isPrivileged) {
      return NextResponse.json({ error: "Access Denied: You do not have permission to edit this profile." }, { status: 403 });
    }

    const updatedFirstName = firstName !== undefined ? firstName.trim() : existingEmp.firstName;
    const updatedLastName = lastName !== undefined ? lastName.trim() : existingEmp.lastName;
    const updatedFullName = `${updatedFirstName} ${updatedLastName}`;
    const updatedDept = department || existingEmp.department;
    const updatedDesig = designation || existingEmp.designation;
    const updatedPhone = phone !== undefined ? phone.trim() : existingEmp.phone;
    const updatedStatus = employmentStatus || existingEmp.employmentStatus;
    const updatedLocation = workLocation || existingEmp.workLocation;

    const numBasic = basicSalary !== undefined ? Number(basicSalary) : existingEmp.basicSalary;
    const numHra = hra !== undefined ? Number(hra) : existingEmp.hra;
    const numSpecial = specialAllowance !== undefined ? Number(specialAllowance) : existingEmp.specialAllowance;
    const gross = numBasic + numHra + numSpecial + existingEmp.conveyance;

    // Update in transaction
    const [updatedEmp, updatedUser] = await prisma.$transaction([
      prisma.employee.update({
        where: { employeeId },
        data: {
          firstName: updatedFirstName,
          lastName: updatedLastName,
          department: updatedDept,
          designation: updatedDesig,
          phone: updatedPhone,
          reportingToName: reportingToName !== undefined ? reportingToName : existingEmp.reportingToName,
          teamLeadName: teamLeadName !== undefined ? teamLeadName : existingEmp.teamLeadName,
          employmentStatus: updatedStatus,
          workLocation: updatedLocation,
          basicSalary: numBasic,
          hra: numHra,
          specialAllowance: numSpecial,
          grossSalary: gross,
        },
      }),
      prisma.user.update({
        where: { id: existingEmp.userId },
        data: {
          fullName: updatedFullName,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : existingEmp.user.avatarUrl,
          department: updatedDept,
          designation: updatedDesig,
          phone: updatedPhone,
          role: role || existingEmp.user.role,
          isActive: updatedStatus === "Active",
        },
      }),
    ]);

    // Safe Audit Log
    try {
      let dbUserId: string | null = null;
      if (session.id) {
        const u = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true } });
        if (u) dbUserId = u.id;
      }
      await prisma.auditLog.create({
        data: {
          userId: dbUserId,
          userEmail: session.email || "admin@inzovate-technologies.com",
          action: "EMPLOYEE_UPDATED",
          module: "EMPLOYEES",
          details: `Updated details for ${employeeId} (${updatedFullName})`,
        },
      });
    } catch (auditErr) {
      console.warn("Audit notice:", auditErr);
    }

    return NextResponse.json({
      success: true,
      employee: updatedEmp,
      user: updatedUser,
      message: `Employee ${employeeId} details updated successfully.`,
    });
  } catch (err: any) {
    console.error("Update employee error:", err);
    return NextResponse.json({ error: err.message || "Failed to update employee." }, { status: 500 });
  }
}
