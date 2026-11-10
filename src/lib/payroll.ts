/**
 * Inzovate HRMS — Indian Statutory Payroll Calculation Engine
 * Currency: INR (₹)
 * Country: India
 * Compliant with EPF Act, ESI Act, State Professional Tax, and Income Tax (TDS) guidelines.
 */

export interface SalaryInput {
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyance?: number;
  bonuses?: number;
  workingDays?: number;
  paidDays?: number;
  unpaidDays?: number;
  state?: string; // Default: Tamil Nadu
}

export interface PayrollBreakdown {
  // Earnings
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  bonuses: number;
  grossSalary: number;

  // Deductions
  employeePf: number;
  employerPf: number;
  esi: number;
  employerEsi: number;
  professionalTax: number;
  tds: number;
  lopDeduction: number; // Loss of Pay for unapproved absent days
  totalDeductions: number;

  // Final Payout
  netSalary: number;

  // Attendance Context
  workingDays: number;
  paidDays: number;
  unpaidDays: number;

  // Audit breakdown notes
  auditTrail: string[];
}

export function calculatePayroll(input: SalaryInput): PayrollBreakdown {
  const workingDays = input.workingDays ?? 22;
  const unpaidDays = input.unpaidDays ?? 0;
  const paidDays = Math.max(0, workingDays - unpaidDays);

  const basicSalary = Math.round(input.basicSalary);
  const hra = Math.round(input.hra);
  const specialAllowance = Math.round(input.specialAllowance);
  const conveyance = Math.round(input.conveyance ?? 0);
  const bonuses = Math.round(input.bonuses ?? 0);

  const grossSalary = basicSalary + hra + specialAllowance + conveyance + bonuses;

  const auditTrail: string[] = [
    `Gross Salary calculated: ₹${grossSalary.toLocaleString("en-IN")} (Basic: ₹${basicSalary}, HRA: ₹${hra}, Special: ₹${specialAllowance}, Conveyance: ₹${conveyance}, Bonuses: ₹${bonuses})`,
  ];

  // 1. Employee Provident Fund (EPF)
  // Statutory rule: 12% of Basic. In India, minimum cap threshold is 15,000 (₹1,800/mo), but organizations often apply 12% on full basic or cap at 1,800.
  // We apply 12% with standard statutory minimum cap option:
  let employeePf = 0;
  let employerPf = 0;
  if (basicSalary > 0) {
    employeePf = Math.min(Math.round(basicSalary * 0.12), 1800); // Standard statutory cap ₹1,800 or 12%
    employerPf = employeePf;
    auditTrail.push(`EPF Employee contribution (12% capped at ₹1,800): ₹${employeePf}`);
  }

  // 2. Employee State Insurance (ESIC)
  // Statutory threshold: Applicable if Gross Salary <= ₹21,000 per month
  let esi = 0;
  let employerEsi = 0;
  if (grossSalary <= 21000 && grossSalary > 0) {
    esi = Math.round(grossSalary * 0.0075); // 0.75%
    employerEsi = Math.round(grossSalary * 0.0325); // 3.25%
    auditTrail.push(`ESIC applicable (Gross <= ₹21,000): Employee (0.75%) = ₹${esi}, Employer (3.25%) = ₹${employerEsi}`);
  } else {
    auditTrail.push(`ESIC not applicable (Gross ₹${grossSalary} exceeds statutory ceiling of ₹21,000)`);
  }

  // 3. Professional Tax (PT)
  // Tamil Nadu slab: bi-annual slabs prorated or monthly standard slab (₹0, ₹100, ₹208)
  let professionalTax = 0;
  if (grossSalary > 15000) {
    professionalTax = 208;
  } else if (grossSalary > 10000) {
    professionalTax = 100;
  }
  auditTrail.push(`Professional Tax (State Slab): ₹${professionalTax}`);

  // 4. Loss of Pay (LOP) for Unpaid Absences
  let lopDeduction = 0;
  if (unpaidDays > 0 && workingDays > 0) {
    const perDayGross = grossSalary / workingDays;
    lopDeduction = Math.round(perDayGross * unpaidDays);
    auditTrail.push(`Loss of Pay (LOP) for ${unpaidDays} unpaid day(s): ₹${lopDeduction} (${unpaidDays} x ₹${perDayGross.toFixed(2)})`);
  }

  // 5. Tax Deducted at Source (TDS estimate)
  // Projected annual taxable income:
  const annualizedGross = grossSalary * 12;
  let tds = 0;
  if (annualizedGross > 700000) {
    // Under New Tax Regime (Section 115BAC), rebate up to 7L, above that graduated slabs
    const taxableAmount = annualizedGross - 75000; // Standard deduction ₹75,000 in FY 24-25 / 25-26
    if (taxableAmount > 700000) {
      const annualTax = (taxableAmount - 700000) * 0.10 + 20000;
      tds = Math.round((annualTax / 12));
    }
  }
  auditTrail.push(`TDS Income Tax monthly withholding estimate: ₹${tds}`);

  const totalDeductions = employeePf + esi + professionalTax + tds + lopDeduction;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  auditTrail.push(`Total Deductions: ₹${totalDeductions.toLocaleString("en-IN")}`);
  auditTrail.push(`Net Payable Salary: ₹${netSalary.toLocaleString("en-IN")}`);

  return {
    basicSalary,
    hra,
    specialAllowance,
    conveyance,
    bonuses,
    grossSalary,
    employeePf,
    employerPf,
    esi,
    employerEsi,
    professionalTax,
    tds,
    lopDeduction,
    totalDeductions,
    netSalary,
    workingDays,
    paidDays,
    unpaidDays,
    auditTrail,
  };
}
