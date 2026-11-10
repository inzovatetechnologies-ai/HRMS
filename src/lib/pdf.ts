import { jsPDF } from "jspdf";

export interface PayslipPDFData {
  companyName: string;
  employeeName: string;
  employeeId: string;
  department: string;
  designation: string;
  panNumber?: string;
  bankAccount?: string;
  bankName?: string;
  pfNumber?: string;
  month: string;
  year: number;
  workingDays: number;
  paidDays: number;
  unpaidDays: number;
  // Earnings
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  bonuses: number;
  grossSalary: number;
  // Deductions
  employeePf: number;
  esi: number;
  professionalTax: number;
  tds: number;
  lopDeduction: number;
  totalDeductions: number;
  netSalary: number;
}

export interface CertificatePDFData {
  certificateNumber: string;
  recipientName: string;
  recipientId: string;
  type: string;
  domainOrDept: string;
  duration: string;
  issueDate: string;
  verificationToken: string;
  mentorOrSignatory: string;
}

export interface InternshipLetterPDFData {
  referenceNo: string;
  issueDate: string;
  internName: string;
  internId: string;
  college?: string;
  degree?: string;
  domain: string;
  trainerName?: string;
  startDate: string;
  endDate?: string;
  feeStatus: "CLEARED" | "PENDING";
  totalFee?: number;
  amountPaid?: number;
  remainingBalance?: number;
  verificationToken: string;
}

export function generatePayslipPDF(data: PayslipPDFData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Header Banner
  doc.setFillColor(30, 58, 138); // Inzovate Navy #1E3A8A
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INZOVATE TECHNOLOGIES PRIVATE LIMITED", 14, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("One Platform. Every People Operation. Intelligent Automation.", 14, 20);
  doc.text("Registered Office: Chennai, Tamil Nadu, India | CIN: U72900TN2023PTC158912", 14, 26);

  // Payslip Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`PAYSLIP FOR ${data.month.toUpperCase()} ${data.year}`, 14, 42);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 45, 196, 45);

  // Employee Metadata Grid
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Left Column
  doc.text(`Employee Name:`, 14, 52);
  doc.setFont("helvetica", "bold");
  doc.text(data.employeeName, 52, 52);

  doc.setFont("helvetica", "normal");
  doc.text(`Employee ID:`, 14, 58);
  doc.setFont("helvetica", "bold");
  doc.text(data.employeeId, 52, 58);

  doc.setFont("helvetica", "normal");
  doc.text(`Department:`, 14, 64);
  doc.setFont("helvetica", "bold");
  doc.text(data.department, 52, 64);

  doc.setFont("helvetica", "normal");
  doc.text(`Designation:`, 14, 70);
  doc.setFont("helvetica", "bold");
  doc.text(data.designation, 52, 70);

  // Right Column
  doc.setFont("helvetica", "normal");
  doc.text(`PAN:`, 110, 52);
  doc.setFont("helvetica", "bold");
  doc.text(data.panNumber || "N/A", 145, 52);

  doc.setFont("helvetica", "normal");
  doc.text(`Bank A/C:`, 110, 58);
  doc.setFont("helvetica", "bold");
  doc.text(data.bankAccount ? `XXXX${data.bankAccount.slice(-4)}` : "N/A", 145, 58);

  doc.setFont("helvetica", "normal");
  doc.text(`Working Days:`, 110, 64);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.workingDays} Days`, 145, 64);

  doc.setFont("helvetica", "normal");
  doc.text(`Paid / Unpaid Days:`, 110, 70);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.paidDays} Paid / ${data.unpaidDays} Unpaid`, 145, 70);

  // Earnings & Deductions Tables
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 76, 88, 7, "F");
  doc.rect(108, 76, 88, 7, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("EARNINGS", 18, 81);
  doc.text("AMOUNT (INR)", 74, 81);
  doc.text("DEDUCTIONS", 112, 81);
  doc.text("AMOUNT (INR)", 168, 81);

  let y = 89;
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");

  const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

  // Rows
  const earnings = [
    { label: "Basic Salary", val: data.basicSalary },
    { label: "House Rent Allowance (HRA)", val: data.hra },
    { label: "Special Allowance", val: data.specialAllowance },
    { label: "Conveyance Allowance", val: data.conveyance },
    { label: "Bonuses & Incentives", val: data.bonuses },
  ];

  const deductions = [
    { label: "Provident Fund (EPF)", val: data.employeePf },
    { label: "Employee State Insurance (ESIC)", val: data.esi },
    { label: "Professional Tax (PT)", val: data.professionalTax },
    { label: "Income Tax (TDS)", val: data.tds },
    { label: "Loss of Pay (LOP)", val: data.lopDeduction },
  ];

  for (let i = 0; i < Math.max(earnings.length, deductions.length); i++) {
    const e = earnings[i];
    const d = deductions[i];

    if (e) {
      doc.text(e.label, 18, y);
      doc.text(fmt(e.val), 74, y);
    }
    if (d) {
      doc.text(d.label, 112, y);
      doc.text(fmt(d.val), 168, y);
    }
    y += 7;
  }

  // Totals Bar
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 88, 8, "F");
  doc.rect(108, y, 88, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.text("Total Gross Earnings", 18, y + 5.5);
  doc.text(fmt(data.grossSalary), 74, y + 5.5);

  doc.text("Total Deductions", 112, y + 5.5);
  doc.text(fmt(data.totalDeductions), 168, y + 5.5);

  y += 14;

  // Net Salary Highlight Box
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(14, y, 182, 16, 2, 2, "FD");

  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text("NET SALARY PAYABLE:", 20, y + 10);
  doc.setFontSize(14);
  doc.text(fmt(data.netSalary), 85, y + 10);

  y += 26;

  // Footer / Signatory
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("This is a computer-generated salary document authenticated by Inzovate Technologies Private Limited.", 14, y);
  doc.text("Authorized HR Signatory: Deepa Meenakshi (Head of People Operations)", 14, y + 6);
  doc.text(`Document Reference: INZ-PAY-${data.year}-${data.employeeId}-${Date.now().toString().slice(-4)}`, 14, y + 12);

  return doc;
}

