"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Laptop,
  Monitor,
  Cpu,
  Key,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileCheck2,
  Filter,
  DollarSign,
  UserCheck,
  Building2,
  HardDrive,
  X,
  Download,
} from "lucide-react";

export default function AssetsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [newAssetModalOpen, setNewAssetModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // New Asset Form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Laptops");
  const [serialNumber, setSerialNumber] = useState("");
  const [cost, setCost] = useState("");
  const [condition, setCondition] = useState("EXCELLENT");

  // Assign Form
  const [assigneeId, setAssigneeId] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [assigneeRole, setAssigneeRole] = useState("Full Stack Engineer");

  // Clearance state
  const [clearanceResult, setClearanceResult] = useState<any>(null);

  const loadAssets = async () => {
    try {
      const res = await fetch("/api/assets");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Error loading assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ASSET",
          name,
          category,
          serialNumber,
          cost,
          condition,
          status: "AVAILABLE",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNewAssetModalOpen(false);
        setName("");
        setSerialNumber("");
        setCost("");
        loadAssets();
      }
    } catch (err) {
      alert("Failed to add asset");
    }
  };

  const handleAssignAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_ASSET",
          assetId: selectedAsset.id,
          employeeId: assigneeId,
          employeeName: assigneeName,
          employeeRole: assigneeRole,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAssignModalOpen(false);
        setSelectedAsset(null);
        setAssigneeId("");
        setAssigneeName("");
        loadAssets();
      }
    } catch (err) {
      alert("Failed to assign asset");
    }
  };

  const handleReturnAsset = async (asset: any) => {
    if (!confirm(`Confirm return of asset ${asset.assetTag} (${asset.name}) to stock?`)) return;
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RETURN_ASSET",
          assetId: asset.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        loadAssets();
      }
    } catch (err) {
      alert("Failed to return asset");
    }
  };

  const handleCheckClearance = async (empId: string, empName: string) => {
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_CLEARANCE",
          employeeId: empId,
          employeeName: empName,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setClearanceResult(json.clearance);
        setClearanceModalOpen(true);
      }
    } catch (err) {
      alert("Failed to generate clearance");
    }
  };

  const assets = data?.assets || [];
  const stats = data?.stats || {
    totalAssets: 0,
    assignedCount: 0,
    availableCount: 0,
    maintenanceCount: 0,
    totalAssetValue: 0,
  };

  const filteredAssets = assets.filter((asset: any) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.assignedToName &&
        asset.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "ALL" || asset.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || asset.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

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
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>IT HARDWARE & ASSET REPOSITORY</span>
                </span>
                <span className="text-slate-400 text-xs font-mono">v2026.1 Enterprise</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Company Asset &amp; Inventory Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Track laptops, lab AI kits, monitors, RFID badges, and equipment assigned to INZOVATE staff and interns with 1-click exit clearance receipts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setNewAssetModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1463F3] to-[#2583FF] hover:from-[#1154D4] hover:to-[#1E74E8] text-white text-xs font-bold shadow-lg shadow-blue-500/30 border border-blue-400/30 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Hardware Asset</span>
              </button>

              <button
                onClick={() => handleCheckClearance("INZ-EMP-1001", "Sundar Rajan")}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/15 text-white text-xs font-bold border border-white/10 hover:border-cyan-500/40 shadow-sm transition active:scale-95"
              >
                <FileCheck2 className="w-4 h-4 text-cyan-300" />
                <span>Issue Exit Clearance</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Micro-KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1463F3] flex items-center justify-center border border-blue-100 flex-shrink-0">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Assets</div>
              <div className="text-2xl font-black text-slate-900">{stats.totalAssets}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Logged in repository</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned</div>
              <div className="text-2xl font-black text-emerald-600">{stats.assignedCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Active staff &amp; interns</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 flex-shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In Stock</div>
              <div className="text-2xl font-black text-cyan-600">{stats.availableCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Ready for deployment</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 flex-shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Asset Value</div>
              <div className="text-2xl font-black text-slate-900">
                ₹{(stats.totalAssetValue / 100000).toFixed(2)}L
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Capital equipment cost</div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by asset name, tag, serial number or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#1463F3] focus:ring-1 focus:ring-[#1463F3] text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["ALL", "Laptops", "Monitors", "Robotics & AI Kits", "Access Badges"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  categoryFilter === cat
                    ? "bg-[#07152E] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="AVAILABLE">Available</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Hardware Assets Data Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Inventory Items ({filteredAssets.length})</h3>
              <p className="text-xs text-slate-500">Live hardware ledger with condition and employee assignment</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Asset Tag &amp; Item</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Serial Number</th>
                  <th className="px-5 py-3.5">Assigned To</th>
                  <th className="px-5 py-3.5">Condition</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset: any) => (
                  <tr key={asset.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-xs">{asset.name}</div>
                      <div className="font-mono text-[11px] text-[#1463F3] font-semibold mt-0.5">
                        {asset.assetTag} • ₹{asset.cost?.toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600 font-medium">
                      {asset.serialNumber}
                    </td>
                    <td className="px-5 py-4">
                      {asset.assignedToName ? (
                        <div>
                          <div className="font-bold text-slate-800">{asset.assignedToName}</div>
                          <div className="text-[10px] text-slate-400">
                            {asset.assignedToRole} • {asset.assignedDate}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned (In Stock)</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          asset.condition === "EXCELLENT" || asset.condition === "NEW"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          asset.status === "ASSIGNED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : asset.status === "AVAILABLE"
                            ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            asset.status === "ASSIGNED"
                              ? "bg-emerald-500"
                              : asset.status === "AVAILABLE"
                              ? "bg-cyan-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span>{asset.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {asset.status === "ASSIGNED" ? (
                        <button
                          onClick={() => handleReturnAsset(asset)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold transition flex items-center space-x-1 ml-auto"
                          title="Return to inventory"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setAssignModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-[#1463F3] hover:bg-[#0e4ac4] text-white text-xs font-bold transition flex items-center space-x-1 ml-auto shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add New Hardware Asset */}
        {newAssetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1463F3] flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Add New IT Asset</h3>
                    <p className="text-xs text-slate-500">Register hardware into company inventory</p>
                  </div>
                </div>
                <button
                  onClick={() => setNewAssetModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAsset} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asset Model &amp; Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MacBook Pro 14 M3 Pro or ThinkPad T14"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                    >
                      <option value="Laptops">Laptops</option>
                      <option value="Monitors">Monitors</option>
                      <option value="Robotics & AI Kits">Robotics &amp; AI Kits</option>
                      <option value="Access Badges">Access Badges</option>
                      <option value="Peripherals">Peripherals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Serial Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. C02G90ZXMD6R"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Cost (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 185000"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hardware Condition</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                    >
                      <option value="NEW">Brand New</option>
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setNewAssetModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1463F3] hover:bg-[#0e4ac4] shadow-md shadow-blue-500/20"
                  >
                    Register Asset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Assign Asset */}
        {assignModalOpen && selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Assign Hardware to Staff</h3>
                  <p className="text-xs text-slate-500">
                    Assigning: <strong className="text-slate-800">{selectedAsset.name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignAsset} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee / Intern ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INZ-EMP-1004 or INZ-INT-2026-002"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Staff Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Role</label>
                  <input
                    type="text"
                    required
                    value={assigneeRole}
                    onChange={(e) => setAssigneeRole(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-[#1463F3]"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1463F3] hover:bg-[#0e4ac4] shadow-md shadow-blue-500/20"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Exit Clearance / No Due Certificate */}
        {clearanceModalOpen && clearanceResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      IT &amp; Asset Exit Clearance Certificate
                    </h3>
                    <p className="text-xs text-slate-500">Official INZOVATE HRMS Asset Audit</p>
                  </div>
                </div>
                <button
                  onClick={() => setClearanceModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Employee ID:</span>
                    <span className="font-bold text-slate-800">{clearanceResult.employeeId}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Employee Name:</span>
                    <span className="font-bold text-slate-800">{clearanceResult.employeeName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Audit Status:</span>
                    <span className="font-black text-emerald-600 uppercase">
                      {clearanceResult.status === "CLEAR_NO_DUES" ? "Verified No Dues" : "Pending Return"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Signatory:</span>
                    <span className="font-medium text-slate-700">{clearanceResult.authorizedSignatory}</span>
                  </div>
                </div>

                {clearanceResult.pendingAssetsCount > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-amber-700">
                      ⚠️ Pending Hardware to be Returned ({clearanceResult.pendingAssetsCount}):
                    </div>
                    {clearanceResult.pendingAssets.map((ast: any) => (
                      <div
                        key={ast.id}
                        className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs flex justify-between"
                      >
                        <span className="font-bold text-slate-800">{ast.name}</span>
                        <span className="font-mono text-slate-600">{ast.assetTag}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>All IT hardware and facilities assets have been returned in full. Exit clearance approved!</span>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      alert("Official IT Clearance Certificate generated for print & digital archiving.");
                      setClearanceModalOpen(false);
                    }}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1463F3] hover:bg-[#0e4ac4] shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Signed PDF</span>
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
