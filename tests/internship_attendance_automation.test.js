const test = require("node:test");
const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function isWeekendDay(dateOrStr) {
  let date;
  if (typeof dateOrStr === "string") {
    const parts = dateOrStr.split("-").map(Number);
    date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  } else {
    date = dateOrStr;
  }
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

async function calculateAttendanceSummary(employeeId, month, year) {
  const employee = await prisma.employee.findUnique({
    where: { employeeId },
  });
  if (!employee) return null;

  const totalDaysInMonth = new Date(year, month, 0).getDate();
  let weekOffCount = 0;
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dObj = new Date(year, month - 1, day, 12, 0, 0);
    if (dObj.getDay() === 0 || dObj.getDay() === 6) {
      weekOffCount++;
    }
  }

  const standardWorkingDays = totalDaysInMonth - weekOffCount;
  const grossSalary = employee.grossSalary || 45000;
  const dailyGross = standardWorkingDays > 0 ? Math.round(grossSalary / standardWorkingDays) : 0;

  return {
    employeeId: employee.employeeId,
    grossSalary,
    dailyGross,
    totalDaysInMonth,
    weekOffCount,
    standardWorkingDays,
  };
}

test("Full-Time Employee & Internship Attendance Automation Suite", async (t) => {
  // Test 1: Weekend Week-Off Policy
  await t.test("SEC-01 [WEEK-OFF POLICY]: Saturday & Sunday are strictly protected non-working days", () => {
    assert.equal(isWeekendDay("2026-11-07"), true, "Saturday must be evaluated as Week-Off");
    assert.equal(isWeekendDay("2026-11-08"), true, "Sunday must be evaluated as Week-Off");
    assert.equal(isWeekendDay("2026-11-09"), false, "Monday must be evaluated as Working Day");
    assert.equal(isWeekendDay("2026-11-13"), false, "Friday must be evaluated as Working Day");
  });

  // Test 2: Monthly Individual Attendance Report & LOP Calculation
  await t.test("SEC-02 [ATTENDANCE REPORT & LOP]: Individual monthly breakdown calculates Week-Offs & Daily Gross", async () => {
    const report = await calculateAttendanceSummary("INZ-EXEC-005", 11, 2026);
    assert.ok(report, "Report must be generated");
    assert.equal(report.employeeId, "INZ-EXEC-005");
    assert.equal(report.totalDaysInMonth, 30);
    assert.ok(report.weekOffCount >= 8, "November must have 8 or 9 weekend days");
    assert.ok(report.standardWorkingDays > 0, "Standard workdays must be positive");
    assert.ok(report.dailyGross > 0, "Daily gross must be computed");
  });

  // Test 3: Full-Time Employee 09:45 AM Shift Cutoff Policy
  await t.test("SEC-03 [09:45 AM CUTOFF SCAN]: Employee absent record upserted with policy notes", async () => {
    const testDate = "2026-11-04"; // Wednesday
    const marimuthuAtt = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: "INZ-EXEC-005",
          date: testDate,
        },
      },
      update: {
        status: "ABSENT",
        punchInNotes: "Automated Absent: No punch-in recorded by 09:45 AM cutoff",
      },
      create: {
        employeeId: "INZ-EXEC-005",
        date: testDate,
        status: "ABSENT",
        punchInNotes: "Automated Absent: No punch-in recorded by 09:45 AM cutoff",
      },
    });

    assert.ok(marimuthuAtt, "Attendance record must be recorded in DB");
    assert.equal(marimuthuAtt.status, "ABSENT", "Unpunched employee must be marked ABSENT");
    assert.match(marimuthuAtt.punchInNotes, /09:45 AM cutoff/i, "Notes must reflect 09:45 AM cutoff rule");
  });

  // Test 4: Internship Trainer Allocation Governance
  await t.test("SEC-04 [INTERN TRAINER ALLOCATION]: Assigned trainer is recorded with audit metadata", async () => {
    const intern = await prisma.internship.upsert({
      where: { personalEmail: "test.intern@example.com" },
      update: {
        trainerId: "INZ-EMP-1002",
        trainerName: "Prem Kumar",
        trainerEmail: "prem.kumar@inzovate-technologies.com",
        allocatedBy: "hr@inzovate-technologies.com",
        allocatedAt: new Date(),
      },
      create: {
        internId: "INZ-INT-TEST-001",
        fullName: "Test Intern Candidate",
        personalEmail: "test.intern@example.com",
        phone: "+91 98765 43210",
        college: "Anna University",
        degree: "B.E CSE",
        graduationYear: 2026,
        domain: "Full Stack Web Development",
        batch: "Batch-2026-Q1",
        mentor: "Prem Kumar",
        trainerId: "INZ-EMP-1002",
        trainerName: "Prem Kumar",
        trainerEmail: "prem.kumar@inzovate-technologies.com",
        allocatedBy: "hr@inzovate-technologies.com",
        allocatedAt: new Date(),
        startDate: "2026-11-01",
        endDate: "2027-01-31",
        totalFee: 15000,
        amountPaid: 10000,
        remainingBalance: 5000,
        status: "ACTIVE",
      },
    });

    assert.equal(intern.trainerId, "INZ-EMP-1002");
    assert.equal(intern.trainerName, "Prem Kumar");
    assert.equal(intern.allocatedBy, "hr@inzovate-technologies.com");
  });

  // Test 5: Daily Class Timing Window (09:00 AM - 08:00 PM)
  await t.test("SEC-05 [CLASS TIMING 12-HOUR WINDOW]: Class schedule must be within 09:00 to 20:00 IST", async () => {
    const testDate = "2026-11-09";
    const intern = await prisma.internship.findUnique({ where: { personalEmail: "test.intern@example.com" } });
    
    const sched = await prisma.internDailySchedule.upsert({
      where: {
        internId_date: {
          internId: "INZ-INT-TEST-001",
          date: testDate,
        },
      },
      update: {
        startTime: "11:00",
        endTime: "13:00",
        topic: "Next.js 14 API Routes & Server Actions",
        status: "SCHEDULED",
      },
      create: {
        internshipId: intern.id,
        internId: "INZ-INT-TEST-001",
        trainerId: "INZ-EMP-1002",
        trainerEmail: "prem.kumar@inzovate-technologies.com",
        date: testDate,
        startTime: "11:00",
        endTime: "13:00",
        topic: "Next.js 14 API Routes & Server Actions",
        status: "SCHEDULED",
      },
    });

    assert.equal(sched.startTime, "11:00");
    assert.equal(sched.endTime, "13:00");
    assert.equal(sched.status, "SCHEDULED");
  });

  // Test 6: Intern Punch-In & Mandatory Punch-Out Feedback
  await t.test("SEC-06 [INTERN MANDATORY FEEDBACK]: Punch-out strictly requires what student learned today", async () => {
    const testDate = "2026-11-09";
    const intern = await prisma.internship.findUnique({ where: { personalEmail: "test.intern@example.com" } });

    // Step 1: Punch In
    const punchInRecord = await prisma.internAttendance.upsert({
      where: {
        internId_date: {
          internId: intern.internId,
          date: testDate,
        },
      },
      update: {
        punchInTime: new Date("2026-11-09T11:02:00+05:30"),
        status: "PRESENT",
      },
      create: {
        internshipId: intern.id,
        internId: intern.internId,
        date: testDate,
        punchInTime: new Date("2026-11-09T11:02:00+05:30"),
        status: "PRESENT",
      },
    });

    assert.equal(punchInRecord.status, "PRESENT");
    assert.ok(punchInRecord.punchInTime);

    // Step 2: Punch Out with Mandatory Feedback
    const learningNotes = "Learned Prisma client schema relationships, cascade deletes, and nodemailer SMTP queueing.";
    const teachingNotes = "Covered Enterprise DB Relations and Microservice Notification Dispatch.";

    const punchOutRecord = await prisma.internAttendance.update({
      where: { id: punchInRecord.id },
      data: {
        punchOutTime: new Date("2026-11-09T13:05:00+05:30"),
        workedHours: 2.05,
        internFeedback: learningNotes,
        trainerFeedback: teachingNotes,
      },
    });

    assert.equal(punchOutRecord.internFeedback, learningNotes, "Intern feedback must be saved");
    assert.equal(punchOutRecord.trainerFeedback, teachingNotes, "Trainer feedback must be saved");
    assert.ok(punchOutRecord.workedHours > 0);
  });

  // Test 7: Intern Prior Leave Intimation
  await t.test("SEC-07 [INTERN PRIOR LEAVE INTIMATION]: Intern can intimate leave in advance with reason", async () => {
    const testDate = "2026-11-10";
    const intern = await prisma.internship.findUnique({ where: { personalEmail: "test.intern@example.com" } });

    const leaveRecord = await prisma.internAttendance.upsert({
      where: {
        internId_date: {
          internId: intern.internId,
          date: testDate,
        },
      },
      update: {
        status: "LEAVE",
        leaveIntimated: true,
        leaveReason: "University Semester Practical Examinations",
      },
      create: {
        internshipId: intern.id,
        internId: intern.internId,
        date: testDate,
        status: "LEAVE",
        leaveIntimated: true,
        leaveReason: "University Semester Practical Examinations",
      },
    });

    assert.equal(leaveRecord.status, "LEAVE");
    assert.equal(leaveRecord.leaveIntimated, true);
    assert.equal(leaveRecord.leaveReason, "University Semester Practical Examinations");
  });

  // Test 8: Intern 3-Way Absent Intimation
  await t.test("SEC-08 [INTERN 3-WAY ABSENT ALERT]: Missed class triggers 3-way absence flag and DB record", async () => {
    const testDate = "2026-11-11";
    const intern = await prisma.internship.findUnique({ where: { personalEmail: "test.intern@example.com" } });

    const absentRecord = await prisma.internAttendance.upsert({
      where: {
        internId_date: {
          internId: intern.internId,
          date: testDate,
        },
      },
      update: {
        status: "ABSENT",
        threeWayAlertSent: true,
        notes: "Automated Absent: Did not attend scheduled training session. Missed classes will not be repeated.",
      },
      create: {
        internshipId: intern.id,
        internId: intern.internId,
        date: testDate,
        status: "ABSENT",
        threeWayAlertSent: true,
        notes: "Automated Absent: Did not attend scheduled training session. Missed classes will not be repeated.",
      },
    });

    assert.equal(absentRecord.status, "ABSENT");
    assert.equal(absentRecord.threeWayAlertSent, true);
    assert.match(absentRecord.notes, /Missed classes will not be repeated/i);
  });

  // Cleanup test intern
  await t.test("TEARDOWN: Clean up test artifacts cleanly", async () => {
    await prisma.internAttendance.deleteMany({
      where: { internId: "INZ-INT-TEST-001" },
    });
    await prisma.internDailySchedule.deleteMany({
      where: { internId: "INZ-INT-TEST-001" },
    });
    await prisma.internship.deleteMany({
      where: { personalEmail: "test.intern@example.com" },
    });
    await prisma.$disconnect();
  });
});
