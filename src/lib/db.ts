import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

declare global {
  var prisma: PrismaClient | undefined;
}

function resolveDatabaseUrl(): string {
  // If an external database URL is explicitly provided (Postgres, Supabase, etc.)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  // On Vercel / AWS Lambda, the filesystem at /var/task is read-only.
  // We copy the bundled prisma/dev.db to /tmp/dev.db where read and write are permitted.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", "dev.db");

    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.join(__dirname, "..", "..", "prisma", "dev.db"),
        path.join(__dirname, "prisma", "dev.db"),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`[DB INIT] Successfully cloned dev.db from ${candidate} to ${tmpDbPath}`);
            break;
          } catch (err) {
            console.warn(`[DB INIT] Failed copying database from ${candidate}:`, err);
          }
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // Local development fallback
  const localCandidates = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "dev.db"),
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
