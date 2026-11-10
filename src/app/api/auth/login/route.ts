import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, createToken, validateEmailForRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        employeeProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials or unauthorized account." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Contact Super Admin." },
        { status: 403 }
      );
    }

    // Role-based domain policy validation
    const emailValidation = validateEmailForRole(normalizedEmail, user.role);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 403 }
      );
    }

    // Compare password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your password." },
        { status: 401 }
      );
    }

    // Session payload
    const sessionUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      designation: user.designation,
      employeeId: user.employeeProfile?.employeeId || null,
    };

    const token = createToken(sessionUser);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "LOGIN_SUCCESS",
        module: "AUTH",
        details: `Successful login for ${user.fullName} (${user.role})`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      token,
    });

    // Set HTTP-only session cookie (expires when browser session ends)
    response.cookies.set("inzovate_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
