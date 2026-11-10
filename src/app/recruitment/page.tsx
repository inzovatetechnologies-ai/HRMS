"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Briefcase,
  Users,
  Plus,
  ArrowRight,
  Star,
  CheckCircle2,
  Calendar,
  X,
  Sparkles,
  Bot,
  FileText,
  CheckCheck,
  AlertCircle,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";

export default function RecruitmentPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Job form state
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [experienceLevel, setExperienceLevel] = useState("2-4 years");
  const [salaryRange, setSalaryRange] = useState("₹8,00,000 - ₹12,00,000 LPA");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  // AI Resume Parser state
  const [selectedJobId, setSelectedJobId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [parsingLoading, setParsingLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);

  const sampleResumes: Record<string, string> = {
    frontend: `Sanjay Kumar
sanjay.kumar@example.com | +91 98765 12340 | Chennai, India
Summary: Full Stack & Frontend Developer with 3+ years experience building reactive web apps.
Skills: React, Next.js, TypeScript, Tailwind CSS, JavaScript, Git, REST APIs, GraphQL, Node.js, UI/UX
Experience:
- Frontend Engineer at TechCorp (2023 - 2026): Architected Next.js dashboard, reduced bundle size 35%.
- Junior Web Developer (2022 - 2023): Built client portals using TypeScript and React.
Education: B.Tech in Computer Science & Engineering (Anna University, 2022)`,
    robotics: `Harish Ramachandran
harish.r@example.com | +91 98450 99882 | Coimbatore, India
Summary: Robotics & AI Vision Specialist with expertise in autonomous navigation and edge computing.
Skills: Python, ROS2, PyTorch, Computer Vision, C++, OpenCV, Robotics, Linux, Docker, Jetson AGX
Experience:
- Robotics Research Associate at Autonomous Lab (2024 - 2026): Deployed SLAM algorithms on mobile robot platforms.
Education: M.Tech in Robotics & Automation (2024)`,
  };

  const loadRecruitment = async () => {
    try {
      const res = await fetch("/api/recruitment");
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.jobs?.length > 0 && !selectedJobId) {
          setSelectedJobId(json.jobs[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruitment();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_JOB",
          title,
          department,
          experienceLevel,
          salaryRange,
          description,
          requirements,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setJobModalOpen(false);
        setTitle("");
        setDescription("");
        loadRecruitment();
      }
    } catch (err) {
      alert("Failed to create job.");
    }
  };

  const handleUpdateStage = async (candidateId: string, stage: string) => {
    try {
      await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_STAGE", candidateId, stage }),
      });
      loadRecruitment();
    } catch (err) {
      alert("Failed to update candidate stage.");
    }
  };

  const handleRunAiParser = async () => {
    if (!resumeText.trim()) {
      alert("Please enter or paste resume text.");
      return;
    }
    setParsingLoading(true);
    try {
      const activeJob = data?.jobs?.find((j: any) => j.id === selectedJobId) || data?.jobs?.[0];
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "AI_PARSE_RESUME",
          resumeText,
          jobTitle: activeJob?.title || "Engineering Role",
          jobRequirements: activeJob?.requirements || "React, Next.js, TypeScript",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setParsedResult(json.parsedData);
      }
    } catch (err) {
      alert("AI Screening failed.");
    } finally {
      setParsingLoading(false);
    }
  };

  const handleAddCandidateFromAi = async () => {
    if (!parsedResult) return;
    try {
      const activeJobId = selectedJobId || data?.jobs?.[0]?.id;
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_CANDIDATE",
          jobPostingId: activeJobId,
          fullName: parsedResult.fullName,
          email: parsedResult.email,
          phone: parsedResult.phone,
          rating: parsedResult.matchScore >= 85 ? 5 : parsedResult.matchScore >= 70 ? 4 : 3,
          interviewNotes: `AI Match Score: ${parsedResult.matchScore}%. Matched: ${parsedResult.matchingSkills.join(", ")}. ${parsedResult.aiSummary}`,
          currentStage: parsedResult.matchScore >= 80 ? "SHORTLISTED" : "SCREENING",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAiModalOpen(false);
        setParsedResult(null);
        setResumeText("");
        loadRecruitment();
      }
    } catch (err) {
      alert("Failed to add candidate.");
    }
  };

  const stages = [
    "APPLIED",
    "SCREENING",
    "SHORTLISTED",
    "INTERVIEW_SCHEDULED",
    "SELECTED",
    "OFFER_RELEASED",
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
        {/* Executive Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#050D20] via-[#040A18] to-[#02050E] p-6 sm:p-8 text-white shadow-xl border border-cyan-500/25">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-black tracking-wider border border-cyan-500/30">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI APPLICANT TRACKING SYSTEM (ATS)</span>
                </span>
                <span className="text-slate-400 text-xs font-mono">v2026.1 Intelligent Screener</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Recruitment, Open Requisitions &amp; AI Screening
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Automated resume parsing, semantic competence matching against Job Descriptions, and stage advancement pipeline for INZOVATE TECHNOLOGIES.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 border border-cyan-400/40 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>🤖 AI Resume Parser &amp; Match</span>
              </button>

              <button
                type="button"
                onClick={() => setJobModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold text-xs border border-white/10 hover:border-white/20 shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Job Requisition</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Job Postings Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Active Job Postings ({data?.jobs?.length || 0})</h3>
            <span className="text-xs text-slate-500">Live career requisitions accepting candidate profiles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.jobs?.map((job: any) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#1463F3]/40 transition space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {job.department}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">{job.salaryRange}</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#1463F3] transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{job.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                  <span>Exp: <strong className="text-slate-700">{job.experienceLevel}</strong></span>
                  <span className="font-bold text-[#1463F3]">{job.candidates?.length ?? 0} Applicants</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Pipeline Stages Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Candidate Pipeline ({data?.candidates?.length || 0})</h3>
              <p className="text-xs text-slate-500">Applicant qualification, AI match rubrics, and hiring stages</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Candidate Name</th>
                  <th className="px-5 py-3.5">Role Applied</th>
                  <th className="px-5 py-3.5">Current Stage</th>
                  <th className="px-5 py-3.5">AI Match &amp; Notes</th>
                  <th className="px-5 py-3.5 text-right">Advance Funnel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.candidates?.map((c: any) => {
                  const hasAiScore = c.interviewNotes?.includes("AI Match Score");
                  const matchMatch = c.interviewNotes?.match(/AI Match Score:\s*(\d+)%/);
                  const score = matchMatch ? parseInt(matchMatch[1], 10) : null;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-xs">{c.fullName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.email} • {c.phone}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {c.jobPosting?.title || "Engineering Role"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            c.currentStage === "SELECTED" || c.currentStage === "OFFER_RELEASED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : c.currentStage === "SHORTLISTED"
                              ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {c.currentStage}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-sm">
                        <div className="flex items-center space-x-2">
                          {score !== null ? (
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black border flex-shrink-0 ${
                                score >= 85
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : score >= 70
                                  ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                                  : "bg-amber-50 text-amber-700 border-amber-300"
                              }`}
                            >
                              ⭐ {score}% MATCH
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400">Review Pending</span>
                          )}
                          <span className="text-[11px] text-slate-600 truncate">{c.interviewNotes}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <select
                          value={c.currentStage}
                          onChange={(e) => handleUpdateStage(c.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-bold focus:outline-hidden focus:border-[#1463F3] shadow-2xs"
                        >
                          {stages.map((st, i) => (
                            <option key={i} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Resume Parser & Match Scorer Modal */}
        {aiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">AI Resume Parser &amp; ATS Screener</h3>
                    <p className="text-xs text-cyan-200/80">Semantic competence extraction &amp; JD scoring engine</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAiModalOpen(false);
                    setParsedResult(null);
                  }}
                  className="p-1 rounded-lg text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {/* Job Selection & Sample Triggers */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Requisition</label>
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                    >
                      {data?.jobs?.map((j: any) => (
                        <option key={j.id} value={j.id}>
                          {j.title} ({j.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500">Quick Samples:</label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setResumeText(sampleResumes.frontend)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        Sample Frontend CV
                      </button>
                      <button
                        type="button"
                        onClick={() => setResumeText(sampleResumes.robotics)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100"
                      >
                        Sample Robotics CV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resume Text Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Paste Candidate Resume / Bio Text
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Paste candidate resume text, skills, experience, and contact information..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3] font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={parsingLoading}
                    onClick={handleRunAiParser}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#1463F3] hover:bg-[#0e4ac4] text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    {parsingLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Screening Competencies...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        <span>Run AI Semantic Screening</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Parsed Results Card */}
                {parsedResult && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{parsedResult.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          {parsedResult.email} • {parsedResult.phone} • {parsedResult.education}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-black border ${
                            parsedResult.matchScore >= 85
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : parsedResult.matchScore >= 70
                              ? "bg-cyan-100 text-cyan-800 border-cyan-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          ⭐ {parsedResult.matchScore}% MATCH
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                          {parsedResult.recommendation.replace("_", " ")}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                        <strong className="text-slate-900">AI Assessment: </strong>
                        {parsedResult.aiSummary}
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-600 mb-1">
                          Matched Skills ({parsedResult.matchingSkills?.length || 0}):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedResult.matchingSkills?.map((sk: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {parsedResult.missingSkills?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-slate-600 mb-1">
                            Missing Target Competencies ({parsedResult.missingSkills.length}):
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {parsedResult.missingSkills.map((sk: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                              >
                                ! {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddCandidateFromAi}
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>Add &amp; Shortlist Candidate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Job Modal */}
        {jobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Post New Career Opening</h3>
                <button onClick={() => setJobModalOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Engineer (Next.js & AI)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="AI & Robotics">AI &amp; Robotics</option>
                      <option value="Product & Design">Product &amp; Design</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Experience Level</label>
                    <input
                      type="text"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range (INR)</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Description</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills / Competencies</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Next.js, TypeScript, Tailwind CSS, Prisma"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setJobModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1463F3] hover:bg-[#0e4ac4] text-white font-bold shadow-md shadow-blue-500/20"
                  >
                    Publish Opening
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
