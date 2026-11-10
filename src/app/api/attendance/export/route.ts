import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { calculateEmployeeAttendanceReport, getISTTimeParts } from "@/lib/attendance";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

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
    const employeeId = searchParams.get("employeeId") || session.employeeId;
    const istNow = getISTTimeParts();
    const month = parseInt(searchParams.get("month") || String(istNow.month), 10);
    const year = parseInt(searchParams.get("year") || String(istNow.year), 10);
    const format = (searchParams.get("format") || "json").toLowerCase();

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const report = await calculateEmployeeAttendanceReport(employeeId, month, year);
    if (!report) {
      return NextResponse.json({ error: `Employee ${employeeId} not found.` }, { status: 404 });
    }

    const filenameBase = `Inzovate_Attendance_${report.employee.employeeId}_${report.period.monthName}_${year}`;

    // 1. Excel (.xlsx) Export
    if (format === "excel" || format === "xlsx") {
      const summaryRows = [
        { "Metric / Attribute": "Company Name", "Value": "INZOVATE TECHNOLOGIES PRIVATE LIMITED" },
        { "Metric / Attribute": "Employee Name", "Value": report.employee.name },
        { "Metric / Attribute": "Employee ID", "Value": report.employee.employeeId },
        { "Metric / Attribute": "Department", "Value": report.employee.department },
        { "Metric / Attribute": "Designation", "Value": report.employee.designation },
        { "Metric / Attribute": "Report Period", "Value": `${report.period.monthName} ${year}` },
        { "Metric / Attribute": "Gross Salary (Monthly)", "Value": `INR ${report.employee.grossSalary.toLocaleString("en-IN")}` },
        { "Metric / Attribute": "Daily Gross Rate", "Value": `INR ${report.employee.dailyGross.toLocaleString("en-IN")}` },
        { "Metric / Attribute": "Total Days in Month", "Value": report.period.totalDaysInMonth },
        { "Metric / Attribute": "Company Week-Offs (Sat/Sun)", "Value": report.period.weekOffCount },
        { "Metric / Attribute": "Standard Working Days", "Value": report.period.standardWorkingDays },
        { "Metric / Attribute": "Days Present", "Value": report.summary.presentCount },
        { "Metric / Attribute": "Days Late", "Value": report.summary.lateCount },
        { "Metric / Attribute": "Days Absent", "Value": report.summary.absentCount },
        { "Metric / Attribute": "Total Worked Hours", "Value": report.summary.totalWorkedHours },
        { "Metric / Attribute": "Estimated Loss of Pay (LOP)", "Value": `INR ${report.summary.lopDeduction.toLocaleString("en-IN")}` },
        { "Metric / Attribute": "Estimated Net Payable Salary", "Value": `INR ${report.summary.estimatedNet.toLocaleString("en-IN")}` },
      ];

      const dailyRows = report.dailyBreakdown.map((d) => ({
        "Date": d.date,
        "Day": d.dayOfWeek,
        "Classification": d.isWeekend ? "Week-Off (Weekend)" : "Workday",
        "Punch In (IST)": d.punchIn || "-",
        "Punch Out (IST)": d.punchOut || "-",
        "Hours Worked": d.workedHours > 0 ? d.workedHours.toFixed(2) : "0.00",
        "Attendance Status": d.status,
        "Notes / Exception": d.notes || "",
      }));

      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      const wsDaily = XLSX.utils.json_to_sheet(dailyRows);

      XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");
      XLSX.utils.book_append_sheet(wb, wsDaily, "Daily Attendance Ledger");

      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filenameBase}.xlsx"`,
        },
      });
    }

    // 2. PDF Export
    if (format === "pdf") {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Branded Header
      doc.setFillColor(7, 21, 46); // #07152E
      doc.rect(0, 0, 210, 36, "F");

      doc.setTextColor(40, 197, 246); // #28C5F6
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("INZOVATE TECHNOLOGIES PRIVATE LIMITED", 14, 14);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Official Employee Monthly Attendance & Statutory Compliance Dossier", 14, 22);
      doc.text(`Period: ${report.period.monthName} ${year} | Generated: ${istNow.dateString} ${istNow.timeString} IST`, 14, 28);

      // Employee Information Box
      doc.setFillColor(245, 247, 250);
      doc.rect(14, 42, 182, 28, "F");
      doc.setDrawColor(200, 210, 225);
      doc.rect(14, 42, 182, 28, "S");

      doc.setTextColor(20, 30, 50);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Employee Name:", 18, 48);
      doc.text("Employee ID:", 18, 54);
      doc.text("Department:", 18, 60);
      doc.text("Designation:", 18, 66);

      doc.setFont("helvetica", "normal");
      doc.text(report.employee.name, 50, 48);
      doc.text(report.employee.employeeId, 50, 54);
      doc.text(report.employee.department, 50, 60);
      doc.text(report.employee.designation, 50, 66);

      doc.setFont("helvetica", "bold");
      doc.text("Gross Salary:", 115, 48);
      doc.text("Standard Workdays:", 115, 54);
      doc.text("Days Present:", 115, 60);
      doc.text("Days Absent (LOP):", 115, 66);

      doc.setFont("helvetica", "normal");
      doc.text(`INR ${report.employee.grossSalary.toLocaleString("en-IN")}`, 155, 48);
      doc.text(`${report.period.standardWorkingDays} Days`, 155, 54);
      doc.text(`${report.summary.presentCount} Days (${report.summary.lateCount} Late)`, 155, 60);
      doc.text(`${report.summary.absentCount} Days (LOP: INR ${report.summary.lopDeduction.toLocaleString("en-IN")})`, 155, 66);

      // Financial LOP summary banner
      doc.setFillColor(239, 246, 255);
      doc.rect(14, 74, 182, 10, "F");
      doc.setTextColor(30, 64, 175);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Week-Off Policy: Saturday & Sunday are Protected Week-Offs (${report.period.weekOffCount} days). Net Payable Est: INR ${report.summary.estimatedNet.toLocaleString("en-IN")}`,
        18,
        80.5
      );

      // Daily Breakdown Table Header
      let y = 92;
      doc.setFillColor(15, 43, 92);
      doc.rect(14, y, 182, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Date", 16, y + 5);
      doc.text("Day", 38, y + 5);
      doc.text("Punch In", 65, y + 5);
      doc.text("Punch Out", 92, y + 5);
      doc.text("Hours", 120, y + 5);
      doc.text("Status", 140, y + 5);
      doc.text("Notes", 165, y + 5);

      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);

      report.dailyBreakdown.forEach((row, idx) => {
        if (y > 275) {
          doc.addPage();
          y = 15;
          doc.setFillColor(15, 43, 92);
          doc.rect(14, y, 182, 7, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text("Date", 16, y + 5);
          doc.text("Day", 38, y + 5);
          doc.text("Punch In", 65, y + 5);
          doc.text("Punch Out", 92, y + 5);
          doc.text("Hours", 120, y + 5);
          doc.text("Status", 140, y + 5);
          doc.text("Notes", 165, y + 5);
          y += 7;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
        }

        // Row background
        if (row.isWeekend) {
          doc.setFillColor(248, 250, 252); // soft gray for weekend
        } else if (row.status === "ABSENT") {
          doc.setFillColor(254, 242, 242); // soft red
        } else if (idx % 2 === 0) {
          doc.setFillColor(255, 255, 255);
        } else {
          doc.setFillColor(245, 248, 255);
        }
        doc.rect(14, y, 182, 5.5, "F");

        // Row text
        doc.setTextColor(50, 60, 75);
        doc.text(row.date, 16, y + 4);
        doc.text(row.dayOfWeek.slice(0, 3), 38, y + 4);
        doc.text(row.punchIn || "-", 65, y + 4);
        doc.text(row.punchOut || "-", 92, y + 4);
        doc.text(row.workedHours > 0 ? `${row.workedHours.toFixed(1)}h` : "-", 120, y + 4);

        if (row.status === "ABSENT") {
          doc.setTextColor(220, 38, 38);
          doc.setFont("helvetica", "bold");
          doc.text("ABSENT", 140, y + 4);
        } else if (row.status === "PRESENT") {
          doc.setTextColor(22, 163, 74);
          doc.setFont("helvetica", "bold");
          doc.text("PRESENT", 140, y + 4);
        } else if (row.status === "WEEK_OFF") {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
          doc.text("WEEK OFF", 140, y + 4);
        } else {
          doc.setTextColor(70, 80, 95);
          doc.setFont("helvetica", "normal");
          doc.text(row.status, 140, y + 4);
        }

        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        const noteShort = (row.notes || "").slice(0, 20);
        doc.text(noteShort, 165, y + 4);

        y += 5.5;
      });

      // Footer notice
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Inzovate Technologies • CIN: U62011TZ2025PTC036329 • Autonomous Workforce Platform", 14, 290);

      const pdfBytes = doc.output("arraybuffer");
      return new NextResponse(pdfBytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
        },
      });
    }

    // Default: JSON response
    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error("Attendance export error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate attendance report." }, { status: 500 });
  }
}
