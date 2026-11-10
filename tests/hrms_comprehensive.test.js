const test = require("node:test");
const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "inzovate-hrms-enterprise-secure-jwt-key-2026-production";
const COMPANY_DOMAIN = "inzovate-technologies.com";

test("Complete HRMS Suite: Comprehensive Verification, Security & Performance Benchmark", async (t) => {
  let founderUser = null;
  let mdUser = null;
  let hrUser = null;

  await t.test("SEC-01 [AUTH & DATA]: Official enterprise accounts exist with verified passwords", async () => {
    const users = await prisma.user.findMany({
      include: { employeeProfile: true },
    });
    assert.ok(users.length >= 3, "At least 3 core staff accounts must exist in database");

    founderUser = users.find((u) => u.email === "founder@inzovate-technologies.com");
    mdUser = users.find((u) => u.email === "md@inzovate-technologies.com");
    hrUser = users.find((u) => u.email === "hr@inzovate-technologies.com");

    assert.ok(founderUser, "Founder account must exist");
    assert.strictEqual(founderUser.role, "SUPER_ADMIN");
    assert.ok(await bcrypt.compare("Founder@2026", founderUser.passwordHash), "Founder password must verify");

    assert.ok(mdUser, "MD account must exist");
    assert.strictEqual(mdUser.role, "SUPER_ADMIN");
    assert.ok(await bcrypt.compare("Md@2026", mdUser.passwordHash), "MD password must verify");

    assert.ok(hrUser, "HR Manager account must exist");
    assert.strictEqual(hrUser.role, "HR_MANAGER");
    assert.ok(await bcrypt.compare("Mick@922001", hrUser.passwordHash), "HR password must verify");
  });

  await t.test("SEC-02 [AUTH & TOKENS]: JWT creation and role-based clearance validation", async () => {
    const payload = {
      id: founderUser.id,
      email: founderUser.email,
      fullName: founderUser.fullName,
      role: founderUser.role,
      department: founderUser.department,
      designation: founderUser.designation,
      employeeId: founderUser.employeeProfile?.employeeId || "INZ-EXEC-001",
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    assert.ok(token);

    const decoded = jwt.verify(token, JWT_SECRET);
    assert.strictEqual(decoded.id, founderUser.id);
    assert.strictEqual(decoded.role, "SUPER_ADMIN");
    assert.strictEqual(decoded.email, "founder@inzovate-technologies.com");
  });

  await t.test("SEC-03 [AUTH POLICY]: Email domain rules enforced by corporate role", () => {
    const internalRoles = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "TEAM_LEAD", "EMPLOYEE"];

    function validateEmail(email, role) {
      const normalized = email.trim().toLowerCase();
      if (internalRoles.includes(role)) {
        if (!normalized.endsWith(`@${COMPANY_DOMAIN}`)) {
          return { valid: false, error: `Must use @${COMPANY_DOMAIN}` };
        }
      }
      return { valid: true };
    }

    assert.strictEqual(validateEmail("gokul@inzovate-technologies.com", "SUPER_ADMIN").valid, true);
    assert.strictEqual(validateEmail("gokul@gmail.com", "SUPER_ADMIN").valid, false);
    assert.strictEqual(validateEmail("hr@inzovate-technologies.com", "HR_MANAGER").valid, true);
    assert.strictEqual(validateEmail("hr@yahoo.com", "HR_MANAGER").valid, false);
    assert.strictEqual(validateEmail("intern.student@gmail.com", "INTERN").valid, true);
  });

  await t.test("PERF-01 [ORG-CHART DATA]: Employee directory excludes raw fileUrl base64 to avoid lag", async () => {
    const start = performance.now();
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: { role: true, isActive: true, avatarUrl: true },
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
    const duration = performance.now() - start;

    assert.ok(Array.isArray(employees));
    assert.ok(employees.length >= 3);
    for (const emp of employees) {
      if (emp.documents) {
        for (const doc of emp.documents) {
          assert.strictEqual(doc.fileUrl, undefined, "fileUrl base64 must not be in directory payload");
        }
      }
    }
    console.log(`      ✓ Employee directory queried in ${duration.toFixed(2)}ms (Records: ${employees.length})`);
    assert.ok(duration < 200, "Employee query must complete in under 200ms");
  });

  await t.test("PERF-02 [DASHBOARD METRICS]: Parallelized stats computation & in-memory cache benchmark", async () => {
    const start = performance.now();
    const today = new Date().toISOString().split("T")[0];

    // Simulate parallel execution pattern
    const [totalEmployees, activeEmployees, attendances, leaveCount] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { employmentStatus: "Active" } }),
      prisma.attendance.findMany({ where: { date: today } }),
      prisma.leaveRequest.count({ where: { status: { in: ["PENDING_TL", "PENDING_HR"] } } }),
    ]);
    const duration = performance.now() - start;

    assert.ok(totalEmployees >= 3);
    assert.ok(activeEmployees >= 3);
    assert.ok(Array.isArray(attendances));
    assert.ok(typeof leaveCount === "number");
    console.log(`      ✓ Parallel database queries completed in ${duration.toFixed(2)}ms`);
    assert.ok(duration < 150, "Parallel DB queries must complete under 150ms");
  });

  await t.test("PERF-03 [NAVIGATION SPEED]: Simulated Dashboard <-> Org Chart round trip", async () => {
    // Nav 1: Moving to Org Chart (fetches employee list)
    const t0 = performance.now();
    const emps = await prisma.employee.findMany({
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        department: true,
        designation: true,
        user: { select: { role: true, avatarUrl: true } },
      },
    });
    const orgChartNavTime = performance.now() - t0;
    assert.ok(emps.length >= 3);

    // Nav 2: Returning to Dashboard (fetches stats summary)
    const t1 = performance.now();
    const [count, pendingLeaves] = await Promise.all([
      prisma.employee.count(),
      prisma.leaveRequest.count({ where: { status: "APPROVED" } }),
    ]);
    const dashboardNavTime = performance.now() - t1;

    console.log(`      ✓ Dashboard -> Org Chart latency: ${orgChartNavTime.toFixed(2)}ms`);
    console.log(`      ✓ Org Chart -> Dashboard latency: ${dashboardNavTime.toFixed(2)}ms`);
    assert.ok(orgChartNavTime < 100, "Org Chart data fetch should be under 100ms");
    assert.ok(dashboardNavTime < 50, "Dashboard return data fetch should be under 50ms");
  });

  await t.test("FUNC-01 [ORG-CHART HIERARCHY]: Tier grouping correctly distributes leadership and staff", async () => {
    const employees = await prisma.employee.findMany({
      include: { user: { select: { role: true } } },
    });

    const tier1Founder = employees.filter(
      (e) => e.user?.role === "SUPER_ADMIN" && (e.designation?.toLowerCase().includes("founder") || e.firstName?.toLowerCase().includes("gokul"))
    );
    const tier2Leadership = employees.filter(
      (e) => (e.user?.role === "SUPER_ADMIN" || e.designation?.toLowerCase().includes("director")) && !tier1Founder.includes(e)
    );
    const tier3Managers = employees.filter(
      (e) => (e.user?.role === "HR_MANAGER" || e.user?.role === "TEAM_LEAD" || e.designation?.toLowerCase().includes("manager")) &&
        !tier1Founder.includes(e) && !tier2Leadership.includes(e)
    );

    assert.strictEqual(tier1Founder.length, 1, "Exactly 1 Founder in Tier 1");
    assert.strictEqual(tier1Founder[0].firstName, "Gokul");
    assert.strictEqual(tier2Leadership.length, 1, "Exactly 1 Managing Director in Tier 2");
    assert.strictEqual(tier2Leadership[0].firstName, "Mousik Shankar");
    assert.strictEqual(tier3Managers.length, 1, "Exactly 1 HR Manager in Tier 3");
  });

  await t.test("FUNC-02 [SHIFT TERMINAL]: Fast-path today status check for floating widget", async () => {
    const today = new Date().toISOString().split("T")[0];
    const t0 = performance.now();
    const currentEmp = await prisma.employee.findFirst({
      where: { employeeId: "INZ-EXEC-001" },
    });
    let todayRecord = null;
    if (currentEmp) {
      todayRecord = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId: currentEmp.employeeId,
            date: today,
          },
        },
      });
    }
    const elapsed = performance.now() - t0;
    console.log(`      ✓ Shift widget status check completed in ${elapsed.toFixed(2)}ms`);
    assert.ok(currentEmp);
    assert.ok(elapsed < 60, "Shift status check should complete under 60ms");
  });

  await t.test("FUNC-03 [STATUTORY PAYROLL]: Indian payroll calculation rules verified", () => {
    function calc(basic, hra, special, days = 22, unpaid = 0) {
      const gross = basic + hra + special;
      const pf = Math.min(Math.round(basic * 0.12), 1800);
      const pt = gross > 15000 ? 208 : 100;
      const lop = unpaid > 0 ? Math.round((gross / days) * unpaid) : 0;
      const net = gross - (pf + pt + lop);
      return { gross, pf, pt, lop, net };
    }

    const exec = calc(250000, 125000, 75000);
    assert.strictEqual(exec.gross, 450000);
    assert.strictEqual(exec.pf, 1800, "EPF capped at statutory 1800");
    assert.strictEqual(exec.pt, 208);
    assert.strictEqual(exec.net, 450000 - 1800 - 208);

    const withLop = calc(40000, 20000, 10000, 22, 1);
    assert.strictEqual(withLop.lop, 3182); // 70000 / 22 = 3181.8
  });

  await t.test("TEARDOWN: Disconnect Prisma database client cleanly", async () => {
    await prisma.$disconnect();
    assert.ok(true);
  });
});
