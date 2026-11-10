const test = require("node:test");
const assert = require("node:assert");

// Import compiled or transpiled attendance logic or test boundary functions directly
function evaluatePunchIn(istTimeString) {
  const [h, m, s] = istTimeString.split(":").map(Number);
  const minutesFromMidnight = h * 60 + m;
  const graceCutoff = 9 * 60 + 45; // 09:45 AM IST

  const isAfterGrace = minutesFromMidnight > graceCutoff || (minutesFromMidnight === graceCutoff && s > 0);

  if (isAfterGrace) {
    const lateMinutes = minutesFromMidnight - graceCutoff;
    return { status: "ABSENT", isLate: true, lateMinutes };
  }
  return { status: "PRESENT", isLate: false, lateMinutes: 0 };
}

function evaluatePunchOut(punchInStr, punchOutStr) {
  const [inH, inM] = punchInStr.split(":").map(Number);
  const [outH, outM] = punchOutStr.split(":").map(Number);

  const inMins = inH * 60 + inM;
  const outMins = outH * 60 + outM;

  const workedHours = (outMins - inMins) / 60;
  const shiftEndMins = 17 * 60; // 5:00 PM IST
  const earlyMinutes = Math.max(0, shiftEndMins - outMins);

  return { workedHours, earlyMinutes };
}

test("Attendance Timing Boundaries: 09:30 AM Shift Start", () => {
  const res = evaluatePunchIn("09:30:00");
  assert.strictEqual(res.status, "PRESENT");
  assert.strictEqual(res.isLate, false);
  assert.strictEqual(res.lateMinutes, 0);
});

test("Attendance Timing Boundaries: 09:45:00 AM Inclusive Grace Period Cutoff", () => {
  const res = evaluatePunchIn("09:45:00");
  assert.strictEqual(res.status, "PRESENT", "09:45:00 inclusive boundary must be marked PRESENT");
  assert.strictEqual(res.isLate, false);
  assert.strictEqual(res.lateMinutes, 0);
});

test("Attendance Timing Boundaries: 09:45:01 AM Past Grace Period", () => {
  const res = evaluatePunchIn("09:45:01");
  assert.strictEqual(res.status, "ABSENT", "09:45:01 must trigger ABSENT per default policy");
  assert.strictEqual(res.isLate, true);
});

test("Attendance Timing Boundaries: 09:46:00 AM Late Arrival", () => {
  const res = evaluatePunchIn("09:46:00");
  assert.strictEqual(res.status, "ABSENT");
  assert.strictEqual(res.isLate, true);
  assert.strictEqual(res.lateMinutes, 1);
});

test("Attendance Timing Boundaries: 09:55:00 AM (10 Minutes Late)", () => {
  const res = evaluatePunchIn("09:55:00");
  assert.strictEqual(res.status, "ABSENT");
  assert.strictEqual(res.isLate, true);
  assert.strictEqual(res.lateMinutes, 10);
});

test("Punch Out Duration: Full Shift 09:30 AM to 05:00 PM (17:00)", () => {
  const res = evaluatePunchOut("09:30", "17:00");
  assert.strictEqual(res.workedHours, 7.5);
  assert.strictEqual(res.earlyMinutes, 0);
});

test("Punch Out Duration: Early Departure at 04:30 PM (16:30)", () => {
  const res = evaluatePunchOut("09:30", "16:30");
  assert.strictEqual(res.workedHours, 7);
  assert.strictEqual(res.earlyMinutes, 30);
});
