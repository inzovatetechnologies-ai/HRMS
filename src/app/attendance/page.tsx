"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  ShieldCheck,
  Send,
  AlertCircle,
  FileCheck2,
  Sparkles,
  Play,
  Square,
  Coffee,
  MapPin,
  Wifi,
  Activity,
  History,
  Filter,
  Check,
  Loader2,
  Navigation,
  Radio,
  Compass,
  ArrowUpRight,
  TrendingDown,
  Layers,
  ChevronRight,
  Download,
  FileText,
  Users,
  GraduationCap,
  BookOpen,
  MessageSquare,
  UserCheck,
  Eye,
  FileSpreadsheet,
  Search,
  X,
} from "lucide-react";

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // SPLIT ATTENDANCE: Full-time employees vs Intern candidates
  const [attendanceView, setAttendanceView] = useState<"FULL_TIME" | "INTERNS">("FULL_TIME");

  // Intern Attendance States
  const [internsList, setInternsList] = useState<any[]>([]);
  const [internAttendances, setInternAttendances] = useState<any[]>([]);
  const [internSchedules, setInternSchedules] = useState<any[]>([]);

  // Intern Historical & Dossier States
  const [internFilterMode, setInternFilterMode] = useState<"TODAY" | "DATE" | "ALL">("TODAY");
  const [selectedInternDate, setSelectedInternDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedInternStudentFilter, setSelectedInternStudentFilter] = useState<string>("ALL");
  const [selectedInternDomainFilter, setSelectedInternDomainFilter] = useState<string>("ALL");
  const [selectedInternStatusFilter, setSelectedInternStatusFilter] = useState<string>("ALL");
  const [internSearchQuery, setInternSearchQuery] = useState<string>("");
  const [historicalInternAttendances, setHistoricalInternAttendances] = useState<any[]>([]);
  const [isHistoricalLoading, setIsHistoricalLoading] = useState<boolean>(false);
  const [internSummaryMetrics, setInternSummaryMetrics] = useState<{
    presentCount: number;
    absentCount: number;
    leaveCount: number;
    totalHours: number;
  }>({ presentCount: 0, absentCount: 0, leaveCount: 0, totalHours: 0 });

  // Individual Intern Dossier Modal
  const [internDossierModalOpen, setInternDossierModalOpen] = useState<boolean>(false);
  const [selectedInternForDossier, setSelectedInternForDossier] = useState<any | null>(null);
  const [internDossierRecords, setInternDossierRecords] = useState<any[]>([]);
  const [isInternDossierLoading, setIsInternDossierLoading] = useState<boolean>(false);

  // Intern Feedback Modal State (Mandatory on punch out)
  const [internFeedbackModalOpen, setInternFeedbackModalOpen] = useState(false);
  const [selectedInternForFeedback, setSelectedInternForFeedback] = useState<any | null>(null);
  const [internLearningText, setInternLearningText] = useState("");
  const [isPunchingIntern, setIsPunchingIntern] = useState(false);

  // Trainer Teaching Notes Modal State
  const [trainerTeachingModalOpen, setTrainerTeachingModalOpen] = useState(false);
  const [selectedInternForTrainer, setSelectedInternForTrainer] = useState<any | null>(null);
  const [trainerTeachingText, setTrainerTeachingText] = useState("");
  const [isSavingTrainerNotes, setIsSavingTrainerNotes] = useState(false);

  // Intern Leave Intimation Modal State
  const [internLeaveModalOpen, setInternLeaveModalOpen] = useState(false);
  const [selectedInternForLeave, setSelectedInternForLeave] = useState<any | null>(null);
  const [internLeaveReason, setInternLeaveReason] = useState("");
  const [isSubmittingInternLeave, setIsSubmittingInternLeave] = useState(false);
  const [isCheckingInternAbsentee, setIsCheckingInternAbsentee] = useState(false);

  // Real-Time GPS Coordinates State
  const [gpsCoords, setGpsCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    status: "IDLE" | "ACQUIRING" | "LOCKED" | "DENIED";
  }>({
    latitude: 13.0827,
    longitude: 80.2707,
    accuracy: 12,
    status: "IDLE",
  });

  // Regularization Modal state
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regReason, setRegReason] = useState("");
  const [isDispatchingAlert, setIsDispatchingAlert] = useState(false);
  const [overridingId, setOverridingId] = useState<string | null>(null);

  const handleOverride = async (attendanceId: string, empName: string) => {
    if (!confirm(`Are you sure you want to grant access and override ${empName}'s status to PRESENT?`)) {
      return;
    }
    setOverridingId(attendanceId);
    try {
      const res = await fetch("/api/attendance/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceId,
          action: "APPROVE_OVERRIDE",
          overrideReason: "Direct Super Admin / HR Override Clearance",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Access granted! ${empName}'s record has been cleared to PRESENT.`
        });
        loadAttendance();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to grant override." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to grant override." });
    } finally {
      setOverridingId(null);
    }
  };

  const handleDispatchAbsentAlert = async () => {
    setIsDispatchingAlert(true);
    try {
      const res = await fetch("/api/attendance/absentee-alert", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Absentee notice successfully dispatched to ${data.targetHREmail} for ${data.unPunchedCount} staff member(s)!`
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to dispatch alert to HR." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to dispatch alert." });
    } finally {
      setIsDispatchingAlert(false);
    }
  };

  const handle0945Scan = async () => {
    setIsDispatchingAlert(true);
    try {
      const res = await fetch("/api/attendance/absentee-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: data.message || "09:45 AM Shift Cutoff Scan complete! Intimation sent to hr@inzovate-technologies.com.",
        });
        loadAttendance();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to execute scan." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to execute scan." });
    } finally {
      setIsDispatchingAlert(false);
    }
  };

  const handleExport = (format: "pdf" | "excel") => {
    const empId = attendanceData?.currentEmployee?.employeeId || "INZ-EXEC-001";
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    window.open(
      `/api/attendance/export?employeeId=${empId}&month=${month}&year=${year}&format=${format}`,
      "_blank"
    );
  };

  // Acquire position from browser GPS
  const acquirePosition = (): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        resolve({ latitude: 13.0827, longitude: 80.2707, accuracy: 15 });
        return;
      }
      setGpsCoords((prev) => ({ ...prev, status: "ACQUIRING" }));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setGpsCoords({ ...coords, status: "LOCKED" });
          resolve(coords);
        },
        (err) => {
          console.warn("GPS acquire error:", err);
          setGpsCoords((prev) => ({ ...prev, status: "DENIED" }));
          resolve({ latitude: 13.0827, longitude: 80.2707, accuracy: 25 });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      acquirePosition();
    }
  }, []);

  const loadInternAttendanceData = async () => {
    try {
      const [intRes, attRes, schedRes] = await Promise.all([
        fetch("/api/internship").then((r) => r.json()),
        fetch("/api/internship/attendance").then((r) => r.json()),
        fetch("/api/internship/schedule").then((r) => r.json()),
      ]);
      if (intRes.success) setInternsList(intRes.internships || []);
      if (attRes.success) setInternAttendances(attRes.attendances || []);
      if (schedRes.success) setInternSchedules(schedRes.schedules || []);
    } catch (err) {
      console.warn("Failed to load intern attendance telemetry:", err);
    }
  };

  const loadAttendance = async () => {
    try {
      const res = await fetch("/api/attendance/list");
      const data = await res.json();
      if (data.success) {
        setAttendanceData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    loadInternAttendanceData();
  };

  const loadHistoricalInternAttendance = async (
    mode = internFilterMode,
    dateStr = selectedInternDate,
    studentId = selectedInternStudentFilter
  ) => {
    setIsHistoricalLoading(true);
    try {
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
        setHistoricalInternAttendances(data.attendances || []);
        if (data.summary) {
          setInternSummaryMetrics(data.summary);
        }
      }
    } catch (err) {
      console.warn("Failed to load historical intern attendance:", err);
    } finally {
      setIsHistoricalLoading(false);
    }
  };

  const openInternDossier = async (intern: any) => {
    setSelectedInternForDossier(intern);
    setInternDossierModalOpen(true);
    setIsInternDossierLoading(true);
    try {
      const res = await fetch(`/api/internship/attendance?internId=${intern.internId}&all=true`);
      const data = await res.json();
      if (data.success) {
        setInternDossierRecords(data.attendances || []);
      }
    } catch (err) {
      console.warn("Failed to fetch intern dossier:", err);
    } finally {
      setIsInternDossierLoading(false);
    }
  };

  const handleExportInternAttendance = (format: "excel" | "pdf" | "csv", specificInternId?: string) => {
    const params = new URLSearchParams();
    params.set("format", format);

    if (specificInternId) {
      params.set("internId", specificInternId);
      params.set("all", "true");
    } else {
      if (internFilterMode === "ALL") {
        params.set("all", "true");
      } else if (internFilterMode === "DATE" && selectedInternDate) {
        params.set("date", selectedInternDate);
      } else {
        params.set("date", new Date().toISOString().split("T")[0]);
      }

      if (selectedInternStudentFilter && selectedInternStudentFilter !== "ALL") {
        params.set("internId", selectedInternStudentFilter);
      }
    }

    window.open(`/api/internship/attendance/export?${params.toString()}`, "_blank");
  };

  useEffect(() => {
    if (attendanceView === "INTERNS") {
      loadHistoricalInternAttendance(internFilterMode, selectedInternDate, selectedInternStudentFilter);
    }
  }, [attendanceView, internFilterMode, selectedInternDate, selectedInternStudentFilter]);

  // Handler: Intern Punch In
  const handleInternPunchIn = async (intern: any) => {
    setIsPunchingIntern(true);
    try {
      const res = await fetch("/api/internship/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PUNCH_IN", internId: intern.internId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Punch-in recorded for intern ${intern.fullName}! Remember to enter learning feedback when punching out.`,
        });
        await loadInternAttendanceData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to punch in." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to punch in." });
    } finally {
      setIsPunchingIntern(false);
    }
  };

  // Handler: Intern Punch Out with Mandatory Feedback
  const handleInternPunchOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForFeedback) return;

    if (!internLearningText || !internLearningText.trim()) {
      alert("Mandatory Learning Feedback Required: You must enter what you learned today before punching out!");
      return;
    }

    setIsPunchingIntern(true);
    try {
      const res = await fetch("/api/internship/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PUNCH_OUT",
          internId: selectedInternForFeedback.internId,
          internFeedback: internLearningText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Punch-out successful! Learning feedback saved for ${selectedInternForFeedback.fullName}.`,
        });
        setInternFeedbackModalOpen(false);
        setSelectedInternForFeedback(null);
        setInternLearningText("");
        await loadInternAttendanceData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to punch out." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to punch out." });
    } finally {
      setIsPunchingIntern(false);
    }
  };

  // Handler: Trainer Teaching Notes
  const handleSaveTrainerNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForTrainer) return;

    if (!trainerTeachingText || !trainerTeachingText.trim()) {
      alert("Please enter what topics you taught today.");
      return;
    }

    setIsSavingTrainerNotes(true);
    try {
      const res = await fetch("/api/internship/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_TRAINER_FEEDBACK",
          internId: selectedInternForTrainer.internId,
          trainerFeedback: trainerTeachingText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: "Trainer teaching notes recorded successfully!",
        });
        setTrainerTeachingModalOpen(false);
        setSelectedInternForTrainer(null);
        setTrainerTeachingText("");
        await loadInternAttendanceData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save trainer notes." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save trainer notes." });
    } finally {
      setIsSavingTrainerNotes(false);
    }
  };

  // Handler: Intern Prior Leave Intimation
  const handleInternLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForLeave) return;

    if (!internLeaveReason || !internLeaveReason.trim()) {
      alert("Please state a reason for taking leave.");
      return;
    }

    setIsSubmittingInternLeave(true);
    try {
      const res = await fetch("/api/internship/leave-intimation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internId: selectedInternForLeave.internId,
          reason: internLeaveReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: "Leave intimation submitted. Trainer and HR have been notified.",
        });
        setInternLeaveModalOpen(false);
        setSelectedInternForLeave(null);
        setInternLeaveReason("");
        await loadInternAttendanceData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit leave intimation." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to submit leave intimation." });
    } finally {
      setIsSubmittingInternLeave(false);
    }
  };

  // Handler: Trigger 3-Way Absent Scan for Interns
  const handleTriggerInternAbsenteeScan = async () => {
    setIsCheckingInternAbsentee(true);
    try {
      const res = await fetch("/api/internship/absentee-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: data.message || `Intern absentee check completed: ${data.absentAlertsCount || 0} 3-way notice(s) dispatched to Student, Trainer, and HR!`,
        });
        await loadInternAttendanceData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to run intern absentee check." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to run intern absentee check." });
    } finally {
      setIsCheckingInternAbsentee(false);
    }
  };

  useEffect(() => {
    loadAttendance();

    const handleUpdate = () => {
      loadAttendance();
    };
    window.addEventListener("inzovate_punch_updated", handleUpdate);
    return () => window.removeEventListener("inzovate_punch_updated", handleUpdate);
  }, []);

  const userToday = attendanceData?.userTodayRecord;
  const isActivelyClockedIn = !!userToday?.punchInTime && !userToday?.punchOutTime;
  const hasCompletedInterval = !!userToday?.punchInTime && !!userToday?.punchOutTime;
  const isPunchedIn = isActivelyClockedIn;
  const isPunchedOut = hasCompletedInterval;
  const isExempt = !!attendanceData?.isExempt;

  // Running work stopwatch timer when clocked in
  useEffect(() => {
    if (!userToday?.punchInTime || userToday?.punchOutTime) {
      setElapsedSeconds(0);
      return;
    }

    const punchInDate = new Date(userToday.punchInTime);

    const updateTimer = () => {
      const diffMs = Math.max(0, Date.now() - punchInDate.getTime());
      setElapsedSeconds(Math.floor(diffMs / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [userToday?.punchInTime, userToday?.punchOutTime]);

  const handlePunch = async (action: "PUNCH_IN" | "PUNCH_OUT") => {
    setActionLoading(true);
    setMessage(null);

    // Always fetch live GPS coordinates to comply with mandatory geofence audit
    const coords = await acquirePosition();

    try {
      const res = await fetch("/api/attendance/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Punch request failed." });
      } else {
        const text =
          action === "PUNCH_IN"
            ? `Punched In Successfully! Status: ${data.evaluation.status} (${data.evaluation.notes})`
            : `Punched Out Successfully! Duration: ${data.evaluation.durationFormatted}`;
        setMessage({ type: "success", text });
        loadAttendance();
        window.dispatchEvent(new CustomEvent("inzovate_punch_updated"));
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error during punch request." });
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  };

  const filteredRecords = (attendanceData?.records || []).filter((r: any) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  // Domains list for intern filter
  const internDomains = Array.from(new Set(internsList.map((i) => i.domain).filter(Boolean)));

  // Filtered interns for TODAY mode
  const filteredTodayInterns = internsList.filter((intern) => {
    if (selectedInternStudentFilter !== "ALL" && intern.internId !== selectedInternStudentFilter) return false;
    if (selectedInternDomainFilter !== "ALL" && intern.domain !== selectedInternDomainFilter) return false;
    if (internSearchQuery.trim()) {
      const q = internSearchQuery.toLowerCase();
      const matchName = intern.fullName?.toLowerCase().includes(q);
      const matchId = intern.internId?.toLowerCase().includes(q);
      const matchEmail = intern.personalEmail?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchEmail) return false;
    }
    if (selectedInternStatusFilter !== "ALL") {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayAtt = internAttendances.find(
        (a: any) => (a.internId === intern.internId || a.internId === intern.id) && a.date === todayStr
      );
      if (selectedInternStatusFilter === "PRESENT" && todayAtt?.status !== "PRESENT") return false;
      if (selectedInternStatusFilter === "ABSENT" && todayAtt?.status !== "ABSENT") return false;
      if (selectedInternStatusFilter === "LEAVE" && todayAtt?.status !== "ON_LEAVE" && todayAtt?.status !== "LEAVE") return false;
    }
    return true;
  });

  // Filtered historical records for ALL / DATE mode
  const filteredHistoricalRecords = historicalInternAttendances.filter((rec) => {
    if (selectedInternStudentFilter !== "ALL" && rec.internId !== selectedInternStudentFilter) return false;
    if (selectedInternDomainFilter !== "ALL" && rec.internship?.domain !== selectedInternDomainFilter) return false;
    if (selectedInternStatusFilter !== "ALL" && rec.status !== selectedInternStatusFilter) return false;
    if (internSearchQuery.trim()) {
      const q = internSearchQuery.toLowerCase();
      const matchName = rec.internship?.fullName?.toLowerCase().includes(q);
      const matchId = rec.internId?.toLowerCase().includes(q);
      const matchDate = rec.date?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchDate) return false;
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
        {/* Cyber-Obsidian Executive Shift Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#060D1A] via-[#09152A] to-[#030712] border border-cyan-500/20 p-6 sm:p-8 shadow-2xl text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Asia/Kolkata IST Server Authority</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>GPS Geofence Verified (Chennai HQ)</span>
                </span>
                {attendanceData?.currentEmployee && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-bold border border-white/10">
                    <span>ID: {attendanceData.currentEmployee.employeeId}</span>
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  {new Date().getHours() < 12
                    ? "Good morning"
                    : new Date().getHours() < 17
                    ? "Good afternoon"
                    : "Good evening"}
                  {attendanceData?.currentEmployee
                    ? `, ${attendanceData.currentEmployee.firstName} ${attendanceData.currentEmployee.lastName}`
                    : ""}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center space-x-3">
                  <span>Shift Attendance &amp; Telemetry Hub</span>
                  <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                    Zero Friction Active
                  </span>
                </h1>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-normal">
                Standard Shift: <strong className="text-white">09:30 AM IST</strong> • Grace Cutoff:{" "}
                <strong className="text-amber-300">09:45 AM IST (Strict)</strong> • Shift Concludes:{" "}
                <strong className="text-purple-300">05:00 PM IST</strong> • Live GPS required for all punches.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handle0945Scan}
                  disabled={isDispatchingAlert}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 border border-rose-400/30 transition flex items-center space-x-2 disabled:opacity-50"
                  title="Executes 09:45 AM Grace Cutoff Scan and dispatches absent report to hr@inzovate-technologies.com"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isDispatchingAlert ? "Scanning..." : "📢 09:45 AM Shift Cutoff Scan & HR Alert"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport("pdf")}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center space-x-1.5"
                  title="Export official attendance summary dossier as PDF"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport("excel")}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-xs border border-emerald-400/30 transition flex items-center space-x-1.5 shadow-md shadow-emerald-900/40"
                  title="Export detailed attendance ledger as Excel (.xlsx)"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Export Excel (.xlsx)</span>
                </button>

                <span className="text-[11px] px-3 py-1.5 rounded-xl bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 font-medium">
                  🌴 Sat &amp; Sun: Company Week-Off
                </span>
              </div>
            </div>

            {/* Server IST Holographic Clock Badge */}
            <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-right flex-shrink-0 shadow-lg">
              <Clock className="w-10 h-10 text-cyan-400 flex-shrink-0 animate-pulse" />
              <div>
                <div className="text-[10px] text-cyan-300/80 font-mono font-bold uppercase tracking-wider">
                  Live IST Authority
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">
                  {attendanceData?.currentTimeIST || "09:30:00 AM"}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">{attendanceData?.today || "Today"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-start space-x-3 animate-fadeIn shadow-lg ${
              message.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/40 border-rose-500/40 text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            )}
            <span className="leading-relaxed">{message.text}</span>
          </div>
        )}

        {/* Dual Tab Navigation: Full-Time Staff vs Intern Candidates */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setAttendanceView("FULL_TIME")}
              className={`flex items-center space-x-2.5 py-3 px-5 font-bold text-xs sm:text-sm rounded-2xl transition border ${
                attendanceView === "FULL_TIME"
                  ? "bg-blue-50 border-blue-200 text-[#0066FF] shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Users className="w-4 h-4 text-[#0066FF]" />
              <span>Full-Time Employees (Shift 09:30 AM – 05:00 PM)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAttendanceView("INTERNS");
                loadInternAttendanceData();
              }}
              className={`flex items-center space-x-2.5 py-3 px-5 font-bold text-xs sm:text-sm rounded-2xl transition border ${
                attendanceView === "INTERNS"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Intern Candidates (Class Schedule &amp; Feedback)</span>
              <span className="ml-1.5 px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {internsList.length}
              </span>
            </button>
          </div>

          {attendanceView === "INTERNS" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportInternAttendance("pdf")}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
                title="Export Official PDF Attendance Dossier"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportInternAttendance("excel")}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
                title="Export Full Attendance Sheet as Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerInternAbsenteeScan}
                disabled={isCheckingInternAbsentee}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
                title="Runs absentee scan for ended classes & sends 3-way notice to Student, Trainer, and HR"
              >
                {isCheckingInternAbsentee ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>3-Way Absent Scan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loadInternAttendanceData();
                  loadHistoricalInternAttendance();
                }}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-2xs"
                title="Refresh Intern Data"
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* FULL-TIME EMPLOYEES VIEW */}
        {attendanceView === "FULL_TIME" && (
          <>
            {/* 2-Column: Main Interactive Live Punch Radar + QA Controller & Geofence HUD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Punch Interaction Console (2 Columns) */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0866FF]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Today&apos;s Live Shift Radar</h3>
                  <p className="text-[11px] text-slate-400">Real-time attendance interval monitoring</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
                {attendanceData?.today || "Today"}
              </span>
            </div>

            {/* Shift Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Punch-In Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                  Punch-In Telemetry
                </span>
                <div className="text-2xl font-mono font-black text-slate-900">
                  {userToday?.punchInTime
                    ? new Date(userToday.punchInTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "Not clocked in"}
                </div>
                {userToday && (
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        userToday.status === "PRESENT"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : userToday.status === "LATE"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {userToday.status}
                    </span>
                    {userToday.lateMinutes > 0 && (
                      <span className="text-[11px] text-rose-600 font-bold font-mono">
                        +{userToday.lateMinutes} mins late
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Punch-Out / Duration Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                  Punch-Out Telemetry
                </span>
                <div className="text-2xl font-mono font-black text-slate-900">
                  {userToday?.punchOutTime
                    ? new Date(userToday.punchOutTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : isPunchedIn
                    ? "Shift in progress"
                    : "Not clocked out"}
                </div>
                {isPunchedIn && !isPunchedOut ? (
                  <div className="text-xs font-mono font-extrabold text-emerald-700 flex items-center space-x-1.5 pt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Active Time: {formatTimer(elapsedSeconds)}</span>
                  </div>
                ) : userToday?.workedHours > 0 ? (
                  <div className="text-[11px] text-[#0866FF] font-bold font-mono pt-1">
                    Completed: {userToday.workedHours} hrs worked
                  </div>
                ) : null}
              </div>
            </div>

            {/* Live GPS Lock Telemetry Pill */}
            <div className="p-4 rounded-2xl bg-[#030B17] border border-cyan-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <MapPin className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>Mandatory Device GPS Status</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-black uppercase ${
                        gpsCoords.status === "LOCKED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : gpsCoords.status === "ACQUIRING"
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      }`}
                    >
                      {gpsCoords.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-300/80 mt-0.5">
                    Lat: {gpsCoords.latitude.toFixed(4)}° N • Lng: {gpsCoords.longitude.toFixed(4)}° E (±{Math.round(gpsCoords.accuracy)}m)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => acquirePosition()}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 font-bold text-[11px] border border-cyan-500/30 transition flex items-center space-x-1 self-start sm:self-auto"
              >
                <Navigation className="w-3 h-3" />
                <span>Refresh Fix</span>
              </button>
            </div>

            {/* Punch Action Buttons or Executive Exemption Notice */}
            {isExempt ? (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-4 text-amber-900">
                <ShieldCheck className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-amber-900">
                    Executive Exemption Active
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Director and Founder accounts are permanent executive authorities and are exempt from mandatory daily shift punch-in policies.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handlePunch("PUNCH_IN")}
                  disabled={isActivelyClockedIn || actionLoading}
                  className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#0066FF] via-[#0052CC] to-blue-800 hover:from-blue-600 hover:to-blue-900 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center space-x-2.5 active:scale-98"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5 fill-white" />
                  )}
                  <span>
                    {isActivelyClockedIn
                      ? "Clocked In (Active Shift)"
                      : hasCompletedInterval
                      ? "Punch In Again (Resume Shift)"
                      : "Punch In Now"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePunch("PUNCH_OUT")}
                  disabled={!isActivelyClockedIn || actionLoading}
                  className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-rose-900 hover:from-rose-700 hover:to-rose-950 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 transition disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center space-x-2.5 active:scale-98"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Square className="w-5 h-5 fill-white" />
                  )}
                  <span>Punch Out (End Interval)</span>
                </button>
              </div>
            )}

            {/* Shift Policy & Deduction Rules Warning Card */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-900 font-extrabold">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Strict Shift Compliance &amp; Loss of Pay (LOP) Rules</span>
              </div>
              <ul className="text-amber-800/90 space-y-1 pl-6 list-disc text-[11px] leading-relaxed">
                <li>
                  <strong>Arrival after 09:45 AM IST:</strong> Triggers instant exception alert email to HR Head &amp; Team Lead with GPS audit tag, plus automated 1/4 or 1/2 day salary deduction.
                </li>
                <li>
                  <strong>Departure before 05:00 PM IST:</strong> Triggers unauthorized early departure email to HR Head &amp; Team Lead with pro-rated hourly deduction for incomplete shift time.
                </li>
                <li>
                  <strong>Live Geolocation:</strong> Device GPS coordinates are recorded on the company blockchain audit log. Punches without GPS will be rejected by server.
                </li>
              </ul>
            </div>

            {/* Today's Shift Milestone Timeline */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Today&apos;s Shift Chronological Milestones</span>
                <span className="text-[10px] text-slate-400 font-normal">9:30 AM – 5:00 PM IST</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">09:30 AM</span>
                  <span className="text-[11px] font-extrabold text-slate-800">Shift Starts</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/70">
                  <span className="text-[9px] font-bold text-emerald-600 block uppercase">09:45 AM</span>
                  <span className="text-[11px] font-extrabold text-emerald-800">Grace Cutoff</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/70">
                  <span className="text-[9px] font-bold text-blue-600 block uppercase">01:00 PM</span>
                  <span className="text-[11px] font-extrabold text-blue-800">Lunch Break</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200/70">
                  <span className="text-[9px] font-bold text-purple-600 block uppercase">05:00 PM</span>
                  <span className="text-[11px] font-extrabold text-purple-800">Shift End</span>
                </div>
              </div>
            </div>

            {/* Regularization Trigger */}
            {userToday?.status === "ABSENT" && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-rose-900">
                  <strong className="font-bold">Marked Absent:</strong> Punch occurred after the 09:45 AM IST cutoff. Submit a formal regularisation request to your Team Lead.
                </div>
                <button
                  type="button"
                  onClick={() => setRegModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold transition shadow-xs flex-shrink-0"
                >
                  Regularise Now
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Shift Telemetry & Geofence Verification HUD */}
          <div className="space-y-6">
            {/* Executive Shift Telemetry & Loss of Pay Policy Engine */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#060E1D] to-[#040813] text-white shadow-xl space-y-4 border border-cyan-500/20">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Automated Shift Telemetry</h3>
                  <p className="text-[10px] text-cyan-300/70">Strict Asia/Kolkata Server Authority</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Standard Shift:</span>
                  <span className="font-mono font-bold text-white">09:30 AM IST</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Grace Period Cutoff:</span>
                  <span className="font-mono font-bold text-amber-300">09:45 AM IST</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Shift Conclusion:</span>
                  <span className="font-mono font-bold text-purple-300">05:00 PM IST</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Geofence Status:</span>
                  <span className="font-mono font-bold text-emerald-400">Chennai HQ (Active)</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 leading-relaxed">
                Server-authoritative enforcement: Punches past 09:45 AM or departures before 05:00 PM automatically calculate Loss of Pay (LOP) payroll deductions and dispatch real-time GPS exception emails to the HR Department.
              </div>
            </div>

            {/* Geofence Perimeter Verification Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Registered Corporate Geofence</h4>
                  <p className="text-[10px] text-slate-400">Chennai Global Headquarters</p>
                </div>
              </div>

              <div className="space-y-2 pt-1 font-mono text-[11px] text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Headquarters:</span>
                  <span className="font-bold text-slate-800">13.0827° N, 80.2707° E</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Allowed Perimeter:</span>
                  <span className="font-bold text-emerald-600">500 meters radius</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Enforcement:</span>
                  <span className="font-bold text-blue-600">Strict Server-side Audit</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps?q=${gpsCoords.latitude},${gpsCoords.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-center transition flex items-center justify-center space-x-1.5"
              >
                <span>View My Coordinates on Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Calendar Grid */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <Calendar className="w-5 h-5 text-[#0066FF]" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Monthly Attendance Calendar</h3>
                <p className="text-[11px] text-slate-400">Monthly presence breakdown and compliance tracking</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Present</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Late Grace</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Absent / LOP</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span>Weekend / Holiday</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <div key={idx} className="font-bold text-slate-400 text-[11px] py-1">
                {day}
              </div>
            ))}

            {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
              const dayOfWeek = (dayNum + 3) % 7;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isToday = dayNum === 13;
              const isPast = dayNum <= 13;

              let statusColor = "bg-slate-50 border-slate-100 text-slate-400";
              let badgeText = "Upcoming";

              if (isWeekend) {
                statusColor = "bg-blue-50/50 border-blue-100 text-blue-700";
                badgeText = "Weekend";
              } else if (isToday) {
                statusColor = userToday?.punchInTime
                  ? userToday.status === "PRESENT"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold ring-2 ring-emerald-400/30"
                    : "bg-amber-50 border-amber-300 text-amber-800 font-bold ring-2 ring-amber-400/30"
                  : "bg-blue-50 border-blue-300 text-blue-800 font-bold ring-2 ring-blue-400/30";
                badgeText = userToday?.status || "Today";
              } else if (isPast) {
                const isLate = dayNum === 3 || dayNum === 8;
                const isAbsent = dayNum === 7;
                if (isAbsent) {
                  statusColor = "bg-rose-50 border-rose-200 text-rose-800";
                  badgeText = "Absent";
                } else if (isLate) {
                  statusColor = "bg-amber-50 border-amber-200 text-amber-800";
                  badgeText = "Late";
                } else {
                  statusColor = "bg-emerald-50 border-emerald-200 text-emerald-800";
                  badgeText = "Present";
                }
              }

              return (
                <div
                  key={dayNum}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between min-h-[56px] transition hover:shadow-xs ${statusColor}`}
                >
                  <span className="font-mono text-xs font-bold">{dayNum}</span>
                  <span className="text-[9px] font-bold uppercase truncate max-w-full">
                    {badgeText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company Attendance Register Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Workforce Attendance Register &amp; Audit Trail</h3>
              <p className="text-[11px] text-slate-400">Complete immutable audit log of arrival, departure, GPS fixes, and deductions</p>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late Grace</option>
                <option value="ABSENT">Marked Absent / LOP</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Punch In</th>
                  <th className="px-5 py-3.5">Punch Out</th>
                  <th className="px-5 py-3.5">Worked</th>
                  <th className="px-5 py-3.5">Evaluation</th>
                  <th className="px-5 py-3.5">Audit &amp; Salary Deductions</th>
                  <th className="px-5 py-3.5 text-right">Access &amp; Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-medium">
                      No matching attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record: any, idx: number) => {
                    const isPrivileged = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(attendanceData?.userRole);
                    const isAbsentOrLate = record.status === "ABSENT" || record.status === "LATE";
                    const isOverridden = record.regularizationStatus === "APPROVED" && record.status === "PRESENT";

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">
                            {record.employee?.firstName} {record.employee?.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{record.employeeId}</div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">{record.date}</td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                          {record.punchInTime
                            ? new Date(record.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                          {record.punchOutTime
                            ? new Date(record.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">
                          {record.workedHours ? `${record.workedHours} hrs` : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                record.status === "PRESENT"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : record.status === "LATE"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {record.status}
                            </span>
                            {isOverridden && (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>HR Cleared</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-sm">
                          <div className="text-[11px] font-mono leading-tight truncate">
                            {record.punchInNotes || record.punchOutNotes || "Standard shift verified"}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {isPrivileged && isAbsentOrLate ? (
                            <button
                              onClick={() =>
                                handleOverride(
                                  record.id,
                                  `${record.employee?.firstName || ""} ${record.employee?.lastName || ""}`
                                )
                              }
                              disabled={overridingId === record.id}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-sm transition active:scale-95 disabled:opacity-50"
                              title="Super Admin / HR override: clears ABSENT to PRESENT"
                            >
                              {overridingId === record.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
                              <span>Grant Access (Present)</span>
                            </button>
                          ) : isOverridden ? (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-600">
                              <Check className="w-3.5 h-3.5" />
                              <span>Cleared to Present</span>
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {/* INTERN CANDIDATES ATTENDANCE & LEARNING HUB */}
        {attendanceView === "INTERNS" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Interns</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0066FF]">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{internsList.length}</div>
                <p className="text-[11px] text-slate-400">Enrolled technical intern candidates</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Assigned Trainers</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {new Set(internsList.filter((i) => i.trainerId).map((i) => i.trainerId)).size}
                </div>
                <p className="text-[11px] text-slate-400">Dedicated staff employee mentors</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Classes Today</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {internSchedules.filter((s) => s.date === new Date().toISOString().split("T")[0]).length}
                </div>
                <p className="text-[11px] text-slate-400">Scheduled 09:00 AM – 08:00 PM</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Present / Attended</span>
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {internAttendances.filter(
                    (a) => a.date === new Date().toISOString().split("T")[0] && (a.status === "PRESENT" || a.punchInTime)
                  ).length}
                </div>
                <p className="text-[11px] text-slate-400">Completed or ongoing class punches</p>
              </div>
            </div>

            {/* Informational Guidance Alert */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-xs text-blue-900 flex items-start space-x-3 shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#0066FF] mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-[#0066FF]">Internship Attendance &amp; Learning Protocol</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Daily Class Window:</strong> Trainers schedule daily class hours between 09:00 AM and 08:00 PM. Trainers who haven&apos;t scheduled by 10:30 AM receive an automated reminder. <br />
                  <strong>Mandatory Learning Submission:</strong> Interns must punch in when their class starts, and on punch out, they <strong>must submit what they learned today</strong> before departure is recorded. Missed classes without prior leave trigger automated 3-way intimation to the Student, Trainer, and HR.
                </p>
              </div>
            </div>

            {/* Intern Candidates Attendance Register & Historical Ledger Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              {/* Header with Title and Mode Switcher */}
              <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-black text-base text-slate-900 tracking-tight">
                      Intern Class Attendance &amp; Historical Dossier
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      {internFilterMode === "TODAY" ? "Live Today" : internFilterMode === "DATE" ? `Date: ${selectedInternDate}` : "All Records"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Live punch telemetry, past day audit, individual student history dossiers, and Excel/PDF export suites
                  </p>
                </div>

                {/* Interactive Mode Switcher & Export */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setInternFilterMode("TODAY")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        internFilterMode === "TODAY"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Live Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setInternFilterMode("DATE")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        internFilterMode === "DATE"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Specific Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setInternFilterMode("ALL")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        internFilterMode === "ALL"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      All Historical Records
                    </button>
                  </div>

                  {internFilterMode === "DATE" && (
                    <input
                      type="date"
                      value={selectedInternDate}
                      onChange={(e) => setSelectedInternDate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  )}

                  {/* Export Master Buttons right on table card */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleExportInternAttendance("excel")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition inline-flex items-center space-x-1 active:scale-95"
                      title="Export Current Attendance Sheet as Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Export Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportInternAttendance("pdf")}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition inline-flex items-center space-x-1 active:scale-95"
                      title="Export Current Attendance Dossier as PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export PDF</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4-Way Filter Controls */}
              <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={internSearchQuery}
                    onChange={(e) => setInternSearchQuery(e.target.value)}
                    placeholder="Search intern name, ID, or email..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                  {internSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setInternSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Student Dropdown */}
                <div>
                  <select
                    value={selectedInternStudentFilter}
                    onChange={(e) => setSelectedInternStudentFilter(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                  >
                    <option value="ALL">All Intern Students ({internsList.length})</option>
                    {internsList.map((i) => (
                      <option key={i.internId} value={i.internId}>
                        {i.fullName} ({i.internId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Domain Dropdown */}
                <div>
                  <select
                    value={selectedInternDomainFilter}
                    onChange={(e) => setSelectedInternDomainFilter(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                  >
                    <option value="ALL">All Domains ({internDomains.length})</option>
                    {internDomains.map((d: any) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Dropdown */}
                <div>
                  <select
                    value={selectedInternStatusFilter}
                    onChange={(e) => setSelectedInternStatusFilter(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                  >
                    <option value="ALL">All Attendance Statuses</option>
                    <option value="PRESENT">Present Only</option>
                    <option value="ABSENT">Absent Only</option>
                    <option value="LEAVE">Leave Only</option>
                  </select>
                </div>
              </div>

              {/* Summary KPI Strip */}
              <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-bold text-slate-700">
                    Audit Metrics:
                  </span>
                  <span className="inline-flex items-center space-x-1 font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span>Present: {internFilterMode === "TODAY" ? filteredTodayInterns.filter(i => { const a = internAttendances.find((att: any) => att.internId === i.internId && att.date === new Date().toISOString().split("T")[0]); return a?.status === "PRESENT" || a?.punchInTime; }).length : internSummaryMetrics.presentCount}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 font-mono text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    <span>Absent: {internFilterMode === "TODAY" ? filteredTodayInterns.filter(i => { const a = internAttendances.find((att: any) => att.internId === i.internId && att.date === new Date().toISOString().split("T")[0]); return a?.status === "ABSENT"; }).length : internSummaryMetrics.absentCount}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 font-mono text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <span>Leave: {internFilterMode === "TODAY" ? filteredTodayInterns.filter(i => { const a = internAttendances.find((att: any) => att.internId === i.internId && att.date === new Date().toISOString().split("T")[0]); return a?.status === "ON_LEAVE" || a?.status === "LEAVE"; }).length : internSummaryMetrics.leaveCount}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    <span>Total Hours: {internSummaryMetrics.totalHours.toFixed(1)} hrs</span>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Click <strong className="text-cyan-700 font-bold">&quot;Dossier&quot;</strong> on any row to view &amp; export that student&apos;s full daily attendance sheet.
                </div>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto">
                {internFilterMode === "TODAY" ? (
                  /* LIVE TODAY TABLE */
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Intern Candidate</th>
                        <th className="px-5 py-3.5">Assigned Trainer</th>
                        <th className="px-5 py-3.5">Class Schedule</th>
                        <th className="px-5 py-3.5">Punch In / Out</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">What Intern Learned (Mandatory)</th>
                        <th className="px-5 py-3.5">Trainer Teaching Notes</th>
                        <th className="px-5 py-3.5 text-right">Actions &amp; Dossier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTodayInterns.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-medium">
                            No matching intern candidates found.
                          </td>
                        </tr>
                      ) : (
                        filteredTodayInterns.map((intern: any) => {
                          const todayStr = new Date().toISOString().split("T")[0];
                          const todayAtt = internAttendances.find(
                            (a: any) => (a.internId === intern.internId || a.internId === intern.id) && a.date === todayStr
                          );
                          const todaySch = internSchedules.find(
                            (s: any) => (s.internId === intern.internId || s.internId === intern.id) && s.date === todayStr
                          );

                          const hasPunchedIn = !!todayAtt?.punchInTime;
                          const hasPunchedOut = !!todayAtt?.punchOutTime;
                          const isClassInProgress = hasPunchedIn && !hasPunchedOut;

                          return (
                            <tr key={intern.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-900">{intern.fullName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{intern.internId || intern.id}</div>
                                <div className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-[#0066FF] border border-blue-100">
                                  {intern.domain || "Technical Intern"}
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                {intern.trainerName ? (
                                  <div>
                                    <div className="font-semibold text-slate-800 flex items-center space-x-1">
                                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>{intern.trainerName}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">{intern.trainerEmail}</div>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Unallocated</span>
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-3.5 font-mono">
                                {todaySch ? (
                                  <div>
                                    <div className="font-bold text-slate-800">
                                      {todaySch.startTime} – {todaySch.endTime}
                                    </div>
                                    {todaySch.meetingLink && (
                                      <a
                                        href={todaySch.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-blue-600 hover:underline flex items-center space-x-0.5 mt-0.5"
                                      >
                                        <span>Join Session</span>
                                        <ArrowUpRight className="w-2.5 h-2.5" />
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-slate-400 text-[11px] italic">
                                    Pending Trainer
                                  </div>
                                )}
                              </td>

                              <td className="px-5 py-3.5 font-mono text-slate-700">
                                <div>
                                  <span className="text-slate-400">In:</span>{" "}
                                  <span className="font-bold text-slate-900">
                                    {todayAtt?.punchInTime
                                      ? new Date(todayAtt.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                      : "—"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Out:</span>{" "}
                                  <span className="font-bold text-slate-900">
                                    {todayAtt?.punchOutTime
                                      ? new Date(todayAtt.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                      : "—"}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                {todayAtt?.status === "PRESENT" ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 w-max">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Present</span>
                                  </span>
                                ) : todayAtt?.status === "ON_LEAVE" ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1 w-max">
                                    <Calendar className="w-3 h-3" />
                                    <span>On Leave</span>
                                  </span>
                                ) : todayAtt?.status === "ABSENT" ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1 w-max">
                                    <XCircle className="w-3 h-3" />
                                    <span>Absent (3-Way Sent)</span>
                                  </span>
                                ) : isClassInProgress ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1 w-max">
                                    <Clock className="w-3 h-3 animate-pulse" />
                                    <span>Class In Progress</span>
                                  </span>
                                ) : todaySch ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 w-max">
                                    Scheduled
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-mono text-[11px]">—</span>
                                )}
                              </td>

                              <td className="px-5 py-3.5 max-w-xs">
                                {todayAtt?.internFeedback ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-1 text-emerald-600 text-[10px] font-bold">
                                      <Check className="w-3 h-3" />
                                      <span>Verified Learning Log</span>
                                    </div>
                                    <div className="text-[11px] text-slate-700 italic bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                                      &ldquo;{todayAtt.internFeedback}&rdquo;
                                    </div>
                                  </div>
                                ) : isClassInProgress ? (
                                  <div className="text-[11px] text-amber-600 font-medium flex items-center space-x-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Mandatory on Punch-Out</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 font-mono text-[11px]">—</span>
                                )}
                              </td>

                              <td className="px-5 py-3.5 max-w-xs">
                                {todayAtt?.trainerFeedback ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-1 text-blue-600 text-[10px] font-bold">
                                      <BookOpen className="w-3 h-3" />
                                      <span>Taught Topics</span>
                                    </div>
                                    <div className="text-[11px] text-slate-700 italic bg-blue-50/50 p-2 rounded-xl border border-blue-100 line-clamp-2">
                                      &ldquo;{todayAtt.trainerFeedback}&rdquo;
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-[11px] italic">No notes logged</span>
                                )}
                              </td>

                              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-1.5">
                                  {/* VIEW FULL DOSSIER BUTTON */}
                                  <button
                                    type="button"
                                    onClick={() => openInternDossier(intern)}
                                    className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold text-[10px] transition flex items-center space-x-1 shadow-2xs"
                                    title="View & Export Student Attendance Dossier"
                                  >
                                    <Eye className="w-3 h-3 text-cyan-600" />
                                    <span>Dossier</span>
                                  </button>

                                  {!hasPunchedIn && todayAtt?.status !== "ON_LEAVE" && (
                                    <button
                                      onClick={() => handleInternPunchIn(intern)}
                                      disabled={isPunchingIntern}
                                      className="px-2.5 py-1.5 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-[10px] shadow-2xs transition active:scale-95 disabled:opacity-50"
                                      title="Start Class Shift"
                                    >
                                      Clock In
                                    </button>
                                  )}

                                  {isClassInProgress && (
                                    <button
                                      onClick={() => {
                                        setSelectedInternForFeedback(intern);
                                        setInternLearningText(todayAtt?.internFeedback || "");
                                        setInternFeedbackModalOpen(true);
                                      }}
                                      disabled={isPunchingIntern}
                                      className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] shadow-2xs transition active:scale-95 disabled:opacity-50 flex items-center space-x-1"
                                      title="Submit mandatory learning notes and clock out"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Punch Out</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      setSelectedInternForTrainer(intern);
                                      setTrainerTeachingText(todayAtt?.trainerFeedback || "");
                                      setTrainerTeachingModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition"
                                    title="Add or update teaching notes"
                                  >
                                    Notes
                                  </button>

                                  {todayAtt?.status !== "ON_LEAVE" && !hasPunchedIn && (
                                    <button
                                      onClick={() => {
                                        setSelectedInternForLeave(intern);
                                        setInternLeaveModalOpen(true);
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[10px] transition"
                                      title="Submit advance leave notice"
                                    >
                                      Leave
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                ) : (
                  /* HISTORICAL / SPECIFIC DATE TABLE */
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Session Date</th>
                        <th className="px-5 py-3.5">Intern Candidate</th>
                        <th className="px-5 py-3.5">Assigned Mentor &amp; Track</th>
                        <th className="px-5 py-3.5">Punch In / Out (IST)</th>
                        <th className="px-5 py-3.5">Hours Logged</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">What Intern Learned</th>
                        <th className="px-5 py-3.5">Trainer Teaching Notes</th>
                        <th className="px-5 py-3.5 text-right">Dossier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isHistoricalLoading ? (
                        <tr>
                          <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
                            <span>Loading historical attendance records...</span>
                          </td>
                        </tr>
                      ) : filteredHistoricalRecords.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-5 py-12 text-center text-slate-400 font-medium">
                            No attendance records match the selected date or filter.
                          </td>
                        </tr>
                      ) : (
                        filteredHistoricalRecords.map((record: any) => {
                          const inFormatted = record.punchInTime
                            ? new Date(record.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "—";
                          const outFormatted = record.punchOutTime
                            ? new Date(record.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "—";

                          const internMeta = record.internship || internsList.find(i => i.internId === record.internId) || {};

                          return (
                            <tr key={record.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                                {record.date}
                              </td>

                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-900">{internMeta.fullName || record.internId}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{record.internId}</div>
                              </td>

                              <td className="px-5 py-3.5">
                                <div className="font-medium text-slate-800">{internMeta.trainerName || "Mentor"}</div>
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-[#0066FF] border border-blue-100">
                                  {internMeta.domain || "Technical"}
                                </span>
                              </td>

                              <td className="px-5 py-3.5 font-mono text-slate-700 whitespace-nowrap">
                                <div><span className="text-slate-400">In:</span> <span className="font-bold">{inFormatted}</span></div>
                                <div><span className="text-slate-400">Out:</span> <span className="font-bold">{outFormatted}</span></div>
                              </td>

                              <td className="px-5 py-3.5 font-mono font-bold text-cyan-700 whitespace-nowrap">
                                {record.workedHours > 0 ? `${record.workedHours.toFixed(2)} hrs` : "—"}
                              </td>

                              <td className="px-5 py-3.5 whitespace-nowrap">
                                {record.status === "PRESENT" && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    PRESENT
                                  </span>
                                )}
                                {record.status === "ABSENT" && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                    ABSENT
                                  </span>
                                )}
                                {record.status === "LEAVE" && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    LEAVE
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-3.5 max-w-xs truncate" title={record.internFeedback || ""}>
                                {record.internFeedback ? (
                                  <span className="text-slate-700 italic">&ldquo;{record.internFeedback}&rdquo;</span>
                                ) : (
                                  <span className="text-slate-300 font-mono text-[11px]">—</span>
                                )}
                              </td>

                              <td className="px-5 py-3.5 max-w-xs truncate" title={record.trainerFeedback || ""}>
                                {record.trainerFeedback ? (
                                  <span className="text-slate-600 italic">&ldquo;{record.trainerFeedback}&rdquo;</span>
                                ) : (
                                  <span className="text-slate-300 font-mono text-[11px]">—</span>
                                )}
                              </td>

                              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const targetIntern = internsList.find(i => i.internId === record.internId) || record.internship;
                                    if (targetIntern) openInternDossier(targetIntern);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold text-[10px] transition inline-flex items-center space-x-1 shadow-2xs"
                                  title="View Full History Dossier for this Student"
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

        {/* Regularization Modal */}
        {regModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-slate-900">Attendance Regularisation Request</h3>
              <p className="text-slate-500 leading-relaxed">
                Explain the reason for arrival past 09:45 AM. Your request will route to your Team Leader and HR Head for review.
              </p>

              <textarea
                rows={3}
                value={regReason}
                onChange={(e) => setRegReason(e.target.value)}
                placeholder="e.g. Metro rail technical delay or morning client on-site sync..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRegModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Regularisation request submitted successfully.");
                    setRegModalOpen(false);
                  }}
                  className="px-4 py-2 font-bold bg-blue-900 text-white rounded-xl hover:bg-blue-800"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Intern Mandatory Punch-Out Learning Feedback Modal */}
        {internFeedbackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 text-xs">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Mandatory Punch-Out Learning Feedback</h3>
                  <p className="text-[11px] text-slate-400">
                    Candidate: <span className="font-bold text-slate-700">{selectedInternForFeedback?.fullName}</span> ({selectedInternForFeedback?.domain})
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Shift Punch-Out Rule:</strong> You must enter what you learned and achieved today. Punch-out will not be accepted without daily learning submission.
                </span>
              </div>

              <form onSubmit={handleInternPunchOutSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    What did you learn today? (Topics, code concepts, tools, or hands-on tasks) *
                  </label>
                  <textarea
                    rows={4}
                    value={internLearningText}
                    onChange={(e) => setInternLearningText(e.target.value)}
                    required
                    placeholder="e.g. Built Next.js server actions for leave approvals, configured Prisma schemas, and debugged edge routing..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInternFeedbackModalOpen(false);
                      setSelectedInternForFeedback(null);
                    }}
                    disabled={isPunchingIntern}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPunchingIntern || !internLearningText.trim()}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
                  >
                    {isPunchingIntern ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Submit Learning &amp; Punch Out</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Trainer Teaching Notes Modal */}
        {trainerTeachingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 text-xs">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0066FF]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Trainer Daily Teaching Notes</h3>
                  <p className="text-[11px] text-slate-400">
                    Candidate: <span className="font-bold text-slate-700">{selectedInternForTrainer?.fullName}</span> • Mentor: <span className="font-bold text-slate-700">{selectedInternForTrainer?.trainerName || "Assigned Trainer"}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveTrainerNotes} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    What topics or practical skills were taught today? *
                  </label>
                  <textarea
                    rows={4}
                    value={trainerTeachingText}
                    onChange={(e) => setTrainerTeachingText(e.target.value)}
                    required
                    placeholder="e.g. Conducted code review on authentication middleware, explained JWT expiration, and assigned CRUD assignment..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTrainerTeachingModalOpen(false);
                      setSelectedInternForTrainer(null);
                    }}
                    disabled={isSavingTrainerNotes}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTrainerNotes || !trainerTeachingText.trim()}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 font-bold bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
                  >
                    {isSavingTrainerNotes ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Save Teaching Notes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Intern Prior Leave Intimation Modal */}
        {internLeaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 text-xs">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Intern Prior Leave Intimation</h3>
                  <p className="text-[11px] text-slate-400">
                    Candidate: <span className="font-bold text-slate-700">{selectedInternForLeave?.fullName}</span>
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-[#0066FF] mt-0.5 flex-shrink-0" />
                <span>
                  Submitting advance leave intimation automatically alerts both your Assigned Trainer and HR (hr@inzovate-technologies.com). <strong>Note: Missed classes will not be repeated.</strong>
                </span>
              </div>

              <form onSubmit={handleInternLeaveSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Reason for Taking Leave *
                  </label>
                  <textarea
                    rows={3}
                    value={internLeaveReason}
                    onChange={(e) => setInternLeaveReason(e.target.value)}
                    required
                    placeholder="e.g. University semester practical examination on campus..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInternLeaveModalOpen(false);
                      setSelectedInternForLeave(null);
                    }}
                    disabled={isSubmittingInternLeave}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInternLeave || !internLeaveReason.trim()}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingInternLeave ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Submit Advance Leave</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* INDIVIDUAL INTERN ATTENDANCE DOSSIER MODAL */}
        {internDossierModalOpen && selectedInternForDossier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
              {/* Modal Top Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-slate-900 text-base sm:text-lg">
                        {selectedInternForDossier.fullName}
                      </h3>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                        {selectedInternForDossier.internId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <span>Domain: <strong className="text-slate-700">{selectedInternForDossier.domain}</strong></span>
                      <span>•</span>
                      <span>Mentor: <strong className="text-slate-700">{selectedInternForDossier.trainerName || selectedInternForDossier.mentor || "Technical Mentor"}</strong></span>
                      <span>•</span>
                      <span>College: <strong className="text-slate-700">{selectedInternForDossier.college || "N/A"}</strong></span>
                      <span>•</span>
                      <span>Joined: <strong className="text-slate-700">{selectedInternForDossier.startDate || "N/A"}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleExportInternAttendance("excel", selectedInternForDossier.internId)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition inline-flex items-center space-x-1.5 active:scale-95"
                    title="Export Student Ledger as Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportInternAttendance("pdf", selectedInternForDossier.internId)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition inline-flex items-center space-x-1.5 active:scale-95"
                    title="Export Student Ledger as PDF Dossier"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInternDossierModalOpen(false);
                      setSelectedInternForDossier(null);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
                {(() => {
                  const totalSessions = internDossierRecords.length;
                  const present = internDossierRecords.filter((r) => r.status === "PRESENT").length;
                  const absent = internDossierRecords.filter((r) => r.status === "ABSENT").length;
                  const leave = internDossierRecords.filter((r) => r.status === "LEAVE").length;
                  const totalHrs = internDossierRecords.reduce((acc, r) => acc + (r.workedHours || 0), 0);
                  const rate = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 100;

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Days</div>
                        <div className="text-xl font-black text-slate-900 mt-0.5">{totalSessions}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                        <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Present</div>
                        <div className="text-xl font-black text-emerald-700 mt-0.5">{present}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                        <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Absent</div>
                        <div className="text-xl font-black text-rose-700 mt-0.5">{absent}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Leave</div>
                        <div className="text-xl font-black text-amber-700 mt-0.5">{leave}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-center">
                        <div className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">Attendance Rate</div>
                        <div className="text-xl font-black text-cyan-700 mt-0.5">{rate}%</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                        <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Total Practical Hrs</div>
                        <div className="text-xl font-black text-indigo-700 mt-0.5">{totalHrs.toFixed(1)}h</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Scrollable Day-by-day Session Ledger */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                {isInternDossierLoading ? (
                  <div className="py-16 text-center">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Loading daily attendance records...</p>
                  </div>
                ) : internDossierRecords.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    No attendance records found for this student.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-bold text-[10px]">
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
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {internDossierRecords.map((rec) => {
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
                            <tr key={rec.id} className="hover:bg-slate-50 transition">
                              <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                                <span>{rec.date}</span>
                                {dayName && (
                                  <span className="ml-1.5 text-[10px] text-slate-500 font-sans font-normal">
                                    ({dayName})
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {rec.status === "PRESENT" && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    PRESENT
                                  </span>
                                )}
                                {rec.status === "ABSENT" && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    ABSENT
                                  </span>
                                )}
                                {rec.status === "LEAVE" && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    LEAVE
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                                {inFormatted}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                                {outFormatted}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-cyan-600 whitespace-nowrap">
                                {rec.workedHours > 0 ? `${rec.workedHours.toFixed(2)} hrs` : "-"}
                              </td>
                              <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={rec.internFeedback || ""}>
                                {rec.internFeedback || <span className="text-slate-400 italic">Not recorded</span>}
                              </td>
                              <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={rec.trainerFeedback || ""}>
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
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs flex-shrink-0">
                <div className="text-[11px] text-slate-500 font-mono">
                  Showing {internDossierRecords.length} session entries from program start
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInternDossierModalOpen(false);
                      setSelectedInternForDossier(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs hover:bg-slate-100 transition text-slate-700"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportInternAttendance("excel", selectedInternForDossier.internId)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center space-x-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Download Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportInternAttendance("pdf", selectedInternForDossier.internId)}
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
