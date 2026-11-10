import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get("recipientId");

    const where: any = {};
    if (recipientId) {
      where.recipientId = recipientId;
    }

    const certificates = await prisma.certificate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, certificates });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch certificates." }, { status: 500 });
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
      return NextResponse.json({ error: "Access Denied: Only HR and Admins can issue official certificates." }, { status: 403 });
    }

    const body = await req.json();
    const {
      type = "INTERNSHIP_COMPLETION",
      recipientName,
      recipientEmail,
      recipientId,
      domainOrDept,
      duration = "12 Weeks",
    } = body;

    // If it's an intern certificate, verify eligibility
    if (type === "INTERNSHIP_COMPLETION") {
      const intern = await prisma.internship.findFirst({
        where: {
          OR: [{ internId: recipientId }, { personalEmail: recipientEmail }],
        },
      });

      if (intern) {
        if (intern.remainingBalance > 0) {
          return NextResponse.json(
            { error: `Cannot issue certificate: Outstanding fee of ₹${intern.remainingBalance.toLocaleString("en-IN")} remains.` },
            { status: 400 }
          );
        }
        if (intern.attendancePercentage < 80) {
          return NextResponse.json(
            { error: `Cannot issue certificate: Attendance is ${intern.attendancePercentage}% (Minimum 80% required).` },
            { status: 400 }
          );
        }
      }
    }

    const count = await prisma.certificate.count();
    const certNum = `INZ-CERT-2026-${String(count + 1).padStart(4, "0")}`;
    const verificationToken = `VERIFY-INZ-${Math.floor(100000 + Math.random() * 900000)}-${Date.now().toString().slice(-4)}`;
    const qrCodeData = `https://hrms.inzovate-technologies.com/verify?token=${verificationToken}`;

    const cert = await prisma.certificate.create({
      data: {
        certificateNumber: certNum,
        type,
        recipientName,
        recipientEmail,
        recipientId,
        domainOrDept,
        duration,
        issueDate: new Date().toISOString().split("T")[0],
        verificationToken,
        qrCodeData,
        status: "ACTIVE",
        issuedBy: `${session.fullName} (${session.role})`,
      },
    });

    // If intern, update their certificate status
    await prisma.internship.updateMany({
      where: {
        OR: [{ internId: recipientId }, { personalEmail: recipientEmail }],
      },
      data: {
        certificateStatus: "ISSUED",
        certificateNumber: certNum,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userEmail: session.email,
        action: "CERTIFICATE_ISSUED",
        module: "CERTIFICATES",
        details: `Issued ${type} (${certNum}) for ${recipientName} with verification token ${verificationToken}`,
      },
    });

    return NextResponse.json({ success: true, certificate: cert });
  } catch (err: any) {
    console.error("Certificate issuance error:", err);
    return NextResponse.json({ error: "Failed to issue certificate." }, { status: 500 });
  }
}
