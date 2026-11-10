const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Inzovate HRMS Database...");

  // Default company password
  const defaultPasswordHash = await bcrypt.hash("Inzovate@2026", 10);

  // 1. Company Settings
  await prisma.companySettings.upsert({
    where: { id: "inzovate-settings" },
    update: {},
    create: {
      id: "inzovate-settings",
      companyName: "INZOVATE TECHNOLOGIES PRIVATE LIMITED",
      tagline: "One Platform. Every People Operation. Intelligent Automation.",
      businessEmailDomain: "inzovate-technologies.com",
      workStartTime: "09:30",
      gracePeriodEndTime: "09:45",
      workEndTime: "17:00",
      timezone: "Asia/Kolkata",
      currency: "INR",
      smtpHost: "smtp.inzovate-technologies.com",
      smtpPort: 587,
      smtpUser: "hr@inzovate-technologies.com",
      smtpFrom: "Inzovate HRMS <hr@inzovate-technologies.com>",
      smtpSecure: true,
      aiApiKeyConfigured: true,
      theme: "light",
    },
  });

  // 2. Users & Employees
  const usersData = [
    {
      email: "admin@inzovate-technologies.com",
      fullName: "Sundar Rajan",
      role: "SUPER_ADMIN",
      department: "Executive Leadership",
      designation: "Managing Director & Super Admin",
      phone: "+91 98765 43210",
      empId: "INZ-EMP-1001",
      firstName: "Sundar",
      lastName: "Rajan",
      joining: "2023-01-15",
      basic: 120000,
      hra: 60000,
      special: 40000,
    },
    {
      email: "hr@inzovate-technologies.com",
      fullName: "Deepa Meenakshi",
      role: "HR_MANAGER",
      department: "Human Resources",
      designation: "Head of People Operations",
      phone: "+91 98765 43211",
      empId: "INZ-EMP-1002",
      firstName: "Deepa",
      lastName: "Meenakshi",
      joining: "2023-03-01",
      basic: 65000,
      hra: 32500,
      special: 22500,
    },
    {
      email: "karthik.tl@inzovate-technologies.com",
      fullName: "Karthik Subramanian",
      role: "TEAM_LEAD",
      department: "Engineering",
      designation: "Technical Lead",
      phone: "+91 98765 43212",
      empId: "INZ-EMP-1003",
      firstName: "Karthik",
      lastName: "Subramanian",
      joining: "2023-06-10",
      basic: 55000,
      hra: 27500,
      special: 17500,
    },
    {
      email: "ananya.sharma@inzovate-technologies.com",
      fullName: "Ananya Sharma",
      role: "EMPLOYEE",
      department: "Engineering",
      designation: "Senior Full Stack Engineer",
      phone: "+91 98765 43213",
      empId: "INZ-EMP-1004",
      firstName: "Ananya",
      lastName: "Sharma",
      joining: "2024-01-08",
      reportingToId: "INZ-EMP-1003",
      reportingToName: "Karthik Subramanian",
      basic: 45000,
      hra: 22500,
      special: 12500,
    },
    {
      email: "vijay.kumar@inzovate-technologies.com",
      fullName: "Vijay Kumar",
      role: "EMPLOYEE",
      department: "Engineering",
      designation: "Backend & Cloud Engineer",
      phone: "+91 98765 43214",
      empId: "INZ-EMP-1005",
      firstName: "Vijay",
      lastName: "Kumar",
      joining: "2024-04-15",
      reportingToId: "INZ-EMP-1003",
      reportingToName: "Karthik Subramanian",
      basic: 40000,
      hra: 20000,
      special: 10000,
    },
    {
      email: "priya.nair@inzovate-technologies.com",
      fullName: "Priya Nair",
      role: "EMPLOYEE",
      department: "Design & Product",
      designation: "Lead UI/UX Designer",
      phone: "+91 98765 43215",
      empId: "INZ-EMP-1006",
      firstName: "Priya",
      lastName: "Nair",
      joining: "2024-02-01",
      reportingToId: "INZ-EMP-1003",
      reportingToName: "Karthik Subramanian",
      basic: 42000,
      hra: 21000,
      special: 12000,
    },
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, fullName: u.fullName },
      create: {
        email: u.email,
        passwordHash: defaultPasswordHash,
        fullName: u.fullName,
        role: u.role,
        department: u.department,
        designation: u.designation,
        phone: u.phone,
        emailVerified: true,
      },
    });

    const gross = u.basic + u.hra + u.special + 3000;
    await prisma.employee.upsert({
      where: { employeeId: u.empId },
      update: {},
      create: {
        employeeId: u.empId,
        userId: user.id,
        firstName: u.firstName,
        lastName: u.lastName,
        companyEmail: u.email,
        phone: u.phone,
        department: u.department,
        designation: u.designation,
        reportingToId: u.reportingToId || null,
        reportingToName: u.reportingToName || null,
        dateOfJoining: u.joining,
        employmentType: "Full-time",
        employmentStatus: "Active",
        workLocation: "Chennai Headquarters",
        panNumber: "ABCDE1234F",
        aadhaarNumber: "XXXX-XXXX-8921",
        bankAccount: "918237461928",
        bankIfsc: "HDFC0001234",
        bankName: "HDFC Bank",
        pfNumber: "TN/CHN/12345/678",
        uanNumber: "101234567890",
        esiNumber: "31000123450000001",
        basicSalary: u.basic,
        hra: u.hra,
        specialAllowance: u.special,
        conveyance: 3000,
        grossSalary: gross,
      },
    });

    // Leave Balance
    await prisma.leaveBalance.upsert({
      where: { employeeId_year: { employeeId: u.empId, year: 2026 } },
      update: {},
      create: {
        employeeId: u.empId,
        year: 2026,
        casualLeave: 12,
        sickLeave: 10,
        earnedLeave: 15,
        maternityLeave: 180,
        paternityLeave: 15,
        unpaidLeaveUsed: 0,
        wfhAvailable: 24,
      },
    });
  }

  // 3. Intern Users (Personal emails)
  const internUsers = [
    {
      email: "rahul.intern@gmail.com",
      fullName: "Rahul Varma",
      internId: "INZ-INT-2026-001",
      college: "Anna University, Chennai",
      degree: "B.Tech Computer Science",
      domain: "Full Stack Web Development",
      mentor: "Karthik Subramanian",
      totalFee: 15000,
      paid: 10000,
      balance: 5000,
      status: "PARTIAL",
      certStatus: "NOT_ELIGIBLE",
      attendance: 88,
      assignDone: 75,
    },
    {
      email: "sneha.data@gmail.com",
      fullName: "Sneha Ramakrishnan",
      internId: "INZ-INT-2026-002",
      college: "PSG College of Technology, Coimbatore",
      degree: "B.E Artificial Intelligence",
      domain: "AI & Machine Learning Engineering",
      mentor: "Deepa Meenakshi",
      totalFee: 18000,
      paid: 18000,
      balance: 0,
      status: "COMPLETED",
      certStatus: "ELIGIBLE",
      attendance: 96,
      assignDone: 100,
      projectTitle: "Voice-Assisted Enterprise Knowledge Search",
      projectUrl: "https://github.com/inzovate-interns/ai-voice-copilot",
    },
    {
      email: "praveen.cloud@gmail.com",
      fullName: "Praveen Chandran",
      internId: "INZ-INT-2026-003",
      college: "SSN College of Engineering, Chennai",
      degree: "B.Tech Information Technology",
      domain: "Cloud Computing & DevOps",
      mentor: "Vijay Kumar",
      totalFee: 16000,
      paid: 16000,
      balance: 0,
      status: "COMPLETED",
      certStatus: "ISSUED",
      attendance: 92,
      assignDone: 90,
      certNumber: "INZ-CERT-2026-0089",
    },
  ];

  for (const it of internUsers) {
    await prisma.user.upsert({
      where: { email: it.email },
      update: {},
      create: {
        email: it.email,
        passwordHash: defaultPasswordHash,
        fullName: it.fullName,
        role: "INTERN",
        emailVerified: true,
      },
    });

    const createdIntern = await prisma.internship.upsert({
      where: { internId: it.internId },
      update: {},
      create: {
        internId: it.internId,
        fullName: it.fullName,
        personalEmail: it.email,
        phone: "+91 97890 12345",
        college: it.college,
        degree: it.degree,
        graduationYear: 2026,
        domain: it.domain,
        batch: "Batch-2026-Q1",
        mentor: it.mentor,
        startDate: "2026-01-05",
        endDate: "2026-04-05",
        durationWeeks: 12,
        workMode: "Hybrid",
        internshipType: "Paid",
        totalFee: it.totalFee,
        discount: 0,
        amountPaid: it.paid,
        remainingBalance: it.balance,
        paymentStatus: it.status,
        attendancePercentage: it.attendance,
        assignmentCompletion: it.assignDone,
        assessmentScore: 92,
        projectTitle: it.projectTitle || null,
        projectUrl: it.projectUrl || null,
        certificateStatus: it.certStatus,
        certificateNumber: it.certNumber || null,
        status: "ACTIVE",
      },
    });

    if (it.paid > 0) {
      await prisma.internshipPayment.create({
        data: {
          internshipId: createdIntern.id,
          amount: it.paid,
          paymentDate: "2026-01-05",
          paymentMode: "UPI",
          transactionRef: `UPI-REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
          receiptNumber: `INZ-RCP-${Math.floor(1000 + Math.random() * 9000)}`,
          verifiedBy: "hr@inzovate-technologies.com",
          notes: "Initial enrollment installment confirmed",
        },
      });
    }
  }

  // 4. Candidate Portal Users
  const candidateUser = await prisma.user.upsert({
    where: { email: "arun.candidate@gmail.com" },
    update: {},
    create: {
      email: "arun.candidate@gmail.com",
      passwordHash: defaultPasswordHash,
      fullName: "Arun Swaminathan",
      role: "CANDIDATE",
      emailVerified: true,
    },
  });

  // 5. Job Postings & Candidates
  const job = await prisma.jobPosting.create({
    data: {
      title: "Senior Full-Stack Engineer (React & Node.js)",
      department: "Engineering",
      location: "Chennai / Hybrid",
      type: "Full-Time",
      experienceLevel: "3-5 years",
      salaryRange: "₹9,00,000 - ₹14,00,000 LPA",
      description: "Building scalable people-operations software and AI assistants for enterprise clients.",
      requirements: "Proficiency in Next.js, TypeScript, PostgreSQL, REST APIs, and Cloud architecture.",
      status: "OPEN",
    },
  });

  await prisma.candidate.create({
    data: {
      jobPostingId: job.id,
      fullName: "Arun Swaminathan",
      email: "arun.candidate@gmail.com",
      phone: "+91 98401 23456",
      currentStage: "SHORTLISTED",
      rating: 4,
      interviewDate: "2026-10-15 11:00 AM",
      interviewNotes: "Strong background in Next.js full-stack and Postgres design.",
    },
  });

  // 6. Attendance Records (Testing Boundary: On-Time vs Late vs Absent)
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  
  // Ananya Sharma: On-time punch at 09:34 AM IST
  const ananyaPunchIn = new Date(`${today}T04:04:00.000Z`); // 09:34 AM IST (UTC + 5:30)
  await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: "INZ-EMP-1004", date: today } },
    update: {},
    create: {
      employeeId: "INZ-EMP-1004",
      date: today,
      punchInTime: ananyaPunchIn,
      workedHours: 4.5,
      lateMinutes: 0,
      status: "PRESENT",
      punchInNotes: "Punched in via Web Portal",
    },
  });

  // Vijay Kumar: Late punch at 09:52 AM IST (> 09:45 AM grace period cutoff) -> Marked ABSENT under default policy!
  const vijayPunchIn = new Date(`${today}T04:22:00.000Z`); // 09:52 AM IST
  await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: "INZ-EMP-1005", date: today } },
    update: {},
    create: {
      employeeId: "INZ-EMP-1005",
      date: today,
      punchInTime: vijayPunchIn,
      workedHours: 3.8,
      lateMinutes: 7, // 7 mins past 9:45 grace period
      status: "ABSENT",
      punchInNotes: "Late punch recorded accurately (09:52 AM IST). Marked Absent per company policy.",
      regularizationStatus: "PENDING",
      regularizationReason: "Metro train delay on Blue Line.",
    },
  });

  // 7. Leave Requests
  await prisma.leaveRequest.create({
    data: {
      employeeId: "INZ-EMP-1006", // Priya Nair
      leaveType: "Casual Leave",
      startDate: "2026-10-20",
      endDate: "2026-10-21",
      totalDays: 2,
      reason: "Family function in hometown (Kochi)",
      status: "PENDING_HR",
      tlApprovalStatus: "APPROVED",
      tlComments: "Approved by Karthik. Team coverage arranged.",
      tlApprovedAt: new Date(),
    },
  });

  // 8. Certificate for Praveen
  await prisma.certificate.upsert({
    where: { certificateNumber: "INZ-CERT-2026-0089" },
    update: {},
    create: {
      certificateNumber: "INZ-CERT-2026-0089",
      type: "INTERNSHIP_COMPLETION",
      recipientName: "Praveen Chandran",
      recipientEmail: "praveen.cloud@gmail.com",
      recipientId: "INZ-INT-2026-003",
      domainOrDept: "Cloud Computing & DevOps",
      duration: "12 Weeks (Jan 2026 - Apr 2026)",
      issueDate: "2026-04-10",
      verificationToken: "VERIFY-INZ-98213-CC",
      qrCodeData: "https://hrms.inzovate-technologies.com/verify?token=VERIFY-INZ-98213-CC",
      status: "ACTIVE",
      issuedBy: "Deepa Meenakshi, HR Head",
    },
  });

  // 9. Initial Tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Complete Q3 Indian Statutory Tax (TDS) Filing",
        description: "Verify quarterly TDS deductions and prepare Form 24Q for review.",
        assignedTo: "Deepa Meenakshi",
        assignedBy: "Sundar Rajan",
        priority: "HIGH",
        status: "IN_PROGRESS",
        dueDate: "2026-10-25",
        project: "Statutory Compliance",
      },
      {
        title: "Integrate Tamil Language Voice Intent Model",
        description: "Benchmark speech recognition accuracy for Tamil phrases in voice copilot.",
        assignedTo: "Ananya Sharma",
        assignedBy: "Karthik Subramanian",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        dueDate: "2026-10-28",
        project: "Inzovate AI Copilot",
      },
    ],
  });

  // 10. Chat Messages
  await prisma.chatMessage.createMany({
    data: [
      {
        senderId: "admin@inzovate-technologies.com",
        senderName: "Sundar Rajan",
        senderRole: "SUPER_ADMIN",
        channel: "ANNOUNCEMENTS",
        message: "Welcome team to Inzovate HRMS! All attendance, leave workflows, and payslips are now live. Please review your profile.",
      },
      {
        senderId: "hr@inzovate-technologies.com",
        senderName: "Deepa Meenakshi",
        senderRole: "HR_MANAGER",
        channel: "ANNOUNCEMENTS",
        message: "Reminder: Standard shift start is 09:30 AM IST with inclusive grace period up to 09:45 AM IST.",
      },
    ],
  });

  // 11. Notifications
  await prisma.notification.create({
    data: {
      userId: (await prisma.user.findUnique({ where: { email: "hr@inzovate-technologies.com" } })).id,
      title: "Late Arrival Alert — Vijay Kumar",
      message: "Vijay Kumar punched in at 09:52 AM IST (7 mins late). Marked Absent per company policy.",
      type: "ATTENDANCE",
      link: "/attendance",
    },
  });

  // 12. Audit Log
  await prisma.auditLog.create({
    data: {
      userEmail: "system@inzovate-technologies.com",
      action: "INITIAL_SEED",
      module: "SYSTEM",
      details: "Initial enterprise master dataset populated successfully.",
      ipAddress: "127.0.0.1",
    },
  });

  console.log("Database seeded successfully with authentic Inzovate enterprise records!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
