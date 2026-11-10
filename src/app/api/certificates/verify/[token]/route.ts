import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    const cert = await prisma.certificate.findUnique({
      where: { verificationToken: token },
    });

    if (!cert) {
      return NextResponse.json(
        { verified: false, message: "Invalid or nonexistent certificate token." },
        { status: 404 }
      );
    }

    if (cert.status === "REVOKED") {
      return NextResponse.json(
        {
          verified: false,
          status: "REVOKED",
          message: "This certificate has been officially revoked by Inzovate Technologies.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      status: "VALID",
      certificateNumber: cert.certificateNumber,
      recipientName: cert.recipientName,
      type: cert.type,
      domainOrDept: cert.domainOrDept,
      duration: cert.duration,
      issueDate: cert.issueDate,
      issuedBy: cert.issuedBy,
      issuer: "INZOVATE TECHNOLOGIES PRIVATE LIMITED",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Verification lookup failed." }, { status: 500 });
  }
}
