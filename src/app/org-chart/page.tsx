"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Crown,
  Users,
  Building2,
  TrendingUp,
  UserCheck,
  Search,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  FolderTree,
  Edit3,
  Plus,
  RotateCcw,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  Megaphone,
  Code2,
  ChevronRight,
  ChevronDown,
  Download,
  ShieldCheck,
  MoreHorizontal,
  Camera,
  Upload,
  FileText,
  AlertTriangle,
  MessageSquare,
  GraduationCap,
  CreditCard,
  FileCheck,
  Check,
  Loader2,
} from "lucide-react";

interface OrgNode {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  role: string;
  tier: 1 | 2 | 3 | 4;
  avatarUrl?: string | null;
  reportingToName?: string | null;
  teamLeadName?: string | null;
  status: string;
  documents?: any[];
  children?: OrgNode[];
}

const MANDATORY_DOCS = [
  { key: "AADHAAR", label: "Aadhaar Card", desc: "UIDAI National Identification Document" },
  { key: "PAN", label: "PAN Card", desc: "Income Tax Department Permanent Account Number" },
  { key: "BANK_PASSBOOK", label: "Bank Passbook / Statement", desc: "Front page with Account No. & IFSC Code" },
  { key: "10TH_MARKSHEET", label: "10th Marksheet", desc: "Secondary School Examination Board Certificate" },
  { key: "12TH_MARKSHEET", label: "12th Marksheet", desc: "Higher Secondary Board Examination Certificate" },
  { key: "COLLEGE_MARKSHEET", label: "College Marksheet", desc: "Semester-wise / Cumulative Grade Transcript" },
  { key: "DEGREE_CERTIFICATE", label: "Consolidated Degree Certificate", desc: "Official University Convocation/Graduation Document" },
];

