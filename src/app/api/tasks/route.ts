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

    const tasks = await prisma.task.findMany({
      orderBy: { updatedAt: "desc" },
    });

    const employees = await prisma.employee.findMany({
      select: { employeeId: true, firstName: true, lastName: true, department: true, designation: true },
    });

    return NextResponse.json({ success: true, tasks, employees });
  } catch (err: any) {
    console.error("Fetch tasks error:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
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
    const { title, description, assignedTo, project, priority, dueDate } = body;

    if (!title || !assignedTo) {
      return NextResponse.json({ error: "Task title and assignee are required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "Operational sprint deliverable.",
        assignedTo,
        assignedBy: session.fullName || "Admin Authority",
        project: project || "General Operations",
        priority: priority || "MEDIUM",
        status: "IN_PROGRESS",
        dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    console.error("Create task error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("inzovate_session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const body = await req.json();
    const { id, status, priority, title, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (priority) dataToUpdate.priority = priority;
    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: any) {
    console.error("Update task error:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
