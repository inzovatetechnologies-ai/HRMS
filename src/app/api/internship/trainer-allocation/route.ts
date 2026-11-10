import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function isAuthorizedToAllocateTrainer(session: any): boolean {
  const role = (session.role || "").toUpperCase();
  const email = (session.email || "").toLowerCase();

  // Exclusive Governance Authority: Founder & Managing Director (SUPER_ADMIN)
  if (
    role === "SUPER_ADMIN" ||
    email.startsWith("founder@") ||
    email.startsWith("md@")
  ) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const canAllocate = isAuthorizedToAllocateTrainer(session);

    // Fetch all active interns
    const interns = await prisma.internship.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        schedules: {
          take: 5,
          orderBy: { date: "desc" },
        },
        attendances: {
          take: 5,
          orderBy: { date: "desc" },
        },
      },
    });

    // Fetch all active employees available to be trainers
    const availableTrainers = await prisma.employee.findMany({
      where: {
        employmentStatus: "Active",
        employmentType: { not: "Intern" },
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        department: true,
        designation: true,
        companyEmail: true,
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({
      success: true,
      canAllocate,
      interns,
      availableTrainers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch trainer allocation data." }, { status: 500 });
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

    if (!isAuthorizedToAllocateTrainer(session)) {
      return NextResponse.json(
        {
          error:
            "Access Restricted: Only Founder & Managing Director (Super Admin) are authorized to allocate permanent employees as trainers to interns.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { internId, trainerEmployeeId } = body;

    if (!internId || !trainerEmployeeId) {
      return NextResponse.json({ error: "Both internId and trainerEmployeeId are required." }, { status: 400 });
    }

    const intern = await prisma.internship.findFirst({
      where: { OR: [{ id: internId }, { internId }] },
    });

    if (!intern) {
      return NextResponse.json({ error: `Intern ${internId} not found.` }, { status: 404 });
    }

    const trainer = await prisma.employee.findUnique({
      where: { employeeId: trainerEmployeeId },
    });

    if (!trainer) {
      return NextResponse.json({ error: `Trainer employee ${trainerEmployeeId} not found.` }, { status: 404 });
    }

    const updatedIntern = await prisma.internship.update({
      where: { id: intern.id },
      data: {
        trainerId: trainer.employeeId,
        trainerName: `${trainer.firstName} ${trainer.lastName}`,
        trainerEmail: trainer.companyEmail,
        mentor: `${trainer.firstName} ${trainer.lastName}`,
        allocatedBy: session.email,
        allocatedAt: new Date(),
      },
    });

    // Send email to the newly assigned Trainer
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background: #07152E; color: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #28C5F6;">
          <h2 style="color: #28C5F6; margin-top: 0;">INZOVATE ACADEMY — New Intern Assignment</h2>
          <p>Hello <strong>${trainer.firstName} ${trainer.lastName}</strong>,</p>
          <p>You have been assigned as the official Trainer / Mentor for the following intern candidate:</p>
          <div style="background: rgba(40,197,246,0.1); padding: 14px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Intern:</strong> ${intern.fullName} (<code>${intern.internId}</code>)</p>
            <p style="margin: 4px 0;"><strong>Domain:</strong> ${intern.domain}</p>
            <p style="margin: 4px 0;"><strong>College:</strong> ${intern.college}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${intern.personalEmail}</p>
            <p style="margin: 4px 0;"><strong>Allocated By:</strong> ${session.email}</p>
          </div>
          <p style="color: #94A3B8; font-size: 13px;">
            <strong>Your Daily Responsibility:</strong> Please allocate your daily class timing (available between 09:00 AM and 08:00 PM IST) every working day before 10:30 AM in the HRMS Portal.
          </p>
        </div>
      `;

      await sendEmail({
        to: trainer.companyEmail,
        subject: `[INZOVATE ACADEMY] 🎓 New Intern Mentorship Assigned: ${intern.fullName} (${intern.domain})`,
        html: emailHtml,
      });
    } catch (mailErr) {
      console.warn("Trainer assignment email error:", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Trainer ${trainer.firstName} ${trainer.lastName} assigned to ${intern.fullName} successfully.`,
      intern: updatedIntern,
    });
  } catch (err: any) {
    console.error("Trainer allocation error:", err);
    return NextResponse.json({ error: err.message || "Failed to allocate trainer." }, { status: 500 });
  }
}