export function generateCertificatePDF(data: CertificatePDFData): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Border Ornament
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);

  doc.setDrawColor(217, 119, 6); // Gold border accent
  doc.setLineWidth(0.8);
  doc.rect(13, 13, 271, 184);

  // Header
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INZOVATE TECHNOLOGIES PRIVATE LIMITED", 148, 32, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("One Platform. Every People Operation. Intelligent Automation.", 148, 39, { align: "center" });

  // Title
  doc.setTextColor(217, 119, 6);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const certTitle =
    data.type === "INTERNSHIP_COMPLETION"
      ? "CERTIFICATE OF INTERNSHIP COMPLETION"
      : "CERTIFICATE OF EXCELLENCE";
  doc.text(certTitle, 148, 55, { align: "center" });

  // Body
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("This is to certify that", 148, 70, { align: "center" });

  // Recipient Name
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(data.recipientName.toUpperCase(), 148, 84, { align: "center" });

  // Description
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(
    `has successfully completed the intensive internship program in`,
    148,
    98,
    { align: "center" }
  );

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(data.domainOrDept, 148, 108, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Duration: ${data.duration} | Issued on: ${data.issueDate}`, 148, 118, { align: "center" });

  doc.text(
    "During this period, their performance, technical acumen, and dedication met enterprise delivery standards.",
    148,
    128,
    { align: "center" }
  );

  // Signatures
  doc.line(40, 160, 100, 160);
  doc.text(data.mentorOrSignatory || "Technical Mentor", 70, 166, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("INZOVATE TECHNOLOGIES", 70, 172, { align: "center" });

  doc.line(197, 160, 257, 160);
  doc.text("Head of People Operations", 227, 166, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("INZOVATE TECHNOLOGIES", 227, 172, { align: "center" });

  // Verification Token
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate No: ${data.certificateNumber}`, 148, 182, { align: "center" });
  doc.text(`Official Verification Token: ${data.verificationToken}`, 148, 187, { align: "center" });

  return doc;
}

