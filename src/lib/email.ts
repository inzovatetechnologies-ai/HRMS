import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";

/**
 * Inzovate HRMS — Email & Notification Engine
 * Enterprise Transactional Email Templates & Delivery Pipeline
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  metadata?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  let smtpHost = process.env.SMTP_HOST || "smtppro.zoho.in";
  let smtpPort = Number(process.env.SMTP_PORT) || 465;
  let smtpUser = process.env.SMTP_USER || "hr@inzovate-technologies.com";
  let smtpPass = process.env.SMTP_PASS || "";
  let smtpFrom = process.env.SMTP_FROM || `Inzovate HRMS <${smtpUser}>`;

  // Check database settings
  try {
    const settings = await prisma.companySettings.findUnique({
      where: { id: "inzovate-settings" },
    });
    if (settings) {
      if (!smtpPass && settings.smtpPass) {
        smtpPass = settings.smtpPass;
      }
      if (settings.smtpHost) smtpHost = settings.smtpHost;
      if (settings.smtpPort) smtpPort = settings.smtpPort;
      if (settings.smtpUser) smtpUser = settings.smtpUser;
      if (settings.smtpFrom) smtpFrom = settings.smtpFrom;
    }
  } catch (err) {
    // Ignore fallback to env
  }

  console.log(`[INZOVATE EMAIL QUEUE] Sending to: ${payload.to} | Subject: ${payload.subject} | Host: ${smtpHost}:${smtpPort} | HasPass: ${Boolean(smtpPass)}`);

  if (!smtpPass) {
    console.warn(`[INZOVATE EMAIL WARNING] SMTP password is empty. Email to ${payload.to} simulated only. Set SMTP_PASS in .env or Settings.`);
    return {
      success: false,
      messageId: `sim_${Date.now()}`,
      simulated: true,
      error: "SMTP credentials missing. Please set your SMTP password in .env or Settings.",
    };
  }

  try {
    const isSecure = smtpPort === 465;
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: smtpFrom,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    console.log(`[INZOVATE EMAIL DELIVERED] MessageId: ${info.messageId} to ${payload.to}`);
    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (err: any) {
    console.error(`[INZOVATE EMAIL ERROR] Failed to deliver email to ${payload.to}:`, err.message);
    return {
      success: false,
      error: err.message || "Failed to deliver email via SMTP",
      simulated: false,
    };
  }
}

/**
 * HTML Email Template: Late Attendance Exception Alert
 */
