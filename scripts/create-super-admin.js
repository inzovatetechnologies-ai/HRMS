#!/usr/bin/env node

/**
 * Inzovate HRMS — Secure First Super Admin Creation Script
 * Usage: node scripts/create-super-admin.js <email> <fullName> <password>
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const COMPANY_DOMAIN = "inzovate-technologies.com";

async function createSuperAdmin() {
  const args = process.argv.slice(2);
  const email = (args[0] || "admin@inzovate-technologies.com").trim().toLowerCase();
  const fullName = args[1] || "Executive Super Admin";
  const password = args[2] || "Inzovate@2026";

  if (!email.endsWith(`@${COMPANY_DOMAIN}`)) {
    console.error(`\x1b[31mError: Super Admin email must end with @${COMPANY_DOMAIN}\x1b[0m`);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("\x1b[31mError: Password must be at least 8 characters long.\x1b[0m");
    process.exit(1);
  }

  console.log(`\x1b[36mProvisioning Super Admin account for: ${email}\x1b[0m`);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      role: "SUPER_ADMIN",
      passwordHash,
      isActive: true,
      emailVerified: true,
    },
    create: {
      email,
      fullName,
      role: "SUPER_ADMIN",
      passwordHash,
      department: "Executive Leadership",
      designation: "Managing Director & Super Admin",
      isActive: true,
      emailVerified: true,
    },
  });

  const empCount = await prisma.employee.count();
  const employeeId = `INZ-EMP-${1000 + empCount + 1}`;

  await prisma.employee.upsert({
    where: { userId: user.id },
    update: {
      companyEmail: email,
      employmentStatus: "Active",
    },
    create: {
      employeeId,
      userId: user.id,
      firstName: fullName.split(" ")[0] || "Super",
      lastName: fullName.split(" ")[1] || "Admin",
      companyEmail: email,
      department: "Executive Leadership",
      designation: "Managing Director & Super Admin",
      dateOfJoining: new Date().toISOString().split("T")[0],
      employmentType: "Full-time",
      employmentStatus: "Active",
      workLocation: "Chennai Headquarters",
      basicSalary: 150000,
      hra: 75000,
      specialAllowance: 50000,
      conveyance: 5000,
      grossSalary: 280000,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      userEmail: email,
      action: "SUPER_ADMIN_PROVISIONED",
      module: "SECURITY",
      details: `Super Admin account initialized securely via CLI for ${fullName}`,
      ipAddress: "127.0.0.1",
    },
  });

  console.log(`\x1b[32m✔ Super Admin provisioned successfully!\x1b[0m`);
  console.log(`Email: ${email}`);
  console.log(`Employee ID: ${employeeId}`);
  console.log(`Role: SUPER_ADMIN (Full system access)`);
}

createSuperAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
