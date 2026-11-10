"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  Fingerprint,
  LogOut,
  Loader2,
  Sparkles,
  AlertTriangle,
  X,
  Minimize2,
  Building2,
  MapPin,
  ChevronRight,
  RotateCcw,
  Play,
  ShieldCheck,
  AlertCircle,
  Power,
  ChevronUp,
} from "lucide-react";

// Module-level shift cache across client navigation
let cachedShiftData: any = null;
let cachedShiftTime = 0;

interface FloatingShiftWidgetProps {
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    role?: string;
    designation?: string;
    department?: string;
  } | null;
}

export default function FloatingShiftWidget({ user }: FloatingShiftWidgetProps) {
  const router = useRouter();
  const [attendance, setAttendance] = useState<any>(cachedShiftData?.userTodayRecord || null);
  const [currentEmp, setCurrentEmp] = useState<any>(cachedShiftData?.currentEmployee || null);
  const [loading, setLoading] = useState(!cachedShiftData);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Live IST Clock
  const [currentTimeIST, setCurrentTimeIST] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeIST(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async (force = false) => {
    if (!force && cachedShiftData && Date.now() - cachedShiftTime < 15000) {
      setAttendance(cachedShiftData.userTodayRecord || null);
      if (cachedShiftData.currentEmployee) setCurrentEmp(cachedShiftData.currentEmployee);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/attendance/list?summary=today");
      const data = await res.json();
      if (data.success) {
        cachedShiftData = data;
        cachedShiftTime = Date.now();
        if (data.userTodayRecord) {
          setAttendance(data.userTodayRecord);
        } else {
          setAttendance(null);
        }
        if (data.currentEmployee) {
          setCurrentEmp(data.currentEmployee);
        }
      }
    } catch (err) {
      console.error("Error fetching shift status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    const handleUpdate = () => {
      cachedShiftData = null;
      cachedShiftTime = 0;
      fetchStatus(true);
    };

    window.addEventListener("inzovate_punch_updated", handleUpdate);
    return () => window.removeEventListener("inzovate_punch_updated", handleUpdate);
  }, []);

  // Live timer calculation when actively clocked in
  useEffect(() => {
    if (!attendance?.punchInTime || attendance?.punchOutTime) {
      setElapsedSeconds(0);
      return;
    }

    const punchInDate = new Date(attendance.punchInTime);

    const updateTimer = () => {
      const diffMs = Math.max(0, Date.now() - punchInDate.getTime());
      setElapsedSeconds(Math.floor(diffMs / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attendance?.punchInTime, attendance?.punchOutTime]);

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

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            status: "LOCKED",
          });
        },
        () => {
          setGpsCoords((prev) => ({ ...prev, status: "DENIED" }));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

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
        { enableHighAccuracy: true, timeout: 6000 }
      );
    });
  };

  const handlePunch = async (action: "PUNCH_IN" | "PUNCH_OUT") => {
    setActionLoading(true);
    setToastMessage(null);

    try {
      const currentCoords = await acquirePosition();

      const res = await fetch("/api/attendance/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude,
          accuracy: currentCoords.accuracy,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToastMessage({ text: data.error || "Punch action failed.", type: "error" });
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        let msg = "";
        if (action === "PUNCH_IN") {
          msg = data.evaluation?.status === "ABSENT"
            ? `Late Punch-In recorded at ${data.evaluation?.timeStringIST} IST: Marked ABSENT (> 09:45 AM cutoff). Automatic alert sent to HR.`
            : `Punched In Successfully at ${data.evaluation?.timeStringIST} IST! Status: PRESENT`;
        } else {
          msg = data.evaluation?.earlyMinutes > 0
            ? `Early Punch-Out (${data.evaluation.earlyMinutes}m before 05:00 PM): Marked ABSENT. Automatic violation alert sent to HR.`
            : `Punched Out Successfully at ${data.evaluation?.timeStringIST} IST! (${data.evaluation?.durationFormatted || "Completed"}). Status: PRESENT`;
        }
        setToastMessage({
          text: msg,
          type: "success",
        });
        setTimeout(() => setToastMessage(null), 5000);
        await fetchStatus();
        window.dispatchEvent(new CustomEvent("inzovate_punch_updated"));
      }
    } catch (err) {
      setToastMessage({ text: "Network error during punch request.", type: "error" });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  // Format seconds to 00:00:00
  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isActivelyClockedIn = !!attendance?.punchInTime && !attendance?.punchOutTime;
  const hasCompletedInterval = !!attendance?.punchInTime && !!attendance?.punchOutTime;

  return (
    <aside
      aria-label="Sub-Navbar Shift Punch Terminal"
      className="relative z-40 select-none transition-all duration-300"
    >
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`absolute top-12 right-0 z-50 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl border whitespace-nowrap animate-fadeIn flex items-center space-x-2 ${
            toastMessage.type === "success"
              ? "bg-[#07152E] text-white border-emerald-500/50"
              : "bg-[#07152E] text-rose-300 border-rose-500/50"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. COLLAPSED FLOATING PILL WITH DIRECT PUNCH IN / OUT CONTROLS */}
      {!isOpen && (
        <div className="flex items-center space-x-2">
          {/* Main Floating Pill Button */}
          <div
            className={`flex items-center space-x-2 p-1.5 pl-3 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.5)] border backdrop-blur-2xl transition-all duration-300 hover:scale-105 ${
              isActivelyClockedIn
                ? "bg-[#06152B]/95 border-emerald-500/50 text-white"
                : "bg-[#06152B]/95 border-blue-500/40 text-white"
            }`}
          >
            {/* Live Indicator Dot */}
            <span className="relative flex h-3 w-3">
              {isActivelyClockedIn && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isActivelyClockedIn ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
            </span>

            {/* Status & Live Timer */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center space-x-2 text-xs font-bold pr-1 hover:text-cyan-300 transition"
              title="Click to view full shift terminal"
            >
              {isActivelyClockedIn ? (
                <>
                  <span className="text-emerald-400">On Shift:</span>
                  <span className="font-mono text-emerald-300 tracking-wider">
                    {formatTimer(elapsedSeconds)}
                  </span>
                </>
              ) : hasCompletedInterval ? (
                <>
                  <span className="text-slate-300">Shift Paused</span>
                  <span className="font-mono text-cyan-300 text-[11px]">
                    ({attendance?.workedHours || 0}h)
                  </span>
                </>
              ) : (
                <span className="text-slate-200">Shift Punch</span>
              )}
            </button>

            {/* Quick Action Button: PUNCH IN or PUNCH OUT */}
            {isActivelyClockedIn ? (
              <button
                type="button"
                onClick={() => handlePunch("PUNCH_OUT")}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-[11px] shadow-md transition flex items-center space-x-1 disabled:opacity-50 active:scale-95"
                title="1-Click Punch Out"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-3 h-3" />
                    <span>Punch Out</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handlePunch("PUNCH_IN")}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] shadow-md transition flex items-center space-x-1 disabled:opacity-50 active:scale-95"
                title="1-Click Punch In"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="w-3.5 h-3.5 text-cyan-200" />
                    <span>Punch In</span>
                  </>
                )}
              </button>
            )}

            {/* Expand arrow */}
            <button
              onClick={() => setIsOpen(true)}
              className="p-1 rounded-full text-slate-400 hover:text-white"
              title="Expand Details"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. EXPANDED FULL FLOATING PUNCH TERMINAL WINDOW */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 sm:w-96 rounded-3xl bg-[#071328]/98 text-white backdrop-blur-2xl border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 space-y-4 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                  isActivelyClockedIn
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-blue-500/20 text-cyan-300 border border-cyan-400/30"
                }`}
              >
                {isActivelyClockedIn ? (
                  <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
                ) : (
                  <Fingerprint className="w-5 h-5 text-cyan-300" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white leading-tight">
                  Floating Punch Terminal
                </h3>
                <span className="text-[10px] text-cyan-300 font-mono">
                  {currentTimeIST || "Asia/Kolkata IST"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="Minimize Terminal"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Shift & Location Details */}
          <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate">Shift: 09:30 AM</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300 justify-end">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">HQ Geofence (Chennai)</span>
            </div>
          </div>

          {/* Live Timer or State Display */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent border border-white/10 flex flex-col items-center justify-center text-center space-y-1">
            {isActivelyClockedIn ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Actively Clocked In</span>
                </span>
                <div className="text-3xl font-mono font-extrabold tracking-widest text-emerald-300 py-1">
                  {formatTimer(elapsedSeconds)}
                </div>
                <div className="text-[11px] text-slate-400">
                  Punch-In Time: <strong className="text-white">{formatTime(attendance?.punchInTime)}</strong> IST
                </div>
              </>
            ) : hasCompletedInterval ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Interval Closed</span>
                </span>
                <div className="text-lg font-bold text-slate-200 py-1">
                  Total Worked: <span className="text-cyan-300 font-mono">{attendance?.workedHours || 0} hrs</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Last Punch-Out: <strong className="text-white">{formatTime(attendance?.punchOutTime)}</strong> IST
                </div>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Not Punched In Today
                </span>
                <div className="text-sm font-semibold text-slate-300 py-1">
                  Ready to start your work shift
                </div>
                <div className="text-[10px] text-slate-400">
                  Grace Cutoff: 09:45 AM IST • Office GPS Verified
                </div>
              </>
            )}
          </div>

          {/* Dual Action Buttons: Big PUNCH IN and Big PUNCH OUT */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Punch In Button */}
            <button
              type="button"
              onClick={() => handlePunch("PUNCH_IN")}
              disabled={actionLoading || isActivelyClockedIn}
              className={`py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg transition active:scale-95 ${
                isActivelyClockedIn
                  ? "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30"
              }`}
            >
              {actionLoading && !isActivelyClockedIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>PUNCH IN</span>
                </>
              )}
            </button>

            {/* Punch Out Button */}
            <button
              type="button"
              onClick={() => handlePunch("PUNCH_OUT")}
              disabled={actionLoading || !isActivelyClockedIn}
              className={`py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg transition active:scale-95 ${
                !isActivelyClockedIn
                  ? "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30"
              }`}
            >
              {actionLoading && isActivelyClockedIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>PUNCH OUT</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Link */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10">
            <span className="flex items-center space-x-1 text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Asia/Kolkata Biometric Sync</span>
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/attendance");
              }}
              className="text-slate-300 hover:text-white font-semibold transition hover:underline"
            >
              Full Attendance &rarr;
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
