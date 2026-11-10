#!/usr/bin/env node

/**
 * Inzovate HRMS — Database Backup and Recovery Script
 * Usage: node scripts/backup-db.js [backup|restore] [backup_file]
 */

const fs = require("fs");
const path = require("path");

const action = process.argv[2] || "backup";
const backupDir = path.join(__dirname, "..", "backups");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const dbPath = path.join(__dirname, "..", "prisma", "dev.db");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const defaultBackupPath = path.join(backupDir, `inzovate_db_backup_${timestamp}.db`);

if (action === "backup") {
  if (!fs.existsSync(dbPath)) {
    console.error(`Database file not found at ${dbPath}`);
    process.exit(1);
  }

  fs.copyFileSync(dbPath, defaultBackupPath);
  console.log(`\x1b[32m✔ Database backed up successfully!\x1b[0m`);
  console.log(`Backup Destination: ${defaultBackupPath}`);
  console.log(`Size: ${(fs.statSync(defaultBackupPath).size / 1024).toFixed(2)} KB`);
} else if (action === "restore") {
  const targetBackup = process.argv[3];
  if (!targetBackup || !fs.existsSync(targetBackup)) {
    console.error("Please provide a valid backup file path to restore.");
    process.exit(1);
  }

  fs.copyFileSync(targetBackup, dbPath);
  console.log(`\x1b[32m✔ Database restored successfully from ${targetBackup}!\x1b[0m`);
} else {
  console.log("Unknown action. Use 'backup' or 'restore'.");
}
