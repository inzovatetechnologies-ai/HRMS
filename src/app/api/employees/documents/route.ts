import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { sendEmail, buildDocumentPendingAlertEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const MANDATORY_DOCUMENTS = [
  { key: "AADHAAR", label: "Aadhaar Card" },
  { key: "PAN", label: "PAN Card" },
  { key: "BANK_PASSBOOK", label: "Bank Passbook" },
  { key: "10TH_MARKSHEET", label: "10th Marksheet" },
  { key: "12TH_MARKSHEET", label: "12th Marksheet" },
  { key: "COLLEGE_MARKSHEET", label: "College Marksheet" },
  { key: "DEGREE_CERTIFICATE", label: "Consolidated Degree Certificate (UG/PG/Diploma)" },
];

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const documents = await prisma.employeeDocument.findMany({
      where: { employeeId },
      orderBy: { uploadedAt: "desc" },
    });

    const uploadedKeys = documents.map((d) => d.category.toUpperCase());
    const missingDocs = MANDATORY_DOCUMENTS.filter(
      (m) => !uploadedKeys.includes(m.key)
    ).map((m) => m.label);

    return NextResponse.json({
      success: true,
      documents,
      missingDocs,
      totalRequired: MANDATORY_DOCUMENTS.length,
      uploadedCount: uploadedKeys.length,
      isCompliant: missingDocs.length === 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch employee documents." }, { status: 500 });
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

    const body = await req.json();
    const {
      employeeId,
      category,
      fileName,
      fileUrl,
      degreeType = null,
      degreeTitle = null,
    } = body;

    if (!employeeId || !category || !fileUrl) {
      return NextResponse.json(
        { error: "Employee ID, category, and file are required." },
        { status: 400 }
      );
    }

    const emp = await prisma.employee.findUnique({
      where: { employeeId },
      include: { user: true, documents: true },
    });

    if (!emp) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    // Check existing document of this category to update or create
    const existing = await prisma.employeeDocument.findFirst({
      where: {
        employeeId,
        category: category.toUpperCase(),
      },
    });

    let savedDoc;
    if (existing) {
      savedDoc = await prisma.employeeDocument.update({
        where: { id: existing.id },
        data: {
          fileName: fileName || `${category}_Document`,
          fileUrl,
          verificationStatus: "VERIFIED",
          degreeType,
          degreeTitle,
          uploadedAt: new Date(),
        },
      });
    } else {
      savedDoc = await prisma.employeeDocument.create({
        data: {
          employeeId,
          category: category.toUpperCase(),
          fileName: fileName || `${category}_Document`,
          fileUrl,
          verificationStatus: "VERIFIED",
          degreeType,
          degreeTitle,
        },
      });
    }

    // Recalculate missing documents
    const allDocs = await prisma.employeeDocument.findMany({ where: { employeeId } });
    const uploadedCats = allDocs.map((d) => d.category.toUpperCase());
    const missingDocs = MANDATORY_DOCUMENTS.filter(
      (m) => !uploadedCats.includes(m.key)
    ).map((m) => m.label);

    return NextResponse.json({
      success: true,
      document: savedDoc,
      missingDocs,
      isCompliant: missingDocs.length === 0,
      message: `Document '${category}' uploaded successfully.`,
    });
  } catch (err: any) {
    console.error("Document upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload document." }, { status: 500 });
  }
}
