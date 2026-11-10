"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  ShieldCheck,
  Shield,
  Lock,
  Unlock,
  Users,
  CheckCircle2,
  XCircle,
  Save,
  RotateCcw,
  Sparkles,
  Building2,
  Briefcase,
  GraduationCap,
  Crown,
  KeyRound,
  FileCheck2,
  CalendarCheck,
  CreditCard,
  LayoutGrid,
  TrendingUp,
  Settings as SettingsIcon,
  HelpCircle,
  Eye,
  AlertTriangle,
  Loader2,
  Radio,
  Sliders,
  Check,
} from "lucide-react";

interface RolePermission {
  id: string;
  role: string;
  title: string;
  description: string;
  modules: string[];
  canApprove: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  isLocked: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

interface UserItem {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  createdAt: string;
}

const AVAILABLE_MODULES = [
  { key: "dashboard", label: "Dashboard", desc: "Executive KPI telemetry & widgets", icon: LayoutGrid },
  { key: "employees", label: "Employee Directory", desc: "Personnel profiles & records", icon: Users },
  { key: "attendance", label: "Attendance & Shifts", desc: "Punch in/out, GPS fixes & audit", icon: CalendarCheck },
  { key: "leaves", label: "Leaves & Approvals", desc: "Apply and approve leave requests", icon: CalendarCheck },
  { key: "payroll", label: "Payroll & Salaries", desc: "Calculate wages, payslips & LOP", icon: CreditCard },
  { key: "org-chart", label: "Org Hierarchy", desc: "Corporate governance & hierarchy", icon: Building2 },
  { key: "tasks", label: "Tasks & Sprints", desc: "Operations board & assigned tasks", icon: LayoutGrid },
  { key: "reports", label: "Reports & Analytics", desc: "Compliance exports & intelligence", icon: TrendingUp },
  { key: "settings", label: "System Settings", desc: "Corporate identity, SMTP & shift rules", icon: SettingsIcon },
  { key: "internship", label: "Internship & Fees", desc: "Student directory & fee telemetry", icon: GraduationCap },
  { key: "recruitment", label: "Recruitment ATS", desc: "Job postings & candidate pipeline", icon: Briefcase },
  { key: "certificates", label: "Certificates", desc: "Digital verification & training certificates", icon: FileCheck2 },
];

export default function RolePermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<string>("HR_MANAGER");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/permissions");
      const data = await res.json();
      if (data.success) {
        setRolePermissions(data.rolePermissions || []);
        setUsersList(data.users || []);
        setIsSuperAdmin(data.currentUser?.isSuperAdmin || false);
      } else {
        setErrorToast(data.error || "Failed to load permissions");
      }
    } catch (e: any) {
      setErrorToast(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activePerm = rolePermissions.find((rp) => rp.role === activeRoleTab);

  const toggleModule = (moduleKey: string) => {
    if (!activePerm || activePerm.isLocked) return;

    const currentModules = activePerm.modules || [];
    const updated = currentModules.includes(moduleKey)
      ? currentModules.filter((m) => m !== moduleKey)
      : [...currentModules, moduleKey];

    setRolePermissions((prev) =>
      prev.map((rp) => (rp.role === activeRoleTab ? { ...rp, modules: updated } : rp))
    );
  };

  const toggleCapability = (field: "canApprove" | "canEdit" | "canDelete" | "canExport") => {
    if (!activePerm || activePerm.isLocked) return;

    setRolePermissions((prev) =>
      prev.map((rp) => (rp.role === activeRoleTab ? { ...rp, [field]: !rp[field] } : rp))
    );
  };

  const handleSaveRolePermissions = async () => {
    if (!activePerm) return;
    setSavingRole(activeRoleTab);
    setSuccessToast(null);
    setErrorToast(null);

    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_ROLE_PERMISSIONS",
          role: activePerm.role,
          modules: activePerm.modules,
          canApprove: activePerm.canApprove,
          canEdit: activePerm.canEdit,
          canDelete: activePerm.canDelete,
          canExport: activePerm.canExport,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessToast(`Permissions updated successfully for ${activePerm.title}!`);
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setErrorToast(data.error || "Failed to save permissions.");
      }
    } catch (err: any) {
      setErrorToast(err.message || "Failed to save permissions.");
    } finally {
      setSavingRole(null);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    const actionLabel = currentStatus ? "revoke access for" : "grant access to";
    if (!confirm(`Are you sure you want to ${actionLabel} ${userName}?`)) return;

    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_USER_STATUS",
          userId,
          isActive: !currentStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessToast(`Access authorization updated for ${userName}.`);
        setTimeout(() => setSuccessToast(null), 4000);
        loadData();
      } else {
        setErrorToast(data.error || "Failed to update user authorization.");
      }
    } catch (err: any) {
      setErrorToast(err.message || "Request failed.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn max-w-[1400px] mx-auto pb-16">
        {/* Toast Alerts */}
        {successToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="hover:opacity-80">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorToast && (
          <div className="p-3.5 rounded-2xl bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorToast}</span>
            </div>
            <button onClick={() => setErrorToast(null)} className="hover:opacity-80">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071630] via-[#0B2555] to-[#1265F5] p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-widest border border-cyan-400/30">
                <Crown className="w-3.5 h-3.5 text-cyan-300" />
                <span>Super Admin Governance Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Role Accessibility &amp; Authorization Matrix
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                Only the <strong>Founder (Gokul G)</strong> and <strong>Managing Director (Mousik Shankar S)</strong> hold supreme governance authority. Define exactly which modules and operational privileges each tier can access.
              </p>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <div className="text-xl font-black text-cyan-300">4 Core Tiers</div>
                <div className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">Strict RBAC Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. ROLE ACCESSIBILITY MATRIX SECTION */}
        <div className="bg-white rounded-3xl border border-[#DCE7F6] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h2 className="font-extrabold text-base text-[#10264A]">Role Permission Profiles</h2>
              <p className="text-xs text-slate-500">
                Select a role to inspect and configure permitted modules, action capabilities, and view limits.
              </p>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {rolePermissions.map((rp) => {
                const isActive = activeRoleTab === rp.role;
                return (
                  <button
                    key={rp.role}
                    type="button"
                    onClick={() => setActiveRoleTab(rp.role)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                      isActive
                        ? "bg-[#1765E8] text-white shadow-md shadow-blue-500/30 scale-102"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {rp.role === "SUPER_ADMIN" ? (
                      <Crown className="w-3.5 h-3.5" />
                    ) : rp.role === "HR_MANAGER" ? (
                      <Building2 className="w-3.5 h-3.5" />
                    ) : rp.role === "EMPLOYEE" ? (
                      <Users className="w-3.5 h-3.5" />
                    ) : (
                      <GraduationCap className="w-3.5 h-3.5" />
                    )}
                    <span>{rp.title.split("(")[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Configuration Details */}
          {activePerm && (
            <div className="space-y-6 animate-fadeIn">
              {/* Role Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-[#10264A]">{activePerm.title}</span>
                    {activePerm.isLocked && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                        Immutable Supreme Role
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{activePerm.description}</p>
                </div>

                {!activePerm.isLocked && isSuperAdmin && (
                  <button
                    type="button"
                    onClick={handleSaveRolePermissions}
                    disabled={savingRole === activePerm.role}
                    className="px-5 py-2.5 rounded-xl bg-[#1765E8] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                  >
                    {savingRole === activePerm.role ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save {activePerm.role} Accessibility</span>
                  </button>
                )}
              </div>

              {/* Action Capabilities Toggles */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                  Operational Action Privileges
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Approve */}
                  <div
                    onClick={() => toggleCapability("canApprove")}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer select-none flex items-center justify-between ${
                      activePerm.canApprove
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Can Approve</div>
                      <div className="text-[10px]">Leaves, Overrides, Regularization</div>
                    </div>
                    {activePerm.canApprove ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-300" />}
                  </div>

                  {/* Edit */}
                  <div
                    onClick={() => toggleCapability("canEdit")}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer select-none flex items-center justify-between ${
                      activePerm.canEdit
                        ? "bg-blue-50 border-blue-300 text-blue-900"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Can Edit Records</div>
                      <div className="text-[10px]">Profiles, Timings, Salary</div>
                    </div>
                    {activePerm.canEdit ? <CheckCircle2 className="w-4 h-4 text-blue-600" /> : <XCircle className="w-4 h-4 text-slate-300" />}
                  </div>

                  {/* Delete */}
                  <div
                    onClick={() => toggleCapability("canDelete")}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer select-none flex items-center justify-between ${
                      activePerm.canDelete
                        ? "bg-rose-50 border-rose-300 text-rose-900"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Can Delete Data</div>
                      <div className="text-[10px]">Purge accounts &amp; logs</div>
                    </div>
                    {activePerm.canDelete ? <CheckCircle2 className="w-4 h-4 text-rose-600" /> : <XCircle className="w-4 h-4 text-slate-300" />}
                  </div>

                  {/* Export */}
                  <div
                    onClick={() => toggleCapability("canExport")}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer select-none flex items-center justify-between ${
                      activePerm.canExport
                        ? "bg-amber-50 border-amber-300 text-amber-900"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Can Export Files</div>
                      <div className="text-[10px]">Reports, Payslips, CSV</div>
                    </div>
                    {activePerm.canExport ? <CheckCircle2 className="w-4 h-4 text-amber-600" /> : <XCircle className="w-4 h-4 text-slate-300" />}
                  </div>
                </div>
              </div>

              {/* Module Visibility Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Permitted Module Workspaces ({activePerm.modules?.length || 0} Enabled)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Unchecked modules will be completely hidden from this role&apos;s UI and blocked at the router.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isEnabled = activePerm.modules?.includes(mod.key);
                    const Icon = mod.icon;

                    return (
                      <div
                        key={mod.key}
                        onClick={() => toggleModule(mod.key)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between select-none ${
                          isEnabled
                            ? "bg-blue-50/70 border-blue-300 shadow-xs"
                            : "bg-slate-50 border-slate-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isEnabled ? "bg-[#1765E8] text-white" : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`font-bold text-xs ${isEnabled ? "text-[#10264A]" : "text-slate-600"}`}>
                              {mod.label}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight">{mod.desc}</div>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isEnabled ? "bg-[#1765E8] border-[#1765E8] text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. USER ACCESS AUTHORIZATION LIST */}
        {isSuperAdmin && (
          <div className="bg-white rounded-3xl border border-[#DCE7F6] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-base text-[#10264A]">Authorized Personnel Accounts</h2>
                <p className="text-xs text-slate-500">
                  Manage active access and role assignments. Super Admin approval is mandatory for system usage.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {usersList.length} Accounts Configured
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">User / Personnel</th>
                    <th className="px-5 py-3.5">Assigned Role</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Access Status</th>
                    <th className="px-5 py-3.5 text-right">Super Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((user) => {
                    const isSupreme =
                      user.email === "founder@inzovate-technologies.com" ||
                      user.email === "md@inzovate-technologies.com";

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-[#10264A] flex items-center space-x-1.5">
                            <span>{user.fullName}</span>
                            {isSupreme && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              user.role === "SUPER_ADMIN"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : user.role === "HR_MANAGER"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : user.role === "EMPLOYEE"
                                ? "bg-indigo-50 text-indigo-800 border-indigo-300"
                                : "bg-teal-50 text-teal-800 border-teal-300"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">
                          {user.department || "Corporate"}
                        </td>
                        <td className="px-5 py-3.5">
                          {user.isActive ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approved &amp; Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-rose-600 font-bold text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Access Suspended</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {isSupreme ? (
                            <span className="text-[11px] font-bold text-amber-600">Supreme Admin</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user.id, user.isActive, user.fullName)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                                user.isActive
                                  ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {user.isActive ? "Revoke Access" : "Grant Access (Approve)"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
