"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Receipt,
  Laptop,
  HelpCircle,
  FileCheck,
  BookOpen,
  Sparkles,
  Plane,
  HeartHandshake,
  CheckCircle2,
  Send,
  Search,
} from "lucide-react";

export default function ModulesHubPage() {
  const [activeModule, setActiveModule] = useState<"EXPENSES" | "ASSETS" | "HELPDESK" | "POLICY_AI" | "GRIEVANCES">("EXPENSES");

  // Expenses State
  const [expenses, setExpenses] = useState([
    { id: "EXP-101", employee: "Ananya Sharma", category: "Client Lunch & Travel", amount: 2450, status: "APPROVED", date: "2026-10-08" },
    { id: "EXP-102", employee: "Vijay Kumar", category: "AWS Cloud Certification Exam", amount: 12500, status: "PENDING_HR", date: "2026-10-10" },
  ]);
  const [newExpCategory, setNewExpCategory] = useState("Broadband Reimbursement");
  const [newExpAmount, setNewExpAmount] = useState(1500);

  // Helpdesk State
  const [tickets, setTickets] = useState([
    { id: "HD-801", employee: "Rahul Varma", subject: "Request Docker dev environment access", priority: "MEDIUM", status: "RESOLVED" },
    { id: "HD-802", employee: "Priya Nair", subject: "Figma enterprise license renewal", priority: "HIGH", status: "IN_PROGRESS" },
  ]);
  const [newTicketSubject, setNewTicketSubject] = useState("");

  // AI Policy Q&A State
  const [aiQuestion, setAiQuestion] = useState("What is the grace period rule for attendance?");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiAnswer(null);

    try {
      const res = await fetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "POLICY_QA", prompt: aiQuestion }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAnswer(data.answer);
      }
    } catch (err) {
      setAiAnswer("Network error contacting Inzovate AI Handbook service.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenses([
      {
        id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
        employee: "You (Active Session)",
        category: newExpCategory,
        amount: Number(newExpAmount),
        status: "PENDING_HR",
        date: new Date().toISOString().split("T")[0],
      },
      ...expenses,
    ]);
    alert("Expense claim submitted to HR for audit and reimbursement!");
  };

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim()) return;
    setTickets([
      {
        id: `HD-${Math.floor(800 + Math.random() * 100)}`,
        employee: "You (Active Session)",
        subject: newTicketSubject,
        priority: "MEDIUM",
        status: "OPEN",
      },
      ...tickets,
    ]);
    setNewTicketSubject("");
    alert("IT Support ticket dispatched to Helpdesk Queue!");
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Enterprise HRMS Suite — 30 Modules Hub</h2>
          <p className="text-xs text-slate-500">
            Comprehensive business operations: Expenses, IT Assets, Helpdesk, Grievances, and AI Policy Knowledge.
          </p>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveModule("EXPENSES")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeModule === "EXPENSES"
                ? "bg-blue-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Expense Claims</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule("ASSETS")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeModule === "ASSETS"
                ? "bg-blue-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Asset Allocation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule("HELPDESK")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeModule === "HELPDESK"
                ? "bg-blue-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>IT Helpdesk &amp; Tickets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule("POLICY_AI")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeModule === "POLICY_AI"
                ? "bg-blue-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Policy Knowledge Base</span>
          </button>
        </div>

        {/* 1. Expenses Claim Section */}
        {activeModule === "EXPENSES" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Submit New Expense Claim</h3>
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Expense Category</label>
                  <input
                    type="text"
                    required
                    value={newExpCategory}
                    onChange={(e) => setNewExpCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (INR ₹)</label>
                  <input
                    type="number"
                    required
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold transition"
                  >
                    Submit Claim
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
                Expense Claims Register
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Claim ID</th>
                      <th className="px-5 py-3">Employee</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Amount (₹)</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="px-5 py-3 font-mono font-bold text-blue-900">{exp.id}</td>
                        <td className="px-5 py-3 font-semibold text-slate-800">{exp.employee}</td>
                        <td className="px-5 py-3 text-slate-600">{exp.category}</td>
                        <td className="px-5 py-3 font-mono font-bold text-slate-900">
                          ₹{exp.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-3 text-slate-500 font-mono">{exp.date}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              exp.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Asset Allocation Section */}
        {activeModule === "ASSETS" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 animate-fadeIn">
            <h3 className="font-bold text-sm text-slate-900">Company Hardware &amp; Asset Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">MacBook Pro 16&quot; M3 Max</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Allocated</span>
                </div>
                <div className="text-slate-500">Asset Tag: INZ-HW-2024-0012</div>
                <div className="text-slate-700 font-medium">Assigned to: Ananya Sharma (Lead Engineer)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Dell XPS 15 Intel i9</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Allocated</span>
                </div>
                <div className="text-slate-500">Asset Tag: INZ-HW-2024-0015</div>
                <div className="text-slate-700 font-medium">Assigned to: Vijay Kumar (Backend &amp; Cloud)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">iPad Pro 12.9&quot; + Pencil</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Allocated</span>
                </div>
                <div className="text-slate-500">Asset Tag: INZ-HW-2024-0019</div>
                <div className="text-slate-700 font-medium">Assigned to: Priya Nair (UI/UX Design)</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. IT Helpdesk Section */}
        {activeModule === "HELPDESK" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Submit IT Support Ticket</h3>
              <form onSubmit={handleAddTicket} className="flex gap-2 text-xs">
                <input
                  type="text"
                  required
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="Describe your technical or access request..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-300"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-sm"
                >
                  Create Ticket
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
                IT Helpdesk Ticket Queue
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center space-x-2">
                        <span className="font-mono text-blue-900">{t.id}</span>
                        <span>{t.subject}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Raised by: {t.employee}</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        t.status === "RESOLVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. AI Policy Q&A Section */}
        {activeModule === "POLICY_AI" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Inzovate Policy Handbook Neural Search</span>
              </div>
              <h3 className="font-bold text-base text-slate-900">Search HR Policies &amp; Employment Guidelines</h3>
              <p className="text-xs text-slate-500">
                Ask questions regarding grace period boundaries, leave accrual, maternity/paternity policy, EPF/ESI statutory calculations, and overtime.
              </p>
            </div>

            <form onSubmit={handleAskAI} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="e.g. What happens if I punch in at 9:48 AM?"
                  className="w-full px-4 py-3 text-xs rounded-xl border border-slate-300 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500">
                <span className="font-medium">Try asking:</span>
                <button
                  type="button"
                  onClick={() => setAiQuestion("What is the grace period rule for attendance?")}
                  className="text-blue-600 hover:underline"
                >
                  &quot;Grace period rule&quot;
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setAiQuestion("How many casual and sick leaves do employees get?")}
                  className="text-blue-600 hover:underline"
                >
                  &quot;Leave entitlement&quot;
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setAiQuestion("Explain EPF and ESIC statutory deductions in salary.")}
                  className="text-blue-600 hover:underline"
                >
                  &quot;EPF and ESIC rules&quot;
                </button>
              </div>
            </form>

            {aiAnswer && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-2 animate-fadeIn">
                <div className="font-bold flex items-center space-x-1.5 text-blue-900">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  <span>Official Handbook Excerpt:</span>
                </div>
                <div className="leading-relaxed font-medium">{aiAnswer}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
