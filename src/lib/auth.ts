import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "inzovate-hrms-enterprise-secure-jwt-key-2026-production";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department?: string | null;
  designation?: string | null;
  employeeId?: string | null;
}

export const COMPANY_DOMAIN = "inzovate-technologies.com";

// Roles allowed for personal emails
export const EXTERNAL_ROLES = ["INTERN", "STUDENT", "CANDIDATE"];

// Internal company staff roles that require @inzovate-technologies.com
export const INTERNAL_ROLES = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "TEAM_LEAD", "EMPLOYEE"];

export function validateEmailForRole(email: string, role: string): { valid: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();

  // Basic email pattern validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  return { valid: true };
}

export function createToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      designation: user.designation,
      employeeId: user.employeeId,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function hasPermission(userRole: string, allowedRoles: string[]): boolean {
  if (userRole === "SUPER_ADMIN") return true;
  return allowedRoles.includes(userRole);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
