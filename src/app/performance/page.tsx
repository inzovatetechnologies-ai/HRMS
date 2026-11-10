"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  TrendingUp,
  Target,
  Award,
  Star,
  CheckCircle2,
  ShieldAlert,
  Edit3,
  Plus,
  Trash2,
  X,
  Filter,
  Search,
  Users,
  Sparkles,
  BarChart2,
  Flame,
  Heart,
  Send,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

interface ReviewItem {
  id: string;
  employee: string;
  department: string;
  role: string;
  period: string;
  goalScore: number;
  competencyScore: number;
  rating: number;
  status: "COMPLETED" | "DRAFT" | "PENDING_REVIEW";
  promotionRecommended: boolean;
  comments: string;
}

interface KudosItem {
  id: string;
  fromName: string;
  fromRole: string;
  toName: string;
  toRole: string;
  badge: string;
  badgeIcon: string;
  message: string;
  claps: number;
  createdAt: string;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "REV-2026-001",
    employee: "Ananya Sharma",
    department: "Engineering",
    role: "Senior Full Stack Engineer",
    period: "Q3 2026",
    goalScore: 94,
    competencyScore: 92,
    rating: 4.8,
    status: "COMPLETED",
    promotionRecommended: true,
    comments: "Exceptional delivery on Inzovate AI HRMS architecture, microservice security, and sub-second performance tuning.",
  },
  {
    id: "REV-2026-002",
    employee: "Vijay Kumar",
    department: "Engineering",
    role: "Backend & Cloud Engineer",
    period: "Q3 2026",
    goalScore: 88,
    competencyScore: 85,
    rating: 4.3,
    status: "COMPLETED",
    promotionRecommended: false,
    comments: "Strong execution on SQLite-to-PostgreSQL architecture, Prisma ORM caching, and Zero Trust security protocols.",
  },
  {
    id: "REV-2026-003",
    employee: "Priya Nair",
    department: "Design & Product",
    role: "Lead UI/UX Designer",
    period: "Q3 2026",
    goalScore: 96,
    competencyScore: 95,
    rating: 4.9,
    status: "COMPLETED",
    promotionRecommended: true,
    comments: "Designed an outstanding enterprise design system, high-contrast dark themes, and mobile-responsive dashboards.",
  },
  {
    id: "REV-2026-004",
    employee: "Prem Kumar",
    department: "Engineering",
    role: "Developer & Technical Team Lead",
    period: "Q3 2026",
    goalScore: 98,
    competencyScore: 97,
    rating: 5.0,
    status: "COMPLETED",
    promotionRecommended: true,
    comments: "Visionary engineering leadership, zero-downtime deployment pipelines, and active developer team mentorship.",
  },
];

const DEFAULT_KUDOS: KudosItem[] = [
  {
    id: "KUDOS-1",
    fromName: "Sundar Rajan",
    fromRole: "Lead IT Ops / Super Admin",
    toName: "Ananya Sharma",
    toRole: "Senior Full Stack Engineer",
    badge: "Problem Solver",
    badgeIcon: "🚀",
    message: "Incredible speed solving the sub-second SQLite to Postgres query optimization and Next.js caching. Lifesaver!",
    claps: 18,
    createdAt: "2 hours ago",
  },
  {
    id: "KUDOS-2",
    fromName: "Kavitha Priya",
    fromRole: "HR Manager",
    toName: "Prem Kumar",
    toRole: "Technical Team Lead",
    badge: "Team Player",
    badgeIcon: "🤝",
    message: "Outstanding mentorship for our 60+ robotics and software interns during the Q3 innovation sprint!",
    claps: 24,
    createdAt: "Yesterday",
  },
  {
    id: "KUDOS-3",
    fromName: "Vijay Kumar",
    fromRole: "Cloud Engineer",
    toName: "Priya Nair",
    toRole: "Lead UI/UX Designer",
    badge: "Innovation Star",
    badgeIcon: "💡",
    message: "The Cyber-Obsidian executive design system looks absolutely futuristic across both desktop and mobile views!",
    claps: 15,
    createdAt: "2 days ago",
  },
];

