"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  CheckSquare,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Filter,
  User,
  Briefcase,
  Layers,
  Sparkles,
  Calendar,
  X,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Create Task Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
        setEmployees(data.employees || []);
        if (data.employees && data.employees.length > 0 && !assignedTo) {
          setAssignedTo(`${data.employees[0].firstName} ${data.employees[0].lastName}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "new" || params.get("action") === "add") {
        setCreateModalOpen(true);
      }
      const handleAddTask = () => setCreateModalOpen(true);
      window.addEventListener("inzovate_open_add_task", handleAddTask);
      return () => window.removeEventListener("inzovate_open_add_task", handleAddTask);
    }
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );

      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      loadTasks();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo) {
      setFormError("Task title and assigned employee are mandatory.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          assignedTo,
          project: project.trim() || "Core Engineering Operations",
          priority,
          dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create task");
      } else {
        setCreateModalOpen(false);
        setTitle("");
        setDescription("");
        setProject("");
        loadTasks();
      }
    } catch (err) {
      setFormError("Network error assigning task");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "TODO", label: "Backlog / To-Do", color: "border-slate-500/40 text-slate-300" },
    { key: "IN_PROGRESS", label: "Active In Progress", color: "border-cyan-500/50 text-cyan-300" },
    { key: "REVIEW", label: "Verification / Review", color: "border-amber-500/50 text-amber-300" },
    { key: "DONE", label: "Completed Deliverables", color: "border-emerald-500/50 text-emerald-300" },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#050D20] via-[#040A18] to-[#02050E] p-6 sm:p-8 text-white shadow-xl border border-cyan-500/25">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-[11px] font-black tracking-wider border border-cyan-500/30">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>WORKFORCE OPERATIONS &amp; PROJECT DELIVERABLES</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
                  {tasks.length} Active Tasks
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Employee Project Assignments &amp; Live Work Radar
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Track who is working on what project, sprint milestones, real-time ticket progression, and executive workload balancing.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#1463F3] to-[#2583FF] hover:from-[#0e4ac4] hover:to-[#1769FF] text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 border border-blue-400/30 transition active:scale-95 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Assign Work to Employee</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-600 font-bold">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filter Assignments:</span>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">Backlog / To-Do</option>
              <option value="IN_PROGRESS">Active In Progress</option>
              <option value="REVIEW">Verification / Review</option>
              <option value="DONE">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* 4-Column Agile Kanban Deck */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="bg-slate-50/80 rounded-3xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between min-h-[500px]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <h3 className="font-extrabold text-xs text-slate-800 tracking-wider">
                        {col.label}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colTasks.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                        No tasks in this lane
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 hover:shadow-md transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                              {task.project}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                task.priority === "URGENT"
                                  ? "bg-rose-500 text-white"
                                  : task.priority === "HIGH"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 leading-snug">
                            {task.title}
                          </h4>

                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                            <div className="flex items-center space-x-1.5 text-blue-700 font-bold">
                              <User className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[120px]">{task.assignedTo}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Due: {task.dueDate}
                            </span>
                          </div>

                          {/* Quick lane transition buttons */}
                          <div className="pt-1 flex flex-wrap gap-1 border-t border-slate-100/70">
                            {columns
                              .filter((c) => c.key !== col.key)
                              .map((c) => (
                                <button
                                  key={c.key}
                                  type="button"
                                  onClick={() => handleUpdateStatus(task.id, c.key)}
                                  className="text-[9.5px] font-bold text-slate-500 hover:text-blue-700 hover:bg-blue-50 px-1.5 py-0.5 rounded transition"
                                >
                                  &rarr; {c.label.split("/")[0]}
                                </button>
                              ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Assign New Work to Employee */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 text-xs text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Assign New Work Deliverable</h3>
                    <p className="text-[11px] text-slate-400">Dispatch live task to workforce personnel</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTask} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assignee (Select Employee):
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp.employeeId} value={`${emp.firstName} ${emp.lastName}`}>
                        {emp.firstName} {emp.lastName} ({emp.designation} • {emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Project / Module Name:
                  </label>
                  <input
                    type="text"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    placeholder="e.g. Core Engineering Platform, AI Voice Copilot..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Task Title &amp; Core Goal:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Architect Redis Caching & Sharding Layer"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Work Description &amp; Technical Scope:
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide clear specifications, acceptance criteria, and expected deliverables..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Priority Level:
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="URGENT">Urgent (Immediate)</option>
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Sprint Target Due Date:
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 text-white font-extrabold hover:from-blue-800 hover:to-blue-950 shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Assign Work</span>
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
