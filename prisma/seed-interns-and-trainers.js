const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");

const prisma = new PrismaClient();

const ODS_PATH = "C:/Users/Lakshmi prabha S/.gemini/antigravity/brain/ecd3abe5-0545-465e-b0b9-f27249af3451/.user_uploaded/media_1794320071795_676bcfbf.ods";

function cleanFirstName(fullName) {
  const clean = fullName.replace(/[^a-zA-Z]/g, " ").trim().split(/\s+/)[0];
  if (!clean) return "User";
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

async function seed() {
  console.log("=== INZOVATE SEED: TRAINERS & INTERNS ===");

  // 1. ADD / UPSERT TRAINERS (PERMANENT EMPLOYEES)
  const trainersData = [
    {
      employeeId: "INZ-EMP-101",
      firstName: "Shalinipriya",
      lastName: "J",
      companyEmail: "jaganchitra1972@gmail.com",
      passwordRaw: "Shalini@2026",
      department: "Engineering & Technology",
      designation: "Software Developer & Mentor",
      phone: "+91 94432 10101",
      specialization: "Software Development",
    },
    {
      employeeId: "INZ-EMP-102",
      firstName: "Yogalakshmi",
      lastName: "S",
      companyEmail: "yogalaksmiofficial31@gmail.com",
      passwordRaw: "Yoga@2026",
      department: "Data & Analytics",
      designation: "Data Analyst & Mentor",
      phone: "+91 94432 10102",
      specialization: "Data Analytics",
    },
    {
      employeeId: "INZ-EMP-103",
      firstName: "Divya",
      lastName: "Ramar",
      companyEmail: "divyaramar5@gmail.com",
      passwordRaw: "Divya@2026",
      department: "Cloud & Infrastructure",
      designation: "Cloud Engineer & Mentor",
      phone: "+91 94432 10103",
      specialization: "Cloud Architecture",
    },
  ];

  const createdTrainers = {};

  for (const t of trainersData) {
    const passwordHash = await bcrypt.hash(t.passwordRaw, 10);

    const user = await prisma.user.upsert({
      where: { email: t.companyEmail },
      update: {
        passwordHash,
        fullName: `${t.firstName} ${t.lastName}`,
        role: "EMPLOYEE",
        department: t.department,
        designation: t.designation,
        phone: t.phone,
        isActive: true,
      },
      create: {
        email: t.companyEmail,
        passwordHash,
        fullName: `${t.firstName} ${t.lastName}`,
        role: "EMPLOYEE",
        department: t.department,
        designation: t.designation,
        phone: t.phone,
        isActive: true,
      },
    });

    const emp = await prisma.employee.upsert({
      where: { employeeId: t.employeeId },
      update: {
        firstName: t.firstName,
        lastName: t.lastName,
        companyEmail: t.companyEmail,
        department: t.department,
        designation: t.designation,
        phone: t.phone,
        employmentType: "Full-time",
        employmentStatus: "Active",
      },
      create: {
        employeeId: t.employeeId,
        userId: user.id,
        firstName: t.firstName,
        lastName: t.lastName,
        companyEmail: t.companyEmail,
        department: t.department,
        designation: t.designation,
        phone: t.phone,
        dateOfJoining: "2026-06-01",
        employmentType: "Full-time",
        employmentStatus: "Active",
      },
    });

    createdTrainers[t.specialization] = {
      user,
      employee: emp,
      fullName: `${t.firstName} ${t.lastName}`,
      email: t.companyEmail,
      employeeId: t.employeeId,
      password: t.passwordRaw,
    };
    console.log(`[TRAINER CREATED] ${t.firstName} ${t.lastName} (${t.employeeId}) | Email: ${t.companyEmail} | Pass: ${t.passwordRaw}`);
  }

  // 2. PARSE SPREADSHEET FOR INTERNS
  const wb = XLSX.readFile(ODS_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  let currentSection = "Software Developer";
  const internsToAdd = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    if (row[2] === "Data Analyst") {
      currentSection = "Data Analyst";
      continue;
    }
    if (row[0] === "Name" || row[1] === "Mobile Number") continue;
    const name = (row[0] || "").toString().trim();
    if (!name || name === "null") continue;

    // Check Exclusion List: Arun Kumar T / Arunkumar D and Govarthani K
    const nameLower = name.toLowerCase();
    if (nameLower.includes("arun kumar") || nameLower.includes("arunkumar") || nameLower.includes("govarthani")) {
      console.log(`[EXCLUDED AS REQUESTED]: ${name}`);
      continue;
    }

    const phone = row[1] ? row[1].toString().trim() : "+91 98765 00000";
    const joinDate = (row[2] || "01.09.2026").toString().trim();
    const endDate = (row[3] || "01.12.2026").toString().trim();
    const feeStatus = (row[4] || "Full paid").toString().trim();
    const feePending = Number(row[5]) || 0;
    const emailCandidate = (row[7] || row[6] || "").toString().trim();
    const email = emailCandidate.includes("@") ? emailCandidate : `${cleanFirstName(name).toLowerCase()}@inzovate-candidate.com`;

    // Special Rule: Naveen V K must be Cloud!
    let domain = currentSection;
    if (nameLower.includes("naveen v k") || nameLower.includes("naveen vk")) {
      domain = "Cloud Architecture";
      console.log(`[DOMAIN SPECIAL ROUTE]: ${name} -> Cloud Architecture`);
    } else if (domain === "Software Developer") {
      domain = "Software Development";
    } else if (domain === "Data Analyst") {
      domain = "Data Analytics";
    }

    internsToAdd.push({
      fullName: name,
      phone,
      joinDate,
      endDate,
      feeStatus,
      feePending,
      email,
      domain,
    });
  }

  console.log(`\nAdding ${internsToAdd.length} interns to Database...`);

  let internIndex = 2; // INZ-INT-2026-002 onwards
  const seededInterns = [];

  for (const it of internsToAdd) {
    const internId = `INZ-INT-2026-${String(internIndex).padStart(3, "0")}`;
    internIndex++;

    const firstName = cleanFirstName(it.fullName);
    const passwordRaw = `${firstName}@2026`;
    const passwordHash = await bcrypt.hash(passwordRaw, 10);

    // Determine assigned Trainer
    let assignedTrainer = createdTrainers[it.domain] || createdTrainers["Software Development"];

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: it.email },
      update: {
        fullName: it.fullName,
        passwordHash,
        role: "INTERN",
        department: it.domain,
        designation: `${it.domain} Intern`,
        phone: it.phone,
        isActive: true,
      },
      create: {
        email: it.email,
        fullName: it.fullName,
        passwordHash,
        role: "INTERN",
        department: it.domain,
        designation: `${it.domain} Intern`,
        phone: it.phone,
        isActive: true,
      },
    });

    const isPartialFee = it.feePending > 0;
    const totalFee = isPartialFee ? it.feePending * 2 : 15000;
    const amountPaid = isPartialFee ? totalFee - it.feePending : 15000;
    const remainingBalance = isPartialFee ? it.feePending : 0;

    // Upsert Internship
    const internship = await prisma.internship.upsert({
      where: { personalEmail: it.email },
      update: {
        fullName: it.fullName,
        phone: it.phone,
        domain: it.domain,
        trainerId: assignedTrainer.employeeId,
        trainerName: assignedTrainer.fullName,
        trainerEmail: assignedTrainer.email,
        mentor: assignedTrainer.fullName,
        allocatedBy: "founder@inzovate-technologies.com",
        allocatedAt: new Date(),
        startDate: it.joinDate,
        endDate: it.endDate,
        totalFee,
        amountPaid,
        remainingBalance,
        paymentStatus: remainingBalance === 0 ? "PAID" : "PARTIAL",
        status: "ACTIVE",
      },
      create: {
        internId,
        fullName: it.fullName,
        personalEmail: it.email,
        phone: it.phone,
        college: "Anna University / Affiliated Institution",
        degree: "B.E / B.Tech / BCA",
        graduationYear: 2026,
        domain: it.domain,
        batch: "Batch-2026-Q1",
        trainerId: assignedTrainer.employeeId,
        trainerName: assignedTrainer.fullName,
        trainerEmail: assignedTrainer.email,
        mentor: assignedTrainer.fullName,
        allocatedBy: "founder@inzovate-technologies.com",
        allocatedAt: new Date(),
        startDate: it.joinDate,
        endDate: it.endDate,
        totalFee,
        amountPaid,
        remainingBalance,
        paymentStatus: remainingBalance === 0 ? "PAID" : "PARTIAL",
        status: "ACTIVE",
      },
    });

    seededInterns.push({
      internId: internship.internId,
      name: internship.fullName,
      email: internship.personalEmail,
      password: passwordRaw,
      domain: internship.domain,
      trainer: assignedTrainer.fullName,
      trainerEmail: assignedTrainer.email,
      balance: remainingBalance,
    });
  }

  console.log(`\nSuccessfully seeded ${seededInterns.length} interns!`);
  return { trainers: createdTrainers, interns: seededInterns };
}

seed()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
