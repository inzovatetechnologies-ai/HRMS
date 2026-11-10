# Inzovate AI HRMS — Enterprise Platform

**Company:** INZOVATE TECHNOLOGIES PRIVATE LIMITED  
**Tagline:** One Platform. Every People Operation. Intelligent Automation.  
**Jurisdiction / Currency / Timezone:** India | INR (₹) | Asia/Kolkata (IST)

---

## Quick Start
```bash
# 1. Install & configure dependencies
npm install

# 2. Setup SQLite Database & Seed Data
npx prisma db push
node prisma/seed.js

# 3. Run Automated Tests
Get-ChildItem tests/*.test.js | ForEach-Object { node --test $_.FullName }

# 4. Start Development Server
npm run dev
```

Visit: **http://localhost:3000**

## Quick Test Personas
- **Super Admin:** `admin@inzovate-technologies.com` (Password: `Inzovate@2026`)
- **HR Head:** `hr@inzovate-technologies.com` (Password: `Inzovate@2026`)
- **Team Lead:** `karthik.tl@inzovate-technologies.com` (Password: `Inzovate@2026`)
- **Employee:** `ananya.sharma@inzovate-technologies.com` (Password: `Inzovate@2026`)
- **Intern:** `rahul.intern@gmail.com` (Password: `Inzovate@2026`)

## Core Features
1. **Attendance Engine:** Standard 09:30 AM IST start, inclusive 09:45 AM IST grace cutoff, automated late arrival email alerts to TL & HR, marked absent by default policy, test clock QA simulator.
2. **Indian Statutory Payroll:** EPF 12% statutory cap, ESIC (Gross <= 21,000), State Professional Tax, TDS withholding, and Loss of Pay (LOP) calculations. 1-click branded PDF payslip downloads.
3. **Multi-Level Leave Workflow:** Employee -> Team Leader (L1) -> HR Head (L2 Final). Balance deductions upon final approval.
4. **Internship Management & Financials:** 60+ domain catalog, installment tracking, remaining balance formula, receipt generation, eligibility verification.
5. **Certificates & Letters Generator:** Branded PDF generation with cryptographic verification tokens and QR code validation.
6. **Inzovate AI Voice Copilot:** Multilingual voice assistant (Tamil தமிழ் & English) with voice navigation, live DB stats queries, and confirmation gates.
7. **Recruitment & ATS:** Job requisitions, candidate pipeline Kanban stages.
8. **Organisational Chart:** Dynamic hierarchy tree.
9. **Internal Team Chat:** Real-time channels and company announcements.
10. **Modules Hub:** Expenses, IT Assets, Helpdesk tickets, and AI Policy Handbook Q&A.