export function buildLateAttendanceEmail(data: {
  employeeName: string;
  employeeId: string;
  department: string;
  date: string;
  scheduledTime: string;
  actualPunchTime: string;
  lateMinutes: number;
  status: string;
  deductionAmount?: number;
  gpsCoords?: { latitude: number; longitude: number; accuracy?: number; locationName?: string };
}): string {
  const mapsUrl = data.gpsCoords
    ? `https://maps.google.com/?q=${data.gpsCoords.latitude},${data.gpsCoords.longitude}`
    : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07152E; color: #E2E8F0; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #0B1F3A; border-radius: 16px; border: 1px solid rgba(40, 197, 246, 0.3); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #071A38 0%, #0F2B5C 50%, #1769FF 100%); padding: 28px 24px; color: #ffffff; text-align: center; border-bottom: 2px solid #28C5F6; }
    .header h2 { margin: 0 0 6px 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; }
    .header p { margin: 0; font-size: 13px; color: #94A3B8; }
    .content { padding: 28px 24px; background: #081B36; }
    .badge { display: inline-block; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: rgba(244, 63, 94, 0.15); color: #FB7185; border: 1px solid rgba(244, 63, 94, 0.4); text-transform: uppercase; }
    .deduction-pill { display: inline-block; padding: 5px 12px; border-radius: 9999px; font-size: 12px; font-weight: 800; background: rgba(239, 68, 68, 0.2); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.5); }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .table td { padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
    .table td:first-child { color: #94A3B8; width: 42%; font-weight: 600; }
    .table td:last-child { font-weight: 700; color: #F8FAFC; }
    .gps-box { background: rgba(40, 197, 246, 0.08); border: 1px solid rgba(40, 197, 246, 0.3); border-radius: 12px; padding: 14px; margin: 18px 0; font-size: 12px; }
    .btn { display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #1769FF, #28C5F6); color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 12px; margin-top: 10px; }
    .footer { padding: 18px 24px; background: #051226; font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.07); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>INZOVATE TECHNOLOGIES</h2>
      <p>AI Shift Compliance Engine • Late Arrival Exception & Salary Deduction Notice</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; color: #CBD5E1;">Hello HR Operations Team,</p>
      <p style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
        An automated late arrival exception has been recorded for <strong style="color: #F8FAFC;">${data.employeeName}</strong> (${data.employeeId}).
        Punch-in occurred past the official <strong style="color: #28C5F6;">09:45 AM IST</strong> grace cutoff under Inzovate workforce policies.
      </p>
      
      <table class="table">
        <tr><td>Employee Name</td><td>${data.employeeName}</td></tr>
        <tr><td>Employee ID</td><td>${data.employeeId}</td></tr>
        <tr><td>Department</td><td>${data.department}</td></tr>
        <tr><td>Date</td><td>${data.date}</td></tr>
        <tr><td>Official Shift Cutoff</td><td>09:45:00 AM IST (09:30 AM Shift Start)</td></tr>
        <tr><td>Actual Punch-In Time</td><td><strong style="color: #F43F5E; font-size: 15px;">${data.actualPunchTime} IST</strong></td></tr>
        <tr><td>Late Delay</td><td><strong style="color: #FB7185;">${data.lateMinutes} minute(s)</strong></td></tr>
        <tr><td>Policy Status</td><td><span class="badge">${data.status}</span></td></tr>
        <tr>
          <td>Auto Salary Deduction</td>
          <td>
            <span class="deduction-pill">
              ₹${(data.deductionAmount || 0).toLocaleString("en-IN")} LOP Penalty
            </span>
          </td>
        </tr>
      </table>

      ${
        data.gpsCoords
          ? `
      <div class="gps-box">
        <div style="font-weight: 800; color: #28C5F6; margin-bottom: 4px;">📍 Live GPS Location Verified</div>
        <div style="color: #E2E8F0;">
          Coordinates: <strong>${data.gpsCoords.latitude.toFixed(6)}, ${data.gpsCoords.longitude.toFixed(6)}</strong>
          ${data.gpsCoords.accuracy ? ` (±${Math.round(data.gpsCoords.accuracy)}m accuracy)` : ""}
        </div>
        <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">
          Zone: ${data.gpsCoords.locationName || "Inzovate Chennai HQ Geofence Radius"}
        </div>
        ${
          mapsUrl
            ? `<a href="${mapsUrl}" target="_blank" class="btn">View Live Punch Location on Google Maps</a>`
            : ""
        }
      </div>`
          : ""
      }

      <p style="font-size: 11px; color: #64748B; margin-top: 20px; line-height: 1.5;">
        <em>Notice: Salary deduction will be automatically factored into this month's payroll processing. The employee may submit a formal regularisation request in the HRMS portal for manager approval.</em>
      </p>
    </div>
    <div class="footer">
      INZOVATE TECHNOLOGIES PRIVATE LIMITED • Autonomous Workforce Intelligence System
    </div>
  </div>
</body>
</html>
`;
}

/**
 * HTML Email Template: Early Departure Exception Alert
 */
export function buildEarlyDepartureEmail(data: {
  employeeName: string;
  employeeId: string;
  department: string;
  date: string;
  scheduledEndTime: string;
  actualPunchOutTime: string;
  earlyMinutes: number;
  workedHours: number;
  durationFormatted: string;
  deductionAmount?: number;
  markedStatus?: string;
  lateMinutes?: number;
  gpsCoords?: { latitude: number; longitude: number; accuracy?: number; locationName?: string };
}): string {
  const mapsUrl = data.gpsCoords
    ? `https://maps.google.com/?q=${data.gpsCoords.latitude},${data.gpsCoords.longitude}`
    : null;

  const isDual = (data.lateMinutes || 0) > 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07152E; color: #E2E8F0; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #0B1F3A; border-radius: 16px; border: 1px solid rgba(245, 158, 11, 0.3); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #071A38 0%, #1A243B 50%, #B45309 100%); padding: 28px 24px; color: #ffffff; text-align: center; border-bottom: 2px solid #F59E0B; }
    .header h2 { margin: 0 0 6px 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; }
    .header p { margin: 0; font-size: 13px; color: #FCD34D; }
    .content { padding: 28px 24px; background: #081B36; }
    .badge { display: inline-block; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.4); text-transform: uppercase; }
    .deduction-pill { display: inline-block; padding: 5px 12px; border-radius: 9999px; font-size: 12px; font-weight: 800; background: rgba(239, 68, 68, 0.2); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.5); }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .table td { padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
    .table td:first-child { color: #94A3B8; width: 42%; font-weight: 600; }
    .table td:last-child { font-weight: 700; color: #F8FAFC; }
    .gps-box { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 14px; margin: 18px 0; font-size: 12px; }
    .btn { display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #D97706, #F59E0B); color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 12px; margin-top: 10px; }
    .footer { padding: 18px 24px; background: #051226; font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.07); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>INZOVATE TECHNOLOGIES</h2>
      <p>AI Shift Compliance Engine • Early Departure Exception & Salary Deduction Notice</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; color: #CBD5E1;">Hello HR Operations Team,</p>
      ${
        isDual
          ? `<div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; color: #FCA5A5; font-size: 13px; font-weight: 700;">
              ⚠️ DUAL SHIFT VIOLATION: Employee arrived late (${data.lateMinutes} mins late) AND left early (${data.earlyMinutes} mins before 5:00 PM). Status marked as ABSENT per Inzovate Shift Policy.
            </div>`
          : `<div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; color: #FCD34D; font-size: 13px; font-weight: 700;">
              ⚠️ EARLY EXIT VIOLATION: Employee exited before 05:00 PM cutoff (${data.earlyMinutes} mins early). Status marked as ${data.markedStatus || "ABSENT"}.
            </div>`
      }
      <p style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
        An automated attendance violation has been recorded for <strong style="color: #F8FAFC;">${data.employeeName}</strong> (${data.employeeId}).
        The employee punched out before the official standard shift end time of <strong style="color: #FBBF24;">${data.scheduledEndTime} IST</strong>.
      </p>
      
      <table class="table">
        <tr><td>Employee Name</td><td>${data.employeeName}</td></tr>
        <tr><td>Employee ID</td><td>${data.employeeId}</td></tr>
        <tr><td>Department</td><td>${data.department}</td></tr>
        <tr><td>Date</td><td>${data.date}</td></tr>
        <tr><td>Final Day Status</td><td><span style="display:inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 900; background: ${data.markedStatus === "PRESENT" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.25)"}; color: ${data.markedStatus === "PRESENT" ? "#6EE7B7" : "#FCA5A5"}; border: 1px solid ${data.markedStatus === "PRESENT" ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)"};">${data.markedStatus || "ABSENT"}</span> ${data.markedStatus === "PRESENT" ? "(Super Admin/HR Override Active)" : "(Absent due to early exit < 5 PM)"}</td></tr>
        <tr><td>Official Shift End Time</td><td>${data.scheduledEndTime} IST</td></tr>
        <tr><td>Actual Punch-Out Time</td><td><strong style="color: #F59E0B; font-size: 15px;">${data.actualPunchOutTime} IST</strong></td></tr>
        <tr><td>Early Departure Time</td><td><span class="badge">${data.earlyMinutes} minute(s) early</span></td></tr>
        ${data.lateMinutes ? `<tr><td>Morning Arrival Delay</td><td><span style="color:#FCA5A5; font-weight:700;">${data.lateMinutes} minute(s) late</span></td></tr>` : ""}
        <tr><td>Total Worked Hours</td><td><strong>${data.durationFormatted}</strong> (${data.workedHours} hrs)</td></tr>
        <tr>
          <td>Auto Salary Deduction</td>
          <td>
            <span class="deduction-pill">
              ₹${(data.deductionAmount || 0).toLocaleString("en-IN")} Pro-Rata LOP
            </span>
          </td>
        </tr>
      </table>

      ${
        data.gpsCoords
          ? `
      <div class="gps-box">
        <div style="font-weight: 800; color: #F59E0B; margin-bottom: 4px;">📍 Live GPS Location Verified</div>
        <div style="color: #E2E8F0;">
          Coordinates: <strong>${data.gpsCoords.latitude.toFixed(6)}, ${data.gpsCoords.longitude.toFixed(6)}</strong>
          ${data.gpsCoords.accuracy ? ` (±${Math.round(data.gpsCoords.accuracy)}m accuracy)` : ""}
        </div>
        <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">
          Zone: ${data.gpsCoords.locationName || "Inzovate Chennai HQ Geofence Radius"}
        </div>
        ${
          mapsUrl
            ? `<a href="${mapsUrl}" target="_blank" class="btn">View Live Punch Location on Google Maps</a>`
            : ""
        }
      </div>`
          : ""
      }

      <p style="font-size: 11px; color: #64748B; margin-top: 20px; line-height: 1.5;">
        <em>Notice: Pro-rata deduction for the unserved shift duration will be automatically recorded in this month's payroll ledger.</em>
      </p>
    </div>
    <div class="footer">
      INZOVATE TECHNOLOGIES PRIVATE LIMITED • Autonomous Workforce Intelligence System
    </div>
  </div>
</body>
</html>
`;
}

/**
 * HTML Email Template: Leave Workflow Decision
 */
export function buildLeaveStatusEmail(data: {
  employeeName: string;
  leaveType: string;
  dates: string;
  status: "APPROVED" | "REJECTED";
  approverRole: string;
  approverName: string;
  comments: string;
}): string {
  const isApproved = data.status === "APPROVED";
  const statusColor = isApproved ? "#16a34a" : "#dc2626";

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #1e3a8a; padding: 20px; color: white; text-align: center; }
    .content { padding: 24px; }
    .status { font-size: 18px; font-weight: bold; color: ${statusColor}; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h3 style="margin: 0;">INZOVATE HRMS — Leave Update</h3>
    </div>
    <div class="content">
      <p>Dear ${data.employeeName},</p>
      <div class="status">Your Leave Request has been ${data.status}</div>
      <p><strong>Leave Type:</strong> ${data.leaveType}</p>
      <p><strong>Dates:</strong> ${data.dates}</p>
      <p><strong>Reviewed By:</strong> ${data.approverName} (${data.approverRole})</p>
      <p><strong>Comments:</strong> ${data.comments || "None"}</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * HTML Email Template: Missing Verification Documents Alert for HR
 */
export function buildDocumentPendingAlertEmail(data: {
  employeeName: string;
  employeeId: string;
  department: string;
  missingDocs: string[];
  daysPending: number;
  dateOfJoining: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #07162F; padding: 24px; color: #E2E8F0; }
    .card { max-width: 600px; margin: 0 auto; background: #0B1E3D; border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.4); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%); padding: 20px 24px; color: white; }
    .content { padding: 24px; line-height: 1.6; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .table td { padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .table td:first-child { color: #94A3B8; width: 40%; }
    .table td:last-child { color: #F8FAFC; font-weight: 600; }
    .pill { display: inline-block; background: rgba(239, 68, 68, 0.2); border: 1px solid #EF4444; color: #FCA5A5; padding: 3px 8px; border-radius: 6px; font-size: 11px; margin: 2px; }
    .footer { padding: 14px 24px; background: #051226; font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.07); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0; font-size: 18px;">⚠️ INZOVATE HRMS — Document Compliance Alert</h2>
      <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Mandatory Employee Onboarding Verification Overdue</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; color: #F8FAFC;">Hello HR Operations Team,</p>
      <p style="font-size: 13px; color: #CBD5E1;">
        The following employee has joined <strong>${data.daysPending} days ago</strong> on <strong>${data.dateOfJoining}</strong>, but has not yet uploaded all mandatory onboarding verification documents:
      </p>

      <table class="table">
        <tr><td>Employee Name</td><td>${data.employeeName}</td></tr>
        <tr><td>Employee ID</td><td>${data.employeeId}</td></tr>
        <tr><td>Department</td><td>${data.department}</td></tr>
        <tr><td>Date of Joining</td><td>${data.dateOfJoining}</td></tr>
        <tr><td>Missing Documents</td><td>
          ${data.missingDocs.map((doc) => `<span class="pill">❌ ${doc}</span>`).join(" ")}
        </td></tr>
      </table>

      <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #EF4444; padding: 12px 16px; border-radius: 8px; margin-top: 16px;">
        <strong style="color: #F87171; font-size: 12px;">Immediate Action Required:</strong>
        <p style="color: #E2E8F0; font-size: 12px; margin: 4px 0 0;">
          Please contact the employee or request document submission through the employee portal to ensure compliance with company statutory and verification audit policies.
        </p>
      </div>
    </div>
    <div class="footer">
      INZOVATE TECHNOLOGIES PRIVATE LIMITED • Automated Onboarding Document Sentinel
    </div>
  </div>
</body>
</html>
`;
}

/**
 * HTML Email Template: Daily 09:45 AM Full-Time Employee Absentee Notice for HR
 */
export function buildFullTimeDailyAbsenteeEmail(data: {
  date: string;
  timeStringIST: string;
  absentCount: number;
  totalActiveStaff: number;
  absentEmployees: Array<{
    name: string;
    employeeId: string;
    department: string;
    designation: string;
    grossSalary?: number;
    lopDeductionEstimate?: number;
  }>;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07152E; color: #E2E8F0; margin: 0; padding: 24px; }
    .card { max-width: 650px; margin: 0 auto; background: #0B1F3A; border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.4); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #DC2626 100%); padding: 28px 24px; color: #ffffff; text-align: center; border-bottom: 2px solid #EF4444; }
    .header h2 { margin: 0 0 6px 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; }
    .header p { margin: 0; font-size: 13px; color: #FECACA; }
    .content { padding: 28px 24px; background: #081B36; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: rgba(239, 68, 68, 0.2); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.5); text-transform: uppercase; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .table th { background: rgba(255,255,255,0.05); text-align: left; padding: 12px 10px; color: #94A3B8; font-weight: 700; border-bottom: 2px solid rgba(255,255,255,0.1); }
    .table td { padding: 12px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); color: #F8FAFC; }
    .footer { padding: 18px 24px; background: #051226; font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.07); }
    .lop-box { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #EF4444; padding: 14px; border-radius: 8px; margin-top: 18px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>INZOVATE TECHNOLOGIES</h2>
      <p>Automated Workforce Intelligence • 09:45 AM Shift Grace Cutoff Absentee Alert</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; color: #CBD5E1;">Dear HR Operations Team (<strong>hr@inzovate-technologies.com</strong>),</p>
      <p style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
        The Inzovate Automated Shift Monitor has completed the daily attendance scan for <strong style="color: #F8FAFC;">${data.date}</strong> at <strong style="color: #28C5F6;">${data.timeStringIST} IST</strong>. 
        Shift start is <strong>09:30 AM IST</strong> with a mandatory grace cutoff at <strong>09:45 AM IST</strong>.
      </p>

      <div style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); border-radius: 10px; padding: 12px 16px; margin: 16px 0; color: #FCA5A5; font-size: 13px; font-weight: 700;">
        ⚠️ <strong>${data.absentCount} of ${data.totalActiveStaff}</strong> active employee(s) have failed to punch in by the 09:45 AM grace cutoff and have been automatically marked as <span class="badge">ABSENT</span> in the database.
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>ID</th>
            <th>Department</th>
            <th>Status</th>
            <th>Est. LOP</th>
          </tr>
        </thead>
        <tbody>
          ${data.absentEmployees
            .map(
              (emp) => `
          <tr>
            <td><strong>${emp.name}</strong><br><span style="font-size: 10px; color: #94A3B8;">${emp.designation}</span></td>
            <td><code style="color: #28C5F6;">${emp.employeeId}</code></td>
            <td>${emp.department}</td>
            <td><span class="badge">ABSENT</span></td>
            <td><span style="color: #FCA5A5; font-weight: 700;">₹${(emp.lopDeductionEstimate || 0).toLocaleString("en-IN")}</span></td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div class="lop-box">
        <strong style="color: #F87171;">Workforce Policy & Payroll Impact:</strong>
        <p style="color: #CBD5E1; margin: 4px 0 0; line-height: 1.5;">
          Under Inzovate Technologies attendance regulations, employees marked ABSENT are subject to 1-Day Loss of Pay (LOP) deduction on their monthly payslip unless an approved regularisation or leave request is filed and authorised by Management / HR.
          <em>(Saturday and Sunday remain protected Company Week-Offs).</em>
        </p>
      </div>
    </div>
    <div class="footer">
      INZOVATE TECHNOLOGIES PRIVATE LIMITED • Autonomous Shift Telemetry Engine
    </div>
  </div>
</body>
</html>
`;
}

/**
 * HTML Email Template: Automated Reminder to Trainer to Allocate Daily Class Schedule (10:30 - 11:00 AM)
 */
export function buildTrainerScheduleReminderEmail(data: {
  trainerName: string;
  internName: string;
  internId: string;
  domain: string;
  date: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07152E; color: #E2E8F0; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #0B1F3A; border-radius: 16px; border: 1px solid rgba(245, 158, 11, 0.4); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #78350F 0%, #B45309 50%, #D97706 100%); padding: 24px; color: #ffffff; text-align: center; border-bottom: 2px solid #F59E0B; }
    .content { padding: 24px; background: #081B36; font-size: 13px; line-height: 1.6; }
    .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #1769FF, #28C5F6); color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 13px; margin: 16px 0; }
    .footer { padding: 16px 24px; background: #051226; font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.07); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0 0 4px 0; font-size: 20px;">INZOVATE ACADEMY</h2>
      <p style="margin: 0; font-size: 12px; color: #FDE68A;">Daily Training Operations • Class Timing Schedule Allocation Pending</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; color: #F8FAFC;">Hello <strong>${data.trainerName}</strong>,</p>
      <p style="color: #CBD5E1;">
        This is an automated reminder that you have not yet allocated today's class schedule for your assigned intern:
      </p>

      <div style="background: rgba(245,158,11,0.1); border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Intern:</strong> ${data.internName} (<code>${data.internId}</code>)</p>
        <p style="margin: 4px 0;"><strong>Domain / Specialization:</strong> ${data.domain}</p>
        <p style="margin: 4px 0;"><strong>Date:</strong> ${data.date}</p>
        <p style="margin: 4px 0;"><strong>Permitted Class Window:</strong> 09:00 AM – 08:00 PM IST (Any 1-3 hour session)</p>
      </div>

      <p style="color: #94A3B8;">
        Please log into the Inzovate HRMS portal and set today's session start and end time so the candidate receives notification and can attend the session on time.
      </p>

      <div style="text-align: center;">
        <a href="http://localhost:3000/internship" class="btn">Allocate Class Schedule in HRMS</a>
      </div>
    </div>
    <div class="footer">
      INZOVATE TECHNOLOGIES PRIVATE LIMITED • Autonomous Academy Operations
    </div>
  </div>
</body>
</html>
`;
}

/**
 * HTML Email Template: Intern 3-Way Absent Intimation (Sent to Candidate, Trainer, and HR)
 */
export function buildIntern3WayAbsentEmail(data: {
  internName: string;
  internId: string;
  domain: string;
  trainerName: string;
  date: string;
  scheduledTime?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07152E; color: #E2E8F0; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #0B1F3A; border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.4); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #B91C1C 100%); padding: 24px; color: #ffffff; text-align: center; border-bottom: 2px solid #EF4444; }
    .content { padding: 24px; background: #081B36; font-size: 13px; line-height: 1.6; }
    .badge-absent { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: rgba(239, 68, 68, 0.2); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.5); text-transform: uppercase; }
    .warning-box { background: rgba(239, 68, 68, 0.12); border-left: 4px solid #EF4444; padding: 14px; border-radius: 8px; margin: 18px 0; color: #FCA5A5; }
    .footer { padding: 16px 24px; background: #051226; font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.07); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0 0 4px 0; font-size: 20px;">INZOVATE ACADEMY</h2>
      <p style="margin: 0; font-size: 12px; color: #FECACA;">Official 3-Way Notification • Internship Class Absence Record</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; color: #F8FAFC;">
        Notice to: <strong>${data.internName}</strong> | Trainer: <strong>${data.trainerName}</strong> | <strong>HR Operations</strong>
      </p>

      <p style="color: #CBD5E1;">
        The candidate <strong style="color: #F8FAFC;">${data.internName}</strong> (ID: <code>${data.internId}</code>) enrolled in <strong>${data.domain}</strong> has <strong style="color: #EF4444;">NOT attended</strong> today's scheduled training session on <strong style="color: #F8FAFC;">${data.date}</strong>${data.scheduledTime ? ` (${data.scheduledTime})` : ""}.
      </p>

      <div style="margin: 12px 0;">
        <strong>Recorded Attendance Status:</strong> <span class="badge-absent">ABSENT</span>
      </div>

      <div class="warning-box">
        <strong style="color: #F87171;">⚠️ Inzovate Academy Attendance Regulations:</strong>
        <ul style="margin: 6px 0 0 16px; padding: 0; line-height: 1.6; color: #CBD5E1;">
          <li>As per institutional policy, <strong>missed classes will NOT be repeated or rescheduled</strong>.</li>
          <li>Attendance is strictly tracked and impacts minimum completion percentage required for internship certification.</li>
          <li>If you have a legitimate emergency, you must submit a prior leave intimation to your Trainer and HR.</li>
        </ul>
      </div>

      <p style="color: #94A3B8; font-size: 12px;">
        This automated 3-way notification has been simultaneously dispatched to the Student, the assigned Trainer, and HR Operations (hr@inzovate-technologies.com).
      </p>
    </div>
    <div class="footer">
      INZOVATE TECHNOLOGIES PRIVATE LIMITED • Autonomous Academy Operations
    </div>
  </div>
</body>
</html>
`;
}

/**
 * HTML Email Template: Intern Prior Leave Intimation Notice
 */
export function buildInternLeaveIntimationEmail(data: {
  internName: string;
  internId: string;
  domain: string;
  trainerName: string;
  date: string;
  reason: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #07152E; color: #E2E8F0; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #0B1F3A; border-radius: 16px; border: 1px solid rgba(40, 197, 246, 0.4); overflow: hidden; }
    .header { background: linear-gradient(135deg, #071A38 0%, #0F2B5C 50%, #1769FF 100%); padding: 24px; color: #ffffff; text-align: center; }
    .content { padding: 24px; font-size: 13px; line-height: 1.6; }
    .footer { padding: 16px 24px; background: #051226; font-size: 11px; color: #64748B; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0; font-size: 20px;">INZOVATE ACADEMY</h2>
      <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Intern Prior Leave Intimation</p>
    </div>
    <div class="content">
      <p>Hello <strong>${data.trainerName}</strong> & <strong>HR Team</strong>,</p>
      <p>The following intern has submitted a prior leave notice that they cannot attend class today:</p>
      <div style="background: rgba(40,197,246,0.1); padding: 14px; border-radius: 8px; margin: 14px 0;">
        <p style="margin: 4px 0;"><strong>Intern:</strong> ${data.internName} (<code>${data.internId}</code>)</p>
        <p style="margin: 4px 0;"><strong>Domain:</strong> ${data.domain}</p>
        <p style="margin: 4px 0;"><strong>Date:</strong> ${data.date}</p>
        <p style="margin: 4px 0;"><strong>Reason:</strong> ${data.reason}</p>
      </div>
      <p style="color: #94A3B8; font-size: 12px;">This session is recorded as Excused Leave with prior intimation.</p>
    </div>
    <div class="footer">
      INZOVATE TECHNOLOGIES PRIVATE LIMITED
    </div>
  </div>
</body>
</html>
`;
}


