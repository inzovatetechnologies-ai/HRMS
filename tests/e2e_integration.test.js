const test = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL = "http://localhost:3000";

test("Complete HRMS Suite: End-to-End Functional, Performance & Security Tests", async (t) => {
  let sessionToken = "";
  let userPayload = null;

  await t.test("TC-01 [AUTH]: Login with invalid credentials rejects with 401", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "founder@inzovate-technologies.com",
        password: "IncorrectPassword!#",
      }),
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.ok(data.error);
  });

  await t.test("TC-02 [AUTH]: Login with non-existent user rejects with 401", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent.user@inzovate-technologies.com",
        password: "SomePassword123",
      }),
    });
    assert.strictEqual(res.status, 401);
  });

  await t.test("TC-03 [AUTH]: Valid Super Admin (Founder) login succeeds with 200 and sets session", async () => {
    const startTime = performance.now();
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "founder@inzovate-technologies.com",
        password: "Founder@2026",
      }),
    });
    const duration = performance.now() - startTime;
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token, "Token must be present in response");
    assert.strictEqual(data.user.role, "SUPER_ADMIN");
    assert.strictEqual(data.user.fullName, "Gokul G");
    sessionToken = data.token;
    userPayload = data.user;
    console.log(`      ✓ Login successful in ${duration.toFixed(2)}ms`);
  });

  await t.test("TC-04 [AUTH]: Session verification GET /api/auth/me returns valid user", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.authenticated, true);
    assert.strictEqual(data.user.email, "founder@inzovate-technologies.com");
  });

  await t.test("TC-05 [AUTH]: Unauthenticated access to /api/auth/me returns 401", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    assert.strictEqual(res.status, 401);
  });

  await t.test("TC-06 [DASHBOARD]: Dashboard stats load correctly and measure performance", async () => {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/api/dashboard/stats?range=7D`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const duration = performance.now() - start;
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.stats, "Stats object must be returned");
    assert.ok(typeof data.stats.totalEmployees === "number");
    assert.ok(Array.isArray(data.weeklyAttendanceTrend));
    console.log(`      ✓ Initial Dashboard stats compiled in ${duration.toFixed(2)}ms`);

    // Verify in-memory cache speedup on repeated call
    const cachedStart = performance.now();
    const cachedRes = await fetch(`${BASE_URL}/api/dashboard/stats?range=7D`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const cachedDuration = performance.now() - cachedStart;
    assert.strictEqual(cachedRes.status, 200);
    console.log(`      ✓ Cached Dashboard stats returned in ${cachedDuration.toFixed(2)}ms`);
    assert.ok(cachedDuration < 100, "Cached stats must respond under 100ms");
  });

  await t.test("TC-07 [ORG-CHART]: Employees directory returns lightweight document metadata without large payloads", async () => {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/api/employees`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const duration = performance.now() - start;
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.employees));
    assert.ok(data.employees.length > 0);

    // Verify documents do NOT include raw base64 data URLs in directory listing
    for (const emp of data.employees) {
      if (emp.documents && emp.documents.length > 0) {
        for (const doc of emp.documents) {
          assert.strictEqual(doc.fileUrl, undefined, "Bulk employee directory must not expose raw fileUrl base64");
          assert.ok(doc.category, "Category must be present");
        }
      }
    }
    console.log(`      ✓ Employee hierarchy payload returned in ${duration.toFixed(2)}ms (${data.employees.length} employees)`);
  });

  await t.test("TC-08 [PERFORMANCE]: Rapid Dashboard <-> Org Chart Navigation simulation", async () => {
    // 1. Moving from Dashboard to Org Chart: Fetches employee directory + permissions
    const t0 = performance.now();
    const [empRes, permsRes] = await Promise.all([
      fetch(`${BASE_URL}/api/employees`, { headers: { Authorization: `Bearer ${sessionToken}` } }),
      fetch(`${BASE_URL}/api/permissions`, { headers: { Authorization: `Bearer ${sessionToken}` } }),
    ]);
    const toOrgChartTime = performance.now() - t0;
    assert.strictEqual(empRes.status, 200);
    assert.strictEqual(permsRes.status, 200);

    // 2. Returning from Org Chart to Dashboard: Fetches stats
    const t1 = performance.now();
    const statsRes = await fetch(`${BASE_URL}/api/dashboard/stats?range=7D`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const toDashboardTime = performance.now() - t1;
    assert.strictEqual(statsRes.status, 200);

    console.log(`      ✓ Navigation Dashboard -> Org Chart: ${toOrgChartTime.toFixed(2)}ms`);
    console.log(`      ✓ Navigation Org Chart -> Dashboard: ${toDashboardTime.toFixed(2)}ms`);
    assert.ok(toOrgChartTime < 500, "Dashboard -> Org Chart should load in under 500ms");
    assert.ok(toDashboardTime < 300, "Org Chart -> Dashboard should load in under 300ms");
  });

  await t.test("TC-09 [ATTENDANCE]: Fast-path shift status check for floating widget", async () => {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/api/attendance/list?summary=today`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const duration = performance.now() - start;
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.today);
    console.log(`      ✓ Fast shift status returned in ${duration.toFixed(2)}ms`);
    assert.ok(duration < 250, "Fast-path attendance summary should respond in under 250ms");
  });

  await t.test("TC-10 [LEAVE]: Leave requests list loads properly", async () => {
    const res = await fetch(`${BASE_URL}/api/leave`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.leaveRequests));
  });

  await t.test("TC-11 [PAYROLL]: Payslips list loads correctly for authorized user", async () => {
    const res = await fetch(`${BASE_URL}/api/payroll/payslips`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.payslips));
  });

  await t.test("TC-12 [NOTIFICATIONS]: Notifications and unread count fetch correctly", async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.notifications));
  });

  await t.test("TC-13 [AUTH]: Logout endpoint clears session cleanly", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });
});
