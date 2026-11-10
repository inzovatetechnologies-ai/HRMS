"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  GraduationCap,
  Banknote,
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  AlertCircle,
  Loader2,
  X,
  Mail,
  Phone,
  Building,
  User,
  ShieldCheck,
  GitPullRequest,
  Star,
  Download,
  Sparkles,
  FileCheck2,
  DollarSign,
  CreditCard,
  Receipt,
  Calendar,
  Send,
  Play,
  Square,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  Printer,
  Copy,
  Check,
  Zap,
  FileSpreadsheet,
  FileText,
  Eye,
} from "lucide-react";
import { generateCertificatePDF, generateInternshipLetterPDF } from "@/lib/pdf";

interface LogbookItem {
  id: string;
  internId: string;
  internName: string;
  domain: string;
  date: string;
  taskTitle: string;
  hoursSpent: number;
  githubPrUrl: string;
  mentorRating: number;
  mentorFeedback: string;
  verifiedBy: string;
}

const DEFAULT_LOGBOOKS: LogbookItem[] = [
  {
    id: "LOG-101",
    internId: "INZ-INT-2026-001",
    internName: "Karthik Subramanian",
    domain: "AI & Machine Learning",
    date: "2026-10-12",
    taskTitle: "Implemented ROS2 Node with Jetson AGX Hardware Acceleration",
    hoursSpent: 7.5,
    githubPrUrl: "https://github.com/inzovate/robotics-core/pull/42",
    mentorRating: 5,
    mentorFeedback: "Flawless real-time edge processing on NVIDIA Jetson. Outstanding work!",
    verifiedBy: "Prem Kumar",
  },
  {
    id: "LOG-102",
    internId: "INZ-INT-2026-002",
    internName: "Divya Ramesh",
    domain: "Frontend Development",
    date: "2026-10-12",
    taskTitle: "Re-engineered Attendance 7-Day Trend Chart & Pill Navbar",
    hoursSpent: 6.0,
    githubPrUrl: "https://github.com/inzovate/hrms-ui/pull/108",
    mentorRating: 5,
    mentorFeedback: "Pixel-perfect implementation of the Cyber-Obsidian executive design system.",
    verifiedBy: "Priya Nair",
  },
];

