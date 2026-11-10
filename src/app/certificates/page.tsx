"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { generateCertificatePDF } from "@/lib/pdf";
import {
  Award,
  Download,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  QrCode,
  X,
} from "lucide-react";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState("INTERNSHIP_COMPLETION");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [domainOrDept, setDomainOrDept] = useState("AI & Machine Learning Engineering");
  const [duration, setDuration] = useState("12 Weeks (Jan 2026 - Apr 2026)");
  const [formError, setFormError] = useState<string | null>(null);

  const loadCertificates = async () => {
    try {
      const res = await fetch("/api/certificates");
      const data = await res.json();
      if (data.success) {
        setCertificates(data.certificates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          recipientName,
          recipientEmail,
          recipientId,
          domainOrDept,
          duration,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to issue certificate.");
      } else {
        setFeedback(`Certificate ${data.certificate.certificateNumber} issued with verification token ${data.certificate.verificationToken}!`);
        setIssueModalOpen(false);
        loadCertificates();
      }
    } catch (err) {
      setFormError("Network error.");
    }
  };

  const handleDownloadCertificate = (cert: any) => {
    const doc = generateCertificatePDF({
      certificateNumber: cert.certificateNumber,
      recipientName: cert.recipientName,
      recipientId: cert.recipientId,
      type: cert.type,
      domainOrDept: cert.domainOrDept,
      duration: cert.duration,
      issueDate: cert.issueDate,
      verificationToken: cert.verificationToken,
      mentorOrSignatory: cert.issuedBy,
    });

    doc.save(`${cert.certificateNumber}_${cert.recipientName.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cryptographic Token &amp; QR Verification Gate</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Certificates &amp; Completion Documentation</h2>
            <p className="text-xs text-slate-500">
              Generate tamper-proof official certificates, internship completion letters, and offer letters.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIssueModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-md transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Official Document</span>
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Issued Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.length === 0 ? (
            <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              No certificates issued yet.
            </div>
          ) : (
            certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {cert.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-900">
                      {cert.certificateNumber}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{cert.recipientName}</h3>
                    <p className="text-xs text-slate-500">{cert.domainOrDept}</p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] space-y-0.5 font-mono text-slate-600">
                    <div>Issued: {cert.issueDate}</div>
                    <div className="truncate">Token: {cert.verificationToken}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadCertificate(cert)}
                    className="w-full py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Issue Certificate Modal */}
        {issueModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Issue Document &amp; Certificate</h3>
                <button onClick={() => setIssueModalOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleIssue} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Document Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="INTERNSHIP_COMPLETION">Internship Completion Certificate</option>
                    <option value="INTERNSHIP_OFFER">Internship Offer Letter</option>
                    <option value="TRAINING">Training Participation Certificate</option>
                    <option value="EMPLOYEE_OFFER">Employee Offer Letter</option>
                    <option value="RELIEVING">Relieving &amp; Experience Certificate</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Recipient Full Name</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Sneha Ramakrishnan"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Recipient ID (Emp/Intern)</label>
                    <input
                      type="text"
                      required
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      placeholder="INZ-INT-2026-002"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Recipient Email</label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Domain / Department</label>
                  <input
                    type="text"
                    required
                    value={domainOrDept}
                    onChange={(e) => setDomainOrDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Program Duration</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="12 Weeks (Jan 2026 - Apr 2026)"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] leading-relaxed">
                  <strong>Validation Check:</strong> The engine will verify attendance &ge; 80% and zero outstanding fee balance before stamping the cryptographic verification token.
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIssueModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-semibold bg-blue-900 text-white rounded-xl hover:bg-blue-800"
                  >
                    Issue Document
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
