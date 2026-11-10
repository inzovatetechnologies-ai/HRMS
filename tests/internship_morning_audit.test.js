const test = require("node:test");
const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

test("Internship Permanent Staff Mentorship & Morning Governance Suite", async (t) => {
  const testInternEmail = "audit.intern@inzovate-technologies.com";
  let internRecord = null;

  await t.test("STEP 1: Upsert test intern candidate with assigned permanent employee trainer", async () => {
    internRecord = await prisma.internship.upsert({
      where: { personalEmail: testInternEmail },
      update: {
        trainerId: "INZ-EXEC-005",
        trainerName: "Marimuthu N",
        trainerEmail: "marimuthu@inzovate-technologies.com",
        allocatedBy: "founder@inzovate-technologies.com",
        allocatedAt: new Date(),
        status: "ACTIVE",
      },
      create: {
        internId: "INZ-INT-AUDIT-001",
        fullName: "Audit Candidate Student",
        personalEmail: testInternEmail,
        phone: "+91 91234 56789",
        college: "PSG College of Technology",
        degree: "B.Tech IT",
        graduationYear: 2026,
        domain: "Full Stack & Applied AI",
        batch: "Batch-2026-Q1",
        mentor: "Marimuthu N",
        trainerId: "INZ-EXEC-005",
        trainerName: "Marimuthu N",
        trainerEmail: "marimuthu@inzovate-technologies.com",
        allocatedBy: "founder@inzovate-technologies.com",
        allocatedAt: new Date(),
        startDate: "2026-11-01",
        endDate: "2027-01-31",
        totalFee: 15000,
        amountPaid: 10000,
        remainingBalance: 5000,
        status: "ACTIVE",
      },
    });

    assert.ok(internRecord);
    assert.equal(internRecord.trainerId, "INZ-EXEC-005");
    assert.equal(internRecord.trainerName, "Marimuthu N");
    assert.equal(internRecord.allocatedBy, "founder@inzovate-technologies.com");
  });

  await t.test("STEP 2: Mentor updates morning punch-in, punch-out, and teaching feedback", async () => {
    const today = "2026-11-10";
    const pIn = new Date("2026-11-10T10:00:00+05:30");
    const pOut = new Date("2026-11-10T12:00:00+05:30");

    const record = await prisma.internAttendance.upsert({
      where: {
        internId_date: {
          internId: internRecord.internId,
          date: today,
        },
      },
      update: {
        punchInTime: pIn,
        punchOutTime: pOut,
        workedHours: 2.0,
        status: "PRESENT",
        trainerFeedback: "Covered Next.js 14 App Router, Server Components & Database Indexing",
        internFeedback: "Understood React Suspense, Server Actions, and Cache Revalidation",
        notes: "Marked by Mentor Marimuthu N",
      },
      create: {
        internshipId: internRecord.id,
        internId: internRecord.internId,
        date: today,
        punchInTime: pIn,
        punchOutTime: pOut,
        workedHours: 2.0,
        status: "PRESENT",
        trainerFeedback: "Covered Next.js 14 App Router, Server Components & Database Indexing",
        internFeedback: "Understood React Suspense, Server Actions, and Cache Revalidation",
        notes: "Marked by Mentor Marimuthu N",
      },
    });

    assert.ok(record);
    assert.equal(record.status, "PRESENT");
    assert.equal(record.workedHours, 2.0);
    assert.match(record.trainerFeedback, /Next.js 14/i);
    assert.match(record.internFeedback, /React Suspense/i);
  });

  await t.test("STEP 3: Class Schedule creation with broadcast metadata", async () => {
    const today = "2026-11-10";
    const schedule = await prisma.internDailySchedule.upsert({
      where: {
        internId_date: {
          internId: internRecord.internId,
          date: today,
        },
      },
      update: {
        startTime: "10:00",
        endTime: "12:00",
        topic: "Enterprise Next.js Architecture",
        status: "SCHEDULED",
        trainerId: internRecord.trainerId,
        trainerEmail: internRecord.trainerEmail,
      },
      create: {
        internshipId: internRecord.id,
        internId: internRecord.internId,
        trainerId: internRecord.trainerId,
        trainerEmail: internRecord.trainerEmail,
        date: today,
        startTime: "10:00",
        endTime: "12:00",
        topic: "Enterprise Next.js Architecture",
        status: "SCHEDULED",
      },
    });

    assert.ok(schedule);
    assert.equal(schedule.startTime, "10:00");
    assert.equal(schedule.endTime, "12:00");
    assert.equal(schedule.status, "SCHEDULED");
  });

  await t.test("STEP 4: Clean up test artifacts cleanly", async () => {
    await prisma.internAttendance.deleteMany({
      where: { internId: "INZ-INT-AUDIT-001" },
    });
    await prisma.internDailySchedule.deleteMany({
      where: { internId: "INZ-INT-AUDIT-001" },
    });
    await prisma.internship.deleteMany({
      where: { personalEmail: testInternEmail },
    });
    await prisma.$disconnect();
  });
});
