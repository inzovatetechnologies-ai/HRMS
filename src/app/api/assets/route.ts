import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// In-memory persistent mock store for assets (seeded with realistic Inzovate hardware)
let assetsStore = [
  {
    id: "AST-1001",
    assetTag: "INZ-LP-014",
    name: "MacBook Pro 16\" (M3 Pro, 36GB, 512GB)",
    category: "Laptops",
    serialNumber: "C02G90ZXMD6R",
    assignedToId: "INZ-EMP-1001",
    assignedToName: "Sundar Rajan",
    assignedToRole: "Super Admin / Lead",
    assignedDate: "2026-01-15",
    condition: "EXCELLENT",
    status: "ASSIGNED", // ASSIGNED, AVAILABLE, MAINTENANCE, RETIRED
    cost: 249000,
    warrantyExpiry: "2029-01-14",
  },
  {
    id: "AST-1002",
    assetTag: "INZ-LP-015",
    name: "Dell XPS 15 (i9-14900H, 32GB, RTX 4060)",
    category: "Laptops",
    serialNumber: "8H9K2M4",
    assignedToId: "INZ-EMP-1002",
    assignedToName: "Kavitha Priya",
    assignedToRole: "HR Manager",
    assignedDate: "2026-02-01",
    condition: "EXCELLENT",
    status: "ASSIGNED",
    cost: 185000,
    warrantyExpiry: "2028-02-01",
  },
  {
    id: "AST-1003",
    assetTag: "INZ-MON-008",
    name: "Dell UltraSharp 27\" 4K USB-C Monitor",
    category: "Monitors",
    serialNumber: "CN-0R5G90-74261",
    assignedToId: "INZ-EMP-1001",
    assignedToName: "Sundar Rajan",
    assignedToRole: "Super Admin",
    assignedDate: "2026-01-15",
    condition: "GOOD",
    status: "ASSIGNED",
    cost: 45000,
    warrantyExpiry: "2027-05-10",
  },
  {
    id: "AST-1004",
    assetTag: "INZ-BOT-002",
    name: "NVIDIA Jetson AGX Orin 64GB Developer Kit (AI Lab)",
    category: "Robotics & AI Kits",
    serialNumber: "NV-AGX-882190",
    assignedToId: "INZ-INT-2026-001",
    assignedToName: "Karthik Subramanian",
    assignedToRole: "AI Robotics Intern",
    assignedDate: "2026-03-01",
    condition: "EXCELLENT",
    status: "ASSIGNED",
    cost: 165000,
    warrantyExpiry: "2028-03-01",
  },
  {
    id: "AST-1005",
    assetTag: "INZ-LP-020",
    name: "ThinkPad T14 Gen 4 (Ryzen 7 PRO, 32GB)",
    category: "Laptops",
    serialNumber: "PF-3K90M2",
    assignedToId: null,
    assignedToName: null,
    assignedToRole: null,
    assignedDate: null,
    condition: "NEW",
    status: "AVAILABLE",
    cost: 110000,
    warrantyExpiry: "2029-06-30",
  },
  {
    id: "AST-1006",
    assetTag: "INZ-ACC-033",
    name: "RFID Smart Card & NFC Facility Access Badge",
    category: "Access Badges",
    serialNumber: "NFC-INZ-033",
    assignedToId: "INZ-EMP-1001",
    assignedToName: "Sundar Rajan",
    assignedToRole: "Super Admin",
    assignedDate: "2026-01-01",
    condition: "GOOD",
    status: "ASSIGNED",
    cost: 1500,
    warrantyExpiry: "2030-01-01",
  },
];

export async function GET(req: NextRequest) {
  try {
    const totalAssets = assetsStore.length;
    const assignedCount = assetsStore.filter((a) => a.status === "ASSIGNED").length;
    const availableCount = assetsStore.filter((a) => a.status === "AVAILABLE").length;
    const maintenanceCount = assetsStore.filter((a) => a.status === "MAINTENANCE").length;
    const totalAssetValue = assetsStore.reduce((acc, a) => acc + (a.cost || 0), 0);

    return NextResponse.json({
      success: true,
      assets: assetsStore,
      stats: {
        totalAssets,
        assignedCount,
        availableCount,
        maintenanceCount,
        totalAssetValue,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load assets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "CREATE_ASSET") {
      const { name, category, serialNumber, cost, condition, status } = body;
      const newAsset = {
        id: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
        assetTag: `INZ-${category.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        name,
        category: category || "General IT",
        serialNumber,
        assignedToId: null,
        assignedToName: null,
        assignedToRole: null,
        assignedDate: null,
        condition: condition || "NEW",
        status: status || "AVAILABLE",
        cost: Number(cost) || 0,
        warrantyExpiry: "2028-12-31",
      };
      assetsStore.unshift(newAsset);
      return NextResponse.json({ success: true, asset: newAsset });
    }

    if (action === "ASSIGN_ASSET") {
      const { assetId, employeeId, employeeName, employeeRole } = body;
      const asset = assetsStore.find((a) => a.id === assetId);
      if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

      asset.assignedToId = employeeId;
      asset.assignedToName = employeeName;
      asset.assignedToRole = employeeRole || "Employee";
      asset.assignedDate = new Date().toISOString().split("T")[0];
      asset.status = "ASSIGNED";

      return NextResponse.json({ success: true, asset });
    }

    if (action === "RETURN_ASSET") {
      const { assetId, returnCondition } = body;
      const asset = assetsStore.find((a) => a.id === assetId);
      if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

      asset.assignedToId = null;
      asset.assignedToName = null;
      asset.assignedToRole = null;
      asset.assignedDate = null;
      asset.condition = returnCondition || asset.condition;
      asset.status = "AVAILABLE";

      return NextResponse.json({ success: true, asset });
    }

    if (action === "GENERATE_CLEARANCE") {
      const { employeeId, employeeName } = body;
      const assigned = assetsStore.filter((a) => a.assignedToId === employeeId);
      const isClear = assigned.length === 0;

      return NextResponse.json({
        success: true,
        clearance: {
          employeeId,
          employeeName,
          status: isClear ? "CLEAR_NO_DUES" : "PENDING_HANDOVER",
          pendingAssetsCount: assigned.length,
          pendingAssets: assigned,
          generatedAt: new Date().toISOString(),
          authorizedSignatory: "Sundar Rajan, Lead IT Ops",
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "Asset operation failed" }, { status: 500 });
  }
}
