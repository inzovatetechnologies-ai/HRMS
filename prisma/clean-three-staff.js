const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("=== INZOVATE HRMS: CLEANING TO EXACTLY 3 PROFILES & 0 DEMO CANDIDATES ===");

  // 1. Wipe all candidates in Recruitment ATS
  const deletedCandidates = await prisma.candidate.deleteMany({});
  console.log(`✓ Deleted ${deletedCandidates.count} demo candidate(s).`);

  // 2. Remove non-executive employees (Ananya, Intern, and any other demo staff)
  const targetKeepEmails = [
    "founder@inzovate-technologies.com",
    "md@inzovate-technologies.com",
    "hr@inzovate-technologies.com",
  ];

  // Clean Attendance, Payslips, Tasks, etc. for users being removed to prevent FK errors
  const usersToDelete = await prisma.user.findMany({
    where: {
      email: {
        notIn: targetKeepEmails,
      },
    },
  });

  for (const u of usersToDelete) {
    console.log(`Removing user & related data for: ${u.email} (${u.fullName})`);
    try {
      await prisma.auditLog.deleteMany({ where: { userId: u.id } });
    } catch (e) {}
    try {
      await prisma.attendance.deleteMany({ where: { employee: { userId: u.id } } });
    } catch (e) {}
    try {
      await prisma.payslip.deleteMany({ where: { employee: { userId: u.id } } });
    } catch (e) {}
    try {
      await prisma.leaveRequest.deleteMany({ where: { employee: { userId: u.id } } });
    } catch (e) {}
    try {
      await prisma.performanceReview.deleteMany({ where: { employee: { userId: u.id } } });
    } catch (e) {}
    try {
      await prisma.employee.deleteMany({ where: { userId: u.id } });
    } catch (e) {}
    try {
      await prisma.user.delete({ where: { id: u.id } });
    } catch (e) {}
  }

  // Also remove any employees whose companyEmail is not in the keep list
  const employeesToDelete = await prisma.employee.findMany({
    where: {
      companyEmail: {
        notIn: targetKeepEmails,
      },
    },
  });

  for (const emp of employeesToDelete) {
    try {
      await prisma.attendance.deleteMany({ where: { employeeId: emp.employeeId } });
      await prisma.payslip.deleteMany({ where: { employeeId: emp.employeeId } });
      await prisma.leaveRequest.deleteMany({ where: { employeeId: emp.employeeId } });
      await prisma.performanceReview.deleteMany({ where: { employeeId: emp.employeeId } });
      await prisma.employee.delete({ where: { id: emp.id } });
      console.log(`Deleted employee record: ${emp.employeeId} - ${emp.companyEmail}`);
    } catch (e) {
      console.warn(`Could not delete employee ${emp.employeeId}:`, e.message);
    }
  }

  // 3. Update HR Account: Remove "Shartvesh M" / "சர்வேஸ்" completely!
  // User asked: "HR ஓடது சர்வேஸ்னு போட்டுருப்ப, அது வேணாம். HR க்கு வந்து நியூ தர்ற அந்த லாகின் இருக்கணும். அவங்களோட இதுதான் வந்து எப்பயுமே ஓபன் பண்ற மாதிரி இருக்கணும்."
  const hrPass = await bcrypt.hash("Mick@922001", 10);
  const hrUser = await prisma.user.upsert({
    where: { email: "hr@inzovate-technologies.com" },
    update: {
      fullName: "HR Manager",
      role: "HR_MANAGER",
      department: "Human Resources",
      designation: "Human Resource Manager",
      phone: "+91 98400 11004",
      isActive: true,
      emailVerified: true,
      passwordHash: hrPass,
    },
    create: {
      email: "hr@inzovate-technologies.com",
      passwordHash: hrPass,
      fullName: "HR Manager",
      role: "HR_MANAGER",
      department: "Human Resources",
      designation: "Human Resource Manager",
      phone: "+91 98400 11004",
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.employee.upsert({
    where: { companyEmail: "hr@inzovate-technologies.com" },
    update: {
      userId: hrUser.id,
      firstName: "HR",
      lastName: "Manager",
      department: "Human Resources",
      designation: "Human Resource Manager",
      basicSalary: 85000,
      hra: 42500,
      specialAllowance: 22500,
      grossSalary: 150000,
    },
    create: {
      employeeId: "INZ-EXEC-003",
      userId: hrUser.id,
      firstName: "HR",
      lastName: "Manager",
      companyEmail: "hr@inzovate-technologies.com",
      department: "Human Resources",
      designation: "Human Resource Manager",
      dateOfJoining: "2023-03-01",
      basicSalary: 85000,
      hra: 42500,
      specialAllowance: 22500,
      grossSalary: 150000,
    },
  });

  // Verify Founder (Gokul G)
  const founderPass = await bcrypt.hash("Founder@2026", 10);
  const founderUser = await prisma.user.upsert({
    where: { email: "founder@inzovate-technologies.com" },
    update: {
      fullName: "Gokul G",
      role: "SUPER_ADMIN",
      department: "Executive Board",
      designation: "Founder & Executive Chairman",
      phone: "+91 98400 11001",
      isActive: true,
      emailVerified: true,
      passwordHash: founderPass,
    },
    create: {
      email: "founder@inzovate-technologies.com",
      passwordHash: founderPass,
      fullName: "Gokul G",
      role: "SUPER_ADMIN",
      department: "Executive Board",
      designation: "Founder & Executive Chairman",
      phone: "+91 98400 11001",
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.employee.upsert({
    where: { companyEmail: "founder@inzovate-technologies.com" },
    update: {
      userId: founderUser.id,
      firstName: "Gokul",
      lastName: "G",
      department: "Executive Board",
      designation: "Founder & Executive Chairman",
      basicSalary: 250000,
      hra: 125000,
      specialAllowance: 75000,
      grossSalary: 450000,
    },
    create: {
      employeeId: "INZ-EXEC-001",
      userId: founderUser.id,
      firstName: "Gokul",
      lastName: "G",
      companyEmail: "founder@inzovate-technologies.com",
      department: "Executive Board",
      designation: "Founder & Executive Chairman",
      dateOfJoining: "2023-01-01",
      basicSalary: 250000,
      hra: 125000,
      specialAllowance: 75000,
      grossSalary: 450000,
    },
  });

  // Verify Managing Director (Mousik Shankar S)
  const mdPass = await bcrypt.hash("Md@2026", 10);
  const mdUser = await prisma.user.upsert({
    where: { email: "md@inzovate-technologies.com" },
    update: {
      fullName: "Mousik Shankar S",
      role: "SUPER_ADMIN",
      department: "Corporate Governance",
      designation: "Managing Director",
      phone: "+91 98400 11002",
      isActive: true,
      emailVerified: true,
      passwordHash: mdPass,
    },
    create: {
      email: "md@inzovate-technologies.com",
      passwordHash: mdPass,
      fullName: "Mousik Shankar S",
      role: "SUPER_ADMIN",
      department: "Corporate Governance",
      designation: "Managing Director",
      phone: "+91 98400 11002",
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.employee.upsert({
    where: { companyEmail: "md@inzovate-technologies.com" },
    update: {
      userId: mdUser.id,
      firstName: "Mousik Shankar",
      lastName: "S",
      department: "Corporate Governance",
      designation: "Managing Director",
      basicSalary: 220000,
      hra: 110000,
      specialAllowance: 70000,
      grossSalary: 400000,
    },
    create: {
      employeeId: "INZ-EXEC-002",
      userId: mdUser.id,
      firstName: "Mousik Shankar",
      lastName: "S",
      companyEmail: "md@inzovate-technologies.com",
      department: "Corporate Governance",
      designation: "Managing Director",
      dateOfJoining: "2023-01-01",
      basicSalary: 220000,
      hra: 110000,
      specialAllowance: 70000,
      grossSalary: 400000,
    },
  });

  // 4. Verify Final State
  const remainingUsers = await prisma.user.findMany({
    select: { email: true, fullName: true, role: true },
  });
  const remainingEmployees = await prisma.employee.findMany({
    select: { employeeId: true, companyEmail: true, firstName: true, lastName: true, designation: true },
  });
  const remainingCandidates = await prisma.candidate.count();

  console.log("\n=== FINAL VERIFICATION ===");
  console.log("REMAINING USERS (Count: " + remainingUsers.length + "):", remainingUsers);
  console.log("REMAINING EMPLOYEES (Count: " + remainingEmployees.length + "):", remainingEmployees);
  console.log("CANDIDATES COUNT:", remainingCandidates);
}

main()
  .catch((e) => {
    console.error("Error executing cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