export default function InternshipPage() {
  const [activeTab, setActiveTab] = useState<"CADRE" | "TRAINERS" | "ATTENDANCE" | "FEES" | "LOGBOOK">("CADRE");
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);

  // Trainer Allocation & Scheduling states
  const [availableTrainers, setAvailableTrainers] = useState<any[]>([]);
  const [canAllocateTrainers, setCanAllocateTrainers] = useState(false);
  const [assignTrainerModalOpen, setAssignTrainerModalOpen] = useState(false);
  const [selectedInternForTrainer, setSelectedInternForTrainer] = useState<any | null>(null);
  const [selectedTrainerEmpId, setSelectedTrainerEmpId] = useState("");
  const [isAssigningTrainer, setIsAssigningTrainer] = useState(false);

  // Daily Class Scheduling states (09:00 AM - 08:00 PM)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedInternForSchedule, setSelectedInternForSchedule] = useState<any | null>(null);
  const [scheduleStartTime, setScheduleStartTime] = useState("10:00");
  const [scheduleEndTime, setScheduleEndTime] = useState("12:00");
  const [scheduleTopic, setScheduleTopic] = useState("");
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isRemindingTrainers, setIsRemindingTrainers] = useState(false);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);

  // Intern Punch-In & Punch-Out with Mandatory Feedback states
  const [punchOutFeedbackModalOpen, setPunchOutFeedbackModalOpen] = useState(false);
  const [selectedInternForPunch, setSelectedInternForPunch] = useState<any | null>(null);
  const [internFeedback, setInternFeedback] = useState("");
  const [isPunching, setIsPunching] = useState(false);
  const [todayAttendances, setTodayAttendances] = useState<any[]>([]);

  // Trainer Teaching Feedback state
  const [trainerFeedbackModalOpen, setTrainerFeedbackModalOpen] = useState(false);
  const [selectedInternForTrainerFeedback, setSelectedInternForTrainerFeedback] = useState<any | null>(null);
  const [trainerFeedbackText, setTrainerFeedbackText] = useState("");
  const [isSubmittingTrainerFeedback, setIsSubmittingTrainerFeedback] = useState(false);

  // Intern Prior Leave Intimation states
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedInternForLeave, setSelectedInternForLeave] = useState<any | null>(null);
  const [leaveReason, setLeaveReason] = useState("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [isCheckingAbsentee, setIsCheckingAbsentee] = useState(false);

  // Student Payment Recording Modal states ("இவ்வளவு பே பண்ணிருக்காங்க, இவ்வளவு பே பண்ணல, ரிமைனிங் இவ்வளவு")
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInternForPay, setSelectedInternForPay] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState<number>(5000);
  const [payMode, setPayMode] = useState("UPI / GPay");
  const [payTxnRef, setPayTxnRef] = useState("");
  const [payNotes, setPayNotes] = useState("Tuition & domain fee installment");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Morning Governance Audit & Hierarchy View states
  const [isAuditingMorning, setIsAuditingMorning] = useState(false);
  const [hierarchyViewMode, setHierarchyViewMode] = useState<"HIERARCHY" | "TABLE">("HIERARCHY");

  // Trainer Morning Attendance & Timing Modal states
  const [trainerAttendanceModalOpen, setTrainerAttendanceModalOpen] = useState(false);
  const [selectedInternForTrainerAtt, setSelectedInternForTrainerAtt] = useState<any | null>(null);
  const [trainerAttPunchIn, setTrainerAttPunchIn] = useState("10:00");
  const [trainerAttPunchOut, setTrainerAttPunchOut] = useState("12:00");
  const [trainerAttStatus, setTrainerAttStatus] = useState("PRESENT");
  const [trainerAttTeachingNotes, setTrainerAttTeachingNotes] = useState("");
  const [trainerAttLearningNotes, setTrainerAttLearningNotes] = useState("");
  const [isSavingTrainerAtt, setIsSavingTrainerAtt] = useState(false);

  // Logbook state
  const [logbooks, setLogbooks] = useState<LogbookItem[]>([]);
  const [newLogModalOpen, setNewLogModalOpen] = useState(false);
  const [logTaskTitle, setLogTaskTitle] = useState("");
  const [logHours, setLogHours] = useState(7);
  const [logPrUrl, setLogPrUrl] = useState("");
  const [selectedInternForLog, setSelectedInternForLog] = useState("");

  // Relieving Letter Modal state
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedCertIntern, setSelectedCertIntern] = useState<any>(null);
  const [certModalDocType, setCertModalDocType] = useState<"LETTER" | "CERTIFICATE">("LETTER");
  const [copiedToken, setCopiedToken] = useState(false);

  const handleDownloadInternLetter = (intern: any) => {
    if (!intern) return;
    const doc = generateInternshipLetterPDF({
      referenceNo: `INZ/INT/2026/${String(intern.internId || "001").replace(/[^0-9]/g, "").slice(-4).padStart(4, "0")}`,
      issueDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      internName: intern.fullName,
      internId: intern.internId,
      college: intern.college,
      degree: intern.degree,
      domain: intern.domain,
      trainerName: intern.trainerName || intern.mentor || "Enterprise Senior Lead",
      startDate: intern.startDate || "2026-09-01",
      endDate: intern.endDate || new Date().toISOString().split("T")[0],
      feeStatus: Number(intern.remainingBalance || 0) === 0 ? "CLEARED" : "PENDING",
      totalFee: Number(intern.totalFee || 6000),
      amountPaid: Number(intern.amountPaid || 3000),
      remainingBalance: Number(intern.remainingBalance || 0),
      verificationToken: `INZ-VERIFY-${intern.internId || "INT"}-${Math.floor(100000 + Math.random() * 900000)}`,
    });
    doc.save(`Inzovate_Clearance_Letter_${intern.fullName.replace(/\s+/g, "_")}.pdf`);
  };

  const handleDownloadInternCert = (intern: any) => {
    if (!intern) return;
    const doc = generateCertificatePDF({
      certificateNumber: `INZ-CERT-${intern.internId || "2026"}`,
      recipientName: intern.fullName,
      recipientId: intern.internId,
      type: "INTERNSHIP_COMPLETION",
      domainOrDept: intern.domain,
      duration: `${intern.durationWeeks || 8} Weeks (${intern.startDate || "2026-09"} - Present)`,
      issueDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      verificationToken: `INZ-CERT-${intern.internId || "INT"}-${Math.floor(100000 + Math.random() * 900000)}`,
      mentorOrSignatory: intern.trainerName || intern.mentor || "Technical Mentor",
    });
    doc.save(`Inzovate_Certificate_${intern.fullName.replace(/\s+/g, "_")}.pdf`);
  };

  // Master Attendance Sheet & Dossier states
  const [attendanceFilterMode, setAttendanceFilterMode] = useState<"TODAY" | "DATE" | "ALL">("TODAY");
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>("ALL");
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState<string>("");

  const [historicalAttendances, setHistoricalAttendances] = useState<any[]>([]);
  const [isLoadingAttendanceSheet, setIsLoadingAttendanceSheet] = useState<boolean>(false);
  const [attendanceSummary, setAttendanceSummary] = useState<{
    presentCount: number;
    absentCount: number;
    leaveCount: number;
    totalHours: number;
  }>({ presentCount: 0, absentCount: 0, leaveCount: 0, totalHours: 0 });

  // Individual Student Dossier Modal
  const [dossierModalOpen, setDossierModalOpen] = useState<boolean>(false);
  const [selectedInternForDossier, setSelectedInternForDossier] = useState<any | null>(null);
  const [dossierRecords, setDossierRecords] = useState<any[]>([]);
  const [isDossierLoading, setIsDossierLoading] = useState<boolean>(false);

  const loadHistoricalAttendanceData = async (mode = attendanceFilterMode, dateStr = selectedAttendanceDate, studentId = selectedStudentFilter) => {
    try {
      setIsLoadingAttendanceSheet(true);
      const params = new URLSearchParams();
      if (mode === "ALL") {
        params.set("all", "true");
      } else if (mode === "DATE" && dateStr) {
        params.set("date", dateStr);
      } else {
        params.set("date", new Date().toISOString().split("T")[0]);
      }

      if (studentId && studentId !== "ALL") {
        params.set("internId", studentId);
      }

      const res = await fetch(`/api/internship/attendance?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setHistoricalAttendances(data.attendances || []);
        if (data.summary) setAttendanceSummary(data.summary);
      }
    } catch (err) {
      console.warn("Failed to load historical attendance:", err);
    } finally {
      setIsLoadingAttendanceSheet(false);
    }
  };

  const openStudentDossier = async (intern: any) => {
    setSelectedInternForDossier(intern);
    setDossierModalOpen(true);
    setIsDossierLoading(true);
    try {
      const res = await fetch(`/api/internship/attendance?internId=${intern.internId}&all=true`);
      const data = await res.json();
      if (data.success) {
        setDossierRecords(data.attendances || []);
      }
    } catch (err) {
      console.warn("Failed to fetch student dossier:", err);
    } finally {
      setIsDossierLoading(false);
    }
  };

  const handleExportAttendanceSheet = (format: "excel" | "pdf" | "csv", specificInternId?: string) => {
    const params = new URLSearchParams();
    params.set("format", format);

    if (specificInternId) {
      params.set("internId", specificInternId);
      params.set("all", "true");
    } else {
      if (attendanceFilterMode === "ALL") {
        params.set("all", "true");
      } else if (attendanceFilterMode === "DATE" && selectedAttendanceDate) {
        params.set("date", selectedAttendanceDate);
      } else {
        params.set("date", new Date().toISOString().split("T")[0]);
      }

      if (selectedStudentFilter && selectedStudentFilter !== "ALL") {
        params.set("internId", selectedStudentFilter);
      }
    }

    window.open(`/api/internship/attendance/export?${params.toString()}`, "_blank");
  };

  useEffect(() => {
    if (activeTab === "ATTENDANCE") {
      loadHistoricalAttendanceData(attendanceFilterMode, selectedAttendanceDate, selectedStudentFilter);
    }
  }, [activeTab, attendanceFilterMode, selectedAttendanceDate, selectedStudentFilter]);

  // New intern form states
  const [fullName, setFullName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [domain, setDomain] = useState("Full Stack Web Development");
  const [batch, setBatch] = useState("Batch-2026-Q1");
  const [mentor, setMentor] = useState("Prem Kumar");
  const [workMode, setWorkMode] = useState("Remote");
  const [totalFee, setTotalFee] = useState<number>(6000);
  const [initialPayment, setInitialPayment] = useState<number>(6000);

  // Submission feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pageToast, setPageToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadTrainerAndScheduleData = async () => {
    try {
      const [allocRes, schedRes, attRes] = await Promise.all([
        fetch("/api/internship/trainer-allocation").then((r) => r.json()),
        fetch("/api/internship/schedule").then((r) => r.json()),
        fetch("/api/internship/attendance").then((r) => r.json()),
      ]);

      if (allocRes.success) {
        setAvailableTrainers(allocRes.availableTrainers || []);
        setCanAllocateTrainers(Boolean(allocRes.canAllocate));
      }
      if (schedRes.success) {
        setTodaySchedules(schedRes.schedules || []);
      }
      if (attRes.success) {
        setTodayAttendances(attRes.attendances || []);
      }
    } catch (err) {
      console.warn("Failed to load trainer/schedule telemetry:", err);
    }
  };

  const loadInterns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/internship");
      const data = await res.json();
      if (data.success) {
        setInternships(data.internships || []);
      }
    } catch (err) {
      console.error("Failed to load interns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterns();
    loadTrainerAndScheduleData();
    try {
      const stored = localStorage.getItem("inzovate_intern_logbooks");
      if (stored) {
        setLogbooks(JSON.parse(stored));
      } else {
        setLogbooks(DEFAULT_LOGBOOKS);
      }
    } catch {
      setLogbooks(DEFAULT_LOGBOOKS);
    }

    // Voice Copilot & URL deep-link listeners
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "onboard" || params.get("action") === "new") {
        setOnboardModalOpen(true);
      }
      if (params.get("action") === "schedule") {
        setScheduleModalOpen(true);
      }
      if (params.get("tab") === "FEES") {
        setActiveTab("FEES");
      }

      const handleAddIntern = () => setOnboardModalOpen(true);
      const handleScheduleClass = () => setScheduleModalOpen(true);
      const handleRecordPay = () => setActiveTab("FEES");

      window.addEventListener("inzovate_open_add_intern", handleAddIntern);
      window.addEventListener("inzovate_open_schedule_class", handleScheduleClass);
      window.addEventListener("inzovate_open_record_pay", handleRecordPay);

      return () => {
        window.removeEventListener("inzovate_open_add_intern", handleAddIntern);
        window.removeEventListener("inzovate_open_schedule_class", handleScheduleClass);
        window.removeEventListener("inzovate_open_record_pay", handleRecordPay);
      };
    }
  }, []);

  const saveLogbooks = (newList: LogbookItem[]) => {
    setLogbooks(newList);
    try {
      localStorage.setItem("inzovate_intern_logbooks", JSON.stringify(newList));
    } catch {}
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    const internObj = internships.find((i) => i.internId === selectedInternForLog) || {
      internId: "INZ-INT-2026-001",
      fullName: "Karthik Subramanian",
      domain: "AI Engineering",
    };

    const newLog: LogbookItem = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      internId: internObj.internId,
      internName: internObj.fullName,
      domain: internObj.domain,
      date: new Date().toISOString().split("T")[0],
      taskTitle: logTaskTitle.trim(),
      hoursSpent: Number(logHours),
      githubPrUrl: logPrUrl.trim() || "https://github.com/inzovate/repo/pull/1",
      mentorRating: 5,
      mentorFeedback: "Work verified and verified against milestone deliverables.",
      verifiedBy: "Prem Kumar",
    };

    saveLogbooks([newLog, ...logbooks]);
    setNewLogModalOpen(false);
    setLogTaskTitle("");
    setLogPrUrl("");
    alert("Daily work log saved & submitted to mentor!");
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/internship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          personalEmail: personalEmail.trim(),
          phone: phone.trim() || "+91 97890 00000",
          college: college.trim() || "Affiliated Engineering College",
          degree: degree.trim() || "B.Tech Computer Science & Engineering",
          domain,
          batch,
          mentor,
          workMode,
          totalFee: Number(totalFee) || 0,
          initialPayment: Number(initialPayment) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Failed to onboard intern. Please check all details.");
      } else {
        const newIntern = data.internship;
        setPageToast({
          message: `Intern successfully onboarded: ${newIntern.fullName} (ID: ${newIntern.internId})! Remaining Due: ₹${newIntern.remainingBalance?.toLocaleString("en-IN")}`,
          type: "success",
        });

        setFullName("");
        setPersonalEmail("");
        setPhone("");
        setCollege("");
        setDegree("");
        setTotalFee(6000);
        setInitialPayment(6000);
        setOnboardModalOpen(false);

        await loadInterns();
      }
    } catch (err: any) {
      setSubmitError(err.message || "Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Record student fee payment & immediately calculate remaining balance
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForPay) return;
    setIsRecordingPayment(true);

    try {
      const res = await fetch("/api/internship/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internshipId: selectedInternForPay.id,
          amount: Number(payAmount),
          paymentMode: payMode,
          transactionRef: payTxnRef.trim() || `UPI-${Date.now().toString().slice(-6)}`,
          notes: payNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to record payment.");
      } else {
        setPageToast({
          message: `Payment of ₹${Number(payAmount).toLocaleString("en-IN")} recorded for ${selectedInternForPay.fullName}! New Balance: ₹${data.internship?.remainingBalance?.toLocaleString("en-IN") || 0}`,
          type: "success",
        });
        setPaymentModalOpen(false);
        setSelectedInternForPay(null);
        setPayTxnRef("");
        await loadInterns();
      }
    } catch (err: any) {
      alert("Error recording payment: " + err.message);
    } finally {
      setIsRecordingPayment(false);
    }
  };

  // Handler: Assign Trainer to Intern (Only HR, Super Admin, Founder, MD, CMO)
  const handleAssignTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForTrainer || !selectedTrainerEmpId) {
      alert("Please select a trainer to assign.");
      return;
    }

    setIsAssigningTrainer(true);
    try {
      const res = await fetch("/api/internship/trainer-allocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internId: selectedInternForTrainer.internId,
          trainerEmployeeId: selectedTrainerEmpId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPageToast({
          message: data.message || "Trainer assigned and notified successfully!",
          type: "success",
        });
        setAssignTrainerModalOpen(false);
        setSelectedInternForTrainer(null);
        setSelectedTrainerEmpId("");
        await loadInterns();
        await loadTrainerAndScheduleData();
      } else {
        alert(data.error || "Failed to assign trainer.");
      }
    } catch (err: any) {
      alert("Error assigning trainer: " + err.message);
    } finally {
      setIsAssigningTrainer(false);
    }
  };

  // Handler: Trainer sets daily class schedule (09:00 AM - 08:00 PM)
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForSchedule) return;

    setIsSavingSchedule(true);
    try {
      const res = await fetch("/api/internship/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internId: selectedInternForSchedule.internId,
          startTime: scheduleStartTime,
          endTime: scheduleEndTime,
          topic: scheduleTopic.trim() || `${selectedInternForSchedule.domain} Training`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPageToast({
          message: `Class scheduled (${scheduleStartTime} - ${scheduleEndTime} IST)! Notification sent to ${selectedInternForSchedule.fullName}.`,
          type: "success",
        });
        setScheduleModalOpen(false);
        setSelectedInternForSchedule(null);
        setScheduleTopic("");
        await loadTrainerAndScheduleData();
      } else {
        alert(data.error || "Failed to save schedule.");
      }
    } catch (err: any) {
      alert("Error scheduling class: " + err.message);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Handler: Send automated reminder to trainers to allocate class schedule
  const handleRemindTrainers = async () => {
    setIsRemindingTrainers(true);
    try {
      const res = await fetch("/api/internship/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REMIND_TRAINERS" }),
      });
      const data = await res.json();
      if (res.ok) {
        setPageToast({
          message: `Reminders dispatched to ${data.remindersDispatchedCount || 0} trainer(s) to set today's schedule!`,
          type: "success",
        });
        await loadTrainerAndScheduleData();
      } else {
        alert(data.error || "Failed to dispatch reminders.");
      }
    } catch (err: any) {
      alert("Error dispatching reminders: " + err.message);
    } finally {
      setIsRemindingTrainers(false);
    }
  };

  // Handler: Intern Punch-In
  const handleInternPunchIn = async (intern: any) => {
    setIsPunching(true);
    try {
      const res = await fetch("/api/internship/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PUNCH_IN",
          internId: intern.internId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPageToast({
          message: `Punch-in recorded for ${intern.fullName}! Remember to submit learning feedback upon completion.`,
          type: "success",
        });
        await loadTrainerAndScheduleData();
      } else {
        alert(data.error || "Failed to punch in.");
      }
    } catch (err: any) {
      alert("Error punching in: " + err.message);
    } finally {
      setIsPunching(false);
    }
  };

  // Handler: Intern Punch-Out (MANDATORY FEEDBACK ENFORCED)
  const handleInternPunchOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForPunch) return;

    if (!internFeedback || !internFeedback.trim()) {
      alert("Mandatory Learning Feedback Required: Please enter what you learned today before punching out!");
      return;
    }

    setIsPunching(true);
    try {
      const res = await fetch("/api/internship/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PUNCH_OUT",
          internId: selectedInternForPunch.internId,
          internFeedback: internFeedback.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPageToast({
          message: `Punch-out successful! Learning feedback logged for ${selectedInternForPunch.fullName}.`,
          type: "success",
        });
        setPunchOutFeedbackModalOpen(false);
        setSelectedInternForPunch(null);
        setInternFeedback("");
        await loadTrainerAndScheduleData();
      } else {
        alert(data.error || "Failed to punch out.");
      }
    } catch (err: any) {
      alert("Error punching out: " + err.message);
    } finally {
      setIsPunching(false);
    }
  };

  // Handler: Trainer Teaching Feedback
  const handleSubmitTrainerFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForTrainerFeedback) return;

    if (!trainerFeedbackText || !trainerFeedbackText.trim()) {
      alert("Please enter what topics you taught the student today.");
      return;
    }

    setIsSubmittingTrainerFeedback(true);
    try {
      const res = await fetch("/api/internship/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_TRAINER_FEEDBACK",
          internId: selectedInternForTrainerFeedback.internId,
          trainerFeedback: trainerFeedbackText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPageToast({
          message: "Trainer teaching feedback recorded successfully!",
          type: "success",
        });
        setTrainerFeedbackModalOpen(false);
        setSelectedInternForTrainerFeedback(null);
        setTrainerFeedbackText("");
        await loadTrainerAndScheduleData();
      } else {
        alert(data.error || "Failed to save trainer feedback.");
      }
    } catch (err: any) {
      alert("Error saving trainer feedback: " + err.message);
    } finally {
      setIsSubmittingTrainerFeedback(false);
    }
  };

  // Handler: Intern Prior Leave Intimation
  const handleSubmitLeaveIntimation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForLeave) return;

    if (!leaveReason || !leaveReason.trim()) {
      alert("Please state a reason for leave.");
      return;
    }

    setIsSubmittingLeave(true);
    try {
      const res = await fetch("/api/internship/leave-intimation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internId: selectedInternForLeave.internId,
          reason: leaveReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPageToast({
          message: "Leave intimation submitted. Trainer and HR have been notified.",
          type: "success",
        });
        setLeaveModalOpen(false);
        setSelectedInternForLeave(null);
        setLeaveReason("");
        await loadTrainerAndScheduleData();
      } else {
        alert(data.error || "Failed to submit leave intimation.");
      }
    } catch (err: any) {
      alert("Error submitting leave intimation: " + err.message);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Handler: Trigger 3-Way Absent Scan (Student + Trainer + HR)
  const handleTriggerInternAbsenteeScan = async () => {
    setIsCheckingAbsentee(true);
    try {
      const res = await fetch("/api/internship/absentee-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setPageToast({
          message: data.message || `Absentee scan complete: ${data.absentAlertsCount || 0} 3-way notification(s) dispatched to Student, Trainer, and HR!`,
          type: "success",
        });
        await loadTrainerAndScheduleData();
      } else {
        alert(data.error || "Failed to execute absentee scan.");
      }
    } catch (err: any) {
      alert("Error running absentee scan: " + err.message);
    } finally {
      setIsCheckingAbsentee(false);
    }
  };

  // Handler: Run Morning Attendance & Schedule Governance Audit
  const handleRunMorningAudit = async () => {
    setIsAuditingMorning(true);
    try {
      const res = await fetch("/api/internship/morning-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setPageToast({
          message: `Morning Audit Complete! Trainer intimations sent: ${data.trainerAlertsSentCount || 0}, Founder escalations: ${data.founderEscalationsSentCount || 0}, Intern reminders: ${data.internRemindersSentCount || 0}`,
          type: "success",
        });
        await loadTrainerAndScheduleData();
      } else {
        alert(data.error || "Failed to execute morning audit.");
      }
    } catch (err: any) {
      alert("Error executing morning audit: " + err.message);
    } finally {
      setIsAuditingMorning(false);
    }
  };

  // Handler: Trainer Submitting Morning Attendance & Timing
  const handleSaveTrainerAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForTrainerAtt) return;
    setIsSavingTrainerAtt(true);
    try {
      const res = await fetch("/api/internship/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TRAINER_UPDATE_ATTENDANCE",
          internId: selectedInternForTrainerAtt.internId,
          punchInStr: trainerAttPunchIn,
          punchOutStr: trainerAttPunchOut,
          status: trainerAttStatus,
          trainerFeedback: trainerAttTeachingNotes,
          internFeedback: trainerAttLearningNotes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPageToast({
          message: `Morning attendance and session timing for ${selectedInternForTrainerAtt.fullName} updated!`,
          type: "success",
        });
        setTrainerAttendanceModalOpen(false);
        setSelectedInternForTrainerAtt(null);
        await loadTrainerAndScheduleData();
      } else {
        alert(data.error || "Failed to save attendance.");
      }
    } catch (err: any) {
      alert("Error saving attendance: " + err.message);
    } finally {
      setIsSavingTrainerAtt(false);
    }
  };

  const domainsList = [
    "Full Stack Web Development",
    "Frontend Development (React / Next.js)",
    "Backend Development (Node.js & Go)",
    "AI & Machine Learning Engineering",
    "Data Analytics & Business Intelligence",
    "Cloud Architecture & DevOps",
    "Cybersecurity & Threat Auditing",
    "UI/UX Design & Product Systems",
    "Digital Marketing & Growth Operations",
    "Human Resources Operations",
  ];

  const mentorsList = [
    "Prem Kumar (Technical Lead)",
    "HR Manager (Human Resources)",
    "Marimuthu N (CMO)",
    "Vasanth V (Head of Product)",
    "Gokul N (Chief Executive)",
  ];

  const filteredInterns = internships.filter((intern) => {
    const matchesSearch =
      intern.fullName.toLowerCase().includes(search.toLowerCase()) ||
      intern.internId.toLowerCase().includes(search.toLowerCase()) ||
      intern.personalEmail.toLowerCase().includes(search.toLowerCase()) ||
      (intern.college && intern.college.toLowerCase().includes(search.toLowerCase()));

    const matchesDomain = domainFilter === "ALL" || intern.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  // Financial aggregates
  const totalFeeAggregate = internships.reduce((acc, i) => acc + (Number(i.totalFee) || 0), 0);
  const totalPaidAggregate = internships.reduce((acc, i) => acc + (Number(i.amountPaid) || 0), 0);
  const totalBalanceAggregate = internships.reduce((acc, i) => acc + (Number(i.remainingBalance) || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-16">
        {/* Toast Alert */}
        {pageToast && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{pageToast.message}</span>
            </div>
            <button onClick={() => setPageToast(null)} className="p-1 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Executive Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#050D20] via-[#040A18] to-[#02050E] p-6 sm:p-8 text-white shadow-xl border border-cyan-500/25">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-black tracking-wider border border-cyan-500/30">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>INZOVATE ACADEMY &amp; INTERNSHIP CADRE</span>
                </span>
                <span className="text-slate-400 text-xs font-mono">{internships.length} Enrolled Students</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Internship Management &amp; Student Fee Ledger
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Track student onboarding, domain tracks, total course fees, amount paid, and remaining balance due with one-click payment receipts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmitError(null);
                  setOnboardModalOpen(true);
                }}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1463F3] to-[#2583FF] hover:from-[#0e4ac4] hover:to-[#1769FF] text-white font-bold text-xs shadow-lg shadow-blue-500/30 border border-blue-400/30 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Onboard New Intern</span>
              </button>
            </div>
          </div>

          {/* Three-Metric Fee Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-white/10 z-10 relative">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Program Fees</div>
              <div className="text-xl font-mono font-black text-white mt-1">
                ₹{totalFeeAggregate.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-cyan-300 mt-0.5">Committed Tuition</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Collected Amount (Paid)</div>
              <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                ₹{totalPaidAggregate.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5">Verified Bank Receipts</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30">
              <div className="text-[10px] uppercase font-bold text-rose-400">Remaining Balance (Unpaid)</div>
              <div className="text-xl font-mono font-black text-rose-400 mt-1">
                ₹{totalBalanceAggregate.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-rose-300/80 mt-0.5">Pending Student Due</div>
            </div>
          </div>
        </div>

        {/* Mandatory Trainer Morning Class Intimation (10:00 AM – 11:00 AM IST Window) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0C1E3C] via-[#07152E] to-[#040D1F] border border-cyan-500/30 text-white shadow-lg space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-sm text-white">
                    Mandatory Trainer Morning Class Intimation (10:00 AM – 11:00 AM IST Window)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    DAILY POLICY
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Permanent employee mentors must intimate class timings and morning punch-in between 10:00 AM – 11:00 AM IST. Alerts dispatch to HR and Founder if missed.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5 active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>+ Intimate Class Timing</span>
              </button>
              <button
                type="button"
                onClick={handleRunMorningAudit}
                disabled={isAuditingMorning}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-200" />
                <span>{isAuditingMorning ? "Auditing..." : "⚡ Run 10-11 AM Audit"}</span>
              </button>
            </div>
          </div>

          {/* Trainer Compliance Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
            {/* Trainer 1: Shalinipriya J */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Software Development</span>
                <span className="font-bold text-xs text-white">Shalinipriya J</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                todaySchedules.some((s) => (s.trainerName || s.internship?.trainerName || "").toLowerCase().includes("shalini"))
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {todaySchedules.some((s) => (s.trainerName || s.internship?.trainerName || "").toLowerCase().includes("shalini"))
                  ? "✅ Intimated"
                  : "⏳ Window 10-11 AM"}
              </span>
            </div>

            {/* Trainer 2: Yogalakshmi */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Data Analytics</span>
                <span className="font-bold text-xs text-white">Yogalakshmi</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                todaySchedules.some((s) => (s.trainerName || s.internship?.trainerName || "").toLowerCase().includes("yoga"))
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {todaySchedules.some((s) => (s.trainerName || s.internship?.trainerName || "").toLowerCase().includes("yoga"))
                  ? "✅ Intimated"
                  : "⏳ Window 10-11 AM"}
              </span>
            </div>

            {/* Trainer 3: Divya Ramar */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Cloud Infrastructure</span>
                <span className="font-bold text-xs text-white">Divya Ramar</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                todaySchedules.some((s) => (s.trainerName || s.internship?.trainerName || "").toLowerCase().includes("divya"))
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {todaySchedules.some((s) => (s.trainerName || s.internship?.trainerName || "").toLowerCase().includes("divya"))
                  ? "✅ Intimated"
                  : "⏳ Window 10-11 AM"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab("CADRE")}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition relative ${
              activeTab === "CADRE"
                ? "text-[#1463F3] border-b-2 border-[#1463F3]"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            🎓 Enrolled Interns ({internships.length})
          </button>

          <button
            onClick={() => setActiveTab("TRAINERS")}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition relative ${
              activeTab === "TRAINERS"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            👨‍🏫 Trainer Allocation &amp; Schedules
          </button>

          <button
            onClick={() => setActiveTab("ATTENDANCE")}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition relative ${
              activeTab === "ATTENDANCE"
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            ⏱️ Shift Punch &amp; Feedback
          </button>

          <button
            onClick={() => setActiveTab("FEES")}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition relative ${
              activeTab === "FEES"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            💰 Fee Ledger &amp; Dues
          </button>

          <button
            onClick={() => setActiveTab("LOGBOOK")}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition relative ${
              activeTab === "LOGBOOK"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            📝 Daily Logbook ({logbooks.length})
          </button>
        </div>

        {/* TAB 1: CADRE VIEW */}
        {activeTab === "CADRE" && (
          <div className="space-y-6">
            {/* Filter bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0C1D3A] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by intern name, ID, email, or college..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#1463F3]"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white font-medium"
                >
                  <option value="ALL">All Technical Domains</option>
                  {domainsList.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interns Table with Fee and Balance Columns */}
            <div className="bg-white dark:bg-[#0C1D3A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-900 dark:text-cyan-400" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Enrolled Intern Cadre &amp; Fee Telemetry
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {filteredInterns.length} Active Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#07162F] text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Intern ID</th>
                      <th className="px-5 py-3.5">Student Name</th>
                      <th className="px-5 py-3.5">Domain</th>
                      <th className="px-5 py-3.5">Total Fee</th>
                      <th className="px-5 py-3.5">Paid Amount</th>
                      <th className="px-5 py-3.5">Remaining Due</th>
                      <th className="px-5 py-3.5">Fee Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-900" />
                            <span>Loading active intern records...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredInterns.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                          No intern records found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredInterns.map((intern) => (
                        <tr key={intern.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                          <td className="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {intern.internId}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{intern.fullName}</div>
                            <div className="text-[10px] text-slate-400">{intern.college}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {intern.domain}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {Number(intern.remainingBalance || 0) > 0
                              ? `₹${Number(intern.totalFee || 6000).toLocaleString("en-IN")}`
                              : Number(intern.totalFee || 0) > 0
                              ? `₹${Number(intern.totalFee).toLocaleString("en-IN")}`
                              : "—"}
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {Number(intern.remainingBalance || 0) > 0
                              ? `₹${Number(intern.amountPaid || 3000).toLocaleString("en-IN")}`
                              : Number(intern.amountPaid || 0) > 0
                              ? `₹${Number(intern.amountPaid).toLocaleString("en-IN")}`
                              : "—"}
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                            {Number(intern.remainingBalance || 0) > 0
                              ? `₹${Number(intern.remainingBalance).toLocaleString("en-IN")}`
                              : "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                Number(intern.remainingBalance || 0) === 0
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200 font-extrabold"
                              }`}
                            >
                              {Number(intern.remainingBalance || 0) === 0
                                ? "FULLY PAID"
                                : `DUE: ₹${Number(intern.remainingBalance).toLocaleString("en-IN")}`}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-2">
                            {/* + Record Payment Button (only for interns with pending due) */}
                            {Number(intern.remainingBalance || 0) > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInternForPay(intern);
                                  setPayAmount(Number(intern.remainingBalance || 3000));
                                  setPaymentModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-[11px] transition inline-flex items-center space-x-1"
                                title="Record fee installment"
                              >
                                <Banknote className="w-3.5 h-3.5" />
                                <span>+ Record Pay</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCertIntern(intern);
                                setCertificateModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] transition inline-flex items-center space-x-1"
                            >
                              <Award className="w-3.5 h-3.5 text-cyan-300" />
                              <span>Letter</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERMANENT EMPLOYEE MENTORSHIP & INTERN CADRE HIERARCHY */}
        {activeTab === "TRAINERS" && (
          <div className="space-y-6">
            {/* Executive Governance Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#07162F] via-[#0B1F44] to-[#040C1A] border border-purple-500/40 text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    Mentorship Governance
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Founder &amp; MD Exclusive Allocation
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                    Permanent Staff Mentors
                  </span>
                </div>
                <h3 className="text-xl font-black mt-1">Permanent Employee Mentorship &amp; Daily Class Scheduling</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  All internship sessions are conducted by verified Permanent Staff. Mentors must schedule class timing and update morning punch-in/out attendance. If missed by 10:30 AM, automated HR alerts notify the Trainer and escalate to the Founder.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunMorningAudit}
                  disabled={isAuditingMorning}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg border border-cyan-300/40 transition flex items-center space-x-2 disabled:opacity-50"
                  title="Executes morning check: alerts mentors missing morning updates, escalates to Founder, and reminds interns to punch in"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>{isAuditingMorning ? "Auditing System..." : "⚡ Run Morning Attendance Audit"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerInternAbsenteeScan}
                  disabled={isCheckingAbsentee}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-md border border-rose-400/30 transition flex items-center space-x-1.5 disabled:opacity-50"
                  title="Dispatches 3-way absent email to Student, Trainer, and HR for missed sessions"
                >
                  <Send className="w-3.5 h-3.5 text-rose-200" />
                  <span>{isCheckingAbsentee ? "Scanning..." : "⚠️ 3-Way Absent Scan"}</span>
                </button>

                <span className="text-[11px] px-3 py-2 rounded-xl bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 font-medium">
                  🌴 Sat &amp; Sun: Week-Off
                </span>
              </div>
            </div>

            {/* View Mode Switcher & Summary Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-[#0C1D3A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">View Structure:</span>
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setHierarchyViewMode("HIERARCHY")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      hierarchyViewMode === "HIERARCHY"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-white"
                    }`}
                  >
                    🌳 Permanent Staff Hierarchy (Staff ➔ Interns)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHierarchyViewMode("TABLE")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      hierarchyViewMode === "TABLE"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-white"
                    }`}
                  >
                    📋 Flat Roster Table
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-slate-500">
                  {availableTrainers.length} Permanent Staff Mentors
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono font-bold px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {internships.length} Interns Enrolled
                </span>
              </div>
            </div>

            {/* UNASSIGNED INTERNS ALERT (If Any Intern Has No Trainer) */}
            {(() => {
              const unassigned = internships.filter((i) => !i.trainerId && !i.trainerName);
              if (unassigned.length === 0) return null;
              return (
                <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <h4 className="font-black text-sm">
                        {unassigned.length} Intern(s) Pending Permanent Staff Mentor Assignment
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                      Founder &amp; MD Action Required
                    </span>
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                    These students require an internal permanent employee to conduct their daily work, schedule sessions, and verify punch times.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                    {unassigned.map((intern) => (
                      <div key={intern.id} className="p-3 rounded-2xl bg-white dark:bg-[#07162F] border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white">{intern.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono"><code>{intern.internId}</code> • {intern.domain}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInternForTrainer(intern);
                            setSelectedTrainerEmpId(availableTrainers[0]?.employeeId || "");
                            setAssignTrainerModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition"
                        >
                          + Assign Mentor
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* HIERARCHICAL VIEW: Permanent Staff ➔ Assigned Interns Tree */}
            {hierarchyViewMode === "HIERARCHY" && (
              <div className="space-y-5">
                {availableTrainers.map((emp) => {
                  const assignedInterns = internships.filter(
                    (i) =>
                      i.trainerId === emp.employeeId ||
                      i.trainerEmail === emp.companyEmail ||
                      (i.trainerName && i.trainerName.toLowerCase().includes(emp.firstName.toLowerCase()))
                  );

                  return (
                    <div
                      key={emp.employeeId}
                      className="bg-white dark:bg-[#0C1D3A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 hover:shadow-md transition"
                    >
                      {/* Permanent Employee Trainer Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-base shadow-md">
                            {emp.firstName[0]}
                            {emp.lastName ? emp.lastName[0] : ""}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-extrabold border border-purple-200 dark:border-purple-800">
                                Permanent Staff Mentor
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{emp.designation || "Enterprise Staff"}</span>
                              {" "}• {emp.department} • <code className="text-purple-600 dark:text-purple-400">{emp.companyEmail}</code>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-start sm:self-center">
                          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {assignedInterns.length} Intern{assignedInterns.length === 1 ? "" : "s"} In Charge
                          </span>
                        </div>
                      </div>

                      {/* Interns Under This Staff Member */}
                      {assignedInterns.length === 0 ? (
                        <div className="py-6 px-4 rounded-2xl bg-slate-50 dark:bg-[#07162F]/60 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800">
                          No interns currently allocated under {emp.firstName}. When Founder / MD assigns an intern to this permanent staff mentor, they will appear here.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {assignedInterns.map((intern) => {
                            const sched = todaySchedules.find((s) => s.internId === intern.internId);
                            const att = todayAttendances.find((a) => a.internId === intern.internId);
                            const hasClassTiming = Boolean(sched?.startTime && sched?.endTime);
                            const isPunchedIn = Boolean(att?.punchInTime);
                            const isPunchedOut = Boolean(att?.punchOutTime);

                            return (
                              <div
                                key={intern.id}
                                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07162F] border border-slate-200 dark:border-slate-800/80 space-y-3 hover:border-purple-400/50 transition"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                                      <GraduationCap className="w-4 h-4 text-purple-500" />
                                      <span>{intern.fullName}</span>
                                    </h5>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      <code>{intern.internId}</code> • {intern.college}
                                    </div>
                                    <div className="text-[10px] text-slate-400">{intern.personalEmail}</div>
                                  </div>
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    {intern.domain}
                                  </span>
                                </div>

                                {/* Today's Telemetry Grid */}
                                <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-[#0C1D3A] p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                                      Today&apos;s Class Timing
                                    </span>
                                    {hasClassTiming ? (
                                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                                        {sched.startTime} – {sched.endTime} IST
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-amber-500 font-extrabold flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Not Scheduled</span>
                                      </span>
                                    )}
                                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                      {sched?.topic || "Practical Track"}
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                                      Morning Punch Status
                                    </span>
                                    {isPunchedIn ? (
                                      <span className="inline-flex items-center space-x-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>Clocked In ({new Date(att.punchInTime).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })})</span>
                                      </span>
                                    ) : att?.status === "LEAVE" ? (
                                      <span className="text-[11px] text-amber-500 font-bold">Approved Leave</span>
                                    ) : (
                                      <span className="text-[11px] text-rose-500 font-bold flex items-center space-x-1">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>Pending Punch-In</span>
                                      </span>
                                    )}
                                    {isPunchedOut && (
                                      <div className="text-[10px] text-blue-500 font-mono mt-0.5 font-bold">
                                        Completed: {att.workedHours} hrs
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Mentorship Feedback Previews */}
                                {(att?.internFeedback || att?.trainerFeedback) && (
                                  <div className="space-y-1 text-[11px] bg-slate-100/70 dark:bg-[#07162F]/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                                    {att?.internFeedback && (
                                      <div>
                                        <span className="font-bold text-emerald-600 text-[10px] uppercase">Student Learned: </span>
                                        <span className="text-slate-700 dark:text-slate-300 italic">&quot;{att.internFeedback}&quot;</span>
                                      </div>
                                    )}
                                    {att?.trainerFeedback && (
                                      <div>
                                        <span className="font-bold text-purple-600 text-[10px] uppercase">Trainer Taught: </span>
                                        <span className="text-slate-700 dark:text-slate-300 italic">&quot;{att.trainerFeedback}&quot;</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Mentor Action Buttons */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                                  <div className="flex items-center space-x-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedInternForTrainerAtt(intern);
                                        const existingAtt = todayAttendances.find((a) => a.internId === intern.internId);
                                        const existingSched = todaySchedules.find((s) => s.internId === intern.internId);
                                        setTrainerAttPunchIn(existingSched?.startTime || "10:00");
                                        setTrainerAttPunchOut(existingSched?.endTime || "12:00");
                                        setTrainerAttStatus(existingAtt?.status || "PRESENT");
                                        setTrainerAttTeachingNotes(existingAtt?.trainerFeedback || "");
                                        setTrainerAttLearningNotes(existingAtt?.internFeedback || "");
                                        setTrainerAttendanceModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition flex items-center space-x-1"
                                      title="Update morning punch-in, punch-out, and teaching feedback"
                                    >
                                      <span>✏️ Update Attendance &amp; Timing</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedInternForSchedule(intern);
                                        setScheduleTopic(`${intern.domain} Practical Training`);
                                        setScheduleModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition"
                                      title="Schedule class time and broadcast email notification to Intern, HR & Founder"
                                    >
                                      📅 Set Class
                                    </button>
                                  </div>

                                  {canAllocateTrainers && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedInternForTrainer(intern);
                                        setSelectedTrainerEmpId(intern.trainerId || "");
                                        setAssignTrainerModalOpen(true);
                                      }}
                                      className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                                      title="Founder & MD Authority: Reassign this intern to a different permanent employee"
                                    >
                                      Reassign
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* FLAT TABLE VIEW */}
            {hierarchyViewMode === "TABLE" && (
              <div className="bg-white dark:bg-[#0C1D3A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Intern Mentorship Roster &amp; Daily Session Schedule
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Track allocated trainers, assigned schedules, and notification telemetry
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {internships.length} Interns Enrolled
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#07162F] border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Intern Candidate</th>
                        <th className="py-3 px-4">Domain Track</th>
                        <th className="py-3 px-4">Assigned Permanent Mentor</th>
                        <th className="py-3 px-4">Allocated By</th>
                        <th className="py-3 px-4">Today&apos;s Class Timing</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {internships.map((intern) => {
                        const sched = todaySchedules.find((s) => s.internId === intern.internId);
                        const hasTrainer = Boolean(intern.trainerName || intern.trainerId);

                        return (
                          <tr key={intern.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">{intern.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                <code>{intern.internId}</code> • {intern.personalEmail}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {intern.domain}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              {hasTrainer ? (
                                <div>
                                  <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center space-x-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                                    <span>{intern.trainerName}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {intern.trainerEmail || intern.trainerId}
                                  </div>
                                </div>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  ⚠️ Mentor Not Assigned
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-[11px] text-slate-400">
                              {intern.allocatedBy ? (
                                <span className="font-mono text-[10px] text-slate-300">
                                  {intern.allocatedBy.split("@")[0]}
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {sched?.startTime && sched?.endTime ? (
                                <div>
                                  <div className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                    {sched.startTime} – {sched.endTime} IST
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                    {sched.topic || "Practical Session"}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                                  Pending allocation (09:00 - 20:00)
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInternForTrainerAtt(intern);
                                    const existingAtt = todayAttendances.find((a) => a.internId === intern.internId);
                                    const existingSched = todaySchedules.find((s) => s.internId === intern.internId);
                                    setTrainerAttPunchIn(existingSched?.startTime || "10:00");
                                    setTrainerAttPunchOut(existingSched?.endTime || "12:00");
                                    setTrainerAttStatus(existingAtt?.status || "PRESENT");
                                    setTrainerAttTeachingNotes(existingAtt?.trainerFeedback || "");
                                    setTrainerAttLearningNotes(existingAtt?.internFeedback || "");
                                    setTrainerAttendanceModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition"
                                >
                                  Update Timing
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInternForSchedule(intern);
                                    setScheduleTopic(`${intern.domain} Practical Training`);
                                    setScheduleModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition"
                                >
                                  Set Class
                                </button>

                                {canAllocateTrainers && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedInternForTrainer(intern);
                                      setSelectedTrainerEmpId(intern.trainerId || "");
                                      setAssignTrainerModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition"
                                  >
                                    {hasTrainer ? "Reassign" : "Assign"}
                                  </button>
                                )}
                              </div>
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
        )}

        {/* TAB 3: INTERN SHIFT PUNCH, ATTENDANCE SHEET & DOSSIER */}
        {activeTab === "ATTENDANCE" && (
          <div className="space-y-6">
            {/* Top Header Card with Export Actions */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#071736] to-[#030E24] border border-cyan-500/30 text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    Master Attendance Engine
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    800+ Recorded Sessions
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Intern Daily Attendance Sheets &amp; Session Records
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  View individual student attendance history from day one, live shift punch-in/out, daily learning feedback, and download official attendance sheets as Excel (.xlsx) or PDF.
                </p>
              </div>

              {/* Master Export Buttons */}
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleExportAttendanceSheet("excel")}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 active:scale-95"
                  title="Export Attendance Sheet as Multi-Tab Excel Spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportAttendanceSheet("pdf")}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center space-x-1.5 active:scale-95"
                  title="Export Official PDF Attendance Dossier"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportAttendanceSheet("csv")}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 font-bold text-xs transition flex items-center space-x-1.5"
                  title="Download Raw CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Interactive Filters & Mode Switcher Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0C1D3A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                {/* View Mode Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      setAttendanceFilterMode("TODAY");
                      loadHistoricalAttendanceData("TODAY", new Date().toISOString().split("T")[0]);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      attendanceFilterMode === "TODAY"
                        ? "bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    Live Today ({new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAttendanceFilterMode("DATE");
                      loadHistoricalAttendanceData("DATE", selectedAttendanceDate);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      attendanceFilterMode === "DATE"
                        ? "bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    Specific Date View
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAttendanceFilterMode("ALL");
                      loadHistoricalAttendanceData("ALL");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      attendanceFilterMode === "ALL"
                        ? "bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    All Historical Records (Consolidated)
                  </button>
                </div>

                {/* Date Picker (visible in DATE mode or as selector) */}
                {attendanceFilterMode === "DATE" && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-500">Pick Date:</span>
                    <input
                      type="date"
                      value={selectedAttendanceDate}
                      onChange={(e) => {
                        setSelectedAttendanceDate(e.target.value);
                        loadHistoricalAttendanceData("DATE", e.target.value);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] font-mono text-xs dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Multi-Dimensional Filter Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Student Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Filter by Student
                  </label>
                  <select
                    value={selectedStudentFilter}
                    onChange={(e) => {
                      setSelectedStudentFilter(e.target.value);
                      loadHistoricalAttendanceData(attendanceFilterMode, selectedAttendanceDate, e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-[#07162F] dark:text-white text-xs font-semibold"
                  >
                    <option value="ALL">All 25 Enrolled Students</option>
                    {internships.map((i) => (
                      <option key={i.id} value={i.internId}>
                        {i.fullName} ({i.internId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Domain Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Domain Track
                  </label>
                  <select
                    value={selectedDomainFilter}
                    onChange={(e) => setSelectedDomainFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-[#07162F] dark:text-white text-xs font-semibold"
                  >
                    <option value="ALL">All Specialized Domains</option>
                    <option value="Software Developer">Software Developer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Cloud">Cloud</option>
                  </select>
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Attendance Status
                  </label>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-[#07162F] dark:text-white text-xs font-semibold"
                  >
                    <option value="ALL">All Statuses (Present/Absent/Leave)</option>
                    <option value="PRESENT">PRESENT Only</option>
                    <option value="ABSENT">ABSENT Only</option>
                    <option value="LEAVE">LEAVE Only</option>
                  </select>
                </div>

                {/* Search query */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Search Keyword
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={attendanceSearchQuery}
                      onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                      placeholder="Search name, ID, or topics..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-[#07162F] dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Telemetry KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#07162F] border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Sessions</span>
                  <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                    {attendanceFilterMode === "TODAY" ? internships.length : historicalAttendances.length}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Present Count</span>
                  <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {attendanceFilterMode === "TODAY" ? todayAttendances.filter(a => a.status === "PRESENT").length : (attendanceSummary.presentCount || historicalAttendances.filter(a => a.status === "PRESENT").length)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Absent Count</span>
                  <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400">
                    {attendanceFilterMode === "TODAY" ? todayAttendances.filter(a => a.status === "ABSENT").length : (attendanceSummary.absentCount || 0)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Leave Count</span>
                  <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400">
                    {attendanceFilterMode === "TODAY" ? todayAttendances.filter(a => a.status === "LEAVE").length : (attendanceSummary.leaveCount || 0)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 block">Total Hours</span>
                  <span className="text-base font-black font-mono text-cyan-700 dark:text-cyan-300">
                    {attendanceSummary.totalHours || Math.round(historicalAttendances.reduce((acc, a) => acc + (a.workedHours || 0), 0) * 10) / 10} hrs
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Ledger Table */}
            <div className="bg-white dark:bg-[#0C1D3A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>
                      {attendanceFilterMode === "TODAY"
                        ? "Today's Live Sessions & Punch Status"
                        : attendanceFilterMode === "DATE"
                        ? `Daily Attendance Sheet for ${selectedAttendanceDate}`
                        : "Consolidated Complete Attendance Sheet (All Dates)"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                      {attendanceFilterMode === "TODAY" ? internships.length : historicalAttendances.length} Records
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Click &quot;View Dossier&quot; on any student to view their complete day-by-day attendance history from join date.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                {attendanceFilterMode === "TODAY" ? (
                  /* LIVE TODAY TABLE */
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#07162F] border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Intern Student</th>
                        <th className="py-3 px-4">Trainer</th>
                        <th className="py-3 px-4">Scheduled Hours</th>
                        <th className="py-3 px-4">Shift Punch Status</th>
                        <th className="py-3 px-4">What Intern Learned (Mandatory)</th>
                        <th className="py-3 px-4">What Trainer Taught</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {internships
                        .filter((intern) => {
                          if (selectedStudentFilter !== "ALL" && intern.internId !== selectedStudentFilter) return false;
                          if (selectedDomainFilter !== "ALL" && intern.domain !== selectedDomainFilter) return false;
                          if (attendanceSearchQuery.trim()) {
                            const q = attendanceSearchQuery.toLowerCase();
                            const matchName = intern.fullName.toLowerCase().includes(q);
                            const matchId = intern.internId.toLowerCase().includes(q);
                            if (!matchName && !matchId) return false;
                          }
                          return true;
                        })
                        .map((intern) => {
                          const att = todayAttendances.find((a) => a.internId === intern.internId);
                          const sched = todaySchedules.find((s) => s.internId === intern.internId);
                          const isClockedIn = Boolean(att?.punchInTime && !att?.punchOutTime);
                          const isClockedOut = Boolean(att?.punchOutTime);

                          return (
                            <tr key={intern.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900 dark:text-white">{intern.fullName}</div>
                                <div className="text-[10px] text-slate-400 font-mono"><code>{intern.internId}</code></div>
                              </td>

                              <td className="py-3.5 px-4 text-[11px]">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {intern.trainerName || "Unassigned"}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                {sched?.startTime && sched?.endTime ? (
                                  <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                    {sched.startTime} – {sched.endTime}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Not scheduled</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {isClockedIn ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>Class in Progress</span>
                                  </span>
                                ) : isClockedOut ? (
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                    Completed ({att?.workedHours || 0} hrs)
                                  </span>
                                ) : att?.status === "LEAVE" ? (
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    Excused Leave
                                  </span>
                                ) : (
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    Not Clocked In
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 max-w-[200px]">
                                {att?.internFeedback ? (
                                  <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200/50 line-clamp-2">
                                    &quot;{att.internFeedback}&quot;
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-rose-500 font-medium italic">
                                    Required before punch-out
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 max-w-[200px]">
                                {att?.trainerFeedback ? (
                                  <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-purple-50/50 dark:bg-purple-950/20 p-2 rounded-lg border border-purple-200/50 line-clamp-2">
                                    &quot;{att.trainerFeedback}&quot;
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">Not yet logged</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                  {/* View Full History Dossier Button */}
                                  <button
                                    type="button"
                                    onClick={() => openStudentDossier(intern)}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 transition flex items-center space-x-1 shadow-2xs"
                                    title="View full day-by-day attendance history from join date"
                                  >
                                    <Eye className="w-3 h-3 text-cyan-600" />
                                    <span>Dossier</span>
                                  </button>

                                  {!isClockedIn && !isClockedOut && (
                                    <button
                                      type="button"
                                      onClick={() => handleInternPunchIn(intern)}
                                      disabled={isPunching}
                                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center space-x-1 shadow-sm"
                                    >
                                      <Play className="w-3 h-3" />
                                      <span>Punch In</span>
                                    </button>
                                  )}

                                  {isClockedIn && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedInternForPunch(intern);
                                        setInternFeedback("");
                                        setPunchOutFeedbackModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition flex items-center space-x-1 shadow-sm animate-pulse"
                                      title="Punch Out (Requires entering what you learned today)"
                                    >
                                      <Square className="w-3 h-3" />
                                      <span>Punch Out</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedInternForTrainerFeedback(intern);
                                      setTrainerFeedbackText(att?.trainerFeedback || "");
                                      setTrainerFeedbackModalOpen(true);
                                    }}
                                    className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                                    title="Trainer: Log teaching coverage"
                                  >
                                    Trainer Notes
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                ) : (
                  /* SPECIFIC DATE OR ALL HISTORICAL SESSIONS TABLE */
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#07162F] border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Intern Student</th>
                        <th className="py-3 px-4">Mentor</th>
                        <th className="py-3 px-4">Timing (Punch In/Out)</th>
                        <th className="py-3 px-4">Hours</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 max-w-[220px]">What Intern Learned</th>
                        <th className="py-3 px-4 max-w-[220px]">Trainer Teaching Notes</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {isLoadingAttendanceSheet ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-500" />
                            <span>Loading attendance history records from database...</span>
                          </td>
                        </tr>
                      ) : historicalAttendances.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400">
                            No attendance records match the selected date or filters.
                          </td>
                        </tr>
                      ) : (
                        historicalAttendances
                          .filter((a) => {
                            if (selectedDomainFilter !== "ALL" && a.internship?.domain !== selectedDomainFilter) return false;
                            if (selectedStatusFilter !== "ALL" && a.status !== selectedStatusFilter) return false;
                            if (attendanceSearchQuery.trim()) {
                              const q = attendanceSearchQuery.toLowerCase();
                              const matchName = (a.internship?.fullName || "").toLowerCase().includes(q);
                              const matchId = (a.internId || "").toLowerCase().includes(q);
                              const matchLearned = (a.internFeedback || "").toLowerCase().includes(q);
                              const matchTaught = (a.trainerFeedback || "").toLowerCase().includes(q);
                              if (!matchName && !matchId && !matchLearned && !matchTaught) return false;
                            }
                            return true;
                          })
                          .map((record) => {
                            const punchIn = record.punchInTime
                              ? new Date(record.punchInTime).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })
                              : "-";
                            const punchOut = record.punchOutTime
                              ? new Date(record.punchOutTime).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })
                              : "-";

                            return (
                              <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                  {record.date}
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {record.internship?.fullName || record.internId}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    <code>{record.internId}</code> • {record.internship?.domain}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                  {record.internship?.trainerName || "-"}
                                </td>

                                <td className="py-3.5 px-4 font-mono text-[11px]">
                                  {punchIn} – {punchOut}
                                </td>

                                <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {record.workedHours || 0} hrs
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    record.status === "PRESENT"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : record.status === "LEAVE"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}>
                                    {record.status}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 max-w-[220px]">
                                  {record.internFeedback ? (
                                    <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-emerald-50/40 dark:bg-emerald-950/20 p-1.5 rounded-lg border border-emerald-200/40 line-clamp-2">
                                      &quot;{record.internFeedback}&quot;
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">No feedback</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 max-w-[220px]">
                                  {record.trainerFeedback ? (
                                    <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-purple-50/40 dark:bg-purple-950/20 p-1.5 rounded-lg border border-purple-200/40 line-clamp-2">
                                      &quot;{record.trainerFeedback}&quot;
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">No notes</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const foundIntern = internships.find((i) => i.internId === record.internId) || record.internship;
                                      if (foundIntern) openStudentDossier(foundIntern);
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 transition inline-flex items-center space-x-1 shadow-2xs"
                                    title="View full history for this student"
                                  >
                                    <Eye className="w-3 h-3 text-cyan-600" />
                                    <span>Dossier</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DETAILED FEE LEDGER VIEW */}
        {activeTab === "FEES" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0C1D3A] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Student Tuition &amp; Internship Fee Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live balance due breakdown per student (Total Fee, Amount Paid, Remaining Balance).
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#07162F] text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Domain</th>
                      <th className="px-4 py-3">Total Fee</th>
                      <th className="px-4 py-3">Amount Paid</th>
                      <th className="px-4 py-3">Remaining Due</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredInterns.map((i) => (
                      <tr key={i.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">
                          {i.fullName} <span className="text-[10px] text-slate-400 block font-normal">{i.internId}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{i.domain}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {Number(i.remainingBalance || 0) > 0
                            ? `₹${Number(i.totalFee || 6000).toLocaleString("en-IN")}`
                            : Number(i.totalFee || 0) > 0
                            ? `₹${Number(i.totalFee).toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {Number(i.remainingBalance || 0) > 0
                            ? `₹${Number(i.amountPaid || 3000).toLocaleString("en-IN")}`
                            : Number(i.amountPaid || 0) > 0
                            ? `₹${Number(i.amountPaid).toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                          {Number(i.remainingBalance || 0) > 0
                            ? `₹${Number(i.remainingBalance).toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            Number(i.remainingBalance || 0) === 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200 font-extrabold"
                          }`}>
                            {Number(i.remainingBalance || 0) === 0 ? "FULLY PAID" : `DUE: ₹${Number(i.remainingBalance).toLocaleString("en-IN")}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCertIntern(i);
                              setCertificateModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] transition inline-flex items-center space-x-1 shadow-sm"
                            title="View & Download Clearance Letter"
                          >
                            <Award className="w-3.5 h-3.5 text-cyan-300" />
                            <span>Letter</span>
                          </button>

                          {Number(i.remainingBalance || 0) > 0 ? (
                            <button
                              onClick={() => {
                                setSelectedInternForPay(i);
                                setPayAmount(Number(i.remainingBalance || 3000));
                                setPaymentModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition"
                            >
                              + Record Payment
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-md">
                              Cleared
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DAILY LOGBOOK */}
        {activeTab === "LOGBOOK" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {logbooks.map((log) => (
                <div
                  key={log.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#0C1D3A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 hover:border-cyan-400/50 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-black text-cyan-700 bg-cyan-50 dark:bg-cyan-950 px-2.5 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800">
                      {log.internId}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{log.date}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-cyan-700 transition-colors">
                      {log.internName}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {log.taskTitle}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#07162F] border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Hours Clocked:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{log.hoursSpent} hrs</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">GitHub PR:</span>
                      <a
                        href={log.githubPrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-600 hover:underline flex items-center space-x-1"
                      >
                        <span className="font-mono text-[10px]">View PR</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: RECORD STUDENT PAYMENT / ADD FEE */}
        {paymentModalOpen && selectedInternForPay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-[#0C1D3A] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    Record Student Fee Payment
                  </h3>
                </div>
                <button onClick={() => setPaymentModalOpen(false)} className="p-1 rounded-lg hover:bg-black/5">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
                {/* Student Overview Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#07162F] border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedInternForPay.fullName} ({selectedInternForPay.internId})
                  </div>
                  <div className="text-slate-500">{selectedInternForPay.domain}</div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Total Fee</span>
                      <span className="font-mono font-bold">
                        {Number(selectedInternForPay.remainingBalance || 0) > 0
                          ? `₹${Number(selectedInternForPay.totalFee || 6000).toLocaleString("en-IN")}`
                          : Number(selectedInternForPay.totalFee || 0) > 0
                          ? `₹${Number(selectedInternForPay.totalFee).toLocaleString("en-IN")}`
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Paid So Far</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {Number(selectedInternForPay.remainingBalance || 0) > 0
                          ? `₹${Number(selectedInternForPay.amountPaid || 3000).toLocaleString("en-IN")}`
                          : Number(selectedInternForPay.amountPaid || 0) > 0
                          ? `₹${Number(selectedInternForPay.amountPaid).toLocaleString("en-IN")}`
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Current Due</span>
                      <span className="font-mono font-bold text-rose-600">
                        {Number(selectedInternForPay.remainingBalance || 0) > 0
                          ? `₹${Number(selectedInternForPay.remainingBalance).toLocaleString("en-IN")}`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    max={Number(selectedInternForPay.remainingBalance || 50000)}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white font-mono text-sm font-bold"
                    required
                  />
                  <div className="text-[10px] text-slate-400">
                    Remaining after this payment: ₹{Math.max(0, Number(selectedInternForPay.remainingBalance || 0) - payAmount).toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Payment Mode</label>
                    <select
                      value={payMode}
                      onChange={(e) => setPayMode(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white"
                    >
                      <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                      <option value="Bank Transfer (NEFT/IMPS)">Bank Transfer</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="Cash Deposit">Cash Deposit</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Transaction Ref / UTR</label>
                    <input
                      type="text"
                      value={payTxnRef}
                      onChange={(e) => setPayTxnRef(e.target.value)}
                      placeholder="e.g. UPI-98765432"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Receipt Notes</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRecordingPayment}
                    className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition flex items-center space-x-1.5"
                  >
                    {isRecordingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Balance...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm &amp; Update Balance</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ONBOARD NEW INTERN */}
        {onboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl bg-white dark:bg-[#0C1D3A] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-[#1463F3]" />
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Enroll Student in Internship Program
                  </h3>
                </div>
                <button onClick={() => setOnboardModalOpen(false)} className="p-1 rounded-lg hover:bg-black/5">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleOnboard} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Arun Kumar"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Personal Email *</label>
                    <input
                      type="email"
                      required
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      placeholder="arun@gmail.com"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">College / Institution</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="Anna University / PSG Tech"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Technical Domain *</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white font-medium"
                  >
                    {domainsList.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Commercials, Amount Paid & Remaining Due */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07162F] border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Commercials: Total Fee &amp; Initial Payment</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Total Program Fee (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        value={totalFee}
                        onChange={(e) => setTotalFee(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#0C1D3A] font-mono text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Initial Paid Amount (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        max={totalFee}
                        value={initialPayment}
                        onChange={(e) => setInitialPayment(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#0C1D3A] font-mono text-sm font-bold text-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#0C1D3A] border border-slate-200 dark:border-slate-700 font-mono text-xs">
                    <span className="text-slate-500">Remaining Balance Due:</span>
                    <span className="font-black text-rose-600">
                      ₹{Math.max(0, totalFee - initialPayment).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOnboardModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 font-bold bg-[#1463F3] text-white rounded-xl hover:bg-[#0e4ac4] transition shadow-md disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enrolling...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Enroll &amp; Save Fee Record</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 1: ASSIGN TRAINER TO INTERN */}
        {assignTrainerModalOpen && selectedInternForTrainer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-[#07162F] rounded-3xl border border-purple-500/30 p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-purple-500" />
                    <span>Assign Trainer / Mentor</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authorized: HR, Super Admin, Founder, MD, CMO
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignTrainerModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-xs">
                <div className="font-bold text-purple-900 dark:text-purple-300">
                  {selectedInternForTrainer.fullName} (<code>{selectedInternForTrainer.internId}</code>)
                </div>
                <div className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">
                  Domain: {selectedInternForTrainer.domain}
                </div>
              </div>

              <form onSubmit={handleAssignTrainer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Staff Employee as Trainer:
                  </label>
                  <select
                    value={selectedTrainerEmpId}
                    onChange={(e) => setSelectedTrainerEmpId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#0C1D3A] dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Choose Trainer Employee --</option>
                    {availableTrainers.map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId}) — {emp.designation || emp.department}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Upon assignment, an automated email notification will be delivered to the Trainer with their daily schedule allocation obligations.
                </p>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAssignTrainerModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigningTrainer}
                    className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    {isAssigningTrainer ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <span>Assign Trainer &amp; Notify</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: SCHEDULE DAILY CLASS TIMING (09:00 AM - 08:00 PM) */}
        {scheduleModalOpen && selectedInternForSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-[#07162F] rounded-3xl border border-blue-500/30 p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>Set Daily Class Schedule</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permissible Window: 09:00 AM – 08:00 PM IST (12 hours)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-xs">
                <div className="font-bold text-blue-900 dark:text-blue-300">
                  {selectedInternForSchedule.fullName} (<code>{selectedInternForSchedule.internId}</code>)
                </div>
                <div className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                  Domain: {selectedInternForSchedule.domain} • Trainer: {selectedInternForSchedule.trainerName || "Assigned Trainer"}
                </div>
              </div>

              <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Start Time (IST):
                    </label>
                    <input
                      type="time"
                      min="09:00"
                      max="20:00"
                      value={scheduleStartTime}
                      onChange={(e) => setScheduleStartTime(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#0C1D3A] dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      End Time (IST):
                    </label>
                    <input
                      type="time"
                      min="09:00"
                      max="20:00"
                      value={scheduleEndTime}
                      onChange={(e) => setScheduleEndTime(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#0C1D3A] dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Session Topic / Focus:
                  </label>
                  <input
                    type="text"
                    value={scheduleTopic}
                    onChange={(e) => setScheduleTopic(e.target.value)}
                    placeholder="e.g. Next.js Routing, State Management & API Hooks"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#0C1D3A] dark:text-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                  ℹ️ Notification email with session start &amp; end times will be automatically dispatched to {selectedInternForSchedule.personalEmail}.
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSchedule}
                    className="px-4 py-2 font-bold bg-[#1463F3] hover:bg-[#0e4ac4] text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    {isSavingSchedule ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save &amp; Notify Student</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: INTERN PUNCH-OUT (MANDATORY LEARNING FEEDBACK) */}
        {punchOutFeedbackModalOpen && selectedInternForPunch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-[#07162F] rounded-3xl border border-rose-500/40 p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                    <Square className="w-5 h-5 text-rose-500" />
                    <span>Mandatory Punch-Out Learning Feedback</span>
                  </h3>
                  <p className="text-xs text-rose-500 font-bold mt-0.5">
                    Feedback submission strictly required to clock out!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPunchOutFeedbackModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0C1D3A] border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedInternForPunch.fullName} (<code>{selectedInternForPunch.internId}</code>)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Domain: {selectedInternForPunch.domain}
                </div>
              </div>

              <form onSubmit={handleInternPunchOut} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    What did you learn today? <span className="text-rose-500">* (Mandatory)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={internFeedback}
                    onChange={(e) => setInternFeedback(e.target.value)}
                    required
                    placeholder="Enter what technical concepts you practiced, code written, tools used, or blockers encountered in today's class session..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#0C1D3A] dark:text-white leading-relaxed focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPunchOutFeedbackModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPunching || !internFeedback.trim()}
                    className="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    {isPunching ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Clocking out...</span>
                      </>
                    ) : (
                      <span>Complete Punch-Out &amp; Save Feedback</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: TRAINER TEACHING COVERAGE NOTES */}
        {trainerFeedbackModalOpen && selectedInternForTrainerFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-[#07162F] rounded-3xl border border-purple-500/30 p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    <span>Trainer Teaching Coverage Log</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    What did you teach the student today?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTrainerFeedbackModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-xs">
                <div className="font-bold text-purple-900 dark:text-purple-300">
                  {selectedInternForTrainerFeedback.fullName} (<code>{selectedInternForTrainerFeedback.internId}</code>)
                </div>
              </div>

              <form onSubmit={handleSubmitTrainerFeedback} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topics / Concepts Taught in Today&apos;s Class:
                  </label>
                  <textarea
                    rows={4}
                    value={trainerFeedbackText}
                    onChange={(e) => setTrainerFeedbackText(e.target.value)}
                    required
                    placeholder="Enter what modules, code architecture, or practical assignments you taught the intern today..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#0C1D3A] dark:text-white leading-relaxed focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTrainerFeedbackModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTrainerFeedback}
                    className="px-4 py-2 font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {isSubmittingTrainerFeedback ? "Saving..." : "Save Teaching Coverage"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: INTERN PRIOR LEAVE INTIMATION */}
        {leaveModalOpen && selectedInternForLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-[#07162F] rounded-3xl border border-amber-500/30 p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span>Prior Leave Intimation</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Intimate your Trainer &amp; HR that you cannot attend today
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLeaveModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs">
                <div className="font-bold text-amber-900 dark:text-amber-300">
                  {selectedInternForLeave.fullName} (<code>{selectedInternForLeave.internId}</code>)
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  Trainer: {selectedInternForLeave.trainerName || "Assigned Trainer"} • HR: hr@inzovate-technologies.com
                </div>
              </div>

              <form onSubmit={handleSubmitLeaveIntimation} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Taking Leave Today:
                  </label>
                  <textarea
                    rows={3}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                    placeholder="e.g. College semester exam, unwell, power outage, personal emergency..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#0C1D3A] dark:text-white leading-relaxed focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setLeaveModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingLeave}
                    className="px-4 py-2 font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {isSubmittingLeave ? "Submitting..." : "Submit Leave Intimation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 7: TRAINER MORNING ATTENDANCE & TIMING UPDATE */}
        {trainerAttendanceModalOpen && selectedInternForTrainerAtt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#0C1D3A] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-lg space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <span className="text-emerald-500">✏️</span>
                    <span>Morning Punch-In &amp; Session Timing Update</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    For {selectedInternForTrainerAtt.fullName} (<code>{selectedInternForTrainerAtt.internId}</code>)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTrainerAttendanceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                <div className="font-bold text-emerald-900 dark:text-emerald-300">
                  Mentor Responsibility Mandate:
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Permanent staff mentors must record the intern&apos;s morning punch time and today&apos;s syllabus topic.
                </div>
              </div>

              <form onSubmit={handleSaveTrainerAttendance} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Morning Punch-In Time *
                    </label>
                    <input
                      type="time"
                      value={trainerAttPunchIn}
                      onChange={(e) => setTrainerAttPunchIn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] font-mono text-xs dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Session Punch-Out Time
                    </label>
                    <input
                      type="time"
                      value={trainerAttPunchOut}
                      onChange={(e) => setTrainerAttPunchOut(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] font-mono text-xs dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Attendance Status
                  </label>
                  <select
                    value={trainerAttStatus}
                    onChange={(e) => setTrainerAttStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white text-xs font-semibold"
                  >
                    <option value="PRESENT">PRESENT (Attended Practical Class)</option>
                    <option value="ABSENT">ABSENT (Missed Scheduled Session)</option>
                    <option value="LEAVE">LEAVE (Prior Excused Absence)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Trainer Teaching Notes (What You Taught Today)
                  </label>
                  <textarea
                    rows={2}
                    value={trainerAttTeachingNotes}
                    onChange={(e) => setTrainerAttTeachingNotes(e.target.value)}
                    placeholder="e.g. Conducted React state management, custom hooks, and API integration..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Learning Notes (What Intern Learned Today)
                  </label>
                  <textarea
                    rows={2}
                    value={trainerAttLearningNotes}
                    onChange={(e) => setTrainerAttLearningNotes(e.target.value)}
                    placeholder="e.g. Practiced useEffect lifecycle, API error handling, and form validation..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-[#07162F] dark:text-white text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTrainerAttendanceModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTrainerAtt}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {isSavingTrainerAtt ? "Saving..." : "Save Attendance & Timing"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* INDIVIDUAL STUDENT ATTENDANCE DOSSIER MODAL */}
        {dossierModalOpen && selectedInternForDossier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="relative w-full max-w-5xl bg-white dark:bg-[#07152E] rounded-3xl shadow-2xl border border-slate-200 dark:border-cyan-500/30 overflow-hidden my-auto max-h-[92vh] flex flex-col">
              {/* Modal Top Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#040C1D] flex-shrink-0">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                        {selectedInternForDossier.fullName}
                      </h3>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/50">
                        {selectedInternForDossier.internId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <span>Domain: <strong className="text-slate-700 dark:text-slate-200">{selectedInternForDossier.domain}</strong></span>
                      <span>•</span>
                      <span>Mentor: <strong className="text-slate-700 dark:text-slate-200">{selectedInternForDossier.trainerName || selectedInternForDossier.mentor || "Technical Mentor"}</strong></span>
                      <span>•</span>
                      <span>College: <strong className="text-slate-700 dark:text-slate-200">{selectedInternForDossier.college || "N/A"}</strong></span>
                      <span>•</span>
                      <span>Joined: <strong className="text-slate-700 dark:text-slate-200">{selectedInternForDossier.startDate || "N/A"}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleExportAttendanceSheet("excel", selectedInternForDossier.internId)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition inline-flex items-center space-x-1.5 active:scale-95"
                    title="Export Student Ledger as Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportAttendanceSheet("pdf", selectedInternForDossier.internId)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition inline-flex items-center space-x-1.5 active:scale-95"
                    title="Export Student Ledger as PDF Dossier"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDossierModalOpen(false);
                      setSelectedInternForDossier(null);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#071328] flex-shrink-0">
                {(() => {
                  const totalSessions = dossierRecords.length;
                  const present = dossierRecords.filter((r) => r.status === "PRESENT").length;
                  const absent = dossierRecords.filter((r) => r.status === "ABSENT").length;
                  const leave = dossierRecords.filter((r) => r.status === "LEAVE").length;
                  const totalHrs = dossierRecords.reduce((acc, r) => acc + (r.workedHours || 0), 0);
                  const rate = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 100;

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Days</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalSessions}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center">
                        <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Present</div>
                        <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{present}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-center">
                        <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Absent</div>
                        <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{absent}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-center">
                        <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Leave</div>
                        <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{leave}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 text-center">
                        <div className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Attendance Rate</div>
                        <div className="text-xl font-black text-cyan-700 dark:text-cyan-400 mt-0.5">{rate}%</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-center">
                        <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Total Practical Hrs</div>
                        <div className="text-xl font-black text-indigo-700 dark:text-indigo-400 mt-0.5">{totalHrs.toFixed(1)}h</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Scrollable Day-by-day Session Ledger */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                {isDossierLoading ? (
                  <div className="py-16 text-center">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Loading daily attendance records...</p>
                  </div>
                ) : dossierRecords.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    No attendance records found for this student.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Session Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Punch In (IST)</th>
                          <th className="py-3 px-4">Punch Out (IST)</th>
                          <th className="py-3 px-4">Hours Logged</th>
                          <th className="py-3 px-4">What Student Learned</th>
                          <th className="py-3 px-4">Trainer Teaching Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#07152E]">
                        {dossierRecords.map((rec) => {
                          const dateObj = new Date(rec.date + "T00:00:00");
                          const dayName = isNaN(dateObj.getTime())
                            ? ""
                            : dateObj.toLocaleDateString("en-IN", { weekday: "short" });
                          const inFormatted = rec.punchInTime
                            ? new Date(rec.punchInTime).toLocaleTimeString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "-";
                          const outFormatted = rec.punchOutTime
                            ? new Date(rec.punchOutTime).toLocaleTimeString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "-";

                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">
                              <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                <span>{rec.date}</span>
                                {dayName && (
                                  <span className="ml-1.5 text-[10px] text-slate-500 font-sans font-normal">
                                    ({dayName})
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {rec.status === "PRESENT" && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                    PRESENT
                                  </span>
                                )}
                                {rec.status === "ABSENT" && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                                    ABSENT
                                  </span>
                                )}
                                {rec.status === "LEAVE" && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                    LEAVE
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {inFormatted}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {outFormatted}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                                {rec.workedHours > 0 ? `${rec.workedHours.toFixed(2)} hrs` : "-"}
                              </td>
                              <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={rec.internFeedback || ""}>
                                {rec.internFeedback || <span className="text-slate-400 italic">Not recorded</span>}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={rec.trainerFeedback || ""}>
                                {rec.trainerFeedback || <span className="text-slate-400 italic">Covered scheduled curriculum</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#040C1D] flex items-center justify-between text-xs flex-shrink-0">
                <div className="text-[11px] text-slate-500 font-mono">
                  Showing {dossierRecords.length} session entries from program start
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDossierModalOpen(false);
                      setSelectedInternForDossier(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportAttendanceSheet("excel", selectedInternForDossier.internId)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center space-x-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Download Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportAttendanceSheet("pdf", selectedInternForDossier.internId)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL CERTIFICATE & CLEARANCE LETTER MODAL */}
        {certificateModalOpen && selectedCertIntern && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#07152E] rounded-3xl shadow-2xl border border-slate-200 dark:border-cyan-500/30 overflow-hidden my-auto max-h-[92vh] flex flex-col">
              {/* Modal Top Control Bar */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#040C1D] flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-900/10 dark:bg-cyan-500/20 text-blue-900 dark:text-cyan-400 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      Official Internship &amp; Fee Clearance Document
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Candidate: <span className="font-bold text-slate-800 dark:text-cyan-300">{selectedCertIntern.fullName}</span> ({selectedCertIntern.internId})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Document Switcher Tab */}
                  <div className="hidden sm:flex bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCertModalDocType("LETTER")}
                      className={`px-3 py-1 rounded-lg transition ${
                        certModalDocType === "LETTER"
                          ? "bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-sm"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Official Letter
                    </button>
                    <button
                      type="button"
                      onClick={() => setCertModalDocType("CERTIFICATE")}
                      className={`px-3 py-1 rounded-lg transition ${
                        certModalDocType === "CERTIFICATE"
                          ? "bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-sm"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Certificate of Completion
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (certModalDocType === "LETTER") {
                        handleDownloadInternLetter(selectedCertIntern);
                      } else {
                        handleDownloadInternCert(selectedCertIntern);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition active:scale-95"
                    title="Download High-Resolution PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCertificateModalOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body Preview Area */}
              <div className="overflow-y-auto p-4 sm:p-8 flex-1 bg-slate-100 dark:bg-[#030712]">
                {certModalDocType === "LETTER" ? (
                  /* LETTER VIEW (A4 Portrait Authentic Letterhead) */
                  <div className="max-w-2xl mx-auto bg-white text-slate-900 shadow-2xl rounded-2xl border border-slate-300 p-8 sm:p-12 space-y-6 text-xs sm:text-sm font-sans leading-relaxed relative">
                    {/* Header Letterhead */}
                    <div className="border-b-2 border-blue-900 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg sm:text-xl font-black text-blue-950 tracking-tight">
                            INZOVATE TECHNOLOGIES PRIVATE LIMITED
                          </h2>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                            One Platform. Every People Operation. Intelligent Automation.
                          </p>
                          <p className="text-[9.5px] text-slate-400 mt-0.5 font-mono">
                            CIN: U62011TZ2025PTC036329 | Reg. Office: Chennai, Tamil Nadu, India
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-950 text-cyan-400 flex items-center justify-center font-black text-lg border border-cyan-400/30">
                          INZ
                        </div>
                      </div>
                    </div>

                    {/* Metadata: Ref & Date */}
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-600 border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-bold text-slate-800">Ref No:</span>{" "}
                        INZ/INT/2026/{String(selectedCertIntern.internId || "001").replace(/[^0-9]/g, "").slice(-4).padStart(4, "0")}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Date:</span>{" "}
                        {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>

                    {/* Salutation & Subject */}
                    <div className="space-y-1.5 pt-1">
                      <div className="font-bold text-slate-900 text-sm tracking-wide">
                        TO WHOMSOEVER IT MAY CONCERN
                      </div>
                      <div className="font-bold text-blue-900 text-xs uppercase tracking-wide">
                        SUBJECT: OFFICIAL INTERNSHIP COMPLETION &amp; TUITION FEE CLEARANCE CONFIRMATION
                      </div>
                    </div>

                    {/* Body Paragraph 1 */}
                    <p className="text-slate-700 text-justify">
                      This is to officially certify that <strong className="text-slate-900 font-extrabold">{selectedCertIntern.fullName}</strong> (Student Registration ID: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px] font-bold text-blue-900">{selectedCertIntern.internId}</code>), student of <strong className="text-slate-800">{selectedCertIntern.college || "Engineering & Technology"}</strong>, has successfully undertaken the specialized enterprise internship program in <strong className="text-blue-950 font-bold">{selectedCertIntern.domain}</strong> under the mentorship of <strong className="text-slate-800">{selectedCertIntern.trainerName || selectedCertIntern.mentor || "Enterprise Senior Lead"}</strong> at Inzovate Technologies Private Limited from <strong>{selectedCertIntern.startDate || "September 2026"}</strong>.
                    </p>

                    {/* Fee Clearance Box */}
                    {Number(selectedCertIntern.remainingBalance || 0) === 0 ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>TUITION FEE STATUS: FULLY CLEARED &amp; PAID IN FULL (NIL BALANCE DUE)</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-normal">
                          The Accounts &amp; Finance Division confirms that the candidate has settled all course tuition and program obligations in full. There are <strong>ZERO (NIL) outstanding dues</strong> against this candidate. Unconditional clearance is granted.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>COURSE FEE ACCOUNT: PARTIAL INSTALLMENT PROCESSED</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Total Tuition</span>
                            <span className="font-bold text-slate-800">₹{(selectedCertIntern.totalFee || 6000).toLocaleString("en-IN")}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Paid Amount</span>
                            <span className="font-bold text-emerald-700">₹{(selectedCertIntern.amountPaid || 3000).toLocaleString("en-IN")}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Pending Balance</span>
                            <span className="font-bold text-rose-700">₹{(selectedCertIntern.remainingBalance || 3000).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Conduct Paragraph */}
                    <p className="text-slate-700 text-justify">
                      Throughout the program, {selectedCertIntern.fullName} exhibited sincere technical dedication, punctual attendance in regular morning domain classes, and commendable practical acumen in real-world deliverable assignments. Their conduct was found to be exemplary throughout the training period.
                    </p>

                    <p className="text-slate-700">
                      We wish them grand success and continued brilliance in all their future academic and career endeavors.
                    </p>

                    {/* Signatures & Seal */}
                    <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-200 mt-6">
                      <div>
                        <div className="w-24 h-0.5 bg-slate-400 mb-2" />
                        <div className="font-bold text-slate-900 text-xs">Deepa Meenakshi</div>
                        <div className="text-[11px] text-slate-500">Head of People Operations &amp; HR</div>
                        <div className="text-[10px] text-slate-400 font-semibold">Inzovate Technologies Pvt. Ltd.</div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <div className="w-24 h-0.5 bg-slate-400 mb-2" />
                        <div className="font-bold text-slate-900 text-xs">Gokul G</div>
                        <div className="text-[11px] text-slate-500">Founder &amp; Managing Director</div>
                        <div className="text-[10px] text-slate-400 font-semibold">Inzovate Technologies Pvt. Ltd.</div>
                      </div>
                    </div>

                    {/* Verification Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Token: INZ-VERIFY-{selectedCertIntern.internId}-2026</span>
                      <span>Verified Corporate Document</span>
                    </div>
                  </div>
                ) : (
                  /* CERTIFICATE OF COMPLETION VIEW (Landscape Ornamented) */
                  <div className="max-w-3xl mx-auto bg-gradient-to-br from-white via-slate-50 to-amber-50/20 text-slate-900 shadow-2xl rounded-2xl border-4 border-blue-950 p-8 sm:p-12 space-y-6 text-center relative overflow-hidden">
                    {/* Gold Inner Frame Accent */}
                    <div className="absolute inset-2 border-2 border-amber-500/40 rounded-xl pointer-events-none" />

                    <div className="space-y-1">
                      <div className="text-[11px] uppercase tracking-widest font-black text-amber-600">
                        Certificate of Internship Completion
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
                        INZOVATE TECHNOLOGIES PRIVATE LIMITED
                      </h2>
                      <p className="text-xs text-slate-500">
                        Enterprise Research, Systems Engineering &amp; People Operations
                      </p>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-slate-500 italic">This is proudly presented to</p>
                      <h3 className="text-2xl sm:text-3xl font-black text-blue-900 uppercase tracking-wide mt-1">
                        {selectedCertIntern.fullName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedCertIntern.internId}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
                      for the successful completion of the intensive enterprise internship program in{" "}
                      <strong className="text-blue-950 font-bold">{selectedCertIntern.domain}</strong> under the mentorship of{" "}
                      <strong>{selectedCertIntern.trainerName || selectedCertIntern.mentor || "Technical Mentor"}</strong>.
                    </p>

                    <div className="pt-6 grid grid-cols-2 gap-8 border-t border-slate-200 max-w-md mx-auto text-xs">
                      <div>
                        <div className="w-20 h-0.5 bg-slate-400 mx-auto mb-1.5" />
                        <span className="font-bold text-slate-900 block">{selectedCertIntern.trainerName || "Technical Mentor"}</span>
                        <span className="text-[10px] text-slate-500">Domain Mentor</span>
                      </div>
                      <div>
                        <div className="w-20 h-0.5 bg-slate-400 mx-auto mb-1.5" />
                        <span className="font-bold text-slate-900 block">Deepa Meenakshi</span>
                        <span className="text-[10px] text-slate-500">Head of HR</span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 pt-2">
                      Official Certificate No: INZ-CERT-{selectedCertIntern.internId}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#040C1D] flex items-center justify-between text-xs flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`INZ-VERIFY-${selectedCertIntern.internId}-2026`);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-cyan-400 font-mono text-[11px] transition"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? "Token Copied!" : "Copy Verification Token"}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setCertificateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (certModalDocType === "LETTER") {
                        handleDownloadInternLetter(selectedCertIntern);
                      } else {
                        handleDownloadInternCert(selectedCertIntern);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
