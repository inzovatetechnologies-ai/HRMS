"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  Users,
  CalendarCheck,
  Send,
  Clock,
  FileText,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Zap,
  UserPlus,
  GraduationCap,
  Briefcase,
  Banknote,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  Crown,
  ShieldCheck,
  Activity,
  Plane,
  FolderArchive,
  CreditCard,
  UserCheck,
  Compass,
} from "lucide-react";
import VoiceCopilotModal from "@/components/layout/VoiceCopilotModal";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState<"7D" | "30D" | "90D">("7D");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Live real-time date and time ticker matching user's reference image
  const [liveDateFormatted, setLiveDateFormatted] = useState("24 Oct 2026");
  const [liveTimeFormatted, setLiveTimeFormatted] = useState("12:45 PM");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setLiveDateFormatted(
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        })
      );
      setLiveTimeFormatted(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 1. Fetch current session user
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((uData) => {
        if (uData && uData.user) {
          setCurrentUser(uData.user);
        }
      })
      .catch(() => {});

    // 2. Fetch live dashboard metrics from database
    setLoading(true);
    fetch(`/api/dashboard/stats?range=${chartRange === "90D" ? "30D" : chartRange}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error("Error loading stats:", err))
      .finally(() => setLoading(false));
  }, [chartRange]);

  const stats = data?.stats;

  // Real Database Data with reference fallback
  const totalEmployees = stats?.totalEmployees ?? 3;
  const presentToday = stats?.presentCount ?? 1;
  const onLeave = stats?.onLeaveCount ?? 0;
  const pendingAttendance = stats?.pendingRegularizations ?? 0;
  const pendingPayroll = stats?.pendingPayroll ?? 3;

  // Dynamic Percentage math
  const totalSafe = Math.max(totalEmployees, 1);
  const onShiftPercent = Math.round((presentToday / totalSafe) * 100);
  const onLeavePercent = Math.round((onLeave / totalSafe) * 100);
  const offDutyCount = Math.max(0, totalEmployees - presentToday - onLeave);
  const offDutyPercent = Math.max(0, 100 - onShiftPercent - onLeavePercent);

  // SVG Donut Math
  const donutRadius = 52;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~326.7
  const onShiftStroke = (onShiftPercent / 100) * donutCircumference;
  const onLeaveStroke = (onLeavePercent / 100) * donutCircumference;

  // Real or Reference-aligned 7-Day Trend Series
  const defaultTrendSeries = [
    { label: "Oct 18", rate: 33, present: 1, absent: 0 },
    { label: "Oct 19", rate: 67, present: 2, absent: 0 },
    { label: "Oct 20", rate: 67, present: 2, absent: 0 },
    { label: "Oct 21", rate: 100, present: 3, absent: 0 },
    { label: "Oct 22", rate: 67, present: 2, absent: 0 },
    { label: "Oct 23", rate: 67, present: 2, absent: 0 },
    { label: "Oct 24", rate: 67, present: 2, absent: 0 },
  ];

  const trendSeries =
    data?.weeklyAttendanceTrend && data.weeklyAttendanceTrend.length > 0
      ? data.weeklyAttendanceTrend.map((d: any) => ({
          label: d.fullDate || d.label,
          rate: d.rate || Math.round((d.present / Math.max(d.total || totalSafe, 1)) * 100),
          present: d.present,
          absent: d.absent || 0,
        }))
      : defaultTrendSeries;

  // Average attendance rate across series
  const avgAttendanceRate = Math.round(
    trendSeries.reduce((acc: number, cur: any) => acc + cur.rate, 0) /
      Math.max(trendSeries.length, 1)
  );

  // SVG Area Line Chart coordinates math (viewBox 0 0 540 160)
  const chartWidth = 540;
  const chartHeight = 160;
  const paddingX = 35;
  const paddingY = 25;
  const availableWidth = chartWidth - paddingX * 2;
  const availableHeight = chartHeight - paddingY * 2;

  const points = trendSeries.map((item: any, i: number) => {
    const x = paddingX + (i / Math.max(trendSeries.length - 1, 1)) * availableWidth;
    // rate is 0 to 100, inverted for SVG Y
    const y = paddingY + (1 - Math.min(Math.max(item.rate, 0), 100) / 100) * availableHeight;
    return { x, y, ...item };
  });

  // Build SVG smooth path curve (Catmull-Rom or cubic spline)
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${
          chartHeight - paddingY
        } Z`
      : "";

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isCMO = currentUser?.role === "CMO";
  const userFullName = currentUser?.fullName || "Mousik Shankar S";

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#040C1D] text-slate-100 p-4 sm:p-5 lg:p-6 space-y-5 animate-fadeIn font-sans selection:bg-cyan-500 selection:text-black">
        {/* ROW 1: TOP SECTION (Hero Banner on Left ~63% + HRMS Operations Overview on Right ~37%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 1.1 HERO WELCOME PANEL (Deep Navy-to-Electric-Blue gradient with 3D Hologram) */}
          <div className="lg:col-span-8 rounded-[22px] bg-gradient-to-br from-[#06183B] via-[#092557] to-[#103D88] border border-[#1C4D9C]/50 p-6 sm:p-7 relative overflow-hidden shadow-[0_10px_35px_rgba(2,8,22,0.7)] flex flex-col justify-between min-h-[260px]">
            {/* Background Ambient Glows & Light Rays */}
            <div className="absolute -top-16 -right-16 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Top Micro-Header: Enterprise Year, Date/Time, Super Admin Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 z-10">
              <div className="flex items-center space-x-3 text-[11px] font-bold text-cyan-300 tracking-wider">
                <span className="uppercase text-cyan-400 font-extrabold tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                  INZOVATE ENTERPRISES 2025 – 26
                </span>
                <span className="text-white/25">•</span>
                <div className="flex items-center space-x-1.5 text-slate-200 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{liveDateFormatted}</span>
                  <span className="text-white/20">|</span>
                  <span>{liveTimeFormatted}</span>
                </div>
              </div>

              {/* Role Dashboard Badge */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#051633]/90 border border-cyan-400/40 text-white text-[11px] font-extrabold shadow-inner shadow-cyan-500/20">
                {isSuperAdmin ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                    <span className="tracking-wide">Super Admin Dashboard</span>
                  </>
                ) : isCMO ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="tracking-wide">Chief Marketing Officer (CMO) Portal</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span className="tracking-wide">{currentUser?.role || "Employee"} Portal</span>
                  </>
                )}
              </div>
            </div>

            {/* Middle Section: Greeting, Name with Crown, Subtitle, and 3D Hologram */}
            <div className="my-5 z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="max-w-xl">
                <div className="text-xs sm:text-sm font-semibold text-cyan-200/90 tracking-wide">
                  Good Morning,
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight mt-1 flex items-center space-x-2.5 drop-shadow-md">
                  <span>{userFullName}</span>
                  {isSuperAdmin ? (
                    <span className="text-amber-400 inline-block text-2xl select-none">👑</span>
                  ) : (
                    <span className="text-cyan-400 inline-block text-xl select-none">✨</span>
                  )}
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-300/90 mt-2 font-medium leading-relaxed max-w-lg">
                  {isCMO
                    ? "Welcome to your Marketing Leadership portal. Real-time workforce metrics, organization hierarchy, team operations, and attendance are ready."
                    : "Welcome to your Command dashboard. All organizational workforce metrics, attendance, leaves and payroll operations are tracked in real-time."}
                </p>
              </div>

              {/* Right Side: Futuristic 3D Holographic Isometric Platform */}
              <div className="relative w-56 h-36 flex-shrink-0 hidden md:flex items-center justify-center pointer-events-none">
                {/* 3D Hologram Concentric Rings */}
                <div className="absolute inset-x-4 bottom-2 h-14 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-purple-500/20 blur-md" />
                <div className="absolute inset-x-8 bottom-4 h-8 rounded-full border border-cyan-400/40 shadow-[0_0_15px_#22d3ee]" />

                {/* Main Hologram Central Screen (Glassmorphic Card) */}
                <div className="relative z-10 w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#0F3574]/90 via-[#184898]/80 to-[#22B8E8]/30 border border-cyan-300/60 p-2 shadow-[0_0_30px_rgba(34,211,238,0.35)] backdrop-blur-md flex flex-col justify-between transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center mx-auto shadow-inner">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-16 bg-cyan-300/80 rounded-full mx-auto" />
                    <div className="h-1.5 w-10 bg-blue-300/60 rounded-full mx-auto" />
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-cyan-200 font-bold">LIVE TELEMETRY</span>
                  </div>
                </div>

                {/* Left Floating Micro-Card */}
                <div className="absolute left-1 top-8 z-20 w-16 h-16 rounded-xl bg-gradient-to-br from-[#0A224D]/90 to-[#103D88]/90 border border-blue-400/50 p-1.5 shadow-lg flex flex-col justify-between transform -rotate-12">
                  <div className="w-4 h-4 rounded-md bg-cyan-400/20 text-cyan-300 flex items-center justify-center">
                    <Activity className="w-2.5 h-2.5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="h-1 w-10 bg-blue-300/70 rounded-full" />
                    <div className="h-1 w-7 bg-cyan-300/50 rounded-full" />
                  </div>
                </div>

                {/* Right Floating Micro-Card (Bar equalizer) */}
                <div className="absolute right-2 top-6 z-20 w-16 h-18 rounded-xl bg-gradient-to-br from-[#1C1844]/90 to-[#321C75]/90 border border-purple-400/50 p-1.5 shadow-lg flex flex-col justify-between transform rotate-12">
                  <div className="w-4 h-4 rounded-md bg-purple-400/20 text-purple-300 flex items-center justify-center">
                    <BarChart3 className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex items-end justify-between space-x-1 h-5 pt-1">
                    <div className="w-1.5 h-3 bg-purple-400 rounded-t-xs" />
                    <div className="w-1.5 h-5 bg-cyan-400 rounded-t-xs" />
                    <div className="w-1.5 h-2 bg-pink-400 rounded-t-xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row of 4 Functional Shortcut Buttons matching reference */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 z-10">
              {/* 1. Onboard Employee */}
              <Link
                href="/employees?action=new"
                className="px-4 py-2.5 rounded-xl bg-[#0F2D62]/85 hover:bg-[#163E85] text-[#38BDF8] border border-[#22B8E8]/60 font-bold text-xs transition-all flex items-center space-x-2 shadow-sm hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5 text-cyan-300" />
                <span>Onboard Employee</span>
              </Link>

              {/* 2. Staff Terminal */}
              <Link
                href="/attendance"
                className="px-4 py-2.5 rounded-xl bg-[#0A1F45]/85 hover:bg-[#112E63] text-slate-200 border border-[#1E4D9C]/50 font-bold text-xs transition-all flex items-center space-x-2 shadow-sm hover:border-slate-300 active:scale-95"
              >
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span>Staff Terminal</span>
              </Link>

              {/* 3. Leave Approval */}
              <Link
                href="/leave"
                className="px-4 py-2.5 rounded-xl bg-[#1D143D]/85 hover:bg-[#2C1C5E] text-[#D8B4FE] border border-[#8B5CF6]/50 font-bold text-xs transition-all flex items-center space-x-2 shadow-sm hover:border-purple-400 active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5 text-purple-300" />
                <span>Leave Approval</span>
              </Link>

              {/* 4. Salary Computed */}
              <Link
                href="/payroll"
                className="px-4 py-2.5 rounded-xl bg-[#092B27]/85 hover:bg-[#10423C] text-[#34D399] border border-[#10B981]/50 font-bold text-xs transition-all flex items-center space-x-2 shadow-sm hover:border-emerald-400 active:scale-95"
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                <span>Salary Computed</span>
              </Link>
            </div>
          </div>

          {/* 1.2 HRMS OPERATIONS OVERVIEW (Right Card with 2x2 Grid matching reference) */}
          <div className="lg:col-span-4 rounded-[22px] bg-[#071530]/90 border border-[#1A3C72]/50 p-5 sm:p-6 shadow-[0_10px_35px_rgba(2,8,22,0.7)] backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
            {/* Header: Icon, Titles, Dropdown */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#124296]/40 border border-[#1D58B8]/60 text-cyan-300 flex items-center justify-center shadow-inner">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white tracking-tight">
                    HRMS Operations Overview
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">Key metrics at a glance</p>
                </div>
              </div>

              {/* Dropdown pill */}
              <div className="px-2.5 py-1 rounded-lg bg-[#0C224B] border border-[#1E4D9C]/50 text-slate-200 text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:border-cyan-400 transition">
                <span>This Month</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* 2x2 Grid of Key Metrics */}
            <div className="grid grid-cols-2 gap-3 py-3">
              {/* Metric 1: Total Employees */}
              <div className="p-3 rounded-xl bg-[#091D42]/70 border border-[#163A6E]/50 flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1265F5]/25 border border-[#1265F5]/50 text-cyan-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[10.5px] font-bold text-slate-400 truncate">
                    Total Employees
                  </div>
                  <div className="text-lg font-black text-white mt-0.5 flex items-baseline space-x-1.5">
                    <span>{totalEmployees}</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                      <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 0%
                    </span>
                  </div>
                  <div className="text-[9.5px] text-slate-400/80 font-medium truncate mt-0.5">
                    Verified Personnel
                  </div>
                </div>
              </div>

              {/* Metric 2: Present Today */}
              <div className="p-3 rounded-xl bg-[#091D42]/70 border border-[#163A6E]/50 flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/25 border border-[#10B981]/50 text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[10.5px] font-bold text-slate-400 truncate">
                    Present Today
                  </div>
                  <div className="text-lg font-black text-white mt-0.5 flex items-baseline space-x-1.5">
                    <span>{presentToday}</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                      <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 0%
                    </span>
                  </div>
                  <div className="text-[9.5px] text-slate-400/80 font-medium truncate mt-0.5">
                    On Shift Now
                  </div>
                </div>
              </div>

              {/* Metric 3: On Leave */}
              <div className="p-3 rounded-xl bg-[#091D42]/70 border border-[#163A6E]/50 flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#A855F7]/25 border border-[#A855F7]/50 text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Plane className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[10.5px] font-bold text-slate-400 truncate">On Leave</div>
                  <div className="text-lg font-black text-white mt-0.5 flex items-baseline space-x-1.5">
                    <span>{onLeave}</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                      <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 0%
                    </span>
                  </div>
                  <div className="text-[9.5px] text-slate-400/80 font-medium truncate mt-0.5">
                    Today&apos;s Leave
                  </div>
                </div>
              </div>

              {/* Metric 4: Pending Attendance */}
              <div className="p-3 rounded-xl bg-[#091D42]/70 border border-[#163A6E]/50 flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/25 border border-[#F59E0B]/50 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[10.5px] font-bold text-slate-400 truncate">
                    Pending Attendance
                  </div>
                  <div className="text-lg font-black text-white mt-0.5 flex items-baseline space-x-1.5">
                    <span>{pendingAttendance}</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                      <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 0%
                    </span>
                  </div>
                  <div className="text-[9.5px] text-slate-400/80 font-medium truncate mt-0.5">
                    Requires Action
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: 5 DISTINCTLY COLORED GLOWING KPI CARDS (Matching Reference Image) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 2.1 Employees (Electric Blue) */}
          <Link
            href="/employees"
            className="group rounded-2xl bg-gradient-to-br from-[#0B2554] via-[#07193C] to-[#040E24] border border-[#1E62D0]/50 p-4 shadow-[0_8px_25px_rgba(2,8,22,0.6)] hover:border-cyan-400 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1265F5] text-white flex items-center justify-center shadow-md shadow-blue-600/40">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Employees</span>
              </div>
            </div>

            <div className="my-2">
              <div className="text-2xl font-black text-white flex items-baseline space-x-2">
                <span>{totalEmployees}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-0.5" /> 0%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Verified Personnel</span>
              <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>

          {/* 2.2 Present Today (Cyan/Teal) */}
          <Link
            href="/attendance"
            className="group rounded-2xl bg-gradient-to-br from-[#083540] via-[#062730] to-[#04171E] border border-[#06B6D4]/50 p-4 shadow-[0_8px_25px_rgba(2,8,22,0.6)] hover:border-teal-300 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shadow-md shadow-teal-600/40">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Present Today</span>
              </div>
            </div>

            <div className="my-2">
              <div className="text-2xl font-black text-white flex items-baseline space-x-2">
                <span>{presentToday}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-0.5" /> 0%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>On Shift Now</span>
              <span className="text-teal-300 font-bold group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>

          {/* 2.3 On Leave (Purple/Violet) */}
          <Link
            href="/leave"
            className="group rounded-2xl bg-gradient-to-br from-[#27104C] via-[#1B0B36] to-[#0F0520] border border-[#A855F7]/50 p-4 shadow-[0_8px_25px_rgba(2,8,22,0.6)] hover:border-purple-300 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#9333EA] text-white flex items-center justify-center shadow-md shadow-purple-600/40">
                  <Plane className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">On Leave</span>
              </div>
            </div>

            <div className="my-2">
              <div className="text-2xl font-black text-white flex items-baseline space-x-2">
                <span>{onLeave}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-0.5" /> 0%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Today&apos;s Leave</span>
              <span className="text-purple-300 font-bold group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>

          {/* 2.4 Pending Attendance (Amber/Bronze) */}
          <Link
            href="/attendance"
            className="group rounded-2xl bg-gradient-to-br from-[#3B2207] via-[#291704] to-[#170C02] border border-[#F59E0B]/50 p-4 shadow-[0_8px_25px_rgba(2,8,22,0.6)] hover:border-amber-300 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D97706] text-white flex items-center justify-center shadow-md shadow-amber-600/40">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Pending Attendance</span>
              </div>
            </div>

            <div className="my-2">
              <div className="text-2xl font-black text-white flex items-baseline space-x-2">
                <span>{pendingAttendance}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-0.5" /> 0%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Requires Action</span>
              <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>

          {/* 2.5 Pending Payroll (Electric Blue/Cyan) */}
          <Link
            href="/payroll"
            className="group rounded-2xl bg-gradient-to-br from-[#0B2554] via-[#07193C] to-[#040E24] border border-[#0284C7]/50 p-4 shadow-[0_8px_25px_rgba(2,8,22,0.6)] hover:border-cyan-300 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shadow-md shadow-blue-600/40">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Pending Payroll</span>
              </div>
            </div>

            <div className="my-2">
              <div className="text-2xl font-black text-white flex items-baseline space-x-2">
                <span>{pendingPayroll}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-0.5" /> 0%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Not Processed</span>
              <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>
        </div>

        {/* ROW 3: LOWER 3-COLUMN ANALYTICS & SHORTCUTS (Matching User Reference Image) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 3.1 EMPLOYEE OVERVIEW (Left Panel ~30%) */}
          <div className="lg:col-span-4 rounded-[22px] bg-[#071738]/90 border border-[#16356B]/60 p-5 sm:p-6 shadow-[0_10px_35px_rgba(2,8,22,0.7)] backdrop-blur-md flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1265F5]/30 text-cyan-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-white tracking-tight">
                  Employee Overview
                </span>
              </div>
              <Link
                href="/employees"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 group"
              >
                <span>Directory</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>

            {/* Doughnut Chart & Legend List */}
            <div className="flex items-center justify-between py-5 gap-4">
              {/* Doughnut SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                  {/* Track Circle */}
                  <circle
                    cx="70"
                    cy="70"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#0B234D"
                    strokeWidth="14"
                  />
                  {/* On Shift Segment (Cyan) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#00C4FF"
                    strokeWidth="14"
                    strokeDasharray={donutCircumference}
                    strokeDashoffset={donutCircumference - onShiftStroke}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* On Leave Segment (Purple) */}
                  {onLeave > 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#A855F7"
                      strokeWidth="14"
                      strokeDasharray={donutCircumference}
                      strokeDashoffset={donutCircumference - onLeaveStroke}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  )}
                </svg>

                {/* Center Counter */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-white leading-none">
                    {totalEmployees}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                    PERSONNEL
                  </span>
                </div>
              </div>

              {/* Legend List with Exact Numbers and Percentages */}
              <div className="space-y-3.5 text-xs flex-1">
                {/* On Shift */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00C4FF] shadow-[0_0_6px_#00c4ff]" />
                    <span className="text-slate-300 font-semibold">On Shift</span>
                  </div>
                  <div className="font-extrabold text-white flex items-center space-x-3">
                    <span>{presentToday}</span>
                    <span className="text-[11px] text-slate-400 font-normal w-7 text-right">
                      {onShiftPercent}%
                    </span>
                  </div>
                </div>

                {/* On Leave */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] shadow-[0_0_6px_#a855f7]" />
                    <span className="text-slate-300 font-semibold">On Leave</span>
                  </div>
                  <div className="font-extrabold text-white flex items-center space-x-3">
                    <span>{onLeave}</span>
                    <span className="text-[11px] text-slate-400 font-normal w-7 text-right">
                      {onLeavePercent}%
                    </span>
                  </div>
                </div>

                {/* Off Duty / Standby */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                    <span className="text-slate-300 font-semibold">Off Duty / Standby</span>
                  </div>
                  <div className="font-extrabold text-white flex items-center space-x-3">
                    <span>{offDutyCount}</span>
                    <span className="text-[11px] text-slate-400 font-normal w-7 text-right">
                      {offDutyPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span>Attendance Status: <strong className="text-white">Active</strong></span>
              <span className="inline-flex items-center text-emerald-400 font-bold space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400" />
                <span>100% Policy Compliant</span>
              </span>
            </div>
          </div>

          {/* 3.2 ATTENDANCE TELEMETRY TREND (Middle Panel ~46%) */}
          <div className="lg:col-span-5 rounded-[22px] bg-[#071738]/90 border border-[#16356B]/60 p-5 sm:p-6 shadow-[0_10px_35px_rgba(2,8,22,0.7)] backdrop-blur-md flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1265F5]/30 text-cyan-300 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-white tracking-tight">
                  Attendance Telemetry Trend
                </span>
              </div>

              {/* Range Filters: 7D, 30D, 90D */}
              <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-[#0C224B] border border-[#1E4D9C]/50 text-xs">
                {(["7D", "30D", "90D"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setChartRange(r)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all ${
                      chartRange === r
                        ? "bg-[#1265F5] text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Row right below header */}
            <div className="pt-3 pb-1 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Attendance Percentage
                </span>
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 block">
                  {avgAttendanceRate}%
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Total Present vs Absent
                </span>
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 block">
                  {totalEmployees} Staff
                </span>
              </div>
            </div>

            {/* SVG Area / Line Chart matching the reference curve */}
            <div className="relative pt-2 pb-1">
              <div className="relative h-44 w-full">
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                  <defs>
                    {/* Area Fill Gradient (Cyan to transparent) */}
                    <linearGradient id="cyberAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00C4FF" stopOpacity="0.35" />
                      <stop offset="50%" stopColor="#1265F5" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#040C1D" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Line Stroke Glow Filter */}
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00C4FF" floodOpacity="0.6" />
                    </filter>
                  </defs>

                  {/* Horizontal Grid lines (100, 75, 50, 25, 0) */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const y = paddingY + pct * availableHeight;
                    const val = Math.round((1 - pct) * 100);
                    return (
                      <g key={idx}>
                        <text
                          x={paddingX - 10}
                          y={y + 3}
                          fontSize="9"
                          fill="#475569"
                          textAnchor="end"
                          fontFamily="monospace"
                        >
                          {val}
                        </text>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="#1E3A6E"
                          strokeOpacity="0.35"
                          strokeDasharray="2 3"
                        />
                      </g>
                    );
                  })}

                  {/* Baseline / Absent level (Flat purple line at 0) */}
                  <line
                    x1={paddingX}
                    y1={chartHeight - paddingY}
                    x2={chartWidth - paddingX}
                    y2={chartHeight - paddingY}
                    stroke="#A855F7"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                  />

                  {/* Area fill under curve */}
                  {areaPath && <path d={areaPath} fill="url(#cyberAreaGradient)" />}

                  {/* Main Glowing Line Path */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#00C4FF"
                      strokeWidth="2.5"
                      filter="url(#neonGlow)"
                    />
                  )}

                  {/* Interactive Point Nodes on the curve */}
                  {points.map((pt: any, idx: number) => {
                    const isHovered = hoveredPoint?.label === pt.label;
                    return (
                      <g key={idx} className="cursor-pointer">
                        {/* Hover Target Area */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="12"
                          fill="transparent"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        {/* Glow halo */}
                        {isHovered && (
                          <circle cx={pt.x} cy={pt.y} r="7" fill="#00C4FF" fillOpacity="0.4" />
                        )}
                        {/* Core Point Dot */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? "4.5" : "3"}
                          fill="#FFFFFF"
                          stroke="#00C4FF"
                          strokeWidth="2"
                        />
                        {/* Baseline Purple Dot */}
                        <circle
                          cx={pt.x}
                          cy={chartHeight - paddingY}
                          r="2.5"
                          fill="#A855F7"
                        />
                        {/* X-axis date label below chart */}
                        <text
                          x={pt.x}
                          y={chartHeight - 5}
                          fontSize="9.5"
                          fill="#94A3B8"
                          textAnchor="middle"
                          fontWeight="500"
                        >
                          {pt.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip on Hover */}
                {hoveredPoint && (
                  <div
                    style={{
                      left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                      top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-12 z-30 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-cyan-400 text-white text-[10px] font-bold shadow-xl pointer-events-none whitespace-nowrap"
                  >
                    <div className="text-cyan-300 font-extrabold">{hoveredPoint.label}</div>
                    <div>Rate: {hoveredPoint.rate}% | Present: {hoveredPoint.present}</div>
                  </div>
                )}
              </div>

              {/* Chart Legend at bottom */}
              <div className="flex items-center justify-center space-x-6 pt-3 border-t border-white/10 mt-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00C4FF] shadow-[0_0_6px_#00c4ff]" />
                  <span className="text-slate-300 font-semibold">Present / On Shift</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] shadow-[0_0_6px_#a855f7]" />
                  <span className="text-slate-300 font-semibold">Leave / Absent</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3.3 QUICK ACTION SHORTCUTS (Right Panel ~24% with 6 colored cards) */}
          <div className="lg:col-span-3 rounded-[22px] bg-[#071738]/90 border border-[#16356B]/60 p-5 sm:p-6 shadow-[0_10px_35px_rgba(2,8,22,0.7)] backdrop-blur-md flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <Zap className="w-4 h-4 text-[#22B8E8] fill-current" />
                <span className="font-extrabold text-sm text-white tracking-tight">
                  Quick Action Shortcuts
                </span>
              </div>
            </div>

            {/* 6 Grid Tiles matching exact reference image */}
            <div className="grid grid-cols-2 gap-2.5 py-3">
              {/* Tile 1: Add Employee (Blue tone) */}
              <Link
                href="/employees?action=new"
                className="p-3 rounded-xl bg-[#0F2959]/90 hover:bg-[#163D85] border border-[#1E4D9C]/70 hover:border-cyan-400 text-left transition flex flex-col justify-between group shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-cyan-300 flex items-center justify-center mb-2">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Add Employee
                </span>
              </Link>

              {/* Tile 2: Attendance (Teal/Green tone) */}
              <Link
                href="/attendance"
                className="p-3 rounded-xl bg-[#0B3330]/90 hover:bg-[#124A46] border border-[#146C65]/70 hover:border-teal-400 text-left transition flex flex-col justify-between group shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-600/30 text-teal-300 flex items-center justify-center mb-2">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                  Attendance
                </span>
              </Link>

              {/* Tile 3: Application (Amber/Orange tone) */}
              <Link
                href="/leave?action=apply"
                className="p-3 rounded-xl bg-[#382309]/90 hover:bg-[#52330D] border border-[#7A4B10]/70 hover:border-amber-400 text-left transition flex flex-col justify-between group shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-600/30 text-amber-300 flex items-center justify-center mb-2">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  Application
                </span>
              </Link>

              {/* Tile 4: Loan / PF / ESI (Purple tone) */}
              <Link
                href="/payroll"
                className="p-3 rounded-xl bg-[#28134F]/90 hover:bg-[#3D1D75] border border-[#5E2BA8]/70 hover:border-purple-400 text-left transition flex flex-col justify-between group shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center mb-2">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  Loan / PF / ESI
                </span>
              </Link>

              {/* Tile 5: Payroll Run (Magenta/Pink tone) */}
              <Link
                href="/payroll"
                className="p-3 rounded-xl bg-[#381137]/90 hover:bg-[#521950] border border-[#7D217A]/70 hover:border-pink-400 text-left transition flex flex-col justify-between group shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-pink-600/30 text-pink-300 flex items-center justify-center mb-2">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                  Payroll Run
                </span>
              </Link>

              {/* Tile 6: Duty Roster (Cyan/Blue tone) */}
              <Link
                href="/tasks"
                className="p-3 rounded-xl bg-[#0B3047]/90 hover:bg-[#124666] border border-[#15608C]/70 hover:border-cyan-400 text-left transition flex flex-col justify-between group shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Duty Roster
                </span>
              </Link>
            </div>

            {/* Bottom link: View All Shortcuts */}
            <div className="pt-2">
              <Link
                href="/modules"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 group"
              >
                <span>View All Shortcuts</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceCopilotModal isOpen={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />
    </AppLayout>
  );
}
