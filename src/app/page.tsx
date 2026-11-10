"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, GraduationCap, UserCheck, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in, redirect directly to dashboard
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          router.push("/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg">
            IN
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-none">INZOVATE TECHNOLOGIES</h1>
            <p className="text-xs text-blue-300 mt-0.5">Enterprise HRMS & AI Automation</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-300 hidden sm:inline">Country: India | Asia/Kolkata (IST)</span>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>One Platform. Every People Operation. Intelligent Automation.</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            The Complete AI-Powered HRMS for Modern Enterprises
          </h2>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Attendance engine with IST grace period rules, Indian statutory payroll, multi-phase leave workflows, internship financial management, and a multilingual Tamil & English voice copilot.
          </p>
        </div>

        {/* Portal Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto pt-4">
          {/* Internal Staff Portal */}
          <Link
            href="/login?role=EMPLOYEE"
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Company Staff Portal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Super Admin, HR, Team Leads & Employees. Authenticates with authorized <span className="text-blue-300 font-mono">@inzovate-technologies.com</span>.
              </p>
            </div>
            <div className="flex items-center text-xs text-blue-400 font-semibold pt-6 group-hover:text-blue-300">
              <span>Sign In with Company Email</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Intern / Student Portal */}
          <Link
            href="/login?role=INTERN"
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Intern & Student Portal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                60+ Technical domains, track learning tasks, fee installments, receipts, and verified completion certificates. Personal email login allowed.
              </p>
            </div>
            <div className="flex items-center text-xs text-amber-400 font-semibold pt-6 group-hover:text-amber-300">
              <span>Access Student Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Candidate Portal */}
          <Link
            href="/login?role=CANDIDATE"
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Candidate Portal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore open career opportunities at Inzovate Technologies, track recruitment pipeline status, interview schedules, and offers.
              </p>
            </div>
            <div className="flex items-center text-xs text-emerald-400 font-semibold pt-6 group-hover:text-emerald-300">
              <span>Applicant Sign In</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Live Features Highlights */}
        <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300 max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 justify-center">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>9:30-9:45 AM IST Grace Period</span>
          </div>
          <div className="flex items-center space-x-2 justify-center">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>EPF, ESI & PT Payroll</span>
          </div>
          <div className="flex items-center space-x-2 justify-center">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>Tamil & English AI Voice</span>
          </div>
          <div className="flex items-center space-x-2 justify-center">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>QR Verified Certificates</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-400">
        <p>© 2026 INZOVATE TECHNOLOGIES PRIVATE LIMITED. All rights reserved.</p>
        <p className="mt-1 text-[11px] text-slate-500">
          Registered in Chennai, Tamil Nadu, India • Built with Next.js, Prisma ORM, and Intelligent Automation
        </p>
      </footer>
    </div>
  );
}
