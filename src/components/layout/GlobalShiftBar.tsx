"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, Fingerprint, LogOut, Loader2, Sparkles, AlertTriangle } from "lucide-react";

export default function GlobalShiftBar() {
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/attendance/list");
      const data = await res.json();
      if (data.success && data.userTodayRecord) {
        setAttendance(data.userTodayRecord);
      } else {
        setAttendance(null);
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
      fetchStatus();
    };

    window.addEventListener("inzovate_punch_updated", handleUpdate);
    return () => window.removeEventListener("inzovate_punch_updated", handleUpdate);
  }, []);

  // Live timer calculation when clocked in
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

  const handlePunch = async (action: "PUNCH_IN" | "PUNCH_OUT") => {
    setActionLoading(true);
    setToastMessage(null);

    try {
      const res = await fetch("/api/attendance/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToastMessage({ text: data.error || "Punch action failed.", type: "error" });
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        const msg =
          action === "PUNCH_IN"
            ? `Punched In! Status: ${data.evaluation?.status || "Present"}`
            : `Punched Out! Worked: ${data.evaluation?.durationFormatted || "Shift Ended"}`;
        setToastMessage({ text: msg, type: "success" });
        setTimeout(() => setToastMessage(null), 4000);
        fetchStatus();
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

  // Format check-in time e.g. 09:28 AM
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
        <span className="text-[11px] font-medium hidden sm:inline">Syncing...</span>
      </div>
    );
  }

  const isPunchedIn = !!attendance?.punchInTime;
  const isPunchedOut = !!attendance?.punchOutTime;

  return (
    <div className="relative flex items-center">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xl border whitespace-nowrap animate-fadeIn flex items-center space-x-2 ${
            toastMessage.type === "success"
              ? "bg-[#07152E] text-white border-emerald-500/40"
              : "bg-[#07152E] text-rose-300 border-rose-500/40"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* STATE 1: Not Checked In — High-Contrast White Pill (Matching User Reference Image) */}
      {!isPunchedIn && (
        <button
          onClick={() => handlePunch("PUNCH_IN")}
          disabled={actionLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-[#07152E] text-xs font-extrabold shadow-md hover:shadow-lg transition-all duration-150 active:scale-95 disabled:opacity-50 group"
          title="Record shift punch in"
        >
          {actionLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#07152E]" />
          ) : (
            <Fingerprint className="w-3.5 h-3.5 text-[#1463F3] group-hover:scale-110 transition" />
          )}
          <span className="tracking-tight">Punch In</span>
        </button>
      )}

      {/* STATE 2: Checked In & Live Active Shift Stopwatch */}
      {isPunchedIn && !isPunchedOut && (
        <div className="flex items-center bg-white/10 hover:bg-white/15 p-1 rounded-full border border-white/20 shadow-xs transition">
          {/* Active status & live timer */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="font-mono text-white text-xs">{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Punch Out Action */}
          <button
            onClick={() => handlePunch("PUNCH_OUT")}
            disabled={actionLoading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#EF4444] hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
            title="End shift and record punch out"
          >
            {actionLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <LogOut className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">Punch Out</span>
          </button>
        </div>
      )}

      {/* STATE 3: Shift Completed Today */}
      {isPunchedIn && isPunchedOut && (
        <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 text-xs text-white">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span className="font-bold text-[11px]">Shift Done</span>
          <span className="text-[10px] text-slate-300 hidden sm:inline">
            ({attendance.workedHours || 0}h)
          </span>
        </div>
      )}
    </div>
  );
}
