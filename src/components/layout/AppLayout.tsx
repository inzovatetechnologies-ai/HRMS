"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Send,
  CreditCard,
  Building2,
  LayoutGrid,
  TrendingUp,
  Settings,
  Bell,
  Sun,
  Moon,
  Calendar,
  Search,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  User,
  Zap,
  Clock,
  Briefcase,
  GraduationCap,
  Banknote,
  FileText,
  Lock,
  Mic,
  Sparkles,
  Crown,
} from "lucide-react";
import FloatingVoiceCopilot from "./FloatingVoiceCopilot";
import VoiceCopilotModal from "./VoiceCopilotModal";
import FloatingShiftWidget from "./FloatingShiftWidget";
import FloatingChatWidget from "./FloatingChatWidget";

// Global client session & permissions cache to eliminate multi-second waterfalls on page navigation
let globalCachedUser: any = null;
let globalCachedUserTimestamp = 0;
let globalCachedPermissions: string[] | null = null;
let globalCachedPermissionsTimestamp = 0;
let globalCachedNotifications: any[] | null = null;
let globalCachedUnreadCount = 0;
let globalCachedNotificationsTimestamp = 0;

export function clearAppLayoutCache() {
  globalCachedUser = null;
  globalCachedUserTimestamp = 0;
  globalCachedPermissions = null;
  globalCachedPermissionsTimestamp = 0;
  globalCachedNotifications = null;
  globalCachedNotificationsTimestamp = 0;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [quickOpsOpen, setQuickOpsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingTarget, setNavigatingTarget] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<any[]>(globalCachedNotifications || []);
  const [unreadCount, setUnreadCount] = useState(globalCachedUnreadCount);

  const [user, setUser] = useState<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string;
    department?: string;
    designation?: string;
    employeeId?: string;
  } | null>(globalCachedUser);

  const [userPermittedModules, setUserPermittedModules] = useState<string[]>(globalCachedPermissions || []);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickOpsRef = useRef<HTMLDivElement>(null);

  // Turn off top loading progress bar when route transition completes
  useEffect(() => {
    setIsNavigating(false);
    setNavigatingTarget(null);
  }, [pathname]);

  const handleLinkClick = (href: string) => {
    if (href !== pathname) {
      setIsNavigating(true);
      setNavigatingTarget(href);
    }
  };

  // Initialize theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("inzovate_theme") as "light" | "dark" | null;
      const initial = savedTheme || "light";
      setTheme(initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("inzovate_theme", nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchModalOpen(false);
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
        setQuickOpsOpen(false);
        setVoiceModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (quickOpsRef.current && !quickOpsRef.current.contains(e.target as Node)) {
        setQuickOpsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fast Cached Session & Permissions Management
  useEffect(() => {
    const now = Date.now();
    const needsUserFetch = !globalCachedUser || now - globalCachedUserTimestamp > 60000;
    const needsPermsFetch = !globalCachedPermissions || now - globalCachedPermissionsTimestamp > 60000;
    const needsNotifsFetch = !globalCachedNotifications || now - globalCachedNotificationsTimestamp > 30000;

    if (needsUserFetch) {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            globalCachedUser = data.user;
            globalCachedUserTimestamp = Date.now();
          } else {
            router.push("/login");
          }
        })
        .catch(() => router.push("/login"));
    }

    if (needsPermsFetch) {
      fetch("/api/permissions")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success) {
            const modules = data.userModules || [];
            setUserPermittedModules(modules);
            globalCachedPermissions = modules;
            globalCachedPermissionsTimestamp = Date.now();
          }
        })
        .catch(() => {});
    }

    if (needsNotifsFetch) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const notifs = data.notifications || [];
            const count = data.unreadCount ?? 0;
            setNotifications(notifs);
            setUnreadCount(count);
            globalCachedNotifications = notifs;
            globalCachedUnreadCount = count;
            globalCachedNotificationsTimestamp = Date.now();
          }
        })
        .catch(() => {});
    }
  }, [router]);

  const handleLogout = async () => {
    clearAppLayoutCache();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isSuperAdminUser = user?.role === "SUPER_ADMIN";
  const isHRUser = user?.role === "HR_MANAGER" || isSuperAdminUser;
  const isEmployeeUser = user?.role === "EMPLOYEE";
  const isInternUser = user?.role === "INTERN";

  // Dynamic Navigation Items
  const allNavItems = [
    { moduleKey: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { moduleKey: "employees", label: "Employees", href: "/employees", icon: Users },
    { moduleKey: "attendance", label: "Attendance", href: "/attendance", icon: CalendarCheck },
    { moduleKey: "leaves", label: "Leaves", href: "/leave", icon: Send },
    {
      moduleKey: "payroll",
      label: isEmployeeUser ? "My Payslips" : "Payroll",
      href: isEmployeeUser ? "/payroll/payslips" : "/payroll",
      icon: CreditCard,
    },
    {
      moduleKey: "org-chart",
      label: "Organization",
      href: "/org-chart",
      icon: Building2,
      hasSubmenu: true,
      subItems: [
        { label: "Org Hierarchy", href: "/org-chart" },
        { label: "Departments", href: "/org-chart?tab=departments" },
        { label: "Designations", href: "/org-chart?tab=designations" },
      ],
    },
    {
      moduleKey: "internship",
      label: "Internship",
      href: "/internship",
      icon: GraduationCap,
      hasSubmenu: isInternUser ? false : true,
      subItems: [
        { label: "Student Telemetry", href: "/internship" },
        { label: "Fee Ledger", href: "/internship/finance" },
      ],
    },
    { moduleKey: "tasks", label: "Workspace", href: "/tasks", icon: LayoutGrid, hasSubmenu: true },
    { moduleKey: "reports", label: "Reports", href: "/reports", icon: TrendingUp, hasSubmenu: true },
    {
      moduleKey: "settings",
      label: "Settings",
      href: "/settings",
      icon: Settings,
      hasSubmenu: isSuperAdminUser,
      subItems: isSuperAdminUser
        ? [
            { label: "System Policies", href: "/settings" },
            { label: "Role Permissions & Governance", href: "/settings/permissions" },
          ]
        : undefined,
    },
  ];

  // Dynamic Filtering based on Permissions and Role
  const navItems = allNavItems.filter((item) => {
    if (isSuperAdminUser) return true; // Super Admin has access to everything
    if (userPermittedModules.length > 0) {
      return userPermittedModules.includes(item.moduleKey);
    }
    // Safe fallbacks before API loads
    if (isInternUser) {
      return ["dashboard", "attendance", "internship", "tasks", "org-chart"].includes(item.moduleKey);
    }
    if (isEmployeeUser) {
      return ["dashboard", "attendance", "leaves", "payroll", "tasks", "org-chart"].includes(item.moduleKey);
    }
    if (isHRUser) {
      return item.moduleKey !== "settings";
    }
    return true;
  });

  const searchableLinks = [
    ...navItems,
    { label: "Tasks Sprint Board", href: "/tasks", icon: LayoutGrid },
    { label: "Team Performance", href: "/performance", icon: TrendingUp },
    { label: "Internship Management", href: "/internship", icon: GraduationCap },
    { label: "Recruitment ATS", href: "/recruitment", icon: Briefcase },
    { label: "Salary Payslips", href: "/payroll/payslips", icon: FileText },
    { label: "Certificates & Training", href: "/certificates", icon: ShieldCheck },
  ];

  const searchResults = searchableLinks.filter((item) =>
    item.label.toLowerCase().includes(globalSearchInput.toLowerCase())
  );

  const topNavLinks = isSuperAdminUser
    ? [
        { label: "Home", href: "/dashboard" },
        { label: "Employees", href: "/employees" },
        { label: "Attendance", href: "/attendance" },
        { label: "Leaves", href: "/leave" },
        { label: "Payroll", href: "/payroll" },
        { label: "Org Chart", href: "/org-chart" },
        { label: "Governance", href: "/settings/permissions", isGovernance: true },
      ]
    : isHRUser
    ? [
        { label: "Home", href: "/dashboard" },
        { label: "Employees", href: "/employees" },
        { label: "Attendance", href: "/attendance" },
        { label: "Leaves", href: "/leave" },
        { label: "Payroll", href: "/payroll" },
        { label: "Org Chart", href: "/org-chart" },
        { label: "Internship", href: "/internship" },
      ]
    : isEmployeeUser
    ? [
        { label: "Home", href: "/dashboard" },
        { label: "Attendance", href: "/attendance" },
        { label: "Leaves", href: "/leave" },
        { label: "My Payslips", href: "/payroll/payslips" },
        { label: "Org Chart", href: "/org-chart" },
        { label: "Tasks", href: "/tasks" },
      ]
    : isInternUser
    ? [
        { label: "Home", href: "/dashboard" },
        { label: "Attendance", href: "/attendance" },
        { label: "Internship & Fees", href: "/internship" },
        { label: "Org Chart", href: "/org-chart" },
        { label: "Tasks", href: "/tasks" },
      ]
    : [
        { label: "Home", href: "/dashboard" },
        { label: "Attendance", href: "/attendance" },
        { label: "Org Chart", href: "/org-chart" },
      ];

  // Strict Enterprise Clearance Check ("ரெஸ்ட்ரிக்சன் பயங்கரமா இருக்கணும்")
  const isRestrictedRoute = () => {
    if (!user) return false;
    const cleanPath = pathname.split("?")[0];
    const role = user.role || "EMPLOYEE";

    // Super Admin (Founder Gokul G & MD Mousik Shankar S) has 100% UNRESTRICTED ACCESS
    if (role === "SUPER_ADMIN") return false;

    // Strict Rule: ONLY Super Admin can access /settings or /settings/permissions!
    if (cleanPath.startsWith("/settings")) return true;

    // HR Access Rules
    if (role === "HR_MANAGER") {
      // HR can access dashboard, employees, attendance, leaves, payroll, org-chart, tasks, reports, internship, recruitment, certificates
      return false;
    }

    // Employee Access Rules
    if (role === "EMPLOYEE") {
      if (cleanPath === "/payroll/payslips") return false;
      if (cleanPath.startsWith("/payroll")) return true; // Block full company payroll
      if (cleanPath.startsWith("/employees") && cleanPath !== "/employees/profile") return true; // Block admin employee edit
      if (
        cleanPath.startsWith("/recruitment") ||
        cleanPath.startsWith("/internship") ||
        cleanPath.startsWith("/reports")
      ) {
        return true;
      }
      return false;
    }

    // Intern Student Access Rules
    if (role === "INTERN") {
      if (
        cleanPath.startsWith("/payroll") ||
        cleanPath.startsWith("/leave") ||
        cleanPath.startsWith("/employees") ||
        cleanPath.startsWith("/recruitment") ||
        cleanPath.startsWith("/reports") ||
        cleanPath === "/internship/finance"
      ) {
        return true;
      }
      return false;
    }

    return false;
  };

  const accessRestricted = isRestrictedRoute();
  const userRole = user?.role || "EMPLOYEE";

  return (
    <div className="min-h-screen flex bg-[#F5F8FD] dark:bg-[#07162F] text-[#10264D] dark:text-slate-100 font-sans transition-colors duration-200">
      {/* 0. INSTANT ZERO-LATENCY TOP PROGRESS BAR (Fires immediately within <10ms on click) */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[10000] h-[3.5px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_15px_#38BDF8] animate-pulse pointer-events-none" />
      )}

      {/* 1. ULTRA-PREMIUM CYBER-EXECUTIVE SIDEBAR (Matching User's Reference) */}
      <aside
        className={`hidden md:flex flex-col bg-gradient-to-b from-[#040915] via-[#050D1D] to-[#02050D] border-r border-cyan-500/20 text-white transition-all duration-300 z-40 sticky top-0 h-screen flex-shrink-0 select-none shadow-[10px_0_40px_rgba(0,0,0,0.6)] ${
          sidebarCollapsed ? "w-[76px]" : "w-[280px] lg:w-[290px]"
        }`}
      >
        {/* Branding Header with Glowing LIVE pill and Collapse icon (<) */}
        <div className="h-[74px] px-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#040915]/90 backdrop-blur-md flex-shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-3 group truncate">
            {/* INZOVATE Logo Squircle */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-40 group-hover:opacity-80 blur-xs transition duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-[#081329] p-1 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-950/60 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="INZOVATE"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.45)]"
                />
              </div>
            </div>

            {!sidebarCollapsed && (
              <div className="truncate">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-[16px] tracking-wider text-white">
                    INZOVATE
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                    LIVE
                  </span>
                </div>
                <div className="text-[9px] font-black tracking-[0.22em] uppercase text-cyan-400/90 block mt-0.5">
                  AI ENTERPRISE HRMS
                </div>
              </div>
            )}
          </Link>

          {/* Sidebar Collapse Toggle Button (<) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-300 bg-white/[0.04] hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 transition shadow-xs flex-shrink-0"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation List with Glowing Beacons */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <div key={idx} className="space-y-1">
                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={() => handleLinkClick(item.href)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative ${
                    isActive || navigatingTarget === item.href
                      ? "bg-gradient-to-r from-blue-600/35 via-blue-500/20 to-transparent text-white border border-blue-400/40 shadow-[0_4px_20px_rgba(37,99,235,0.25)] font-bold backdrop-blur-md"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {/* Active Cyan Left Glow Indicator */}
                  {(isActive || navigatingTarget === item.href) && (
                    <span className="absolute -left-1 top-2 bottom-2 w-1.5 rounded-r-full bg-gradient-to-b from-blue-400 via-cyan-400 to-sky-500 shadow-[0_0_12px_#38BDF8]" />
                  )}

                  <div className="flex items-center space-x-3 truncate">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        isActive || navigatingTarget === item.href
                          ? "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/40"
                          : "bg-white/[0.04] border border-white/[0.08] text-slate-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/10"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.hasSubmenu && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isActive ? "text-cyan-300 rotate-180" : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    />
                  )}
                </Link>

                {/* Submenu Items (e.g. Org Hierarchy, Departments, Designations) */}
                {isActive && !sidebarCollapsed && (item as any).subItems && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    {(item as any).subItems.map((sub: any, sIdx: number) => {
                      const isSubActive =
                        sub.href === "/org-chart"
                          ? pathname === "/org-chart"
                          : pathname === sub.href;
                      return (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          prefetch={true}
                          onClick={() => handleLinkClick(sub.href)}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            isSubActive || navigatingTarget === sub.href
                              ? "bg-[#1265F5] text-white font-bold shadow-md shadow-blue-600/30"
                              : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSubActive ? "bg-white shadow-[0_0_6px_#fff]" : "bg-slate-500"
                            }`}
                          />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Company Badge Card */}
        {!sidebarCollapsed && (
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#071329] to-[#040C1D] border border-cyan-500/20 flex items-center space-x-2.5 shadow-inner">
              <div className="w-7 h-7 rounded-lg bg-[#10264D] border border-[#1E3A6B] flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-[9.5px] font-bold text-white uppercase tracking-tight truncate leading-tight">
                  INZOVATE TECHNOLOGIES PRIVATE LIMITED
                </div>
                <div className="text-[9px] font-semibold text-cyan-300 font-mono mt-0.5 truncate">
                  CIN: U62011TZ2025PTC036329
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile & Logout Section at bottom */}
        <div className="p-3 border-t border-cyan-500/20 bg-[#02050D]/95 flex-shrink-0">
          {!sidebarCollapsed ? (
            <div className="space-y-2">
              <div
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-cyan-500/20 transition cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-md border border-cyan-400/30">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : (isSuperAdminUser ? "GG" : "IN")}</span>
                    )}
                  </div>
                  <div className="truncate text-left">
                    <div className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors flex items-center">
                      <span>{user?.fullName || (isSuperAdminUser ? "Gokul G" : "Inzovate Personnel")}</span>
                      {isSuperAdminUser && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 ml-1.5 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-[10.5px] font-mono text-cyan-400 font-semibold tracking-wide flex items-center space-x-1 mt-0.5">
                      <span className="text-slate-400 font-sans text-[9.5px]">ID:</span>
                      <span>{user?.employeeId || (isSuperAdminUser ? "INZ-SA-001" : "INZ-EMP-1001")}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>

              {profileDropdownOpen && (
                <div
                  ref={profileDropdownRef}
                  className="p-2 rounded-xl bg-[#071329] border border-cyan-500/30 space-y-1 text-xs animate-fadeIn shadow-xl"
                >
                  <div className="px-2 py-1 text-[10px] text-slate-400 border-b border-white/10 flex justify-between">
                    <span>Role: <strong className="text-cyan-300">{userRole}</strong></span>
                    <span className="text-slate-400 font-mono">{user?.employeeId || (isSuperAdminUser ? "INZ-SA-001" : "")}</span>
                  </div>
                  <Link
                    href="/employees"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 text-slate-300 transition-all flex items-center space-x-2 text-xs font-semibold group"
                title="Sign out of HRMS"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div
                className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs border border-cyan-400/30"
                title={`${user?.fullName || "User"} (${user?.employeeId || "INZ-SA-001"})`}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.fullName?.slice(0, 2).toUpperCase() || "MS"}</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT & EXACT FLOATING PILL NAVBAR MATCHING USER'S SCREENSHOT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Floating Capsule/Pill Topbar Container */}
        <div className="sticky top-0 z-30 px-3 sm:px-6 pt-3 pb-2 transition-all duration-300">
          <header className="max-w-7xl mx-auto h-[62px] sm:h-[66px] bg-[#070D1A]/95 dark:bg-[#071328]/95 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.55)] px-3 sm:px-4 flex items-center justify-between text-white relative">
            {/* Left: Circular White Logo Pedestal + Hamburger Toggle */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <Link
                href="/dashboard"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg flex-shrink-0 hover:scale-105 transition p-1.5 overflow-hidden"
                title="INZOVATE Enterprise HRMS"
              >
                <img src="/logo.png" alt="INZOVATE" className="w-full h-full object-contain" />
              </Link>

              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Open Navigation Drawer"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            {/* Center: Dynamic Navigation Links matching user screenshot: Home, Employees, Attendance, Leaves, Payroll, Org Chart */}
            <nav className="hidden lg:flex items-center space-x-5 xl:space-x-6 text-xs xl:text-sm font-semibold tracking-wide">
              {topNavLinks.map((link, idx) => {
                const isActive =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={idx}
                    href={link.href}
                    prefetch={true}
                    onClick={() => handleLinkClick(link.href)}
                    className={`transition flex items-center space-x-1.5 ${
                      isActive || navigatingTarget === link.href
                        ? "text-white font-extrabold shadow-xs"
                        : "text-slate-300 hover:text-white"
                    } ${
                      link.isGovernance
                        ? "px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30"
                        : ""
                    }`}
                  >
                    {link.isGovernance && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Quick Search Shortcut Pill [ 🔍 ⌘K ] */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-1.5 px-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs transition flex items-center space-x-1.5"
                title="Search (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5" />
                <kbd className="text-[10px] font-mono text-slate-300">⌘K</kbd>
              </button>
            </nav>

            {/* Right: AI Copilot Button, Fast Actions, Theme Toggle, Bell Notification */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* [ 🎙️ AI Copilot ] Button with Cyan Text & Border */}
              <button
                type="button"
                onClick={() => setVoiceModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm active:scale-95"
                title="Launch Inzovate AI Voice Copilot"
              >
                <Mic className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                <span className="hidden sm:inline">AI Copilot</span>
              </button>

              {/* [ ⚡ ⌄ ] Quick Actions Dropdown */}
              <div className="relative" ref={quickOpsRef}>
                <button
                  type="button"
                  onClick={() => setQuickOpsOpen(!quickOpsOpen)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold transition flex items-center space-x-1"
                  title="Quick Operations"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-300 fill-current" />
                  <ChevronDown className="w-3 h-3 text-slate-300 hidden sm:inline" />
                </button>

                {quickOpsOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-[#070D1A]/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 p-3 z-50 animate-fadeIn text-xs">
                    <div className="px-2 py-1.5 border-b border-white/10 font-bold text-white mb-2">
                      Operations Shortcuts
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/employees"
                        onClick={() => setQuickOpsOpen(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-left"
                      >
                        <div className="font-bold text-white">Staff Onboard</div>
                        <div className="text-[10px] text-slate-400">Add personnel</div>
                      </Link>
                      <Link
                        href="/internship"
                        onClick={() => setQuickOpsOpen(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-left"
                      >
                        <div className="font-bold text-white">Internship</div>
                        <div className="text-[10px] text-slate-400">Student fees</div>
                      </Link>
                      <Link
                        href="/attendance"
                        onClick={() => setQuickOpsOpen(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-left"
                      >
                        <div className="font-bold text-white">Attendance</div>
                        <div className="text-[10px] text-slate-400">Live shift punch</div>
                      </Link>
                      <Link
                        href="/leave"
                        onClick={() => setQuickOpsOpen(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-left"
                      >
                        <div className="font-bold text-white">Leave Appeal</div>
                        <div className="text-[10px] text-slate-400">Request leave</div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* [ 🌙 ] Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                title={theme === "light" ? "Dark Mode" : "Light Mode"}
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              {/* [ 🔔 ] Notifications Bell */}
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-black">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#070D1A]/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 p-4 z-50 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
                      <span className="font-bold text-white">Alerts ({unreadCount})</span>
                      <button
                        onClick={async () => {
                          await fetch("/api/notifications", { method: "PATCH" });
                          setUnreadCount(0);
                        }}
                        className="text-[11px] text-cyan-300 hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">
                          All systems operational.
                        </div>
                      ) : (
                        notifications.map((n, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1"
                          >
                            <div className="font-bold text-white">{n.title}</div>
                            <div className="text-slate-300 text-[11px] leading-relaxed">
                              {n.message}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Sub-Navbar Shift Punch Bar (Docked directly below the navbar capsule) */}
          <div className="max-w-7xl mx-auto mt-2 px-1 flex justify-end">
            <FloatingShiftWidget user={user} />
          </div>
        </div>

        {/* Global Search Dialog Modal (Ctrl + K) */}
        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-xl bg-white dark:bg-[#07162F] rounded-2xl shadow-2xl border border-[#DCE6F3] dark:border-[#162C52] overflow-hidden">
              <div className="p-4 border-b border-[#DCE6F3] dark:border-[#162C52] flex items-center space-x-3">
                <Search className="w-5 h-5 text-[#1765E8]" />
                <input
                  type="text"
                  autoFocus
                  value={globalSearchInput}
                  onChange={(e) => setGlobalSearchInput(e.target.value)}
                  placeholder="Search employees, modules, reports, payroll..."
                  className="flex-1 bg-transparent text-sm text-[#10264D] dark:text-white placeholder-slate-400 focus:outline-none"
                />
                <kbd className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                  ESC
                </kbd>
              </div>

              <div className="max-h-96 overflow-y-auto p-2.5 space-y-1">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No matching modules found.
                  </div>
                ) : (
                  searchResults.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setSearchModalOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F8FD] dark:hover:bg-[#0C1D3A] transition text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-[#E8F1FD] dark:bg-[#10264D] text-[#1765E8] dark:text-cyan-300">
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-[#10264D] dark:text-white block">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-[#64748B]">Route: {item.href}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Off-Canvas Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="w-72 bg-[#040915] border-r border-cyan-500/20 text-white flex flex-col h-full shadow-2xl">
              <div className="p-5 border-b border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                    <img src="/logo.png" alt="INZOVATE" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-extrabold text-sm text-white">INZOVATE HRMS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      prefetch={true}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLinkClick(item.href);
                      }}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive || navigatingTarget === item.href
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 border-t border-cyan-500/20 bg-[#02050D] flex items-center justify-between">
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate flex items-center">
                    <span>{user?.fullName || (isSuperAdminUser ? "Gokul G" : "Inzovate Personnel")}</span>
                    {isSuperAdminUser && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 ml-1.5 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-cyan-300/70 truncate">{user?.designation || userRole}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Voice Copilot Modal & Floating Orb */}
        <VoiceCopilotModal isOpen={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />
        <FloatingVoiceCopilot />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 w-full bg-[#F5F8FD] dark:bg-[#07162F] transition-colors pb-12">
          {accessRestricted ? (
            <div className="max-w-2xl mx-auto my-12 p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#0C1D3A] border border-rose-300 dark:border-rose-900/50 text-center shadow-lg space-y-5 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                  403 RESTRICTED ENTERPRISE VAULT
                </span>
                <h2 className="text-xl font-bold tracking-tight text-[#10264D] dark:text-white mt-2">
                  Access Denied: High-Security Clearance Required
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Your corporate role ({userRole}) does not have administrative clearance to access this module ({pathname}). This restricted perimeter attempt has been logged for corporate compliance.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#1765E8] hover:bg-[#1253c2] text-white font-semibold text-xs shadow-md transition"
                >
                  <span>Return to Secure Dashboard</span>
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Floating 1-to-1 Chat & Mention Widget */}
      <FloatingChatWidget user={user} />
    </div>
  );
}
