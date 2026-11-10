import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.companySettings.findUnique({
      where: { id: "inzovate-settings" },
    });
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
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

    if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.role)) {
      return NextResponse.json({ error: "Access Denied: Only Super Admin and HR can modify system settings." }, { status: 403 });
    }

    const data = await req.json();

    const updatePayload: any = {
      companyName: data.companyName,
      tagline: data.tagline,
      workStartTime: data.workStartTime,
      gracePeriodEndTime: data.gracePeriodEndTime,
      workEndTime: data.workEndTime,
      smtpHost: data.smtpHost,
      smtpPort: Number(data.smtpPort) || 587,
      smtpUser: data.smtpUser,
      smtpFrom: data.smtpFrom,
      theme: data.theme,
    };

    if (data.smtpPass !== undefined && data.smtpPass !== "") {
      updatePayload.smtpPass = data.smtpPass;
    }

    const updated = await prisma.companySettings.upsert({
      where: { id: "inzovate-settings" },
      update: updatePayload,
      create: {
        id: "inzovate-settings",
        companyName: data.companyName || "INZOVATE TECHNOLOGIES PRIVATE LIMITED",
        tagline: data.tagline || "One Platform. Every People Operation. Intelligent Automation.",
        workStartTime: data.workStartTime || "09:30",
        gracePeriodEndTime: data.gracePeriodEndTime || "09:45",
        workEndTime: data.workEndTime || "17:00",
        smtpHost: data.smtpHost || "smtppro.zoho.in",
        smtpPort: Number(data.smtpPort) || 465,
        smtpUser: data.smtpUser || "hr@inzovate-technologies.com",
        smtpPass: data.smtpPass || null,
        smtpFrom: data.smtpFrom || "Inzovate HRMS <hr@inzovate-technologies.com>",
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