export function generateInternshipLetterPDF(data: InternshipLetterPDFData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Outer Subtle Border
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, 194, 281);

  // Top Navy Letterhead Banner
  doc.setFillColor(7, 21, 46); // #07152E
  doc.rect(8, 8, 194, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("INZOVATE TECHNOLOGIES PRIVATE LIMITED", 14, 19);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("One Platform. Every People Operation. Intelligent Enterprise Systems.", 14, 25);
  doc.text("Registered Office: Chennai, Tamil Nadu, India | CIN: U62011TZ2025PTC036329", 14, 31);

  // Metadata Line: Ref & Date
  let y = 48;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(`Ref: ${data.referenceNo}`, 14, y);
  doc.text(`Date: ${data.issueDate}`, 196, y, { align: "right" });

  y += 10;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);

  // Title / Recipient
  y += 12;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("TO WHOMSOEVER IT MAY CONCERN", 14, y);

  y += 8;
  doc.setFontSize(10.5);
  doc.setTextColor(30, 58, 138);
  doc.text("SUB: OFFICIAL INTERNSHIP COMPLETION & FEE CLEARANCE CERTIFICATE", 14, y);

  // Salutation & Intro
  y += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const introText = `This is to officially certify that ${data.internName.toUpperCase()} (Student ID: ${data.internId}), student of ${data.college || "Engineering & Technology"}, has successfully participated in the specialized industry internship program at Inzovate Technologies Private Limited.`;
  const splitIntro = doc.splitTextToSize(introText, 182);
  doc.text(splitIntro, 14, y);
  y += splitIntro.length * 6 + 4;

  // Internship Domain & Mentor Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Technical Track & Mentorship Particulars:", 18, y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Specialized Domain:`, 18, y + 13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(data.domain, 60, y + 13);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Assigned Mentor / Trainer:`, 18, y + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(data.trainerName || "Senior Enterprise Trainer", 60, y + 20);

  doc.setFont("helvetica", "normal");
  doc.text(`Commencement Date:`, 120, y + 13);
  doc.setFont("helvetica", "bold");
  doc.text(data.startDate, 160, y + 13);

  y += 34;

  // Fee Clearance Statement Box
  const isCleared = (data.remainingBalance || 0) === 0;
  if (isCleared) {
    doc.setFillColor(240, 253, 244); // light green
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, y, 182, 28, 2, 2, "FD");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52); // green 800
    doc.text("FINANCIAL & TUITION FEE CLEARANCE: FULLY CLEARED / NIL DUES", 18, y + 7);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(21, 128, 61);
    const feeText = `The Accounts & Finance Department certifies that the candidate has settled all program tuition and registration fee obligations in full. There are ZERO (NIL) outstanding dues on this candidate's institutional account. Unconditional clearance is granted.`;
    const splitFee = doc.splitTextToSize(feeText, 174);
    doc.text(splitFee, 18, y + 14);
  } else {
    doc.setFillColor(255, 241, 242); // light rose
    doc.setDrawColor(254, 205, 211);
    doc.roundedRect(14, y, 182, 28, 2, 2, "FD");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(159, 18, 57);
    doc.text("FINANCIAL RECORD: PARTIAL PAYMENT PROCESSED", 18, y + 7);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(190, 18, 60);
    doc.text(`Total Program Tuition: Rs. ${(data.totalFee || 6000).toLocaleString("en-IN")}`, 18, y + 14);
    doc.text(`Verified Receipts (Paid): Rs. ${(data.amountPaid || 3000).toLocaleString("en-IN")}`, 18, y + 20);
    doc.setFont("helvetica", "bold");
    doc.text(`Current Pending Balance Due: Rs. ${(data.remainingBalance || 3000).toLocaleString("en-IN")}`, 110, y + 20);
  }

  y += 36;

  // Conduct & Performance Paragraph
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  const conductText = `During the tenure of their internship, ${data.internName} demonstrated exemplary professional conduct, punctual attendance in regular morning and scheduled training sessions, and commendable diligence in practical software and analysis tasks. Their dedication met the enterprise standards of our development cadence.`;
  const splitConduct = doc.splitTextToSize(conductText, 182);
  doc.text(splitConduct, 14, y);
  y += splitConduct.length * 6 + 6;

  const wishText = "We wish them continued excellence and success in all their future academic and professional endeavors.";
  doc.text(wishText, 14, y);

  y += 32;

  // Dual Signatory Block
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);

  // Left Signatory (HR)
  doc.line(18, y, 78, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Deepa Meenakshi", 18, y + 5);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Head of People Operations & HR", 18, y + 10);
  doc.text("Inzovate Technologies Pvt. Ltd.", 18, y + 14);

  // Right Signatory (Founder & MD)
  doc.line(136, y, 196, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Gokul G", 136, y + 5);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Founder & Managing Director", 136, y + 10);
  doc.text("Inzovate Technologies Pvt. Ltd.", 136, y + 14);

  // Verification & Seal Footer
  y += 28;
  doc.setFillColor(248, 250, 252);
  doc.rect(8, 270, 194, 19, "F");
  doc.setDrawColor(226, 232, 240);
  doc.line(8, 270, 202, 270);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(`Digital Verification Token: ${data.verificationToken}`, 14, 276);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Digitally authenticated corporate document. Verify at http://localhost:3000/certificates/verify", 14, 281);
  doc.text("CIN: U62011TZ2025PTC036329 | Chennai, India", 196, 281, { align: "right" });

  return doc;
}
