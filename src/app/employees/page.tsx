"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { generatePayslipPDF } from "@/lib/pdf";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Edit3,
  Loader2,
  ShieldCheck,
  Briefcase,
  DollarSign,
  UserCheck,
  Camera,
  Upload,
  FileText,
  FileCheck,
  AlertTriangle,
  Eye,
  Crown,
} from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Add employee modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [designation, setDesignation] = useState("Developer");
  const [customDesignation, setCustomDesignation] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [reportingToName, setReportingToName] = useState("");
  const [teamLeadName, setTeamLeadName] = useState("");
  const [basicSalary, setBasicSalary] = useState(45000);
  const [hra, setHra] = useState(22500);
  const [specialAllowance, setSpecialAllowance] = useState(12500);
  const [formError, setFormError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Document upload state in Add Employee
  const [panDoc, setPanDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [aadhaarDoc, setAadhaarDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [bankPassbookDoc, setBankPassbookDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [marksheet10thDoc, setMarksheet10thDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [marksheet12thDoc, setMarksheet12thDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [collegeMarksheetDoc, setCollegeMarksheetDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [degreeCertificateDoc, setDegreeCertificateDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [addDegreeType, setAddDegreeType] = useState<string>("UG");
  const [addDegreeTitle, setAddDegreeTitle] = useState<string>("B.E / B.Tech Computer Science");

  // Edit employee modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editRole, setEditRole] = useState("EMPLOYEE");
  const [editStatus, setEditStatus] = useState("Active");
  const [editBasicSalary, setEditBasicSalary] = useState(45000);
  const [editHra, setEditHra] = useState(22500);
  const [editSpecialAllowance, setEditSpecialAllowance] = useState(12500);
  const [editWorkLocation, setEditWorkLocation] = useState("Chennai Headquarters");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Payslip preview modal state
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [payslipEmployee, setPayslipEmployee] = useState<any | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (departmentFilter !== "ALL") query.set("department", departmentFilter);
      if (statusFilter !== "ALL") query.set("status", statusFilter);

      const res = await fetch(`/api/employees?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [search, departmentFilter, statusFilter]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Photo file size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Helper for Document file uploads
  const handleDocUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<{ name: string; dataUrl: string } | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setter({
        name: file.name,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // Trigger automated compliance check across employees
  const handleAuditDocuments = async () => {
    try {
      setToast({ message: "Running document compliance sentinel audit...", type: "success" });
      const res = await fetch("/api/employees/document-alert", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setToast({
          message: data.message || `Audit complete. Flagged: ${data.totalFlagged}`,
          type: data.totalFlagged > 0 ? "error" : "success",
        });
        loadEmployees();
      }
    } catch (err) {
      setToast({ message: "Failed to run document compliance audit.", type: "error" });
    }
  };

  // Voice command & URL deep-link support: auto-open Add Employee modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkParams = () => {
        const params = new URLSearchParams(window.location.search);
        if (
          params.get("action") === "new" ||
          params.get("action") === "add" ||
          params.get("add") === "true"
        ) {
          setAddModalOpen(true);
        }
      };
      checkParams();

      const handleOpenEvent = () => setAddModalOpen(true);
      window.addEventListener("inzovate_open_add_employee", handleOpenEvent);
      return () => window.removeEventListener("inzovate_open_add_employee", handleOpenEvent);
    }
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreateLoading(true);

    if (!companyEmail.trim().toLowerCase().endsWith("@inzovate-technologies.com")) {
      setFormError("Company email must end with @inzovate-technologies.com");
      setCreateLoading(false);
      return;
    }

    const finalDesignation = designation === "OTHER" ? customDesignation.trim() || "Staff" : designation;

    // Build documents array
    const documents: any[] = [];
    if (panDoc) documents.push({ category: "PAN", fileName: panDoc.name, fileUrl: panDoc.dataUrl });
    if (aadhaarDoc) documents.push({ category: "AADHAAR", fileName: aadhaarDoc.name, fileUrl: aadhaarDoc.dataUrl });
    if (bankPassbookDoc) documents.push({ category: "BANK_PASSBOOK", fileName: bankPassbookDoc.name, fileUrl: bankPassbookDoc.dataUrl });
    if (marksheet10thDoc) documents.push({ category: "10TH_MARKSHEET", fileName: marksheet10thDoc.name, fileUrl: marksheet10thDoc.dataUrl });
    if (marksheet12thDoc) documents.push({ category: "12TH_MARKSHEET", fileName: marksheet12thDoc.name, fileUrl: marksheet12thDoc.dataUrl });
    if (collegeMarksheetDoc) documents.push({ category: "COLLEGE_MARKSHEET", fileName: collegeMarksheetDoc.name, fileUrl: collegeMarksheetDoc.dataUrl });
    if (degreeCertificateDoc) {
      documents.push({
        category: "DEGREE_CERTIFICATE",
        fileName: degreeCertificateDoc.name,
        fileUrl: degreeCertificateDoc.dataUrl,
        degreeType: addDegreeType,
        degreeTitle: addDegreeTitle,
      });
    }

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          companyEmail,
          phone,
          department,
          designation: finalDesignation,
          role,
          reportingToName: reportingToName || null,
          teamLeadName: teamLeadName || null,
          avatarUrl: avatarUrl || null,
          basicSalary,
          hra,
          specialAllowance,
          documents,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create employee.");
      } else {
        setAddModalOpen(false);
        setFirstName("");
        setLastName("");
        setCompanyEmail("");
        setPhone("");
        setAvatarUrl(null);
        setReportingToName("");
        setTeamLeadName("");
        setPanDoc(null);
        setAadhaarDoc(null);
        setBankPassbookDoc(null);
        setMarksheet10thDoc(null);
        setMarksheet12thDoc(null);
        setCollegeMarksheetDoc(null);
        setDegreeCertificateDoc(null);

        const msg = data.missingDocuments?.length > 0
          ? `Employee created! Alert sent to HR for missing docs: ${data.missingDocuments.join(", ")}`
          : "Employee profile created with all verification documents!";

        setToast({ message: msg, type: "success" });
        loadEmployees();
      }
    } catch (err) {
      setFormError("Network error while creating employee.");
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setEditFirstName(emp.firstName || "");
    setEditLastName(emp.lastName || "");
    setEditPhone(emp.phone || "");
    setEditDepartment(emp.department || "Engineering");
    setEditDesignation(emp.designation || "");
    setEditRole(emp.user?.role || "EMPLOYEE");
    setEditStatus(emp.employmentStatus || "Active");
    setEditBasicSalary(emp.basicSalary || 45000);
    setEditHra(emp.hra || 22500);
    setEditSpecialAllowance(emp.specialAllowance || 12500);
    setEditWorkLocation(emp.workLocation || "Chennai Headquarters");
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch("/api/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: editingEmployee.employeeId,
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone,
          department: editDepartment,
          designation: editDesignation,
          role: editRole,
          employmentStatus: editStatus,
          workLocation: editWorkLocation,
          basicSalary: editBasicSalary,
          hra: editHra,
          specialAllowance: editSpecialAllowance,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || "Failed to update employee.");
      } else {
        setEditModalOpen(false);
        setToast({
          message: `Employee ${editingEmployee.employeeId} (${editFirstName} ${editLastName}) updated successfully!`,
          type: "success",
        });
        loadEmployees();
      }
    } catch (err: any) {
      setEditError(err.message || "Network error updating employee.");
    } finally {
      setEditLoading(false);
    }
  };

  // Automatic Salary Slip Generation & Download (சேலரி ஸ்லிப் டவுன்லோட்)
  const handleDownloadPayslip = (emp: any) => {
    const basic = Number(emp.basicSalary) || 45000;
    const hraAmount = Number(emp.hra) || 22500;
    const special = Number(emp.specialAllowance) || 12500;
    const conveyance = Number(emp.conveyance) || 3000;
    const gross = basic + hraAmount + special + conveyance;

    // Statutory Deductions
    const employeePf = Math.round(basic * 0.12);
    const esi = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
    const professionalTax = 200;
    const tds = gross > 75000 ? Math.round(gross * 0.05) : 0;
    const totalDeductions = employeePf + esi + professionalTax + tds;
    const netSalary = Math.max(0, gross - totalDeductions);

    const today = new Date();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthStr = monthNames[today.getMonth()];
    const year = today.getFullYear();

    const doc = generatePayslipPDF({
      companyName: "INZOVATE TECHNOLOGIES PRIVATE LIMITED",
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeId: emp.employeeId,
      department: emp.department || "Engineering",
      designation: emp.designation || "Staff",
      panNumber: emp.panNumber || "ABCDE1234F",
      bankAccount: emp.bankAccount || "918273645012",
      bankName: "HDFC Bank Ltd",
      pfNumber: emp.pfNumber || "TN/CHN/0082736/000",
      month: monthStr,
      year: year,
      workingDays: 22,
      paidDays: 22,
      unpaidDays: 0,
      basicSalary: basic,
      hra: hraAmount,
      specialAllowance: special,
      conveyance: conveyance,
      bonuses: 0,
      grossSalary: gross,
      employeePf: employeePf,
      esi: esi,
      professionalTax: professionalTax,
      tds: tds,
      lopDeduction: 0,
      totalDeductions: totalDeductions,
      netSalary: netSalary,
    });

    doc.save(`Inzovate_Payslip_${emp.employeeId}_${monthStr}_${year}.pdf`);
    setToast({
      message: `Payslip for ${emp.firstName} ${emp.lastName} (${monthStr} ${year}) downloaded successfully!`,
      type: "success",
    });
  };

  const exportCSV = () => {
    const headers = "Employee ID,Full Name,Email,Department,Designation,Status,Gross Salary\n";
    const rows = employees
      .map(
        (e) =>
          `"${e.employeeId}","${e.firstName} ${e.lastName}","${e.companyEmail}","${e.department}","${e.designation}","${e.employmentStatus}","${e.grossSalary}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Inzovate_Employee_Roster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* Toast Notification */}
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Users className="w-3.5 h-3.5" />
              <span>Human Capital Master Directory</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Employee Master Directory</h2>
            <p className="text-xs text-slate-500">
              Complete personnel governance, onboarding document verification, direct compensation &amp; automated payslip download.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleAuditDocuments}
              className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition flex items-center space-x-1.5 border border-amber-200 shadow-2xs"
              title="Audit missing verification documents across employees"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Audit Document Compliance</span>
            </button>
            <button
              type="button"
              onClick={exportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-md transition flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, title, or email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Design & Product">Design & Product</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
                <option value="Executive Leadership">Executive Leadership</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Workforce Register</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {employees.length} Personnel Found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Leadership &amp; Reporting</th>
                  <th className="px-5 py-3.5">Official Email</th>
                  <th className="px-5 py-3.5">Monthly Gross</th>
                  <th className="px-5 py-3.5">Documents</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-900" />
                        <span>Loading employee directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      No matching employee records found.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const docs = emp.documents || [];
                    const uploadedCats = docs.map((d: any) => d.category?.toUpperCase());
                    const required = [
                      "AADHAAR",
                      "PAN",
                      "BANK_PASSBOOK",
                      "10TH_MARKSHEET",
                      "12TH_MARKSHEET",
                      "COLLEGE_MARKSHEET",
                      "DEGREE_CERTIFICATE",
                    ];
                    const verifiedCount = required.filter((r) => uploadedCats.includes(r)).length;
                    const allVerified = verifiedCount === required.length;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                        {/* Employee Avatar + Name + Emp ID */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs border border-slate-200">
                              {emp.user?.avatarUrl ? (
                                <img
                                  src={emp.user.avatarUrl}
                                  alt={emp.firstName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{emp.firstName?.slice(0, 1)}{emp.lastName?.slice(0, 1)}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                                <span>{emp.firstName} {emp.lastName}</span>
                                {emp.user?.role === "SUPER_ADMIN" && (
                                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                                )}
                              </div>
                              <div className="text-[10px] font-mono font-bold text-blue-900">
                                {emp.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department & Designation */}
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-800">{emp.department}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{emp.designation}</div>
                        </td>

                        {/* Reporting Manager & Team Lead */}
                        <td className="px-5 py-3.5 text-slate-700">
                          <div className="text-[11px]">
                            <span className="text-slate-400 font-medium">Mgr: </span>
                            <strong className="text-slate-800">{emp.reportingToName || "Founder & MD"}</strong>
                          </div>
                          {emp.teamLeadName && (
                            <div className="text-[10.5px] text-slate-500 mt-0.5">
                              <span className="text-slate-400">TL: </span>
                              <span className="font-medium text-slate-700">{emp.teamLeadName}</span>
                            </div>
                          )}
                        </td>

                        {/* Official Email */}
                        <td className="px-5 py-3.5 font-mono text-slate-600 text-[11px]">
                          {emp.companyEmail}
                        </td>

                        {/* Gross Salary */}
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                          ₹{emp.grossSalary?.toLocaleString("en-IN")}
                        </td>

                        {/* Documents Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              allVerified
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                            title={allVerified ? "All mandatory verification documents verified" : `${verifiedCount}/7 documents uploaded`}
                          >
                            {allVerified ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            )}
                            <span>{verifiedCount}/7 Docs</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              emp.employmentStatus === "Active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : emp.employmentStatus === "On Leave"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {emp.employmentStatus}
                          </span>
                        </td>

                        {/* Actions: Download Payslip + Edit */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Salary Slip Download (சேலரி ஸ்லிப் டவுன்லோட்) */}
                            <button
                              type="button"
                              onClick={() => handleDownloadPayslip(emp)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition inline-flex items-center space-x-1 shadow-2xs"
                              title="Download authenticated salary slip (PDF)"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Payslip</span>
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => openEditModal(emp)}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] border border-blue-200 transition inline-flex items-center space-x-1 shadow-2xs"
                              title="Edit employee profile"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* EDIT EMPLOYEE MODAL */}
        {editModalOpen && editingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-900/10 text-blue-900 flex items-center justify-center font-bold">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Edit Employee: {editingEmployee.employeeId}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Update professional title, role, status, and compensation structure.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">First Name</label>
                    <input
                      type="text"
                      required
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Last Name</label>
                    <input
                      type="text"
                      required
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Employment Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Resigned">Resigned</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Department</label>
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Design & Product">Design & Product</option>
                      <option value="Marketing & Growth">Marketing & Growth</option>
                      <option value="Executive Leadership">Executive Leadership</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Designation</label>
                    <input
                      type="text"
                      required
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Role Authority</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="TEAM_LEAD">Team Leader</option>
                      <option value="HR_MANAGER">HR Manager</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Work Location</label>
                    <input
                      type="text"
                      value={editWorkLocation}
                      onChange={(e) => setEditWorkLocation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    Compensation Structure (INR ₹)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500">Basic Salary</label>
                      <input
                        type="number"
                        value={editBasicSalary}
                        onChange={(e) => setEditBasicSalary(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500">HRA</label>
                      <input
                        type="number"
                        value={editHra}
                        onChange={(e) => setEditHra(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500">Special Allow.</label>
                      <input
                        type="number"
                        value={editSpecialAllowance}
                        onChange={(e) => setEditSpecialAllowance(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-slate-500">New Estimated Gross Salary:</span>
                    <strong className="font-mono text-emerald-700 font-bold">
                      ₹{(Number(editBasicSalary) + Number(editHra) + Number(editSpecialAllowance) + 3000).toLocaleString("en-IN")} / mo
                    </strong>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2 font-bold bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save Employee Details</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD EMPLOYEE MODAL (Comprehensive with Photo, Manager, TL, Depts, Designations, Documents) */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-md">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Onboard New Employee</h3>
                    <p className="text-[11px] text-slate-500">
                      Profile photo, leadership structure, departmental assignment, statutory documents, and compensation.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
                {/* 1. PHOTO UPLOAD SECTION */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-7 h-7 text-white/80" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <label className="font-bold text-slate-900 block text-xs">
                      Employee Profile Photo
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload an executive headshot (PNG, JPG, max 2MB). Displays in sidebar and directory.
                    </p>
                    <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                      <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer hover:bg-slate-100 transition shadow-2xs inline-flex items-center space-x-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl(null)}
                          className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. BASIC INFORMATION */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">
                      Official Company Email
                    </label>
                    <input
                      type="email"
                      required
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="firstname.lastname@inzovate-technologies.com"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. DEPARTMENT & DESIGNATION */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Design & Product">Design & Product</option>
                      <option value="Marketing & Growth">Marketing & Growth</option>
                      <option value="Executive Leadership">Executive Leadership</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Designation / Role Title</label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Developer">Developer</option>
                      <option value="Business Development Executive">Business Development Executive</option>
                      <option value="Software Engineer">Software Engineer</option>
                      <option value="Senior Software Engineer">Senior Software Engineer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="HR Specialist">HR Specialist</option>
                      <option value="Talent Acquisition Specialist">Talent Acquisition Specialist</option>
                      <option value="Marketing & Growth Lead">Marketing & Growth Lead</option>
                      <option value="Executive Director">Executive Director</option>
                      <option value="OTHER">Custom Designation...</option>
                    </select>
                  </div>
                </div>

                {designation === "OTHER" && (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Enter Custom Designation</label>
                    <input
                      type="text"
                      required
                      value={customDesignation}
                      onChange={(e) => setCustomDesignation(e.target.value)}
                      placeholder="e.g. AI Research Engineer"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                )}

                {/* 4. REPORTING MANAGER & TEAM LEAD */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Reporting Manager</label>
                    <input
                      type="text"
                      value={reportingToName}
                      onChange={(e) => setReportingToName(e.target.value)}
                      placeholder="e.g. Mousik Shankar S / Gokul G"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Team Lead</label>
                    <input
                      type="text"
                      value={teamLeadName}
                      onChange={(e) => setTeamLeadName(e.target.value)}
                      placeholder="e.g. Lead Engineer / Project Head"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">System Role Access</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="EMPLOYEE">Employee (Standard Portal Access)</option>
                    <option value="TEAM_LEAD">Team Leader (Shift & Team Approval)</option>
                    <option value="HR_MANAGER">HR Manager (HR Management Suite)</option>
                    <option value="ADMIN">Admin (Full System Privileges)</option>
                  </select>
                </div>

                {/* 5. MANDATORY VERIFICATION DOCUMENTS UPLOAD */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[10.5px] block">
                        Mandatory Verification Documents
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Upload statutory cards and academic credentials for background verification.
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      Statutory Onboarding
                    </span>
                  </div>

                  {/* 4 Document cards: PAN, Aadhaar, 10th Marksheet, 12th Marksheet */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* PAN Card */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">1. PAN Card</span>
                        {panDoc ? (
                          <span className="text-emerald-600 flex items-center space-x-1 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Required</span>
                        )}
                      </div>
                      <label className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition flex items-center justify-between text-[11px] shadow-2xs">
                        <span className="truncate max-w-[160px]">
                          {panDoc ? panDoc.name : "Select PAN file (PDF/IMG)..."}
                        </span>
                        <Upload className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleDocUpload(e, setPanDoc)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Aadhaar Card */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">2. Aadhaar Card</span>
                        {aadhaarDoc ? (
                          <span className="text-emerald-600 flex items-center space-x-1 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Required</span>
                        )}
                      </div>
                      <label className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition flex items-center justify-between text-[11px] shadow-2xs">
                        <span className="truncate max-w-[160px]">
                          {aadhaarDoc ? aadhaarDoc.name : "Select Aadhaar file..."}
                        </span>
                        <Upload className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleDocUpload(e, setAadhaarDoc)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* 10th Marksheet */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">3. 10th Marksheet</span>
                        {marksheet10thDoc ? (
                          <span className="text-emerald-600 flex items-center space-x-1 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Required</span>
                        )}
                      </div>
                      <label className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition flex items-center justify-between text-[11px] shadow-2xs">
                        <span className="truncate max-w-[160px]">
                          {marksheet10thDoc ? marksheet10thDoc.name : "Select 10th Marksheet..."}
                        </span>
                        <Upload className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleDocUpload(e, setMarksheet10thDoc)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* 12th Marksheet */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">4. 12th Marksheet</span>
                        {marksheet12thDoc ? (
                          <span className="text-emerald-600 flex items-center space-x-1 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Required</span>
                        )}
                      </div>
                      <label className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition flex items-center justify-between text-[11px] shadow-2xs">
                        <span className="truncate max-w-[160px]">
                          {marksheet12thDoc ? marksheet12thDoc.name : "Select 12th Marksheet..."}
                        </span>
                        <Upload className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleDocUpload(e, setMarksheet12thDoc)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Bank Passbook */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">5. Bank Passbook</span>
                        {bankPassbookDoc ? (
                          <span className="text-emerald-600 flex items-center space-x-1 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Required</span>
                        )}
                      </div>
                      <label className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition flex items-center justify-between text-[11px] shadow-2xs">
                        <span className="truncate max-w-[160px]">
                          {bankPassbookDoc ? bankPassbookDoc.name : "Select Bank Passbook file..."}
                        </span>
                        <Upload className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleDocUpload(e, setBankPassbookDoc)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* College Marksheet */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">6. College Marksheet</span>
                        {collegeMarksheetDoc ? (
                          <span className="text-emerald-600 flex items-center space-x-1 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Required</span>
                        )}
                      </div>
                      <label className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition flex items-center justify-between text-[11px] shadow-2xs">
                        <span className="truncate max-w-[160px]">
                          {collegeMarksheetDoc ? collegeMarksheetDoc.name : "Select College Marksheet..."}
                        </span>
                        <Upload className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleDocUpload(e, setCollegeMarksheetDoc)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Consolidated Degree Certificate */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">7. Consolidated Degree Certificate (UG / PG / Diploma)</span>
                        {degreeCertificateDoc ? (
                          <span className="text-emerald-600 flex items-center space-x-1 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Uploaded ({addDegreeType}: {addDegreeTitle})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Required</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-1">
                        <select
                          value={addDegreeType}
                          onChange={(e) => setAddDegreeType(e.target.value)}
                          className="p-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                        >
                          <option value="UG">Undergraduate (UG)</option>
                          <option value="PG">Postgraduate (PG)</option>
                          <option value="Diploma">Diploma / Polytechnic</option>
                          <option value="Doctorate">Doctorate / Ph.D.</option>
                        </select>
                        <input
                          type="text"
                          value={addDegreeTitle}
                          onChange={(e) => setAddDegreeTitle(e.target.value)}
                          placeholder="e.g. B.Tech Computer Science & Engg"
                          className="p-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <label className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition flex items-center justify-between text-[11px] shadow-2xs">
                        <span className="truncate max-w-[280px]">
                          {degreeCertificateDoc ? degreeCertificateDoc.name : "Select Degree Certificate..."}
                        </span>
                        <Upload className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleDocUpload(e, setDegreeCertificateDoc)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Compliance Notice */}
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Automated HR Sentinel Policy:</strong> If any of these mandatory verification documents are not uploaded, an automated alert and email will be immediately transmitted to HR Operations for compliance tracking.
                    </div>
                  </div>
                </div>

                {/* 6. SALARY STRUCTURE */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    Salary Structure (INR ₹)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500">Basic Salary</label>
                      <input
                        type="number"
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500">HRA</label>
                      <input
                        type="number"
                        value={hra}
                        onChange={(e) => setHra(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500">Special Allow.</label>
                      <input
                        type="number"
                        value={specialAllowance}
                        onChange={(e) => setSpecialAllowance(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Gross Monthly CTC:</span>
                    <strong className="font-mono text-emerald-700 font-bold">
                      ₹{(Number(basicSalary) + Number(hra) + Number(specialAllowance) + 3000).toLocaleString("en-IN")} / mo
                    </strong>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2 font-bold bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    {createLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Onboarding Staff...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Create Employee Profile</span>
                      </>
                    )}
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
