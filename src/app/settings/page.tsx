"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Settings,
  Building2,
  Clock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Save,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("INZOVATE TECHNOLOGIES PRIVATE LIMITED");
  const [tagline, setTagline] = useState("One Platform. Every People Operation. Intelligent Automation.");
  const [workStartTime, setWorkStartTime] = useState("09:30");
  const [gracePeriodEndTime, setGracePeriodEndTime] = useState("09:45");
  const [workEndTime, setWorkEndTime] = useState("17:00");
  const [smtpHost, setSmtpHost] = useState("smtppro.zoho.in");
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUser, setSmtpUser] = useState("hr@inzovate-technologies.com");
  const [smtpPass, setSmtpPass] = useState("Mick@922001");
  const [smtpFrom, setSmtpFrom] = useState("Inzovate HRMS <hr@inzovate-technologies.com>");
  const [showPass, setShowPass] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          setCompanyName(s.companyName || companyName);
          setTagline(s.tagline || tagline);
          setWorkStartTime(s.workStartTime || workStartTime);
          setGracePeriodEndTime(s.gracePeriodEndTime || gracePeriodEndTime);
          setWorkEndTime(s.workEndTime || workEndTime);
          setSmtpHost(s.smtpHost || smtpHost);
          setSmtpPort(s.smtpPort || smtpPort);
          setSmtpUser(s.smtpUser || smtpUser);
          if (s.smtpPass) setSmtpPass(s.smtpPass);
          setSmtpFrom(s.smtpFrom || smtpFrom);
          setTheme(s.theme || theme);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch("/api/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: smtpUser || "hr@inzovate-technologies.com" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult({
          success: true,
          message: data.simulated
            ? `Email simulated. (SMTP_PASS not provided: real email not sent over internet).`
            : `Delivered! Real verification email sent to ${smtpUser} (ID: ${data.messageId}).`,
        });
      } else {
        setTestEmailResult({
          success: false,
          message: data.error || "Failed to deliver email. Please check your SMTP host, port, user and password.",
        });
      }
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err.message || "Network error while testing SMTP.",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          tagline,
          workStartTime,
          gracePeriodEndTime,
          workEndTime,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass,
          smtpFrom,
          theme,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update settings.");
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Admin Configuration Console</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">System Settings &amp; Policies</h2>
          <p className="text-xs text-slate-500">
            Configure company identity, attendance grace periods, email integrations, and security rules.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Settings saved successfully! Real-time policies updated across all modules.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Company Details */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-blue-900" />
              <span>Company Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Legal Business Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Authorized Domain Allowlist</label>
                <input
                  type="text"
                  disabled
                  value="inzovate-technologies.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Shift & Grace Period Engine Configuration */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-blue-900" />
              <span>Shift Timings &amp; Grace Period Boundaries (Asia/Kolkata IST)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Standard Shift Start</label>
                <input
                  type="time"
                  required
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Grace Period Cutoff (Inclusive)</label>
                <input
                  type="time"
                  required
                  value={gracePeriodEndTime}
                  onChange={(e) => setGracePeriodEndTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                />
                <span className="text-[10px] text-slate-400">Arrival past this triggers late alert</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Standard Shift End</label>
                <input
                  type="time"
                  required
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* SMTP Email Service Integration */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              <Mail className="w-4 h-4 text-blue-900" />
              <span>Transactional Email &amp; SMTP Provider Integration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.inzovate-technologies.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">SMTP Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Sender Username / HR Mailbox</label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="hr@inzovate-technologies.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">SMTP Password / App Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="Enter email account / app password"
                    className="w-full p-2.5 rounded-xl border border-slate-300 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">
                  Required to dispatch real live emails to hr@inzovate-technologies.com over the internet.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">From Header Display Name</label>
                <input
                  type="text"
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                  placeholder="Inzovate HRMS <hr@inzovate-technologies.com>"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex flex-col justify-end space-y-1">
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="w-full p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center justify-center space-x-2 border border-slate-300 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>{testingEmail ? "Testing SMTP Connection..." : "Send Test Email to HR Mailbox"}</span>
                </button>
              </div>
            </div>

            {testEmailResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  testEmailResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {testEmailResult.message}
              </div>
            )}
          </div>

          {/* Theme & Visual Identity */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-blue-900" />
              <span>Theme &amp; Visual Preferences</span>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "light"}
                  onChange={() => setTheme("light")}
                  className="w-4 h-4 text-blue-900"
                />
                <span className="font-semibold text-slate-800">Corporate Light (Default)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === "dark"}
                  onChange={() => setTheme("dark")}
                  className="w-4 h-4 text-blue-900"
                />
                <span className="font-semibold text-slate-800">Executive Dark Theme</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-md transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save System Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
