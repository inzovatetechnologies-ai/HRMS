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

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Return contact directory for 1-to-1 direct messaging
    if (action === "contacts") {
      const contacts = await prisma.user.findMany({
        where: {
          isActive: true,
          id: { not: session.id },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          department: true,
          designation: true,
          avatarUrl: true,
          employeeProfile: {
            select: {
              employeeId: true,
              department: true,
              designation: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { fullName: "asc" }],
      });

      return NextResponse.json({ success: true, contacts });
    }

    const channel = searchParams.get("channel") || "ANNOUNCEMENTS";
    const targetUserId = searchParams.get("targetUserId");

    let where: any = {};

    if (channel === "DIRECT" && targetUserId) {
      // 1-to-1 Direct Chat between session user and target user
      where = {
        channel: "DIRECT",
        OR: [
          { senderId: session.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: session.id },
        ],
      };
    } else {
      // Group Broadcast Channels
      where = {
        channel,
        receiverId: null,
      };
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    console.error("Fetch chat error:", err);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
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
    const { channel = "ANNOUNCEMENTS", message, receiverId = null } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    }

    const isDirect = Boolean(receiverId);
    const finalChannel = isDirect ? "DIRECT" : channel;

    const created = await prisma.chatMessage.create({
      data: {
        senderId: session.id,
        senderName: session.fullName,
        senderRole: session.role,
        channel: finalChannel,
        receiverId: isDirect ? receiverId : null,
        message: message.trim(),
      },
    });

    // If 1-to-1 direct message, notify the receiver
    if (isDirect && receiverId) {
      try {
        await prisma.notification.create({
          data: {
            userId: receiverId,
            title: `💬 New Message from ${session.fullName}`,
            message: message.trim().slice(0, 100),
            type: "SYSTEM",
            link: `/chat?user=${session.id}`,
          },
        });
      } catch (notifyErr) {
        // Non-blocking notification
      }
    }

    return NextResponse.json({ success: true, message: created });
  } catch (err: any) {
    console.error("Post chat error:", err);
    return NextResponse.json({ error: "Failed to post message." }, { status: 500 });
  }
}
