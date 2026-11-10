"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Banknote,
  Plus,
  CheckCircle2,
  AlertCircle,
  Receipt,
  FileCheck2,
  ShieldCheck,
  X,
} from "lucide-react";

export default function InternshipFinancePage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<any | null>(null);

  // Payment form state
  const [amount, setAmount] = useState(5000);
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptSuccess, setReceiptSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/internship");
      const json = await res.json();
      if (json.success) {
        setInternships(json.internships || []);
        setSummary(json.summary || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntern) return;

    try {
      const res = await fetch("/api/internship/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internshipId: selectedIntern.id,
          amount,
          paymentMode,
          transactionRef,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Payment recording failed.");
      } else {
        setReceiptSuccess(`Payment of ₹${amount} recorded! Generated official receipt: ${json.receiptNumber}`);
        setPayModalOpen(false);
        setSelectedIntern(null);
        setTransactionRef("");
        loadData();
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Financial Audit &amp; Reconciliation Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Internship Fee Collections &amp; Ledger</h2>
            <p className="text-xs text-slate-500">
              Formula: <strong>Remaining Balance = Total Payable − Confirmed Payments − Approved Discounts</strong>
            </p>
          </div>
        </div>

        {/* Feedback receipt */}
        {receiptSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{receiptSuccess}</span>
          </div>
        )}

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Enrolled Interns</span>
            <div className="text-2xl font-bold text-slate-900">{summary?.totalInterns ?? 0}</div>
            <div className="text-[11px] text-slate-400">Paid and subsidized students</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Confirmed Collections</span>
            <div className="text-2xl font-bold text-emerald-700">
              ₹{summary?.totalCollected?.toLocaleString("en-IN") ?? 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">Verified into Inzovate bank account</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Outstanding Balance</span>
            <div className="text-2xl font-bold text-amber-600">
              ₹{summary?.totalOutstanding?.toLocaleString("en-IN") ?? 0}
            </div>
            <div className="text-[11px] text-amber-700 font-medium">Pending collection installments</div>
          </div>
        </div>

        {/* Student Fee Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Student Fee Ledger</h3>
            <span className="text-xs text-slate-400 font-medium">Reconciled Installments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Intern ID</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Domain</th>
                  <th className="px-5 py-3.5">Total Fee (₹)</th>
                  <th className="px-5 py-3.5">Paid So Far (₹)</th>
                  <th className="px-5 py-3.5">Remaining Balance (₹)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {internships.map((intern) => (
                  <tr key={intern.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-900">{intern.internId}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{intern.fullName}</div>
                      <div className="text-[10px] text-slate-400">{intern.personalEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{intern.domain}</td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">
                      ₹{intern.totalFee.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-emerald-700">
                      ₹{intern.amountPaid.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-amber-700">
                      ₹{intern.remainingBalance.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          intern.paymentStatus === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {intern.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {intern.remainingBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIntern(intern);
                            setAmount(intern.remainingBalance);
                            setPayModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-900 text-white font-semibold text-xs hover:bg-blue-800 transition"
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Payment Installment Modal */}
        {payModalOpen && selectedIntern && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Record Fee Installment</h3>
                <button onClick={() => setPayModalOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <div><strong>Student:</strong> {selectedIntern.fullName} ({selectedIntern.internId})</div>
                <div><strong>Outstanding Balance:</strong> ₹{selectedIntern.remainingBalance.toLocaleString("en-IN")}</div>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Payment Amount (INR ₹)</label>
                  <input
                    type="number"
                    max={selectedIntern.remainingBalance}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="UPI">UPI (GPay/PhonePe)</option>
                      <option value="NetBanking">Net Banking (NEFT/IMPS)</option>
                      <option value="Card">Debit/Credit Card</option>
                      <option value="Cash">Cash Receipt</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Bank / Txn Reference</label>
                    <input
                      type="text"
                      required
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="UPI-12345678"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Verification Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Verified against bank statement credit..."
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-semibold bg-blue-900 text-white rounded-xl hover:bg-blue-800"
                  >
                    Confirm &amp; Issue Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
