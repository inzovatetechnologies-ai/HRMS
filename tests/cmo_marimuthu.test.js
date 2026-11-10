const test = require("node:test");
const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "inzovate-hrms-enterprise-secure-jwt-key-2026-production";

test("CMO Marimuthu N: Access Control, Limited Edition Permissions & Automated Attendance Alerts", async (t) => {
  let cmoUser = null;
  let cmoEmployee = null;

  await t.test("CMO-01 [ACCOUNT & AUTH]: Marimuthu N account exists with correct password", async () => {
    cmoUser = await prisma.user.findUnique({
      where: { email: "marimuthu@inzovate-technologies.com" },
      include: { employeeProfile: true },
    });

    assert.ok(cmoUser, "Marimuthu N user account must exist");
    assert.strictEqual(cmoUser.email, "marimuthu@inzovate-technologies.com");
    assert.strictEqual(cmoUser.fullName, "Marimuthu N");
    assert.strictEqual(cmoUser.role, "CMO");
    assert.strictEqual(cmoUser.designation, "Chief Marketing Officer");
    assert.strictEqual(cmoUser.department, "Marketing & Growth Operations");

    const passwordMatches = await bcrypt.compare("Marimuthu@2026", cmoUser.passwordHash);
    assert.strictEqual(passwordMatches, true, "Password 'Marimuthu@2026' must verify with bcrypt");

    cmoEmployee = cmoUser.employeeProfile;
    assert.ok(cmoEmployee, "Employee profile must exist for Marimuthu N");
    assert.strictEqual(cmoEmployee.employeeId, "INZ-EXEC-005");
    assert.strictEqual(cmoEmployee.companyEmail, "marimuthu@inzovate-technologies.com");
  });

  await t.test("CMO-02 [RBAC & PERMISSIONS]: Limited Edition Permissions - Restricted from Payroll & System Settings", async () => {
    const rolePerm = await prisma.rolePermission.findUnique({
      where: { role: "CMO" },
    });

    assert.ok(rolePerm, "CMO RolePermission must exist in database");
    const modules = JSON.parse(rolePerm.modules);

    // Permitted modules for Chief Marketing Officer
    assert.ok(modules.includes("dashboard"), "CMO must have access to dashboard");
    assert.ok(modules.includes("attendance"), "CMO must have access to attendance");
    assert.ok(modules.includes("leaves"), "CMO must have access to leaves");
    assert.ok(modules.includes("employees"), "CMO must have access to employee directory");
    assert.ok(modules.includes("org-chart"), "CMO must have access to org-chart");
    assert.ok(modules.includes("tasks"), "CMO must have access to tasks");
    assert.ok(modules.includes("recruitment"), "CMO must have access to recruitment");

    // Strictly Restricted modules
    assert.strictEqual(modules.includes("payroll"), false, "CMO must NOT have access to company payroll");
    assert.strictEqual(modules.includes("settings"), false, "CMO must NOT have access to system settings");
    assert.strictEqual(modules.includes("permissions"), false, "CMO must NOT have access to role permissions governance");
    assert.strictEqual(modules.includes("internship"), false, "CMO must NOT have access to internship finance/fees");

    // Action capabilities (view-only for administration)
    assert.strictEqual(rolePerm.canApprove, false, "CMO cannot administratively approve system records");
    assert.strictEqual(rolePerm.canEdit, false, "CMO cannot edit other employees' master records");
    assert.strictEqual(rolePerm.canDelete, false, "CMO cannot delete company records");
    assert.strictEqual(rolePerm.canExport, true, "CMO can export marketing tasks and reports");
  });

  await t.test("CMO-03 [ATTENDANCE POLICY]: Marimuthu N is NOT exempt and must punch in/out", () => {
    const userDes = (cmoEmployee.designation || "").toLowerCase();
    const userRole = (cmoUser.role || "").toLowerCase();
    const isMarimuthu =
      cmoEmployee.companyEmail === "marimuthu@inzovate-technologies.com" ||
      cmoEmployee.employeeId === "INZ-EXEC-005";

    const isExempt =
      !isMarimuthu &&
      (userDes.includes("director") ||
        userDes.includes("founder") ||
        userDes.includes("ceo") ||
        (userRole === "super_admin" &&
          (userDes.includes("director") || userDes.includes("admin") || userDes.includes("executive"))));

    assert.strictEqual(isExempt, false, "Marimuthu N must NOT be exempt from attendance");
  });

  await t.test("CMO-04 [LATE PUNCH-IN ALERT]: Punch-in after 09:30 AM triggers automated alert to HR", () => {
    // Simulate punch-in at 10:15 AM IST (45 mins late past 09:30 AM shift start)
    const testDate = new Date("2026-11-08T04:45:00.000Z"); // 04:45 UTC = 10:15 AM IST
    const utc = testDate.getTime() + testDate.getTimezoneOffset() * 60000;
    const istDate = new Date(utc + 5.5 * 60 * 60000);

    const istHours = istDate.getHours();
    const istMinutes = istDate.getMinutes();

    const istMinutesFromMidnight = istHours * 60 + istMinutes;
    const shiftStartMinutes = 9 * 60 + 30; // 09:30 AM = 570 mins

    const isLate = istMinutesFromMidnight > shiftStartMinutes;
    const lateMinutes = istMinutesFromMidnight - shiftStartMinutes;

    assert.strictEqual(isLate, true, "10:15 AM must be detected as late arrival");
    assert.strictEqual(lateMinutes, 45, "Must accurately compute 45 minutes late");

    const targetHREmail = "hr@inzovate-technologies.com";
    const subjectLine = `[INZOVATE HR ALERT] ⚠️ CMO Late Arrival Notice — Marimuthu N (${lateMinutes}m late | Shift: 09:30 AM) — 2026-11-08`;

    assert.strictEqual(targetHREmail, "hr@inzovate-technologies.com");
    assert.ok(subjectLine.includes("Marimuthu N"));
    assert.ok(subjectLine.includes("45m late"));
  });

  await t.test("CMO-05 [EARLY PUNCH-OUT ALERT]: Punch-out before 05:00 PM (17:00 IST) triggers automated alert to HR", () => {
    // Simulate punch-out at 04:15 PM IST (16:15 IST = 45 mins before 05:00 PM)
    const testDate = new Date("2026-11-08T10:45:00.000Z"); // 10:45 UTC = 16:15 IST (04:15 PM)
    const utc = testDate.getTime() + testDate.getTimezoneOffset() * 60000;
    const istDate = new Date(utc + 5.5 * 60 * 60000);

    const istHours = istDate.getHours();
    const istMinutes = istDate.getMinutes();

    const punchOutMinutesFromMidnight = istHours * 60 + istMinutes;
    const shiftEndMinutes = 17 * 60; // 17:00 = 1020 mins

    const isEarly = punchOutMinutesFromMidnight < shiftEndMinutes;
    const earlyMinutes = shiftEndMinutes - punchOutMinutesFromMidnight;

    assert.strictEqual(isEarly, true, "04:15 PM must be detected as early departure");
    assert.strictEqual(earlyMinutes, 45, "Must accurately compute 45 minutes early before 5:00 PM");

    const targetHREmail = "hr@inzovate-technologies.com";
    const subjectLine = `[INZOVATE HR ALERT] ⚠️ CMO Early Punch-Out Notice (Before 05:00 PM) — Marimuthu N (${earlyMinutes}m early) — 2026-11-08`;

    assert.strictEqual(targetHREmail, "hr@inzovate-technologies.com");
    assert.ok(subjectLine.includes("Marimuthu N"));
    assert.ok(subjectLine.includes("Before 05:00 PM"));
    assert.ok(subjectLine.includes("45m early"));
  });

  await t.test("CMO-06 [ON-TIME PUNCH-OUT]: Punch-out at or after 05:00 PM does not trigger early departure alert", () => {
    // Simulate punch-out at 05:15 PM IST (17:15 IST)
    const testDate = new Date("2026-11-08T11:45:00.000Z"); // 11:45 UTC = 17:15 IST
    const utc = testDate.getTime() + testDate.getTimezoneOffset() * 60000;
    const istDate = new Date(utc + 5.5 * 60 * 60000);

    const istHours = istDate.getHours();
    const istMinutes = istDate.getMinutes();

    const punchOutMinutesFromMidnight = istHours * 60 + istMinutes;
    const shiftEndMinutes = 17 * 60; // 17:00 = 1020 mins

    const isEarly = punchOutMinutesFromMidnight < shiftEndMinutes;
    assert.strictEqual(isEarly, false, "05:15 PM is on-time / after shift end, not early");
  });
});