export default function PerformancePage() {
  const [activeMainTab, setActiveMainTab] = useState<"OKRS" | "KUDOS">("OKRS");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);

  // Kudos Wall State
  const [kudosList, setKudosList] = useState<KudosItem[]>([]);
  const [kudosModalOpen, setKudosModalOpen] = useState(false);
  const [kudosToName, setKudosToName] = useState("");
  const [kudosToRole, setKudosToRole] = useState("Software Engineer");
  const [kudosBadge, setKudosBadge] = useState("Problem Solver");
  const [kudosMessage, setKudosMessage] = useState("");

  // OKR Form states
  const [employee, setEmployee] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [role, setRole] = useState("");
  const [period, setPeriod] = useState("Q3 2026");
  const [goalScore, setGoalScore] = useState<number>(90);
  const [competencyScore, setCompetencyScore] = useState<number>(90);
  const [rating, setRating] = useState<number>(4.5);
  const [promotionRecommended, setPromotionRecommended] = useState<boolean>(false);
  const [comments, setComments] = useState("");

  // Load reviews & kudos from localStorage with fallback
  useEffect(() => {
    try {
      const stored = localStorage.getItem("inzovate_performance_reviews");
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        setReviews(DEFAULT_REVIEWS);
      }

      const storedKudos = localStorage.getItem("inzovate_kudos_wall");
      if (storedKudos) {
        setKudosList(JSON.parse(storedKudos));
      } else {
        setKudosList(DEFAULT_KUDOS);
      }
    } catch {
      setReviews(DEFAULT_REVIEWS);
      setKudosList(DEFAULT_KUDOS);
    }
  }, []);

  const saveReviews = (newList: ReviewItem[]) => {
    setReviews(newList);
    try {
      localStorage.setItem("inzovate_performance_reviews", JSON.stringify(newList));
    } catch {}
  };

  const saveKudos = (newList: KudosItem[]) => {
    setKudosList(newList);
    try {
      localStorage.setItem("inzovate_kudos_wall", JSON.stringify(newList));
    } catch {}
  };

  const handleOpenAdd = () => {
    setEditingReview(null);
    setEmployee("");
    setDepartment("Engineering");
    setRole("Full Stack Engineer");
    setPeriod("Q3 2026");
    setGoalScore(90);
    setCompetencyScore(90);
    setRating(4.5);
    setPromotionRecommended(false);
    setComments("");
    setModalOpen(true);
  };

  const handleOpenEdit = (rev: ReviewItem) => {
    setEditingReview(rev);
    setEmployee(rev.employee);
    setDepartment(rev.department);
    setRole(rev.role);
    setPeriod(rev.period);
    setGoalScore(rev.goalScore);
    setCompetencyScore(rev.competencyScore);
    setRating(rev.rating);
    setPromotionRecommended(rev.promotionRecommended);
    setComments(rev.comments);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this performance review?")) {
      const updated = reviews.filter((r) => r.id !== id);
      saveReviews(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee.trim()) return;

    if (editingReview) {
      const updated = reviews.map((r) =>
        r.id === editingReview.id
          ? {
              ...r,
              employee: employee.trim(),
              department,
              role: role.trim(),
              period,
              goalScore: Number(goalScore),
              competencyScore: Number(competencyScore),
              rating: Number(rating),
              promotionRecommended,
              comments: comments.trim(),
            }
          : r
      );
      saveReviews(updated);
    } else {
      const newReview: ReviewItem = {
        id: `REV-${Date.now().toString().slice(-4)}`,
        employee: employee.trim(),
        department,
        role: role.trim() || "Staff Contributor",
        period,
        goalScore: Number(goalScore),
        competencyScore: Number(competencyScore),
        rating: Number(rating),
        status: "COMPLETED",
        promotionRecommended,
        comments: comments.trim(),
      };
      saveReviews([newReview, ...reviews]);
    }

    setModalOpen(false);
  };

  const handleClapKudos = (id: string) => {
    const updated = kudosList.map((k) => (k.id === id ? { ...k, claps: k.claps + 1 } : k));
    saveKudos(updated);
  };

  const handleSendKudos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kudosToName.trim() || !kudosMessage.trim()) return;

    const badgeIcons: Record<string, string> = {
      "Problem Solver": "🚀",
      "Innovation Star": "💡",
      "Team Player": "🤝",
      "Speed Demon": "⚡",
      "Leadership Champion": "🏆",
    };

    const newKudos: KudosItem = {
      id: `KUDOS-${Date.now()}`,
      fromName: "Sundar Rajan",
      fromRole: "Lead IT Ops",
      toName: kudosToName.trim(),
      toRole: kudosToRole.trim(),
      badge: kudosBadge,
      badgeIcon: badgeIcons[kudosBadge] || "⭐",
      message: kudosMessage.trim(),
      claps: 1,
      createdAt: "Just now",
    };

    saveKudos([newKudos, ...kudosList]);
    setKudosModalOpen(false);
    setKudosToName("");
    setKudosMessage("");
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.employee.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase()) ||
      r.comments.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "ALL" || r.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";
  const promoCount = reviews.filter((r) => r.promotionRecommended).length;
  const avgGoalScore =
    reviews.length > 0
      ? Math.round(reviews.reduce((acc, r) => acc + r.goalScore, 0) / reviews.length)
      : 95;

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
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>PERFORMANCE, OKRS &amp; RECOGNITION</span>
                </span>
                <span className="text-slate-400 text-xs font-mono">Q3 2026 Cycle</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Workforce Performance &amp; Peer Kudos
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Comprehensive OKR appraisal rubrics, manager evaluations, and a gamified peer recognition wall celebrating excellence across INZOVATE teams.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeMainTab === "OKRS" ? (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1463F3] to-[#2583FF] hover:from-[#0e4ac4] hover:to-[#1769FF] text-white font-bold text-xs shadow-lg shadow-blue-500/30 border border-blue-400/30 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ New OKR Review</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setKudosModalOpen(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-lg shadow-amber-500/30 border border-amber-400/40 transition active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>🌟 Give Kudos to Colleague</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Switcher: OKRs vs Kudos Wall */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveMainTab("OKRS")}
            className={`pb-3 px-5 text-xs font-black uppercase tracking-wider transition relative ${
              activeMainTab === "OKRS"
                ? "text-[#1463F3] border-b-2 border-[#1463F3]"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            📊 Appraisals &amp; OKR Rubrics ({reviews.length})
          </button>
          <button
            onClick={() => setActiveMainTab("KUDOS")}
            className={`pb-3 px-5 text-xs font-black uppercase tracking-wider transition relative ${
              activeMainTab === "KUDOS"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            🌟 Peer Recognition &amp; Kudos Wall ({kudosList.length})
          </button>
        </div>

        {/* TAB 1: OKRS & APPRAISALS */}
        {activeMainTab === "OKRS" && (
          <div className="space-y-6">
            {/* 3 Executive Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Average Rating</span>
                <div className="text-3xl font-extrabold text-amber-500 flex items-center space-x-1.5">
                  <Star className="w-6 h-6 fill-amber-500" />
                  <span>{avgRating} / 5.0</span>
                </div>
                <div className="text-[11px] text-slate-400">Across all reviewed quarters</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Promotion Recommendations</span>
                <div className="text-3xl font-extrabold text-emerald-600 flex items-center space-x-1.5">
                  <Award className="w-6 h-6 text-emerald-600" />
                  <span>{promoCount} Staff</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">Eligible for appraisal elevation</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Goal Completion</span>
                <div className="text-3xl font-extrabold text-[#1463F3] flex items-center space-x-1.5">
                  <Target className="w-6 h-6 text-[#1463F3]" />
                  <span>{avgGoalScore}%</span>
                </div>
                <div className="text-[11px] text-blue-700 font-medium">OKR milestone achievement index</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search reviews by employee name, role or notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:border-[#1463F3]"
                />
              </div>

              <div className="flex items-center space-x-2">
                {["ALL", "Engineering", "Design & Product"].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setDeptFilter(dept)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      deptFilter === dept
                        ? "bg-[#07152E] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-[#1463F3]/40 transition group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-base text-slate-900 group-hover:text-[#1463F3] transition-colors">
                          {rev.employee}
                        </h4>
                        {rev.promotionRecommended && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ★ Promo Ready
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {rev.role} • <strong className="text-slate-700">{rev.department}</strong>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 font-bold font-mono text-sm bg-amber-50 px-2.5 py-1 rounded-xl text-amber-600 border border-amber-200">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Goal Score:</span>
                      <div className="font-bold text-slate-800">{rev.goalScore}%</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Competency Score:</span>
                      <div className="font-bold text-slate-800">{rev.competencyScore}%</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-blue-400 pl-3">
                    &ldquo;{rev.comments}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="font-mono text-slate-400 text-[11px]">{rev.period}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(rev)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Review"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: KUDOS & PEER RECOGNITION WALL */}
        {activeMainTab === "KUDOS" && (
          <div className="space-y-6">
            {/* Top Kudos Champions Leaderboard */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/40 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-base text-slate-900">Monthly Recognition Leaderboard</h3>
                </div>
                <span className="text-xs font-bold text-amber-600">October 2026 Sprint</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 font-black text-sm flex items-center justify-center flex-shrink-0">
                    🥇
                  </div>
                  <div>
                    <div className="font-black text-xs text-slate-900">Ananya Sharma</div>
                    <div className="text-[11px] text-amber-600 font-bold">42 Kudos • Problem Solver</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center flex-shrink-0">
                    🥈
                  </div>
                  <div>
                    <div className="font-black text-xs text-slate-900">Sundar Rajan</div>
                    <div className="text-[11px] text-slate-500 font-bold">38 Kudos • Leadership Champion</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 font-black text-sm flex items-center justify-center flex-shrink-0">
                    🥉
                  </div>
                  <div>
                    <div className="font-black text-xs text-slate-900">Vijay Kumar</div>
                    <div className="text-[11px] text-orange-600 font-bold">31 Kudos • Innovation Star</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kudos Feed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {kudosList.map((kudos) => (
                <div
                  key={kudos.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-amber-400/50 transition relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
                      <span>{kudos.badgeIcon}</span>
                      <span>{kudos.badge}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{kudos.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    &ldquo;{kudos.message}&rdquo;
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-black text-xs text-slate-900">
                        To: {kudos.toName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        From: {kudos.fromName}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClapKudos(kudos.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-300 text-xs font-bold transition active:scale-95 shadow-2xs"
                    >
                      <span className="text-sm">👏</span>
                      <span>{kudos.claps}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Give Kudos */}
        {kudosModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
                    🌟
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Give Peer Kudos</h3>
                    <p className="text-xs text-slate-500">Celebrate a colleague&apos;s contribution</p>
                  </div>
                </div>
                <button onClick={() => setKudosModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendKudos} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Colleague Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma or Vijay Kumar"
                    value={kudosToName}
                    onChange={(e) => setKudosToName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Choose Recognition Badge</label>
                  <select
                    value={kudosBadge}
                    onChange={(e) => setKudosBadge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                  >
                    <option value="Problem Solver">🚀 Problem Solver</option>
                    <option value="Innovation Star">💡 Innovation Star</option>
                    <option value="Team Player">🤝 Team Player</option>
                    <option value="Speed Demon">⚡ Speed Demon</option>
                    <option value="Leadership Champion">🏆 Leadership Champion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Praise Message / Why they rock *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe how they helped the team, delivered exceptional code, or solved a blocker..."
                    value={kudosMessage}
                    onChange={(e) => setKudosMessage(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3] leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setKudosModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md shadow-amber-500/20"
                  >
                    Post Kudos to Wall
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add/Edit OKR Review */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {editingReview ? "Edit OKR Evaluation" : "New Performance Appraisal"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Employee Name *</label>
                  <input
                    type="text"
                    required
                    value={employee}
                    onChange={(e) => setEmployee(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design & Product">Design &amp; Product</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Period</label>
                    <input
                      type="text"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Goal Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={goalScore}
                      onChange={(e) => setGoalScore(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-300 font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Competency (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={competencyScore}
                      onChange={(e) => setCompetencyScore(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-300 font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Rating (1 to 5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-300 font-mono text-center font-bold text-amber-600"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="promo"
                    checked={promotionRecommended}
                    onChange={(e) => setPromotionRecommended(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="promo" className="font-bold text-slate-800 cursor-pointer">
                    Recommend for Promotion / Grade Elevation
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Manager &amp; OKR Evaluation Comments *</label>
                  <textarea
                    rows={3}
                    required
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide specific feedback on deliverables, architecture, teamwork..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold bg-[#1463F3] text-white rounded-xl hover:bg-[#0e4ac4] transition shadow-md"
                  >
                    {editingReview ? "Save Changes" : "Save Review"}
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
