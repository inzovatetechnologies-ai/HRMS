/**
 * Inzovate HRMS — Autonomous Background Cron Worker
 * - 09:45 AM IST: Full-Time Employee 09:45 AM Shift Cutoff Scan (Marks Absent & Dispatches HR Email)
 * - 10:30 AM IST: Trainer Daily Class Schedule Allocation Reminder
 * - 08:00 PM IST: Intern 3-Way Absent Intimation (Student + Trainer + HR)
 */

const http = require("http");

console.log("Inzovate Autonomous Background Cron Worker initialized.");

let lastFullTimeScanDate = "";
let lastTrainerReminderDate = "";
let lastInternScanDate = "";

function getISTParts() {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 5.5 * 3600000);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    year: istDate.getFullYear(),
    month: istDate.getMonth() + 1,
    day: istDate.getDate(),
    hours: istDate.getHours(),
    minutes: istDate.getMinutes(),
    seconds: istDate.getSeconds(),
    dayOfWeek: istDate.getDay(), // 0 = Sun, 6 = Sat
    isWeekend: istDate.getDay() === 0 || istDate.getDay() === 6,
    dateString: `${istDate.getFullYear()}-${pad(istDate.getMonth() + 1)}-${pad(istDate.getDate())}`,
    timeString: `${pad(istDate.getHours())}:${pad(istDate.getMinutes())}:${pad(istDate.getSeconds())}`,
  };
}

async function triggerEndpoint(path, method = "POST", body = {}) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(body);
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ raw: data });
          }
        });
      }
    );
    req.on("error", (e) => {
      resolve({ error: e.message });
    });
    req.write(postData);
    req.end();
  });
}

async function tick() {
  const ist = getISTParts();

  // If weekend (Saturday / Sunday), Week-Off policy applies!
  if (ist.isWeekend) {
    return;
  }

  // 1. 09:45 AM IST: Full-Time Employee Absentee Scan
  if (ist.hours === 9 && ist.minutes >= 45 && lastFullTimeScanDate !== ist.dateString) {
    console.log(`[AUTONOMOUS CRON ${ist.timeString} IST] Triggering 09:45 AM Full-Time Employee Absentee Scan...`);
    lastFullTimeScanDate = ist.dateString;
    const res = await triggerEndpoint("/api/attendance/absentee-check", "POST", { targetDate: ist.dateString });
    console.log("[AUTONOMOUS CRON] Full-Time Scan Result:", res);
  }

  // 2. 10:30 AM IST: Trainer Schedule Reminder
  if (ist.hours === 10 && ist.minutes >= 30 && lastTrainerReminderDate !== ist.dateString) {
    console.log(`[AUTONOMOUS CRON ${ist.timeString} IST] Triggering 10:30 AM Trainer Class Schedule Reminder...`);
    lastTrainerReminderDate = ist.dateString;
    const res = await triggerEndpoint("/api/internship/schedule", "POST", { action: "REMIND_TRAINERS" });
    console.log("[AUTONOMOUS CRON] Trainer Reminder Result:", res);
  }

  // 3. 08:00 PM IST (20:00): Intern 3-Way Absent Scan
  if (ist.hours === 20 && ist.minutes >= 0 && lastInternScanDate !== ist.dateString) {
    console.log(`[AUTONOMOUS CRON ${ist.timeString} IST] Triggering 08:00 PM Intern 3-Way Absent Scan...`);
    lastInternScanDate = ist.dateString;
    const res = await triggerEndpoint("/api/internship/absentee-check", "POST", { date: ist.dateString });
    console.log("[AUTONOMOUS CRON] Intern Absentee Result:", res);
  }
}

// Tick every 30 seconds
setInterval(tick, 30000);
tick();
