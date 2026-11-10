import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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
      return NextResponse.json({ error: "Access Denied: Only HR and Admins can verify payments." }, { status: 403 });
    }

    const { internshipId, amount, paymentMode = "UPI", transactionRef, notes } = await req.json();

    if (!internshipId || !amount || !transactionRef) {
      return NextResponse.json({ error: "Missing required payment fields." }, { status: 400 });
    }

    const intern = await prisma.internship.findUnique({
      where: { id: internshipId },
    });

    if (!intern) {
      return NextResponse.json({ error: "Internship record not found." }, { status: 404 });
    }

    const payAmount = Number(amount);
    const newPaid = intern.amountPaid + payAmount;
    const newBalance = Math.max(0, intern.totalFee - intern.discount - newPaid);
    const newStatus = newBalance === 0 ? "COMPLETED" : "PARTIAL";

    // Certificate eligibility check: If fees cleared, attendance >= 80%, assignment completed
    let certStatus = intern.certificateStatus;
    if (newBalance === 0 && intern.attendancePercentage >= 80 && intern.assignmentCompletion >= 75) {
      certStatus = "ELIGIBLE";
    }

    const receiptNumber = `INZ-RCP-${Math.floor(10000 + Math.random() * 90000)}`;

    const [payment, updatedIntern] = await prisma.$transaction([
      prisma.internshipPayment.create({
        data: {
          internshipId,
          amount: payAmount,
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMode,
          transactionRef,
          receiptNumber,
          verifiedBy: session.email,
          notes,
        },
      }),
      prisma.internship.update({
        where: { id: internshipId },
        data: {
          amountPaid: newPaid,
          remainingBalance: newBalance,
          paymentStatus: newStatus,
          certificateStatus: certStatus,
        },
      }),
    ]);

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
          action: "PAYMENT_RECORDED",
          module: "INTERNSHIP",
          details: `Recorded payment of ₹${payAmount} for ${intern.internId}. Receipt: ${receiptNumber}. New balance: ₹${newBalance}`,
        },
      });
    } catch (auditErr) {
      console.warn("Audit log notice:", auditErr);
    }

    return NextResponse.json({
      success: true,
      payment,
      internship: updatedIntern,
      receiptNumber,
    });
  } catch (err: any) {
    console.error("Payment recording error:", err);
    return NextResponse.json({ error: "Failed to record payment." }, { status: 500 });
  }
}
