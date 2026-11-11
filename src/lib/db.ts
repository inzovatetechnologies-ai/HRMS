import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import { DB_BASE64 } from "./db-bundle";

declare global {
  var prisma: PrismaClient | undefined;
}

function resolveDatabaseUrl(): string {
  // If an external database URL is explicitly provided (Postgres, Supabase, etc.)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  // On Vercel / AWS Lambda, the filesystem at /var/task is read-only.
  // We unpack the bundled dev.db directly into /tmp/dev.db where read and write are fully permitted.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
        if (DB_BASE64 && DB_BASE64.length > 0) {
          const buffer = Buffer.from(DB_BASE64, "base64");
          fs.writeFileSync(tmpDbPath, buffer);
          console.log(`[DB INIT] Extracted ${buffer.length} bytes from db-bundle to ${tmpDbPath}`);
        }
      }
    } catch (err) {
      console.error("[DB INIT] Error extracting bundled db to /tmp:", err);
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // Local development fallback
  const localCandidates = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "dev.db"),
    path.join("/tmp", "dev.db"),
  ];

  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      return `file:${candidate}`;
    }
  }

  return process.env.DATABASE_URL || "file:./prisma/dev.db";
}

const dbUrl = resolveDatabaseUrl();

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