export default function OrgChartPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Profile Edit & Upload State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editReportingTo, setEditReportingTo] = useState("");
  const [editTeamLead, setEditTeamLead] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Document Uploads State for Selected Employee
  const [nodeDocuments, setNodeDocuments] = useState<any[]>([]);
  const [uploadingDocKey, setUploadingDocKey] = useState<string | null>(null);
  const [degreeType, setDegreeType] = useState<string>("UG");
  const [degreeTitle, setDegreeTitle] = useState<string>("B.E / B.Tech Computer Science");
  const [docAlertLoading, setDocAlertLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // 1. Fetch current session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  // 2. Fetch all employees
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (data.success && data.employees) {
        setEmployees(data.employees);
      }
    } catch (e) {
      console.warn("Failed to load employees:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Fetch documents for the selected employee
  const loadDocumentsForEmployee = async (empId: string) => {
    try {
      const res = await fetch(`/api/employees/documents?employeeId=${empId}`);
      const data = await res.json();
      if (data.success) {
        setNodeDocuments(data.documents || []);
      }
    } catch (err) {
      console.warn("Error loading documents:", err);
    }
  };

  // Open profile modal for employee
  const handleOpenEmployeeProfile = (emp: any) => {
    setSelectedNode(emp);
    setEditFirstName(emp.firstName || "");
    setEditLastName(emp.lastName || "");
    setEditPhone(emp.phone || "");
    setEditDepartment(emp.department || "Engineering");
    setEditDesignation(emp.designation || "Staff");
    setEditReportingTo(emp.reportingToName || "");
    setEditTeamLead(emp.teamLeadName || "");
    setEditAvatarUrl(emp.user?.avatarUrl || null);
    loadDocumentsForEmployee(emp.employeeId);
    setProfileModalOpen(true);
  };

  // Handle Photo File Selection & Base64 Conversion
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;
    setSavingProfile(true);

    try {
      const res = await fetch("/api/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedNode.employeeId,
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone,
          department: editDepartment,
          designation: editDesignation,
          reportingToName: editReportingTo,
          teamLeadName: editTeamLead,
          avatarUrl: editAvatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update employee details.");
      } else {
        setToast({
          message: `Profile and photo updated for ${selectedNode.employeeId}!`,
          type: "success",
        });
        loadEmployees();
      }
    } catch (err) {
      alert("Network error updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Upload a verification document
  const handleUploadSingleDoc = (e: React.ChangeEvent<HTMLInputElement>, categoryKey: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedNode) return;

    setUploadingDocKey(categoryKey);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      try {
        const payload: any = {
          employeeId: selectedNode.employeeId,
          category: categoryKey,
          fileName: file.name,
          fileUrl: dataUrl,
        };

        if (categoryKey === "DEGREE_CERTIFICATE") {
          payload.degreeType = degreeType;
          payload.degreeTitle = degreeTitle;
        }

        const res = await fetch("/api/employees/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          setToast({
            message: `${categoryKey.replace("_", " ")} uploaded successfully!`,
            type: "success",
          });
          loadDocumentsForEmployee(selectedNode.employeeId);
          loadEmployees();
        } else {
          alert(data.error || "Failed to upload document.");
        }
      } catch (err) {
        alert("Upload error.");
      } finally {
        setUploadingDocKey(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Send automated email reminder to HR for missing documents
  const handleSendHRMissingAlert = async () => {
    if (!selectedNode) return;
    setDocAlertLoading(true);

    try {
      const res = await fetch("/api/employees/document-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: selectedNode.employeeId }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({
          message: `Automated alert email dispatched to HR for ${selectedNode.firstName} ${selectedNode.lastName}!`,
          type: "success",
        });
      } else {
        alert(data.error || "Could not dispatch alert.");
      }
    } catch (e) {
      alert("Failed to send HR reminder.");
    } finally {
      setDocAlertLoading(false);
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      fullName.includes(query) ||
      emp.employeeId.toLowerCase().includes(query) ||
      emp.designation?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query);

    const matchesDept = deptFilter === "ALL" || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Calculate missing documents count for an employee
  const getDocStatus = (emp: any) => {
    const docs = emp.documents || [];
    const uploadedCats = docs.map((d: any) => d.category?.toUpperCase());
    const missing = MANDATORY_DOCS.filter((m) => !uploadedCats.includes(m.key));
    return {
      uploadedCount: uploadedCats.length,
      missingCount: missing.length,
      isCompliant: missing.length === 0,
      missingList: missing.map((m) => m.label),
    };
  };

  // Group by Tiers
  const tier1Founder = employees.filter(
    (e) => e.user?.role === "SUPER_ADMIN" && (e.designation?.toLowerCase().includes("founder") || e.firstName?.toLowerCase().includes("gokul"))
  );
  const tier2Leadership = employees.filter(
    (e) => (e.user?.role === "SUPER_ADMIN" || e.designation?.toLowerCase().includes("director")) && !tier1Founder.includes(e)
  );
  const tier3Managers = employees.filter(
    (e) => (e.user?.role === "HR_MANAGER" || e.user?.role === "TEAM_LEAD" || e.designation?.toLowerCase().includes("manager") || e.designation?.toLowerCase().includes("lead")) &&
      !tier1Founder.includes(e) && !tier2Leadership.includes(e)
  );
  const tier4Team = employees.filter(
    (e) => !tier1Founder.includes(e) && !tier2Leadership.includes(e) && !tier3Managers.includes(e)
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-16">
        {/* Toast Feedback */}
        {toast && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-md transition animate-fadeIn ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="p-1 text-slate-500 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Master Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Building2 className="w-3.5 h-3.5" />
              <span>INZOVATE Enterprise Workforce Hierarchy</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Organizational Hierarchy &amp; Profile Vault</h2>
            <p className="text-xs text-slate-500">
              Interactive corporate command chain. Click any employee to manage photos, IDs, reporting lines &amp; all 7 statutory credentials.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (currentUser) {
                  const meEmp = employees.find((e) => e.userId === currentUser.id) || employees[0];
                  if (meEmp) handleOpenEmployeeProfile(meEmp);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>My Profile &amp; Documents</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search personnel, ID, title, or department..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Departments</option>
              <option value="Executive Board">Executive Board</option>
              <option value="Corporate Governance">Corporate Governance</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Design & Product">Design & Product</option>
              <option value="Marketing & Growth">Marketing & Growth</option>
            </select>
          </div>
        </div>

        {/* SKELETON PLACEHOLDER WHILE LOADING */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 w-52 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 rounded-2xl bg-white dark:bg-[#0C1D3A] border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/40 rounded-md w-full mt-4" />
                    <div className="h-8 bg-slate-100 dark:bg-slate-800/40 rounded-xl w-full mt-3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE HIERARCHY TREE VIEW */}
        {!loading && (
          <div className="space-y-8">
          {/* TIER 1: FOUNDER & EXECUTIVE BOARD */}
          {tier1Founder.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Tier 1 — Founder &amp; Executive Board
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier1Founder.map((emp) => renderEmployeeCard(emp))}
              </div>
            </div>
          )}

          {/* TIER 2: CORPORATE GOVERNANCE & MANAGING DIRECTOR */}
          {tier2Leadership.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Tier 2 — Executive Leadership &amp; Managing Director
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier2Leadership.map((emp) => renderEmployeeCard(emp))}
              </div>
            </div>
          )}

          {/* TIER 3: DEPARTMENT HEADS, HR & TEAM LEADS */}
          {tier3Managers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Tier 3 — Operational Leadership, HR &amp; Team Leads
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier3Managers.map((emp) => renderEmployeeCard(emp))}
              </div>
            </div>
          )}

          {/* TIER 4: WORKFORCE & TEAM MEMBERS */}
          {tier4Team.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Tier 4 — Core Development, Specialists &amp; Operations
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier4Team.map((emp) => renderEmployeeCard(emp))}
              </div>
            </div>
          )}
        </div>
        )}

        {/* MODAL: COMPREHENSIVE EMPLOYEE VAULT & DOCUMENT MANAGEMENT */}
        {profileModalOpen && selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto text-xs">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-md">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                      <span>{selectedNode.firstName} {selectedNode.lastName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {selectedNode.employeeId}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Manage official profile photo, hierarchy reporting links, and 7 statutory verification documents.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SECTION 1: PHOTO & PROFILE DETAILS */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
                      {editAvatarUrl ? (
                        <img src={editAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{selectedNode.firstName?.slice(0, 1)}{selectedNode.lastName?.slice(0, 1)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <label className="font-bold text-slate-900 block text-xs">
                      Employee Headshot &amp; Identification Photo
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Insert or update employee photo. Displays across the hierarchy chart, dashboard, and sidebar.
                    </p>
                    <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                      <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer hover:bg-slate-100 transition shadow-2xs inline-flex items-center space-x-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-700" />
                        <span>{editAvatarUrl ? "Change Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {editAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setEditAvatarUrl(null)}
                          className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">First Name</label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Last Name</label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Department</label>
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Executive Board">Executive Board</option>
                      <option value="Corporate Governance">Corporate Governance</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Design & Product">Design & Product</option>
                      <option value="Marketing & Growth">Marketing & Growth</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Designation Title</label>
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Reporting Manager</label>
                    <input
                      type="text"
                      value={editReportingTo}
                      onChange={(e) => setEditReportingTo(e.target.value)}
                      placeholder="e.g. Mousik Shankar S / Gokul G"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Team Lead</label>
                    <input
                      type="text"
                      value={editTeamLead}
                      onChange={(e) => setEditTeamLead(e.target.value)}
                      placeholder="e.g. Lead Engineer"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-4 py-2 font-bold bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition shadow-md flex items-center space-x-1.5"
                  >
                    {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Profile Information</span>
                  </button>
                </div>
              </form>

              {/* SECTION 2: 7 MANDATORY VERIFICATION DOCUMENTS */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                      <span>7 Mandatory Verification Documents</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {nodeDocuments.length} / 7 Uploaded
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      If these documents are not uploaded, an automated alert email will be routed to HR.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendHRMissingAlert}
                    disabled={docAlertLoading}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto"
                    title="Send instant missing documents alert to HR"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{docAlertLoading ? "Sending..." : "Send Document Alert to HR"}</span>
                  </button>
                </div>

                {/* Degree Certificate details specification (UG / PG / Diploma) */}
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-blue-950 text-[11px]">Degree Classification *</label>
                    <select
                      value={degreeType}
                      onChange={(e) => setDegreeType(e.target.value)}
                      className="w-full p-2 rounded-xl border border-blue-200 bg-white font-medium"
                    >
                      <option value="UG">Undergraduate (UG) — B.E, B.Tech, B.Sc, B.Com, BCA</option>
                      <option value="PG">Postgraduate (PG) — M.E, M.Tech, MBA, MCA, M.Sc</option>
                      <option value="Diploma">Diploma / Polytechnic</option>
                      <option value="Doctorate">Doctorate / Ph.D.</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-blue-950 text-[11px]">Degree &amp; Specialization *</label>
                    <input
                      type="text"
                      value={degreeTitle}
                      onChange={(e) => setDegreeTitle(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science & Engineering"
                      className="w-full p-2 rounded-xl border border-blue-200 bg-white font-medium"
                    />
                  </div>
                </div>

                {/* 7 Document Upload Tiles */}
                <div className="space-y-2">
                  {MANDATORY_DOCS.map((docDef) => {
                    const uploadedDoc = nodeDocuments.find((d) => d.category.toUpperCase() === docDef.key);
                    const isUploading = uploadingDocKey === docDef.key;

                    return (
                      <div
                        key={docDef.key}
                        className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          uploadedDoc
                            ? "bg-emerald-50/60 border-emerald-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-xs">{docDef.label}</span>
                            {uploadedDoc ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-rose-700 bg-rose-100 px-2 py-0.2 rounded-full text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Missing (HR Alert Active)</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {docDef.desc}
                            {uploadedDoc?.degreeTitle && (
                              <span className="font-semibold text-blue-900 ml-1">
                                [{uploadedDoc.degreeType}: {uploadedDoc.degreeTitle}]
                              </span>
                            )}
                          </div>
                          {uploadedDoc && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              File: {uploadedDoc.fileName}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 self-start sm:self-auto">
                          {uploadedDoc?.fileUrl && (
                            <a
                              href={uploadedDoc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition"
                            >
                              View
                            </a>
                          )}
                          <label className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold cursor-pointer transition shadow-2xs inline-flex items-center space-x-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploading ? "Uploading..." : uploadedDoc ? "Update" : "Upload"}</span>
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              disabled={isUploading}
                              onChange={(e) => handleUploadSingleDoc(e, docDef.key)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );

  // Helper renderer for hierarchy cards
  function renderEmployeeCard(emp: any) {
    const docStatus = getDocStatus(emp);
    const isSuper = emp.user?.role === "SUPER_ADMIN";

    return (
      <div
        key={emp.id}
        className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-cyan-500/40 hover:shadow-lg transition-all duration-200 space-y-3.5 relative group"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar Photo */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                {emp.user?.avatarUrl ? (
                  <img src={emp.user.avatarUrl} alt={emp.firstName} className="w-full h-full object-cover" />
                ) : (
                  <span>{emp.firstName?.slice(0, 1)}{emp.lastName?.slice(0, 1)}</span>
                )}
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-white absolute -bottom-0.5 -right-0.5" />
            </div>

            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <span>{emp.firstName} {emp.lastName}</span>
                {isSuper && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />}
              </div>
              <div className="text-[10px] font-mono font-bold text-blue-900">
                {emp.employeeId}
              </div>
              <div className="text-[11px] font-semibold text-slate-700">
                {emp.designation}
              </div>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            {emp.user?.role || "EMPLOYEE"}
          </span>
        </div>

        {/* Metadata */}
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Department:</span>
            <strong className="text-slate-700">{emp.department}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Reports To:</span>
            <strong className="text-slate-800">{emp.reportingToName || "Founder & MD"}</strong>
          </div>
          {emp.teamLeadName && (
            <div className="flex justify-between">
              <span className="text-slate-400">Team Lead:</span>
              <strong className="text-slate-700">{emp.teamLeadName}</strong>
            </div>
          )}
        </div>

        {/* Document Compliance Badge */}
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <span className="text-slate-400 font-medium">Verification Vault:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
              docStatus.isCompliant
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {docStatus.isCompliant ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-600" />
            )}
            <span>{docStatus.uploadedCount} / 7 Docs</span>
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-1 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleOpenEmployeeProfile(emp)}
            className="w-full py-2 px-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Profile &amp; Documents</span>
          </button>
        </div>
      </div>
    );
  }
}
