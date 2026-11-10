const test = require("node:test");
const assert = require("node:assert");

function calculatePayroll({ basicSalary, hra, specialAllowance, conveyance = 0, workingDays = 22, unpaidDays = 0 }) {
  const grossSalary = basicSalary + hra + specialAllowance + conveyance;

  // EPF 12% capped at 1800
  const employeePf = Math.min(Math.round(basicSalary * 0.12), 1800);

  // ESIC 0.75% if gross <= 21000
  const esi = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;

  // Professional Tax
  let professionalTax = 0;
  if (grossSalary > 15000) professionalTax = 208;
  else if (grossSalary > 10000) professionalTax = 100;

  // Loss of Pay
  const lopDeduction = unpaidDays > 0 ? Math.round((grossSalary / workingDays) * unpaidDays) : 0;

  const totalDeductions = employeePf + esi + professionalTax + lopDeduction;
  const netSalary = grossSalary - totalDeductions;

  return { grossSalary, employeePf, esi, professionalTax, lopDeduction, totalDeductions, netSalary };
}

test("Indian Statutory Payroll: Standard Full-Time Salary Breakdown", () => {
  const p = calculatePayroll({
    basicSalary: 40000,
    hra: 20000,
    specialAllowance: 10000,
    conveyance: 3000,
    workingDays: 22,
    unpaidDays: 0,
  });

  assert.strictEqual(p.grossSalary, 73000);
  assert.strictEqual(p.employeePf, 1800, "EPF capped at statutory ₹1,800");
  assert.strictEqual(p.esi, 0, "ESIC not applicable above ₹21,000 gross ceiling");
  assert.strictEqual(p.professionalTax, 208, "Tamil Nadu PT slab applied");
  assert.strictEqual(p.lopDeduction, 0);
  assert.strictEqual(p.totalDeductions, 2008);
  assert.strictEqual(p.netSalary, 70992);
});

test("Indian Statutory Payroll: Loss of Pay (LOP) for 2 Unpaid Days", () => {
  const p = calculatePayroll({
    basicSalary: 40000,
    hra: 20000,
    specialAllowance: 10000,
    conveyance: 3000,
    workingDays: 22,
    unpaidDays: 2,
  });

  // (73000 / 22) * 2 = 6636.36 -> 6636
  assert.strictEqual(p.lopDeduction, 6636);
  assert.strictEqual(p.totalDeductions, 2008 + 6636);
  assert.strictEqual(p.netSalary, 73000 - (2008 + 6636));
});

test("Indian Statutory Payroll: Entry Staff with ESIC Eligibility (Gross <= 21,000)", () => {
  const p = calculatePayroll({
    basicSalary: 10000,
    hra: 5000,
    specialAllowance: 3000,
    conveyance: 1000, // Gross = 19,000
    workingDays: 22,
    unpaidDays: 0,
  });

  assert.strictEqual(p.grossSalary, 19000);
  assert.strictEqual(p.esi, Math.round(19000 * 0.0075), "ESIC 0.75% applied when gross <= 21,000");
});
