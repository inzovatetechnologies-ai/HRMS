"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Building2,
  Briefcase,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Banknote,
  TrendingUp,
  BarChart3,
  Compass,
  Layers,
  FileText,
  UserPlus,
  Radio,
  FileCheck2,
  Check,
  HelpCircle,
  Activity,
  Shield,
  KeyRound,
  ChevronRight,
  ExternalLink,
  Upload,
  Crown,
  Image as ImageIcon,
  X,
  LockKeyhole,
  Globe,
  Award,
  Cpu,
  RefreshCw,
} from "lucide-react";

interface RoleOption {
  id: string;
  label: string;
  roleCode: string;
  defaultEmail: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  isInternal: boolean;
}

const ROLES: RoleOption[] = [
  {
    id: "HR_MANAGER",
    label: "HR Manager",
    roleCode: "HR_MANAGER",
    defaultEmail: "hr@inzovate-technologies.com",
    badge: "Inzovate HR",
    icon: Users,
    isInternal: true,
  },
  {
    id: "FOUNDER",
    label: "Founder (Super Admin)",
    roleCode: "SUPER_ADMIN",
    defaultEmail: "founder@inzovate-technologies.com",
    badge: "Gokul G (Founder)",
    icon: Crown,
    isInternal: true,
  },
  {
    id: "MD",
    label: "MD (Super Admin)",
    roleCode: "SUPER_ADMIN",
    defaultEmail: "md@inzovate-technologies.com",
    badge: "Mousik Shankar S (MD)",
    icon: ShieldCheck,
    isInternal: true,
  },
];

// 12 High-Impact Enterprise HRMS Capabilities Grid
const HRMS_MODULES = [
  {
    title: "Attendance & Time Tracking",
    desc: "Biometric & Geo-Shift Punch Clock",
    icon: Clock,
  },
  {
    title: "Employee Directory & HR",
    desc: "Comprehensive Org Hierarchy & Profiles",
    icon: Users,
  },
  {
    title: "Leave Workflows & Approvals",
    desc: "Automated Multi-tier Manager Routing",
    icon: CalendarDays,
  },
  {
    title: "Automated Payroll & Forecasting",
    desc: "Statutory PF, ESI, TDS & Direct Disbursal",
    icon: Banknote,
  },
  {
    title: "Performance Management & OKRs",
    desc: "Continuous Reviews & 360° KPI Analytics",
    icon: TrendingUp,
  },
  {
    title: "Reports & HR Intelligence",
    desc: "Real-time Workforce Insights & Exports",
    icon: BarChart3,
  },
  {
    title: "Employee Self-Service Portal",
    desc: "Payslips, Requests & Digital Requests",
    icon: Compass,
  },
  {
    title: "Shift & Roster Management",
    desc: "Dynamic Rotations & Overtime Control",
    icon: Layers,
  },
  {
    title: "Document Vault & E-Sign",
    desc: "Offer Letters, NDAs & Verified ID Proofs",
    icon: FileText,
  },
  {
    title: "Recruitment & ATS Pipeline",
    desc: "Sourcing, Resume Screening & Job Boards",
    icon: Briefcase,
  },
  {
    title: "Onboarding & Offboarding",
    desc: "Digital Checklists & Asset Provisioning",
    icon: UserPlus,
  },
  {
    title: "AI Voice & Copilot Assistant",
    desc: "Multilingual Voice Navigation & Actions",
    icon: Sparkles,
  },
];

// 4 Sophisticated Workforce Statistics Cards
const WORKFORCE_STATS = [
  {
    title: "Active Workforce",
    value: "128+",
    sub: "Configured Personnel Base",
    tag: "System Baseline",
    icon: Users,
    color: "text-[#1769FF]",
    bg: "bg-blue-50/70 border-blue-100",
  },
  {
    title: "Attendance & Shifts",
    value: "09:30 AM",
    sub: "09:45 AM Grace Cutoff (IST)",
    tag: "Shift Policy",
    icon: Clock,
    color: "text-[#087CF5]",
    bg: "bg-sky-50/70 border-sky-100",
  },
  {
    title: "Performance & OKRs",
    value: "96.8%",
    sub: "Quarterly Target Velocity",
    tag: "Enterprise Target",
    icon: TrendingUp,
    color: "text-[#7857FF]",
    bg: "bg-purple-50/70 border-purple-100",
  },
  {
    title: "Security & Compliance",
    value: "AES-256",
    sub: "Role-Based Access Control",
    tag: "Zero-Trust Active",
    icon: ShieldCheck,
    color: "text-[#19C995]",
    bg: "bg-emerald-50/70 border-emerald-100",
  },
];

