"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Download, FileSpreadsheet, ShieldCheck, Filter, Calendar } from "lucide-react";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const downloadReport = async (type: string, filename: string) => {
    setDownloading(true);
    try {
      let csvContent = "";
      if (type === "ATTENDANCE") {
        const res = await fetch("/api/attendance/list");
        const json = await res.json();
        csvContent = "Date,Employee ID,Employee Name,Punch In,Punch Out,Worked Hours,Late Minutes,Status\n";
        (json.records || []).forEach((r: any) => {
          csvContent += `"${r.date}","${r.employeeId}","${r.employee?.firstName} ${r.employee?.lastName}","${r.punchInTime || ""}","${r.punchOutTime || ""}","${r.workedHours}","${r.lateMinutes}","${r.status}"\n`;
        });
      } else if (type === "PAYROLL") {
        const res = await fetch("/api/payroll/payslips");
        const json = await res.json();
        csvContent = "Month,Year,Employee ID,Employee Name,Gross (INR),PF (INR),ESI (INR),PT (INR),TDS (INR),Net (INR)\n";
        (json.payslips || []).forEach((p: any) => {
          csvContent += `"${p.month}","${p.year}","${p.employeeId}","${p.employee?.firstName} ${p.employee?.lastName}","${p.grossSalary}","${p.employeePf}","${p.esi}","${p.professionalTax}","${p.tds}","${p.netSalary}"\n`;
        });
      } else if (type === "INTERNSHIP") {
        const res = await fetch("/api/internship");
        const json = await res.json();
        csvContent = "Intern ID,Student Name,College,Domain,Total Fee (INR),Paid (INR),Balance (INR),Status\n";
        (json.internships || []).forEach((i: any) => {
          csvContent += `"${i.internId}","${i.fullName}","${i.college}","${i.domain}","${i.totalFee}","${i.amountPaid}","${i.remainingBalance}","${i.paymentStatus}"\n`;
        });
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to export report.");
    } finally {
      setDownloading(false);
    }
  };

  const reportsList = [
    {
      id: "ATTENDANCE",
      title: "Attendance & Exception Register",
      desc: "Daily punch-in, punch-out, worked hours, late minutes, and absent flags.",
      filename: "Inzovate_Attendance_Report_2026.csv",
    },
    {
      id: "PAYROLL",
      title: "Monthly Payroll & Statutory EPF/ESI Register",
      desc: "Gross earnings, PF contributions, ESIC, Professional Tax, TDS withholding, and Net Pay.",
      filename: "Inzovate_Payroll_Statutory_Report_2026.csv",
    },
    {
      id: "INTERNSHIP",
      title: "Internship Fee Ledger & Collections Report",
      desc: "Student-wise enrollment, total payable, confirmed receipts, and remaining balances.",
      filename: "Inzovate_Internship_Fee_Report_2026.csv",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit-Grade Compliance Reporting</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Reports &amp; Analytics Center</h2>
          <p className="text-xs text-slate-500">
            Download verified enterprise datasets in CSV and spreadsheet formats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reportsList.map((rep) => (
            <div
              key={rep.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{rep.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{rep.desc}</p>
              </div>

              <button
                type="button"
                disabled={downloading}
                onClick={() => downloadReport(rep.id, rep.filename)}
                className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Dataset</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
