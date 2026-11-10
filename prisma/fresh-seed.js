const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("=== INZOVATE HRMS: CLEANING DEMO DATA & SEEDING AUTHENTIC ACCOUNTS ===");

  // 1. Wipe out old demo users
  const demoEmails = [
    "admin@inzovate-technologies.com",
    "rahul.intern@gmail.com",
    "sneha.data@gmail.com",
    "praveen.cloud@gmail.com",
    "arun.candidate@gmail.com",
    "mousik2001@gmail.com",
    "kavitha.test@gmail.com",
    "karthik.tl@inzovate-technologies.com",
    "vijay.kumar@inzovate-technologies.com",
    "priya.nair@inzovate-technologies.com"
  ];

  for (const email of demoEmails) {
    try {
      const u = await prisma.user.findUnique({ where: { email } });
      if (u) {
        await prisma.employee.deleteMany({ where: { userId: u.id } });
        await prisma.user.delete({ where: { id: u.id } });
        console.log(`Removed demo user: ${email}`);
      }
    } catch (e) {
      console.warn(`Could not remove ${email}:`, e.message);
    }
  }

  // Also clean old dummy employees not linked to real accounts
  try {
    await prisma.employee.deleteMany({
      where: {
        employeeId: {
          in: ["INZ-EMP-1002", "INZ-EMP-1003", "INZ-EMP-1005", "INZ-EMP-1006"]
        }
      }
    });
  } catch (e) {}

  // 2. Pre-hash official passwords
  const founderPass = await bcrypt.hash("Founder@2026", 10);
  const mdPass = await bcrypt.hash("Md@2026", 10);
  const hrPass = await bcrypt.hash("Mick@922001", 10);
  const empPass = await bcrypt.hash("Employee@2026", 10);
  const internPass = await bcrypt.hash("Intern@2026", 10);

  // 3. Official Accounts
  const officialAccounts = [
    {
      email: "founder@inzovate-technologies.com",
      passwordHash: founderPass,
      fullName: "Gokul G",
      role: "SUPER_ADMIN",
      department: "Executive Board",
      designation: "Founder & Executive Chairman",
      phone: "+91 98400 11001",
      employeeId: "INZ-EXEC-001",
      firstName: "Gokul",
      lastName: "G",
      joining: "2023-01-01",
      basic: 250000,
      hra: 125000,
      special: 75000,
    },
    {
      email: "md@inzovate-technologies.com",
      passwordHash: mdPass,
      fullName: "Mousik Shankar S",
      role: "SUPER_ADMIN",
      department: "Corporate Governance",
      designation: "Managing Director",
      phone: "+91 98400 11002",
      employeeId: "INZ-EXEC-002",
      firstName: "Mousik Shankar",
      lastName: "S",
      joining: "2023-01-01",
      basic: 220000,
      hra: 110000,
      special: 70000,
    },
    {
      email: "hr@inzovate-technologies.com",
      passwordHash: hrPass,
      fullName: "HR Manager",
      role: "HR_MANAGER",
      department: "Human Resources",
      designation: "Human Resource Manager",
      phone: "+91 98400 11004",
      employeeId: "INZ-EXEC-004",
      firstName: "HR",
      lastName: "Manager",
      joining: "2023-03-01",
      basic: 85000,
      hra: 42500,
      special: 22500,
    },
    {
      email: "employee@inzovate-technologies.com",
      passwordHash: empPass,
      fullName: "Ananya Sharma",
      role: "EMPLOYEE",
      department: "Engineering & Technology",
      designation: "Senior Full Stack Engineer",
      phone: "+91 98400 11010",
      employeeId: "INZ-EMP-1001",
      firstName: "Ananya",
      lastName: "Sharma",
      joining: "2024-01-15",
      basic: 65000,
      hra: 32500,
      special: 17500,
    },
    {
      email: "ananya.sharma@inzovate-technologies.com",
      passwordHash: empPass,
      fullName: "Ananya Sharma",
      role: "EMPLOYEE",
      department: "Engineering & Technology",
      designation: "Senior Full Stack Engineer",
      phone: "+91 98400 11010",
      employeeId: "INZ-EMP-1004",
      firstName: "Ananya",
      lastName: "Sharma",
      joining: "2024-01-15",
      basic: 65000,
      hra: 32500,
      special: 17500,
    },
    {
      email: "intern@inzovate-technologies.com",
      passwordHash: internPass,
      fullName: "Student Intern",
      role: "INTERN",
      department: "Technology Academy",
      designation: "AI & Cloud Intern",
      phone: "+91 98400 11020",
      employeeId: "INZ-INT-2026-001",
      firstName: "Student",
      lastName: "Intern",
      joining: "2026-01-10",
      basic: 12000,
      hra: 3000,
      special: 0,
    },
  ];

  for (const acc of officialAccounts) {
    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        passwordHash: acc.passwordHash,
        fullName: acc.fullName,
        role: acc.role,
        department: acc.department,
        designation: acc.designation,
        phone: acc.phone,
        isActive: true,
        emailVerified: true,
      },
      create: {
        email: acc.email,
        passwordHash: acc.passwordHash,
        fullName: acc.fullName,
        role: acc.role,
        department: acc.department,
        designation: acc.designation,
        phone: acc.phone,
        isActive: true,
        emailVerified: true,
      },
    });

    const gross = acc.basic + acc.hra + acc.special;
    await prisma.employee.upsert({
      where: { companyEmail: acc.email },
      update: {
        userId: user.id,
        firstName: acc.firstName,
        lastName: acc.lastName,
        department: acc.department,
        designation: acc.designation,
        grossSalary: gross,
      },
      create: {
        employeeId: acc.employeeId,
        userId: user.id,
        firstName: acc.firstName,
        lastName: acc.lastName,
        companyEmail: acc.email,
        department: acc.department,
        designation: acc.designation,
        dateOfJoining: acc.joining,
        basicSalary: acc.basic,
        hra: acc.hra,
        specialAllowance: acc.special,
        grossSalary: gross,
      },
    });

    console.log(`✓ Seeded official account: ${acc.fullName} (${acc.email}) -> Role: ${acc.role}`);
  }

  // 4. Clean old demo internships and seed official intern profile
  try {
    await prisma.internshipPayment.deleteMany({});
    await prisma.internship.deleteMany({});
  } catch (e) {}

  await prisma.internship.create({
    data: {
      internId: "INZ-INT-2026-001",
      fullName: "Student Intern",
      personalEmail: "intern@inzovate-technologies.com",
      phone: "+91 98400 11020",
      college: "PSG College of Technology",
      degree: "B.Tech Computer Science",
      graduationYear: 2026,
      domain: "Full Stack & Applied AI",
      batch: "Batch-2026-Q1",
      mentor: "Prem Kumar",
      startDate: "2026-01-10",
      endDate: "2026-04-10",
      durationWeeks: 12,
      workMode: "Hybrid (Chennai HQ)",
      internshipType: "Paid Certification",
      totalFee: 15000,
      discount: 0,
      amountPaid: 10000,
      remainingBalance: 5000,
      paymentStatus: "PARTIAL",
      attendancePercentage: 96.5,
      assignmentCompletion: 92.0,
      assessmentScore: 88.5,
      projectTitle: "Inzovate Autonomous HRMS Telemetry Suite",
      certificateStatus: "ELIGIBLE",
      status: "ACTIVE",
    },
  });

  // 5. Seed Role Permissions Matrix
  const rolePermissions = [
    {
      role: "SUPER_ADMIN",
      title: "Super Admin (Founder & Managing Director)",
      description: "Full and unrestricted autonomous access across all modules, governance policies, financial records, audit logs, and accessibility configuration.",
      modules: JSON.stringify([
        "dashboard",
        "employees",
        "attendance",
        "leaves",
        "payroll",
        "org-chart",
        "tasks",
        "reports",
        "settings",
        "permissions",
        "internship",
        "recruitment",
        "certificates"
      ]),
      canApprove: true,
      canEdit: true,
      canDelete: true,
      canExport: true,
      isLocked: true,
      updatedBy: "founder@inzovate-technologies.com",
    },
    {
      role: "HR_MANAGER",
      title: "HR Head (Human Resources)",
      description: "Workforce operations, attendance management, leave approvals, payroll disbursals, employee profiles, and internship management.",
      modules: JSON.stringify([
        "dashboard",
        "employees",
        "attendance",
        "leaves",
        "payroll",
        "org-chart",
        "tasks",
        "reports",
        "internship",
        "recruitment",
        "certificates"
      ]),
      canApprove: true,
      canEdit: true,
      canDelete: false,
      canExport: true,
      isLocked: false,
      updatedBy: "founder@inzovate-technologies.com",
    },
    {
      role: "EMPLOYEE",
      title: "Employee (Self-Service ESS)",
      description: "Personal self-service: My Attendance, My Leaves, My Payslips, My Tasks, and Company Org Hierarchy.",
      modules: JSON.stringify([
        "dashboard",
        "attendance",
        "leaves",
        "payroll",
        "org-chart",
        "tasks",
        "certificates"
      ]),
      canApprove: false,
      canEdit: false,
      canDelete: false,
      canExport: false,
      isLocked: false,
      updatedBy: "founder@inzovate-technologies.com",
    },
    {
      role: "INTERN",
      title: "Intern Student",
      description: "Internship portal: Learning Sprints, My Attendance, My Internship Fee Telemetry, and Certificates.",
      modules: JSON.stringify([
        "dashboard",
        "attendance",
        "internship",
        "tasks",
        "certificates",
        "org-chart"
      ]),
      canApprove: false,
      canEdit: false,
      canDelete: false,
      canExport: false,
      isLocked: false,
      updatedBy: "founder@inzovate-technologies.com",
    },
  ];

  for (const rp of rolePermissions) {
    await prisma.rolePermission.upsert({
      where: { role: rp.role },
      update: rp,
      create: rp,
    });
    console.log(`✓ Configured Role Access Permissions: ${rp.role} -> ${rp.modules}`);
  }

  // 6. Ensure Company Settings have live Zoho SMTP configuration
  await prisma.companySettings.upsert({
    where: { id: "inzovate-settings" },
    update: {
      smtpHost: "smtppro.zoho.in",
      smtpPort: 465,
      smtpUser: "hr@inzovate-technologies.com",
      smtpPass: "Mick@922001",
      smtpFrom: "Inzovate HRMS <hr@inzovate-technologies.com>",
    },
    create: {
      id: "inzovate-settings",
      companyName: "INZOVATE TECHNOLOGIES PRIVATE LIMITED",
      tagline: "Empowering People | Building Tomorrow",
      workStartTime: "09:30",
      gracePeriodEndTime: "09:45",
      workEndTime: "17:00",
      smtpHost: "smtppro.zoho.in",
      smtpPort: 465,
      smtpUser: "hr@inzovate-technologies.com",
      smtpPass: "Mick@922001",
      smtpFrom: "Inzovate HRMS <hr@inzovate-technologies.com>",
    },
  });

  console.log("=== INZOVATE HRMS: CLEAN SETUP COMPLETED SUCCESSFULLY ===");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
