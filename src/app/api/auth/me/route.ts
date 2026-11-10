import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      token = req.cookies.get("inzovate_session")?.value || null;
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        employeeProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl || null,
        department: user.department,
        designation: user.designation,
        employeeId: user.employeeProfile?.employeeId || (user.role === "SUPER_ADMIN" ? "INZ-SA-001" : (user.role === "HR_MANAGER" ? "INZ-HR-001" : null)),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Session verification failed." }, { status: 500 });
  }
}