// Modern Corporate Glass Office Technology Exterior Photo Component
function CorporateArchitectureIllustration() {
  return (
    <div className="relative w-full h-48 sm:h-60 my-3 rounded-2xl overflow-hidden border border-[#DFE8F5] shadow-lg group">
      {/* Real High-Resolution Corporate Exterior Architecture Photo */}
      <img
        src="/images/company-exterior.jpg"
        alt="INZOVATE TECHNOLOGIES Corporate Headquarters Exterior"
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Sophisticated Dark Gradient & Ambient Light Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#071A38]/95 via-[#071A38]/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071A38]/70 via-transparent to-[#071A38]/40 pointer-events-none" />

      {/* Top Left Campus Identification Tag */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#071A38]/90 backdrop-blur-md border border-[#28C5F6]/40 text-white text-[11px] font-bold shadow-md">
          <Building2 className="w-3.5 h-3.5 text-[#28C5F6]" />
          <span>INZOVATE GLOBAL HEADQUARTERS</span>
          <span className="w-2 h-2 rounded-full bg-[#19C995] beacon-pulse ml-0.5" />
        </div>
      </div>

      {/* Top Right Live Radar Badge */}
      <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-slate-200 text-[10px] font-semibold">
        <Activity className="w-3 h-3 text-[#28C5F6]" />
        <span>Enterprise Node Active</span>
      </div>

      {/* Bottom Floating Glassmorphism Telemetry HUD Badges */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2">
        {/* Badge 1: 98.4% On-Shift */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#071A38]/90 backdrop-blur-md border border-[#19C995]/50 shadow-lg hover:border-[#19C995] transition">
          <div className="w-2 h-2 rounded-full bg-[#19C995] beacon-pulse" />
          <div className="text-left">
            <span className="text-[11px] font-extrabold text-white block leading-tight">
              98.4% On-Shift
            </span>
            <span className="text-[9px] text-[#19C995] font-semibold block">
              Biometric Clock Synced
            </span>
          </div>
        </div>

        {/* Badge 2: Automated Payroll */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#071A38]/90 backdrop-blur-md border border-[#28C5F6]/50 shadow-lg hover:border-[#28C5F6] transition">
          <div className="w-2 h-2 rounded-full bg-[#28C5F6]" />
          <div className="text-left">
            <span className="text-[11px] font-extrabold text-white block leading-tight">
              Automated Payroll
            </span>
            <span className="text-[9px] text-cyan-200 font-semibold block">
              PF • ESI • Direct Disbursal
            </span>
          </div>
        </div>

        {/* Badge 3: Zero Friction AI */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#071A38]/90 backdrop-blur-md border border-[#7857FF]/50 shadow-lg hover:border-[#7857FF] transition">
          <div className="w-2 h-2 rounded-full bg-[#7857FF]" />
          <div className="text-left">
            <span className="text-[11px] font-extrabold text-white block leading-tight">
              Zero Friction AI
            </span>
            <span className="text-[9px] text-purple-200 font-semibold block">
              Multilingual Voice Copilot
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Brand Crest / Custom Logo Display Component
function BrandLogoDisplay({
  customLogo,
  className = "w-11 h-11",
}: {
  customLogo: string | null;
  className?: string;
}) {
  const logoSrc = customLogo || "/logo.png";
  return (
    <div
      className={`${className} rounded-2xl bg-white border border-[#DFE8F5] p-1 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0`}
    >
      <img
        src={logoSrc}
        alt="Inzovate Technologies"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

// Inner Authentication Form (handles client hooks and router safely)
function LoginFormInner({ customLogo }: { customLogo: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedRole, setSelectedRole] = useState<RoleOption>(ROLES[0]);
  const [email, setEmail] = useState("hr@inzovate-technologies.com");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Sync with ?role= query parameter from URL
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) {
      const normalizedParam = roleParam.toUpperCase();
      const matched = ROLES.find(
        (r) =>
          r.roleCode === normalizedParam ||
          r.id === normalizedParam ||
          (normalizedParam === "ATS" && r.id === "CANDIDATE") ||
          (normalizedParam === "HR" && r.id === "HR_MANAGER")
      );
      if (matched) {
        setSelectedRole(matched);
        setEmail(matched.defaultEmail);
        setPassword("");
      }
    }
  }, [searchParams]);

  const handleRoleChange = (role: RoleOption) => {
    setSelectedRole(role);
    setEmail(role.defaultEmail);
    setPassword("");
    setError(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Please verify your credentials.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Authorization successful. Entering workspace...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 450);
    } catch (err) {
      setError("Unable to connect to authorization gateway. Please check network connection.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-[490px] bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(7,26,56,0.12)] border border-[#DFE8F5] space-y-5 text-[#10213F] relative overflow-hidden transition-all">
        {/* Subtle top primary gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1769FF] via-[#087CF5] to-[#28C5F6]" />

        {/* Card Brand Header & Security Indicator */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2.5">
            <BrandLogoDisplay customLogo={customLogo} className="w-8 h-8" />
            <span className="font-extrabold text-xs tracking-wider text-[#071A38] uppercase">
              INZOVATE TECHNOLOGIES
            </span>
          </div>

          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1769FF] text-[10px] font-bold">
            <LockKeyhole className="w-3 h-3 text-[#1769FF]" />
            <span>Secure Sign In</span>
          </div>
        </div>

        {/* Welcome Header */}
        <div className="space-y-1 text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#10213F]">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-[#61718B] font-normal">
            Sign in to your authorized Inzovate HRMS workspace.
          </p>
        </div>

        {/* 6-Role Selection Grid (Accessible 3-column layout) */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#61718B] uppercase tracking-wider block">
              Identity Role:
            </label>
            <span className="text-[10px] text-[#1769FF] font-bold">
              {selectedRole.badge}
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Select Identity Role"
            className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#F4F8FF] border border-[#DFE8F5]"
          >
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleRoleChange(role)}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-[#1769FF] ${
                    isSelected
                      ? "bg-[#1769FF] text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/30"
                      : "text-[#61718B] hover:text-[#10213F] hover:bg-white"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#61718B]"}`} />
                  <span className="truncate">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Corporate Domain Policy Card */}
        <div
          className={`p-3 rounded-2xl text-xs flex items-start space-x-2.5 transition border ${
            selectedRole.isInternal
              ? "bg-blue-50/70 border-blue-200/80 text-blue-950"
              : "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
          }`}
        >
          <ShieldCheck
            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              selectedRole.isInternal ? "text-[#1769FF]" : "text-[#19C995]"
            }`}
          />
          <div className="space-y-0.5 text-left">
            <span className="font-extrabold text-[11px] block">
              Corporate Domain
            </span>
            <span className="text-[11px] text-[#61718B] leading-relaxed block font-medium">
              {selectedRole.isInternal
                ? "Use your authorized Inzovate account credentials (@inzovate-technologies.com) to access your workspace."
                : "External access permitted for registered personal or academic emails for active programs."}
            </span>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-800 animate-fadeIn text-left shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2.5 text-xs text-emerald-800 animate-fadeIn text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Primary Authentication Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {/* Email Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-email" className="text-xs font-bold text-[#10213F]">
                Work / Registered Email
              </label>
              <span className="text-[10px] text-[#61718B] font-mono">
                {selectedRole.isInternal ? "@inzovate-technologies.com" : "Authorized Email"}
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#61718B] absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole.isInternal
                    ? "name@inzovate-technologies.com"
                    : "your.name@gmail.com"
                }
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#F8FAFC] border border-[#DFE8F5] text-[#10213F] placeholder-[#61718B]/70 focus:outline-none focus:ring-2 focus:ring-[#1769FF] focus:bg-white focus:border-transparent transition font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-xs font-bold text-[#10213F]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-bold text-[#1769FF] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#61718B] absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-[#F8FAFC] border border-[#DFE8F5] text-[#10213F] placeholder-[#61718B]/70 focus:outline-none focus:ring-2 focus:ring-[#1769FF] focus:bg-white focus:border-transparent transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#61718B] hover:text-[#10213F] focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2 pt-0.5">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#1769FF] rounded border-[#DFE8F5] focus:ring-[#1769FF] cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="text-xs font-medium text-[#61718B] cursor-pointer select-none"
            >
              Remember this device
            </label>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="shimmer-btn w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1769FF] via-[#087CF5] to-[#28C5F6] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 flex items-center justify-center space-x-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#087CF5]"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </span>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-cyan-200" />
                <span>Sign In to INZOVATE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Access Section (Role Shortcuts) */}
        <div className="pt-2 border-t border-slate-100 space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#61718B] uppercase tracking-wider block">
              ⚡ Quick Access (Role Selector):
            </span>
            <span className="text-[10px] text-[#1769FF] font-semibold">Select Role</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {ROLES.slice(1, 6).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`px-2 py-1.5 rounded-xl text-[10px] font-bold border text-center transition truncate ${
                  selectedRole.id === r.id
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-slate-50 hover:bg-slate-100 text-[#61718B] border-slate-200"
                }`}
              >
                {r.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleRoleChange(ROLES[0])}
              className={`px-2 py-1.5 rounded-xl text-[10px] font-bold border text-center transition truncate ${
                selectedRole.id === ROLES[0].id
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-slate-50 hover:bg-slate-100 text-[#61718B] border-slate-200"
              }`}
            >
              Super Admin
            </button>
          </div>
        </div>

        {/* Security Footer in Card */}
        <div className="pt-2 border-t border-slate-100 space-y-2 text-center text-xs text-[#61718B]">
          <div className="flex items-center justify-center space-x-1.5 text-[#10213F] font-medium text-[11px]">
            <Shield className="w-3.5 h-3.5 text-[#19C995]" />
            <span>Your account and workforce information deserve the highest level of protection.</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-[11px] text-[#61718B]">
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "INZOVATE PRIVACY POLICY:\nWorkforce records are stored with AES-256 encryption. Role-Based Access Control (RBAC) ensures data is only visible to authorized personnel."
                );
              }}
              className="hover:text-[#10213F] underline"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "INZOVATE TERMS OF SERVICE:\nAuthorized organizational access only. Continuous audit and access logging are active."
                );
              }}
              className="hover:text-[#10213F] underline"
            >
              Terms of Service
            </a>
            <span>•</span>
            <a
              href="mailto:hr@inzovate-technologies.com"
              className="text-[#1769FF] font-bold hover:underline"
            >
              HR Support
            </a>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#DFE8F5] space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-[#1769FF]" />
                <h3 className="font-extrabold text-base text-[#10213F]">
                  Password Recovery
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#61718B] leading-relaxed">
              To ensure organizational compliance and protect company data, self-service password resets are mediated by authorized HR Operations administrators.
            </p>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
              <span className="font-bold block">Contact HR Operations:</span>
              <span className="block font-mono">hr@inzovate-technologies.com</span>
              <span className="text-[11px] text-[#61718B] block">
                Please mention your Employee ID / Registration Number from your registered email.
              </span>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
              <a
                href="mailto:hr@inzovate-technologies.com?subject=HRMS%20Password%20Reset%20Request"
                className="px-4 py-2 rounded-xl bg-[#1769FF] text-white text-xs font-bold hover:bg-blue-600"
              >
                Send Email to HR
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  const [istTime, setIstTime] = useState("");
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom logo from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("inzovate_custom_logo");
      if (saved) {
        setCustomLogo(saved);
      }
    } catch (e) {
      // LocalStorage access fail safe
    }
  }, []);

  // Live IST Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setIstTime(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Secure Logo File Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type (PNG, JPG, SVG, WebP)
    const validMimes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!validMimes.includes(file.type)) {
      setLogoUploadError("Invalid file type. Please upload a PNG, JPG, or SVG image.");
      return;
    }

    // Validate file size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setLogoUploadError("File is too large. Logo must be under 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        setCustomLogo(base64);
        try {
          localStorage.setItem("inzovate_custom_logo", base64);
        } catch (err) {
          // ignore storage error
        }
        setShowLogoModal(false);
      }
    };
    reader.onerror = () => {
      setLogoUploadError("Error reading image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomLogo = () => {
    setCustomLogo(null);
    try {
      localStorage.removeItem("inzovate_custom_logo");
    } catch (e) {}
    setShowLogoModal(false);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-[#10213F] flex flex-col justify-between selection:bg-[#1769FF] selection:text-white relative overflow-x-hidden font-sans">
      {/* Subtle Luminous Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#1769FF]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[550px] h-[550px] rounded-full bg-[#28C5F6]/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] rounded-full bg-[#087CF5]/5 blur-[120px] pointer-events-none" />

      {/* TOP HEADER — Refined Brand Bar */}
      <header className="w-full px-6 md:px-12 py-3.5 flex items-center justify-between border-b border-[#DFE8F5] bg-white/80 backdrop-blur-md z-20 sticky top-0 shadow-xs">
        {/* Left Side: Company Brand Lockup */}
        <Link href="/" className="flex items-center space-x-3.5 group">
          <BrandLogoDisplay customLogo={customLogo} className="w-10 h-10" />

          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-[#071A38] group-hover:text-[#1769FF] transition">
                INZOVATE TECHNOLOGIES PVT. LTD.
              </span>
              <span className="w-2 h-2 rounded-full bg-[#19C995] beacon-pulse" />
            </div>
            <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-[#61718B]">
              <span className="font-medium">“Code the Future with Inzovate.”</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline font-normal text-slate-500">
                Empowering Ideas through Intelligent Innovation.
              </span>
            </div>
          </div>
        </Link>

        {/* Right Side: IST Clock, Upload Logo Button & Status */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Logo Upload Feature for Admin Customization */}
          <button
            type="button"
            onClick={() => setShowLogoModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#071A38] text-[11px] font-bold transition cursor-pointer"
            title="Upload or Customize Company Logo"
          >
            <Upload className="w-3.5 h-3.5 text-[#1769FF]" />
            <span className="hidden sm:inline">
              {customLogo ? "Change Logo" : "Upload Company Logo"}
            </span>
          </button>

          {/* Live IST Time Pill */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-[#DFE8F5] text-[#61718B] shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#1769FF]" />
            <span className="font-mono text-[#071A38] font-bold">{istTime || "09:30 AM"}</span>
            <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-1.5">IST Node</span>
          </div>

          {/* Security Indicator */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1769FF] text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#19C995]" />
            <span className="hidden md:inline">Secure HRMS Portal</span>
            <span className="md:hidden">Portal</span>
          </div>
        </div>
      </header>

      {/* TWO-PANEL SPLIT SCREEN EXPERIENCE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        {/* LEFT PANEL — BRAND STORY AND HRMS CAPABILITIES (~60% desktop width) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* A. Brand Sub-Header Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1769FF] text-xs font-bold border border-blue-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#087CF5]" />
            <span>✦ ENTERPRISE WORKFORCE OPERATING SYSTEM</span>
          </div>

          {/* B. Hero Section */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-[50px] font-black tracking-tight text-[#071A38] leading-[1.14]">
              One Unified Platform. <br />
              <span className="bg-gradient-to-r from-[#1769FF] via-[#087CF5] to-[#28C5F6] bg-clip-text text-transparent">
                Every People Operation.
              </span> <br />
              Zero Human Bottlenecks.
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-[#61718B] leading-relaxed max-w-2xl font-normal pt-1">
              Empower your organization with INZOVATE HRMS — an intelligent workforce management platform designed to streamline attendance, employee operations, payroll workflows, performance tracking, and people analytics.
            </p>
          </div>

          {/* Abstract Corporate Technology Illustration */}
          <CorporateArchitectureIllustration />

          {/* C. Workforce Statistics Cards (4 Cards) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#61718B] uppercase tracking-wider block">
                Workforce Operations Overview:
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Configurable System Metrics</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WORKFORCE_STATS.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl ${stat.bg} border shadow-xs space-y-1.5 hover:shadow-md hover:scale-[1.01] transition`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#071A38] text-[11px] truncate">{stat.title}</span>
                      <Icon className={`w-3.5 h-3.5 ${stat.color} flex-shrink-0`} />
                    </div>
                    <div className="text-xl font-black text-[#071A38] tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-[#61718B] leading-tight truncate">
                      {stat.sub}
                    </div>
                    <div className="pt-0.5">
                      <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                        {stat.tag}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* D. Enterprise HRMS Modules (12 Capabilities in 4-column desktop grid) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#61718B] uppercase tracking-wider block">
                Enterprise HRMS Capabilities:
              </span>
              <span className="text-[11px] text-[#1769FF] font-bold">12 Integrated Modules</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {HRMS_MODULES.map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-[#DFE8F5] shadow-xs flex flex-col justify-between hover:border-[#1769FF]/50 hover:shadow-sm transition group"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1769FF] border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-[#1769FF] group-hover:text-white transition">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#10213F] leading-tight line-clamp-1 group-hover:text-[#1769FF] transition">
                        {mod.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#61718B] line-clamp-1 mt-1 block">
                      {mod.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* E. Bottom Brand Trust Strip */}
          <div className="p-3 rounded-2xl bg-[#071A38] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md border border-slate-800">
            <div className="flex items-center space-x-3 text-slate-300">
              <span className="flex items-center space-x-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#19C995]" />
                <span>Zero Trust — RBAC</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#19C995]" />
                <span>Instant ESS Access</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#19C995]" />
                <span>Automated HR Alerts</span>
              </span>
            </div>

            <div className="italic text-[#28C5F6] text-xs font-medium">
              “Empowering People. Building Tomorrow.”
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — PREMIUM AUTHENTICATION CARD (~40% desktop width) */}
        <div className="lg:col-span-5 flex justify-center">
          <Suspense
            fallback={
              <div className="p-8 text-center bg-white rounded-3xl text-slate-900 shadow-2xl">
                Loading HRMS Authentication Terminal...
              </div>
            }
          >
            <LoginFormInner customLogo={customLogo} />
          </Suspense>
        </div>
      </main>

      {/* 5. COMPANY LEGAL DETAILS AND GLOBAL EXECUTIVE COMMAND FOOTER */}
      <footer className="w-full px-6 md:px-12 py-5 bg-[#071A38] text-white border-t border-slate-800/90 relative z-20 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
          {/* Entity Identity & CIN Lockup */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-3.5">
            <BrandLogoDisplay customLogo={customLogo} className="w-9 h-9" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-extrabold text-sm tracking-wide text-white">
                  INZOVATE TECHNOLOGIES PVT. LTD.
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#1769FF]/20 border border-[#28C5F6]/40 text-[#28C5F6] font-mono text-[11px] font-bold shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-[#19C995]" />
                  <span>CIN: U62011TZ2025PTC036329</span>
                </span>
              </div>
              <p className="text-[11px] text-[#A9BBD6]">
                Registered under the Companies Act, 2013 • Official Enterprise HRMS Infrastructure
              </p>
            </div>
          </div>

          {/* Center: Interactive Corporate Links (Pill Buttons) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="https://inzovate-technologies.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-slate-700/80 text-xs text-slate-200 transition group shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-[#28C5F6] group-hover:scale-110 transition" />
              <span className="font-medium">inzovate-technologies.com</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href="mailto:hr@inzovate-technologies.com"
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-slate-700/80 text-xs text-slate-200 transition group shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-[#19C995] group-hover:scale-110 transition" />
              <span className="font-medium">hr@inzovate-technologies.com</span>
            </a>
          </div>

          {/* Right: Copyright & Enterprise Engine Badge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-right space-y-1 sm:space-y-0 sm:space-x-3 text-[11px] text-[#A9BBD6]">
            <span>© {currentYear} INZOVATE TECHNOLOGIES PVT. LTD. All rights reserved.</span>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border border-cyan-400/30 text-cyan-200 font-bold text-[10px]">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>Powered by INZOVATE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Logo Upload & Customization Modal */}
      {showLogoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#DFE8F5] space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-[#1769FF]" />
                <h3 className="font-extrabold text-base text-[#10213F]">
                  Upload Company Logo
                </h3>
              </div>
              <button
                onClick={() => setShowLogoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#61718B] leading-relaxed">
              Upload your official company logo to personalize the Inzovate HRMS login portal and header. Supports transparent PNG, JPG, or SVG files (Max 2MB).
            </p>

            {/* Current Logo Preview */}
            <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#DFE8F5] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#071A38] block">Current Active Logo:</span>
                <span className="text-[11px] text-[#61718B] block">
                  {customLogo ? "Custom Uploaded Logo" : "Default Inzovate Monogram"}
                </span>
              </div>
              <BrandLogoDisplay customLogo={customLogo} className="w-12 h-12" />
            </div>

            {logoUploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{logoUploadError}</span>
              </div>
            )}

            {/* Hidden Native File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              {customLogo ? (
                <button
                  type="button"
                  onClick={handleRemoveCustomLogo}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLogoModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-[#1769FF] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
