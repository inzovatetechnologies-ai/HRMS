import { NextRequest, NextResponse } from "next/server";
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

    const { tool, prompt, parameters } = await req.json();

    if (tool === "POLICY_QA") {
      // HR Policy Knowledge Base Answer
      const p = (prompt || "").toLowerCase();
      let answer = "";
      if (p.includes("grace") || p.includes("late") || p.includes("shift")) {
        answer = "Under Inzovate Technologies' policy, the standard shift starts at 09:30 AM IST with an inclusive grace period extending to 09:45 AM IST. Arrival past 09:45 AM triggers an exception alert to HR and the reporting Team Leader, and is marked as Absent by default unless an authorized regularization request is approved.";
      } else if (p.includes("leave") || p.includes("casual") || p.includes("sick")) {
        answer = "Inzovate employees receive 12 Casual Leaves, 10 Sick Leaves, and 15 Earned Leaves annually. Leave applications follow a mandatory sequential workflow: Employee submits -> Reporting Team Leader gives L1 approval -> HR Head gives L2 final approval.";
      } else if (p.includes("pf") || p.includes("provident") || p.includes("esi")) {
        answer = "Statutory Employee Provident Fund (EPF) is deducted at 12% of Basic Salary (with standard statutory ceiling of ₹1,800/mo or matching scheme). ESIC applies to employees with monthly gross under ₹21,000 (0.75% employee contribution).";
      } else {
        answer = "Inzovate HRMS Handbook guidelines state that all personnel operations must adhere to fair employment practices, data confidentiality under Indian IT laws, server-authoritative timestamps, and multi-tier approval hierarchies.";
      }
      return NextResponse.json({ success: true, tool, answer });
    } else if (tool === "DRAFT_JOB_DESCRIPTION") {
      const role = parameters?.title || "Senior Software Engineer";
      const dept = parameters?.department || "Engineering";
      const draft = `Job Title: ${role}\nCompany: INZOVATE TECHNOLOGIES PRIVATE LIMITED\nDepartment: ${dept}\nLocation: Chennai / Remote (Hybrid)\n\nKey Responsibilities:\n• Architect, build, and deploy high-availability enterprise services.\n• Collaborate with cross-functional product and design teams.\n• Ensure adherence to cybersecurity, data privacy, and clean architecture standards.\n\nRequirements:\n• Proven experience in full-stack web technologies (TypeScript, Next.js, Node.js, relational databases).\n• Strong problem-solving mindset and collaborative communication.`;
      return NextResponse.json({ success: true, tool, draft });
    } else if (tool === "DRAFT_HR_EMAIL") {
      const emailType = parameters?.type || "WELCOME";
      const name = parameters?.name || "Colleague";
      const draft = `Subject: Welcome to INZOVATE TECHNOLOGIES PRIVATE LIMITED!\n\nDear ${name},\n\nWe are delighted to welcome you to Inzovate Technologies. Your HRMS account has been provisioned with your official company email (@inzovate-technologies.com).\n\nPlease log in to the portal at https://hrms.inzovate-technologies.com to review your profile, view shift timings (09:30 AM - 05:00 PM IST), and familiarize yourself with company policies.\n\nWarm regards,\nPeople Operations Team\nINZOVATE TECHNOLOGIES`;
      return NextResponse.json({ success: true, tool, draft });
    }

    return NextResponse.json({ error: "Unknown AI tool requested." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "AI tool processing failed." }, { status: 500 });
  }
}
