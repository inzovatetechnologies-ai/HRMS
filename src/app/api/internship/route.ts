import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";

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

    const isInternal = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "TEAM_LEAD", "EMPLOYEE"].includes(session.role);

    const where: any = {};
    if (!isInternal && session.role === "INTERN") {
      where.personalEmail = session.email;
    }

    const internships = await prisma.internship.findMany({
      where,
      include: {
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Summary calculations
    let totalCollected = 0;
    let totalOutstanding = 0;
    internships.forEach((item) => {
      totalCollected += item.amountPaid;
      totalOutstanding += item.remainingBalance;
    });

    return NextResponse.json({
      success: true,
      internships,
      summary: {
        totalInterns: internships.length,
        totalCollected,
        totalOutstanding,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch internship records." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Session expired. Please re-login." }, { status: 401 });

    // Allow internal authorized staff (Admin, HR, Team Leads, Internal Staff)
    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "TEAM_LEAD", "EMPLOYEE"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Access Denied: Only authorized HR and management staff can enroll interns." }, { status: 403 });
    }

    const body = await req.json();
    const {
      fullName,
      personalEmail,
      phone,
      college,
      degree,
      graduationYear = 2026,
      domain,
      batch = "Batch-2026-Q1",
      mentor = "Prem Kumar",
      startDate,
      endDate,
      durationWeeks = 12,
      workMode = "Remote",
      internshipType = "Paid",
      totalFee = 15000,
      discount = 0,
      initialPayment = 0,
    } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Student Full Name is required." }, { status: 400 });
    }

    if (!personalEmail || !personalEmail.trim()) {
      return NextResponse.json({ error: "Student Personal Email is required." }, { status: 400 });
    }

    const cleanEmail = personalEmail.trim().toLowerCase();

    // Check duplicate email
    const existing = await prisma.internship.findUnique({
      where: { personalEmail: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: `An intern with email "${cleanEmail}" is already registered (${existing.internId} - ${existing.fullName}). Please use a different email or manage their existing record.`,
        },
        { status: 400 }
      );
    }

    // Dynamic, collision-free intern ID generation
    const allInterns = await prisma.internship.findMany({
      select: { internId: true },
    });

    let maxNum = 0;
    for (const item of allInterns) {
      const match = item.internId?.match(/INZ-INT-2026-(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    const nextNum = Math.max(maxNum + 1, allInterns.length + 1);
    const internId = `INZ-INT-2026-${String(nextNum).padStart(3, "0")}`;

    const numTotalFee = Math.max(0, Number(totalFee) || 0);
    const numDiscount = Math.max(0, Number(discount) || 0);
    const numInitialPayment = Math.max(0, Number(initialPayment) || 0);

    const remainingBalance = Math.max(0, numTotalFee - numDiscount - numInitialPayment);
    const paymentStatus = remainingBalance === 0 ? "COMPLETED" : numInitialPayment > 0 ? "PARTIAL" : "PENDING";

    const defaultPasswordHash = await hashPassword("Inzovate@2026");

    // Upsert user for intern self-service portal
    try {
      await prisma.user.upsert({
        where: { email: cleanEmail },
        update: {
          fullName: fullName.trim(),
        },
        create: {
          email: cleanEmail,
          passwordHash: defaultPasswordHash,
          fullName: fullName.trim(),
          role: "INTERN",
          emailVerified: true,
        },
      });
    } catch (userErr) {
      console.warn("User upsert notice:", userErr);
    }

    const created = await prisma.internship.create({
      data: {
        internId,
        fullName: fullName.trim(),
        personalEmail: cleanEmail,
        phone: phone ? phone.trim() : "+91 97890 00000",
        college: college ? college.trim() : "Affiliated Technical University",
        degree: degree ? degree.trim() : "B.Tech / B.E. Computer Science",
        graduationYear: Number(graduationYear) || 2026,
        domain: domain ? domain.trim() : "Full Stack Web Development",
        batch: batch ? batch.trim() : "Batch-2026-Q1",
        mentor: mentor ? mentor.trim() : "Prem Kumar",
        startDate: startDate || new Date().toISOString().split("T")[0],
        endDate: endDate || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
        durationWeeks: Number(durationWeeks) || 12,
        workMode: workMode || "Remote",
        internshipType: internshipType || "Paid",
        totalFee: numTotalFee,
        discount: numDiscount,
        amountPaid: numInitialPayment,
        remainingBalance,
        paymentStatus,
        attendancePercentage: 100,
        assignmentCompletion: 0,
        status: "ACTIVE",
      },
    });

    // Record initial fee installment if paid
    if (numInitialPayment > 0) {
      const receiptNumber = `INZ-RCP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      await prisma.internshipPayment.create({
        data: {
          internshipId: created.id,
          amount: numInitialPayment,
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMode: "UPI",
          transactionRef: `TXN-${Date.now()}`,
          receiptNumber,
          verifiedBy: session.email || "admin@inzovate-technologies.com",
          notes: "Initial enrollment registration fee confirmed",
        },
      });
    }

    // Safe Audit Log
    try {
      let dbUserId: string | null = null;
      if (session.id) {
        const u = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true } });
        if (u) dbUserId = u.id;
      }

      await prisma.auditLog.create({
        data: {
          userId: dbUserId,
          userEmail: session.email || "admin@inzovate-technologies.com",
          action: "INTERNSHIP_CREATED",
          module: "INTERNSHIP",
          details: `Enrolled intern ${internId} (${fullName.trim()}) in ${domain || "Full Stack Web Development"}`,
        },
      });
    } catch (auditErr) {
      console.warn("Audit log notice:", auditErr);
    }

    return NextResponse.json({ success: true, internship: created });
  } catch (err: any) {
    console.error("Create internship error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create internship record in database." },
      { status: 500 }
    );
  }
}
