"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { generatePayslipPDF } from "@/lib/pdf";
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Building2,
  Calendar,
  X,
} from "lucide-react";

export default function PayslipsPage() {
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/payroll/payslips")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPayslips(data.payslips || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPDF = (slip: any) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthStr = monthNames[slip.month - 1] || `Month-${slip.month}`;

    const doc = generatePayslipPDF({
      companyName: "INZOVATE TECHNOLOGIES PRIVATE LIMITED",
      employeeName: `${slip.employee?.firstName} ${slip.employee?.lastName}`,
      employeeId: slip.employeeId,
      department: slip.employee?.department || "Operations",
      designation: slip.employee?.designation || "Staff",
      panNumber: slip.employee?.panNumber,
      bankAccount: slip.employee?.bankAccount,
      month: monthStr,
      year: slip.year,
      workingDays: slip.workingDays,
      paidDays: slip.paidDays,
      unpaidDays: slip.unpaidDays,
      basicSalary: slip.basicSalary,
      hra: slip.hra,
      specialAllowance: slip.specialAllowance,
      conveyance: slip.conveyance,
      bonuses: 0,
      grossSalary: slip.grossSalary,
      employeePf: slip.employeePf,
      esi: slip.esi,
      professionalTax: slip.professionalTax,
      tds: slip.tds,
      lopDeduction: slip.lopDeduction,
      totalDeductions: slip.totalDeductions,
      netSalary: slip.netSalary,
    });

    doc.save(`Inzovate_Payslip_${slip.employeeId}_${monthStr}_${slip.year}.pdf`);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Salary Statements &amp; Payslips</h2>
            <p className="text-xs text-slate-500">
              Tamper-proof computer-generated payslips authenticated by Inzovate Technologies Private Limited.
            </p>
          </div>
        </div>

        {/* Payslips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {payslips.length === 0 ? (
            <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              No published payslips found. Run monthly payroll first.
            </div>
          ) : (
            payslips.map((slip: any) => (
              <div
                key={slip.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Month {slip.month} / {slip.year}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {slip.employeeId}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {slip.employee?.firstName} {slip.employee?.lastName}
                    </h3>
                    <p className="text-xs text-slate-500">{slip.employee?.designation}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Net Take-Home:</span>
                    <span className="font-mono font-bold text-base text-emerald-700">
                      ₹{slip.netSalary.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Gross: ₹{slip.grossSalary.toLocaleString("en-IN")}</span>
                    <span>Deductions: ₹{slip.totalDeductions.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSlip(slip)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPDF(slip)}
                    className="flex-1 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Slip</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detailed Slip View Modal */}
        {selectedSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">INZOVATE TECHNOLOGIES — SALARY SLIP</h3>
                  <p className="text-xs text-blue-200">
                    Period: {selectedSlip.month}/{selectedSlip.year} • {selectedSlip.employee?.firstName} {selectedSlip.employee?.lastName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="p-1 rounded text-blue-200 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Earnings & Deductions Tables */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Earnings */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                      Earnings
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><span>Basic Salary:</span><span className="font-mono font-semibold">₹{selectedSlip.basicSalary.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>HRA:</span><span className="font-mono font-semibold">₹{selectedSlip.hra.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Special Allowance:</span><span className="font-mono font-semibold">₹{selectedSlip.specialAllowance.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Conveyance:</span><span className="font-mono font-semibold">₹{selectedSlip.conveyance.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                        <span>Total Gross:</span>
                        <span className="font-mono">₹{selectedSlip.grossSalary.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-rose-800 uppercase tracking-wide border-b border-slate-200 pb-1">
                      Deductions
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><span>EPF (Employee):</span><span className="font-mono font-semibold text-rose-600">-₹{selectedSlip.employeePf.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>ESIC:</span><span className="font-mono font-semibold text-rose-600">-₹{selectedSlip.esi.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Professional Tax:</span><span className="font-mono font-semibold text-rose-600">-₹{selectedSlip.professionalTax.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Income Tax (TDS):</span><span className="font-mono font-semibold text-rose-600">-₹{selectedSlip.tds.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between"><span>Loss of Pay (LOP):</span><span className="font-mono font-semibold text-rose-600">-₹{selectedSlip.lopDeduction.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                        <span>Total Deductions:</span>
                        <span className="font-mono text-rose-600">-₹{selectedSlip.totalDeductions.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Payout Banner */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-sm">Net Payable Salary:</span>
                  <span className="font-mono font-extrabold text-xl text-blue-950">
                    ₹{selectedSlip.netSalary.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(selectedSlip)}
                  className="px-4 py-2 text-xs font-semibold bg-blue-900 text-white rounded-xl hover:bg-blue-800 flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Document</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
