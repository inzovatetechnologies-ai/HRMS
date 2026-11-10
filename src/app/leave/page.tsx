"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Calendar,
  Briefcase,
  X,
  Filter,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function LeavePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [approverComments, setApproverComments] = useState("");
  const [approverAction, setApproverAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leave");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // Voice command & URL deep-link support: auto-open Apply Leave modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get("action") === "apply" ||
        params.get("action") === "new" ||
        params.get("apply") === "true"
      ) {
        setApplyModalOpen(true);
      }

      const handleOpenEvent = () => setApplyModalOpen(true);
      window.addEventListener("inzovate_open_apply_leave", handleOpenEvent);
      return () => window.removeEventListener("inzovate_open_apply_leave", handleOpenEvent);
    }
  }, []);

  // Auto calculate total working days when start & end date change
  useEffect(() => {
    if (startDate && endDate) {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 >= d1) {
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diffDays);
      }
    }
  }, [startDate, endDate]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setActionLoading(true);

    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveType, startDate, endDate, totalDays, reason }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: json.error || "Failed to apply." });
      } else {
        setFeedback({
          type: "success",
          text: "Leave application submitted! Routed to your Team Leader for Step-1 review.",
        });
        setApplyModalOpen(false);
        setReason("");
        loadLeaves();
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Network error submitting leave." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessApproval = async () => {
    if (!selectedLeave) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/leave/${selectedLeave.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: approverAction, comments: approverComments }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to process approval.");
      } else {
        setApproveModalOpen(false);
        setSelectedLeave(null);
        setApproverComments("");
        setFeedback({
          type: "success",
          text: `Leave request for ${selectedLeave.employee?.firstName} ${approverAction === "APPROVE" ? "approved" : "rejected"} successfully.`,
        });
        loadLeaves();
      }
    } catch (err) {
      alert("Network error processing decision.");
    } finally {
      setActionLoading(false);
    }
  };

  const balances = data?.balances;

  const filteredRequests = (data?.leaveRequests || []).filter((req: any) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return req.status.startsWith("PENDING");
    return req.status === statusFilter;
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Multi-Tier Workflow Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Leave Approvals &amp; Employee Appeals</h2>
            <p className="text-xs text-slate-500">
              Submit your formal leave appeal here. Approvals follow: <strong>Employee Appeal &rarr; Team Leader &rarr; HR Head Sanction</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setApplyModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Appeal / Request Leave</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-start space-x-2.5 animate-fadeIn shadow-xs ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* 4 Leave Quota Balance Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Casual Leave (CL)</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="text-3xl font-black text-blue-900">{balances?.casualLeave ?? 12}</div>
            <div className="text-[11px] text-slate-400">Days available (2026 quota)</div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, ((balances?.casualLeave ?? 12) / 12) * 100)}%` }}
                className="h-full bg-blue-600 rounded-full"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Sick Leave (SL)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-700">{balances?.sickLeave ?? 10}</div>
            <div className="text-[11px] text-slate-400">Medical emergency entitlement</div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, ((balances?.sickLeave ?? 10) / 10) * 100)}%` }}
                className="h-full bg-emerald-600 rounded-full"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Earned Leave (EL)</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            </div>
            <div className="text-3xl font-black text-indigo-700">{balances?.earnedLeave ?? 15}</div>
            <div className="text-[11px] text-slate-400">Annual privilege quota</div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, ((balances?.earnedLeave ?? 15) / 15) * 100)}%` }}
                className="h-full bg-indigo-600 rounded-full"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Remote (WFH) Days</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-700">{balances?.wfhAvailable ?? 24}</div>
            <div className="text-[11px] text-slate-400">Approved remote work quota</div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, ((balances?.wfhAvailable ?? 24) / 24) * 100)}%` }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Leave Requests &amp; Workflow Ledger</h3>
              <p className="text-[11px] text-slate-400">Track multi-level approval progression and comments</p>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Applications</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved &amp; Deducted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Duration Window</th>
                  <th className="px-5 py-3.5">Days</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Workflow Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                      Loading leave applications...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                      No matching leave requests in the system.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req: any) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {req.employee?.firstName} {req.employee?.lastName}
                        </div>
                        <div className="text-[10px] text-slate-400">{req.employee?.department}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{req.leaveType}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">
                        {req.startDate} to {req.endDate}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{req.totalDays}d</td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{req.reason}</td>
                      <td className="px-5 py-3.5">
                        {req.status === "PENDING_TL" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1 w-max">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Step 1: Pending TL Review</span>
                          </span>
                        ) : req.status === "PENDING_HR" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1 w-max">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Step 2: Pending HR Sanction</span>
                          </span>
                        ) : req.status === "APPROVED" ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved &amp; Quota Deducted</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1 w-max">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.status.startsWith("PENDING") && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeave(req);
                              setApproveModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* APPLY FOR LEAVE MODAL */}
        {applyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-900/10 text-blue-900 flex items-center justify-center font-bold">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Apply for Leave</h3>
                    <p className="text-[11px] text-slate-500">Submit planned or medical absence request.</p>
                  </div>
                </div>
                <button onClick={() => setApplyModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Leave Category *</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Casual Leave">Casual Leave (CL)</option>
                    <option value="Sick Leave">Sick Leave (SL)</option>
                    <option value="Earned Leave">Earned / Privilege Leave (EL)</option>
                    <option value="Work From Home">Work From Home (WFH)</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">End Date *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Calculated Working Days</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={totalDays}
                    onChange={(e) => setTotalDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Reason for Leave *</label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide specific reason for absence..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 font-bold bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition shadow-md disabled:opacity-50"
                  >
                    {actionLoading ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* APPROVER REVIEW MODAL */}
        {approveModalOpen && selectedLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-slate-900">
                  Review Leave Application
                </h3>
                <button onClick={() => setApproveModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-slate-700">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName} ({selectedLeave.employee?.department})
                </div>
                <div><strong>Category:</strong> {selectedLeave.leaveType} ({selectedLeave.totalDays} day(s))</div>
                <div><strong>Window:</strong> {selectedLeave.startDate} to {selectedLeave.endDate}</div>
                <div><strong>Reason:</strong> {selectedLeave.reason}</div>
                
                {/* 2-Phase Workflow Status Indicator */}
                <div className="pt-2 border-t border-slate-200">
                  {selectedLeave.status === "PENDING_TL" ? (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-0.5">
                      <div className="font-extrabold flex items-center space-x-1.5 text-xs text-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Step 1 of 2: Team Leader Recommendation</span>
                      </div>
                      <p className="text-[10.5px] text-amber-700">
                        Employee submitted leave request to Team Lead. Approving here will forward this request to HR for Step 2 final sanction.
                      </p>
                    </div>
                  ) : selectedLeave.status === "PENDING_HR" ? (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-0.5">
                      <div className="font-extrabold flex items-center space-x-1.5 text-xs text-blue-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Step 2 of 2: HR Final Sanction</span>
                      </div>
                      <p className="text-[10.5px] text-blue-700">
                        Team Leader has already approved. HR approval will grant final clearance and deduct leave balances.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Approver Decision Comments</label>
                <textarea
                  rows={2}
                  value={approverComments}
                  onChange={(e) => setApproverComments(e.target.value)}
                  placeholder="Reason for approval or rejection note..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApproveModalOpen(false)}
                  className="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setApproverAction("REJECT");
                    handleProcessApproval();
                  }}
                  className="px-4 py-2 font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition shadow-xs"
                >
                  {selectedLeave.status === "PENDING_TL" ? "Reject as TL" : "Reject as HR"}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setApproverAction("APPROVE");
                    handleProcessApproval();
                  }}
                  className="px-4 py-2 font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-xs"
                >
                  {selectedLeave.status === "PENDING_TL"
                    ? "✓ Approve as Team Lead (Forward to HR)"
                    : "✓ Final Sanction by HR (Deduct Leave Quota)"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
