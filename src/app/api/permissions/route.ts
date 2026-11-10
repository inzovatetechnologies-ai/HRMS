import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const rolePermissions = await prisma.rolePermission.findMany({
      orderBy: { role: "asc" },
    });

    const userPermission = rolePermissions.find((rp) => rp.role === session.role);
    const parsedUserModules = userPermission ? JSON.parse(userPermission.modules) : [];

    const isSuperAdmin = session.role === "SUPER_ADMIN";

    // If Super Admin, also return all users for the access management list
    let usersList: any[] = [];
    if (isSuperAdmin) {
      usersList = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          department: true,
          designation: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      currentUser: {
        id: session.id,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
        isSuperAdmin,
      },
      userModules: parsedUserModules,
      userCapabilities: userPermission
        ? {
            canApprove: userPermission.canApprove,
            canEdit: userPermission.canEdit,
            canDelete: userPermission.canDelete,
            canExport: userPermission.canExport,
          }
        : { canApprove: false, canEdit: false, canDelete: false, canExport: false },
      rolePermissions: rolePermissions.map((rp) => ({
        ...rp,
        modules: JSON.parse(rp.modules),
      })),
      users: usersList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load permissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    // ONLY Super Admin (Founder Gokul G & MD Mousik Shankar S) can modify access policies!
    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Access Denied: Only Founder & Managing Director (Super Admins) can configure role accessibility." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, role, modules, canApprove, canEdit, canDelete, canExport, userId, isActive, newRole } = body;

    if (action === "UPDATE_ROLE_PERMISSIONS") {
      if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });

      // Super admin role itself is locked from removing all permissions
      const isSuperAdminRole = role === "SUPER_ADMIN";
      const modulesArray = Array.isArray(modules) ? modules : [];

      const updated = await prisma.rolePermission.upsert({
        where: { role },
        update: {
          modules: JSON.stringify(modulesArray),
          canApprove: isSuperAdminRole ? true : !!canApprove,
          canEdit: isSuperAdminRole ? true : !!canEdit,
          canDelete: isSuperAdminRole ? true : !!canDelete,
          canExport: isSuperAdminRole ? true : !!canExport,
          updatedBy: session.email,
        },
        create: {
          role,
          title: role,
          description: `Access profile for ${role}`,
          modules: JSON.stringify(modulesArray),
          canApprove: isSuperAdminRole ? true : !!canApprove,
          canEdit: isSuperAdminRole ? true : !!canEdit,
          canDelete: isSuperAdminRole ? true : !!canDelete,
          canExport: isSuperAdminRole ? true : !!canExport,
          isLocked: isSuperAdminRole,
          updatedBy: session.email,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.id,
          userEmail: session.email,
          action: "PERMISSION_ROLE_UPDATED",
          module: "ADMIN",
          details: `Super Admin ${session.fullName} updated module access for role ${role}: [${modulesArray.join(", ")}]`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Accessibility permissions updated for ${role}!`,
        permission: { ...updated, modules: modulesArray },
      });
    }

    if (action === "TOGGLE_USER_STATUS") {
      if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

      // Cannot deactivate Founder or MD
      if (
        targetUser.email === "founder@inzovate-technologies.com" ||
        targetUser.email === "md@inzovate-technologies.com"
      ) {
        return NextResponse.json(
          { error: "Founder and Managing Director accounts cannot be deactivated." },
          { status: 400 }
        );
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: isActive !== undefined ? isActive : !targetUser.isActive,
          ...(newRole ? { role: newRole } : {}),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.id,
          userEmail: session.email,
          action: "USER_ACCESS_GRANT_MODIFIED",
          module: "ADMIN",
          details: `Super Admin ${session.fullName} changed access for ${targetUser.email} (Active: ${updated.isActive}, Role: ${updated.role})`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Access authorization updated for ${targetUser.fullName}.`,
        user: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save permissions" }, { status: 500 });
  }
}
