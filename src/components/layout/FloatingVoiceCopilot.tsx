"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  ArrowRight,
  Send,
  Minimize2,
  Maximize2,
  CheckCircle2,
  Compass,
  Clock,
  Layers,
  AlertCircle,
  Move,
  GripHorizontal,
  Bot,
  Cpu,
  Zap,
  Building2,
  GitBranch,
} from "lucide-react";
import { resolveVoiceIntent } from "@/lib/voice";

// Client-side quick directory for instant zero-latency routing
const CLIENT_ROUTES = [
  {
    route: "/org-chart",
    name: "Organization Hierarchy",
    nameTa: "நிறுவன படிநிலை வரைபடம்",
    keys: [
      "org chart", "org", "hierarchy", "chart", "structure", "tree", "reporting",
      "படிநிலை", "நிறுவன வரைபடம்", "ஆர்க் சார்ட்", "org-chart", "organization", "தலைமை",
      "gokul", "mousik", "vasanth", "marimuthu", "hr manager", "prem", "periyanna", "founder", "managing director", "ceo", "cmo"
    ],
  },
  {
    route: "/dashboard",
    name: "Executive Dashboard",
    nameTa: "முதன்மை முகப்பு",
    keys: ["dashboard", "home", "main", "overview", "hq", "டேஷ்போர்டு", "டேஷ்போர்ட்", "முகப்பு", "ஹோம்"],
  },
  {
    route: "/attendance",
    name: "Attendance & Punch",
    nameTa: "பணி வருகை பதிவு",
    keys: ["attendance", "punch", "clock", "shift", "checkin", "அட்டென்டன்ஸ்", "வருகை", "பஞ்ச்"],
  },
  {
    route: "/internship",
    name: "Internship Management",
    nameTa: "இன்டர்ன்ஷிப் மேலாண்மை",
    keys: ["intern", "interns", "internship", "students", "இன்டர்ன்ஷிப்", "இன்டர்ன்"],
  },
  {
    route: "/internship/finance",
    name: "Internship Finance Ledger",
    nameTa: "இன்டர்ன்ஷிப் நிதி",
    keys: ["finance", "fees", "fee", "ledger", "கட்டணம்", "நிதி"],
  },
  {
    route: "/employees",
    name: "Employee Master Directory",
    nameTa: "பணியாளர்கள் பட்டியல்",
    keys: ["employee", "employees", "staff", "directory", "people", "பணியாளர்", "பணியாளர்கள்", "ஊழியர்"],
  },
  {
    route: "/payroll",
    name: "Statutory Payroll",
    nameTa: "சம்பளக் கணக்கீடு",
    keys: ["payroll", "salary", "பேரோல்", "சம்பளம்"],
  },
  {
    route: "/payroll/payslips",
    name: "Employee Payslips",
    nameTa: "சம்பளச் சீட்டு",
    keys: ["payslip", "payslips", "slip", "பேஸ்லிப்", "சம்பள சீட்டு"],
  },
  {
    route: "/leave",
    name: "Leave Approvals",
    nameTa: "விடுப்பு விண்ணப்பங்கள்",
    keys: ["leave", "leaves", "vacation", "holiday", "லீவ்", "விடுப்பு"],
  },
  {
    route: "/recruitment",
    name: "Recruitment ATS",
    nameTa: "ஆட்சேர்ப்பு மேலாண்மை",
    keys: ["recruitment", "ats", "jobs", "hiring", "ஆட்சேர்ப்பு", "வேலை"],
  },
  {
    route: "/performance",
    name: "Performance & OKRs",
    nameTa: "செயல்திறன் மதிப்பாய்வு",
    keys: ["performance", "okr", "kpi", "appraisal", "செயல்திறன்", "மதிப்பாய்வு"],
  },
  {
    route: "/certificates",
    name: "Certificates & Letters",
    nameTa: "சான்றிதழ்கள்",
    keys: ["certificate", "certificates", "letter", "சான்றிதழ்", "சர்டிபிகேட்"],
  },
  {
    route: "/tasks",
    name: "Tasks & Projects",
    nameTa: "திட்டப் பணிகள்",
    keys: ["task", "tasks", "project", "டாஸ்க்", "திட்டம்"],
  },
  {
    route: "/chat",
    name: "Company Chat",
    nameTa: "உள் தொடர்பு அரட்டை",
    keys: ["chat", "message", "சாட்", "அரட்டை"],
  },
  {
    route: "/settings",
    name: "System Settings",
    nameTa: "அமைப்புகள்",
    keys: ["setting", "settings", "rules", "config", "செட்டிங்ஸ்", "அமைப்புகள்"],
  },
  {
    route: "/modules",
    name: "All 30 Modules Hub",
    nameTa: "அனைத்து தொகுதிகள்",
    keys: ["module", "modules", "30 modules", "மாடியூல்", "தொகுதிகள்"],
  },
];

// Futuristic Cyber Robotic AI Companion Avatar
function CyberRobotIcon({
  isListening,
  className = "w-9 h-9",
}: {
  isListening?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Animated Sound Wave Halo when listening */}
      {isListening && (
        <span className="absolute inset-0 rounded-2xl bg-cyan-400/40 animate-ping pointer-events-none" />
      )}

      {/* High-Tech Futuristic Cybernetic Robot SVG */}
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="robotHelm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#28C5F6" />
            <stop offset="50%" stopColor="#1769FF" />
            <stop offset="100%" stopColor="#071A38" />
          </linearGradient>
          <linearGradient id="robotVisor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#051226" />
            <stop offset="100%" stopColor="#0B234D" />
          </linearGradient>
        </defs>

        {/* Top Antenna with Pulsing Beacon */}
        <line x1="24" y1="3" x2="24" y2="10" stroke="#28C5F6" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="3" r="3" fill={isListening ? "#F43F5E" : "#28C5F6"} />

        {/* Robot Chassis Head Contour */}
        <rect
          x="8"
          y="10"
          width="32"
          height="28"
          rx="8"
          fill="url(#robotHelm)"
          stroke="#28C5F6"
          strokeWidth="1.5"
        />

        {/* Cyber Visor Screen */}
        <rect
          x="12"
          y="15"
          width="24"
          height="14"
          rx="5"
          fill="url(#robotVisor)"
          stroke="#1769FF"
          strokeWidth="1"
        />

        {/* Illuminated Cyan Robotic Visor Eyes */}
        <circle cx="19" cy="22" r={isListening ? "3.2" : "2.5"} fill="#28C5F6">
          {isListening && <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />}
        </circle>
        <circle cx="29" cy="22" r={isListening ? "3.2" : "2.5"} fill="#28C5F6">
          {isListening && <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />}
        </circle>

        {/* Digital Mouth Equalizer Bar */}
        <rect x="18" y="32" width="12" height="2" rx="1" fill="#28C5F6" opacity="0.8" />

        {/* Ear Transceivers */}
        <rect x="5" y="18" width="3" height="10" rx="1.5" fill="#28C5F6" />
        <rect x="40" y="18" width="3" height="10" rx="1.5" fill="#28C5F6" />
      </svg>
    </div>
  );
}

export default function FloatingVoiceCopilot() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [typedInput, setTypedInput] = useState("");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("AUTO");
  const languageRef = useRef<string>("AUTO");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const switchLanguage = (newLang: string) => {
    setLanguage(newLang);
    languageRef.current = newLang;
  };

  // Dragging state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>("");
  const isListeningRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopListening = () => {
    isListeningRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  // Setup / start listening directly on single click
  const startListeningDirectly = (targetLang?: "ta-IN" | "en-IN") => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setActionFeedback("Speech recognition not supported in this browser. Please use Chrome, Edge, or type below!");
      return;
    }

    const selected = targetLang || languageRef.current;
    const activeLang =
      selected === "AUTO"
        ? typeof navigator !== "undefined"
          ? navigator.language || "en-US"
          : "en-US"
        : selected;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true; // KEEP MIC CONTINUOUSLY OPEN!
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.lang = activeLang;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        latestTranscriptRef.current = "";
        setTranscript("");
        setActionFeedback("🎙️ Listening... Speak your command now!");
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        const cleaned = fullTranscript.trim();
        setTranscript(cleaned);
        latestTranscriptRef.current = cleaned;

        // Auto-execute 1.5s after user finishes speaking
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (latestTranscriptRef.current && latestTranscriptRef.current.trim()) {
            const command = latestTranscriptRef.current.trim();
            stopListening();
            handleProcessQuery(command);
          }
        }, 1500);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "no-speech") {
          // DO NOT SHUT OFF MIC ON NO-SPEECH!
          setActionFeedback("🎙️ Listening... Speak your command now!");
          return;
        }

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          stopListening();
          setActionFeedback("Microphone access was denied. Please allow mic permissions in your browser.");
        } else if (event.error === "network") {
          if (activeLang === "ta-IN") {
            switchLanguage("en-IN");
            setActionFeedback("Retrying with English/Tanglish voice engine...");
            setTimeout(() => {
              startListeningDirectly("en-IN");
            }, 300);
            return;
          }
          setActionFeedback("Speech service connecting. Speak now or use quick buttons below.");
        } else if (event.error !== "aborted") {
          setActionFeedback(`Notice: ${event.error}. You can speak or tap buttons below.`);
        }
      };

      recognition.onend = () => {
        // Keep mic alive if user is still in listening mode
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        } else {
          setIsListening(false);
          const captured = latestTranscriptRef.current;
          if (captured && captured.trim()) {
            handleProcessQuery(captured.trim());
          }
        }
      };

      isListeningRef.current = true;
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Error starting speech recognition:", err);
      stopListening();
      setActionFeedback("Click the microphone to speak.");
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      if (latestTranscriptRef.current) {
        handleProcessQuery(latestTranscriptRef.current);
      }
    } else {
      startListeningDirectly();
    }
  };

  // Voice speech synthesis (TTS)
  const speakText = (text: string, lang: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech synthesis error:", e);
      }
    }
  };

  // Immediate Client-Side Navigation Matching
  const matchClientRoute = (query: string) => {
    const q = query.toLowerCase().trim();
    for (const item of CLIENT_ROUTES) {
      for (const key of item.keys) {
        if (q.includes(key)) {
          return item;
        }
      }
    }
    return null;
  };

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText || !queryText.trim()) return;

    setIsProcessing(true);
    setResponseMessage(null);
    setActionFeedback(null);

    const isTamil = languageRef.current.startsWith("ta");

    // 1. FAST COMPREHENSIVE ROUTE RESOLUTION
    const resolved = resolveVoiceIntent(queryText, languageRef.current);

    if (resolved.intent === "ADD_EMPLOYEE") {
      const spokenMsg = resolved.spokenResponse;
      setActionFeedback(spokenMsg);
      setResponseMessage(spokenMsg);
      speakText(spokenMsg, resolved.language || languageRef.current);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("inzovate_open_add_employee"));
      }
      setTimeout(() => {
        router.push("/employees?action=new");
        setIsMinimized(true);
      }, 700);
      setIsProcessing(false);
      return;
    }

    if (resolved.intent === "APPLY_LEAVE") {
      const spokenMsg = resolved.spokenResponse;
      setActionFeedback(spokenMsg);
      setResponseMessage(spokenMsg);
      speakText(spokenMsg, resolved.language || languageRef.current);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("inzovate_open_apply_leave"));
      }
      setTimeout(() => {
        router.push("/leave?action=apply");
        setIsMinimized(true);
      }, 700);
      setIsProcessing(false);
      return;
    }

    if (resolved.intent === "ADD_INTERN") {
      const spokenMsg = resolved.spokenResponse;
      setActionFeedback(spokenMsg);
      setResponseMessage(spokenMsg);
      speakText(spokenMsg, resolved.language || languageRef.current);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("inzovate_open_add_intern"));
      }
      setTimeout(() => {
        router.push("/internship?action=onboard");
        setIsMinimized(true);
      }, 700);
      setIsProcessing(false);
      return;
    }

    if (resolved.intent === "ADD_TASK") {
      const spokenMsg = resolved.spokenResponse;
      setActionFeedback(spokenMsg);
      setResponseMessage(spokenMsg);
      speakText(spokenMsg, resolved.language || languageRef.current);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("inzovate_open_add_task"));
      }
      setTimeout(() => {
        router.push("/tasks?action=new");
        setIsMinimized(true);
      }, 700);
      setIsProcessing(false);
      return;
    }

    if (resolved.intent === "RECORD_PAY") {
      const spokenMsg = resolved.spokenResponse;
      setActionFeedback(spokenMsg);
      setResponseMessage(spokenMsg);
      speakText(spokenMsg, resolved.language || languageRef.current);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("inzovate_open_record_pay"));
      }
      setTimeout(() => {
        router.push("/internship?tab=FEES");
        setIsMinimized(true);
      }, 700);
      setIsProcessing(false);
      return;
    }

    if (resolved.intent === "SCHEDULE_CLASS") {
      const spokenMsg = resolved.spokenResponse;
      setActionFeedback(spokenMsg);
      setResponseMessage(spokenMsg);
      speakText(spokenMsg, resolved.language || languageRef.current);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("inzovate_open_schedule_class"));
      }
      setTimeout(() => {
        router.push("/internship?action=schedule");
        setIsMinimized(true);
      }, 700);
      setIsProcessing(false);
      return;
    }

    if (resolved.matched && resolved.intent === "NAVIGATION" && resolved.targetRoute) {
      const spokenMsg = resolved.spokenResponse;
      setActionFeedback(spokenMsg);
      setResponseMessage(spokenMsg);
      speakText(spokenMsg, resolved.language || languageRef.current);

      setTimeout(() => {
        router.push(resolved.targetRoute!);
        setIsMinimized(true);
      }, 700);

      setIsProcessing(false);
      return;
    }

    const matchedRoute = matchClientRoute(queryText);
    if (matchedRoute) {
      const spokenMsg = isTamil
        ? `${matchedRoute.nameTa} பக்கத்தைத் திறக்கிறது.`
        : `Opening ${matchedRoute.name}...`;

      setActionFeedback(spokenMsg);
      setResponseMessage(spokenMsg);
      speakText(spokenMsg, languageRef.current);

      setTimeout(() => {
        router.push(matchedRoute.route);
        setIsMinimized(true);
      }, 700);

      setIsProcessing(false);
      return;
    }

    // 2. SERVER ACTION & DATABASE QUERIES (PUNCH IN, PUNCH OUT, STATS)
    try {
      const res = await fetch("/api/voice-copilot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: queryText.trim(), language }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error || "Failed to process voice query.";
        setResponseMessage(errMsg);
        speakText(errMsg, language);
        return;
      }

      const resolution = data.resolution;
      setResponseMessage(resolution.spokenResponse);
      speakText(resolution.spokenResponse, resolution.language || language);

      if (resolution.intent === "NAVIGATION" && resolution.targetRoute) {
        setActionFeedback(`Navigating to ${resolution.targetRoute}...`);
        setTimeout(() => {
          router.push(resolution.targetRoute);
        }, 600);
      } else if (resolution.intent === "PUNCH_IN" || resolution.intent === "PUNCH_OUT") {
        setActionFeedback("Punch status updated!");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("inzovate_punch_updated"));
        }
      } else if (resolution.intent === "LOGOUT") {
        setActionFeedback("Logging out...");
        setTimeout(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
        }, 1200);
      }
    } catch (err) {
      const fallbackMsg = isTamil
        ? "மன்னிக்கவும், நெட்வொர்க் பிழை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
        : "Network error connecting to Voice Copilot.";
      setResponseMessage(fallbackMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedInput.trim()) {
      setTranscript(typedInput.trim());
      handleProcessQuery(typedInput.trim());
      setTypedInput("");
    }
  };

  const handleQuickCommand = (cmd: string) => {
    setTranscript(cmd);
    handleProcessQuery(cmd);
  };

  // Dragging handlers
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position?.x ?? (window.innerWidth - 420),
      posY: position?.y ?? (window.innerHeight - 560),
    };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = Math.max(10, Math.min(window.innerWidth - 400, dragRef.current.posX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, dragRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  const floatingStyle: React.CSSProperties = position
    ? {
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
      }
    : {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
      };

  return (
    <div style={floatingStyle} className="transition-all duration-100 ease-out select-none">
      {/* 1. Closed State: Futuristic Cyber Robotics Companion Orb (1-CLICK LISTENING) */}
      {!isOpen && (
        <div className="relative group">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              startListeningDirectly(); // 1-CLICK INSTANT LISTENING!
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#071A38] via-[#0E2856] to-[#1769FF] text-white shadow-2xl shadow-blue-500/50 border-2 border-[#28C5F6]/60 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 relative group-hover:border-cyan-300"
            title="Click once to speak! (Inzovate AI Robotics Copilot)"
          >
            <CyberRobotIcon isListening={false} className="w-10 h-10" />

            {/* Glowing Live AI Pulse Beacon */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#28C5F6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#1769FF] border-2 border-white"></span>
            </span>
          </button>

          {/* Interactive Tooltip on Hover */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3.5 py-2 rounded-2xl bg-[#071A38]/95 text-white text-xs font-bold whitespace-nowrap shadow-2xl border border-[#28C5F6]/40 opacity-0 group-hover:opacity-100 transition pointer-events-none flex items-center space-x-2">
            <Bot className="w-4 h-4 text-[#28C5F6]" />
            <span>Click to Talk! (தமிழ் / Voice Assistant)</span>
          </div>
        </div>
      )}

      {/* 2. Minimized Floating Pill State */}
      {isOpen && isMinimized && (
        <div className="flex items-center space-x-2 p-2 rounded-full bg-[#071A38]/95 border border-[#28C5F6]/50 shadow-2xl backdrop-blur-xl text-white">
          <button
            onClick={handleToggleListening}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition ${
              isListening ? "bg-rose-600 text-white animate-pulse" : "bg-[#1769FF] text-white"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <span className="text-xs font-bold px-2 text-[#28C5F6] flex items-center space-x-1">
            <Bot className="w-3.5 h-3.5" />
            <span>{isListening ? "Listening..." : "Robot Copilot"}</span>
          </span>

          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
            title="Expand Window"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Fully Expanded Floating Glass Window */}
      {isOpen && !isMinimized && (
        <div className="w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-[#071A38]/95 text-white backdrop-blur-2xl border border-[#28C5F6]/40 shadow-[0_20px_50px_rgba(7,26,56,0.8)] p-5 space-y-4 animate-fadeIn">
          {/* Draggable Header */}
          <div
            onMouseDown={onMouseDown}
            className="flex items-center justify-between pb-3 border-b border-slate-700/80 cursor-move"
          >
            <div className="flex items-center space-x-2.5">
              <GripHorizontal className="w-4 h-4 text-slate-400" />
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1769FF] to-[#28C5F6] p-[1px] flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-[#071A38] rounded-[11px] flex items-center justify-center">
                  <CyberRobotIcon isListening={isListening} className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white leading-tight flex items-center space-x-1.5">
                  <span>Inzovate AI Robotics</span>
                  <span className="w-2 h-2 rounded-full bg-[#19C995] beacon-pulse" />
                </h3>
                <span className="text-[10px] text-[#28C5F6] font-mono font-medium block">
                  Autonomous Workforce Voice Copilot
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Worldwide Language Selector Dropdown */}
              <select
                aria-label="Select AI Voice Language"
                value={language}
                onChange={(e) => switchLanguage(e.target.value)}
                className="px-2 py-0.5 rounded-lg bg-[#03102B] text-[#28C5F6] border border-[#28C5F6]/40 text-[10px] font-extrabold focus:outline-none cursor-pointer hover:border-cyan-300 max-w-[110px]"
              >
                <option value="AUTO">🌐 Auto Detect</option>
                <option value="ta-IN">🇮🇳 தமிழ்</option>
                <option value="en-IN">🇮🇳 English (IN)</option>
                <option value="en-US">🇺🇸 English (US)</option>
                <option value="hi-IN">🇮🇳 हिन्दी</option>
                <option value="te-IN">🇮🇳 తెలుగు</option>
                <option value="ml-IN">🇮🇳 മലയാളം</option>
                <option value="kn-IN">🇮🇳 ಕನ್ನಡ</option>
                <option value="es-ES">🇪🇸 Español</option>
                <option value="fr-FR">🇫🇷 Français</option>
                <option value="de-DE">🇩🇪 Deutsch</option>
                <option value="ar-SA">🇸🇦 العربية</option>
                <option value="ja-JP">🇯🇵 日本語</option>
                <option value="zh-CN">🇨🇳 中文</option>
              </select>

              {/* Minimize Button */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                title="Minimize Copilot"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Voice Microphone Center Section with Dynamic Equalizer */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            <div className="relative">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-[#28C5F6]/30 animate-ping pointer-events-none" />
              )}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                  isListening
                    ? "bg-rose-600 text-white ring-4 ring-rose-400/30 animate-pulse"
                    : "bg-gradient-to-tr from-[#1769FF] via-[#087CF5] to-[#28C5F6] text-white hover:scale-105 active:scale-95"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>
            </div>

            {/* Audio Visualizer Equalizer Soundwave */}
            {isListening ? (
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1.5 h-6">
                  <span className="w-1 bg-[#28C5F6] rounded-full animate-bounce h-3" />
                  <span className="w-1 bg-[#1769FF] rounded-full animate-bounce h-5" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1 bg-cyan-300 rounded-full animate-bounce h-6" style={{ animationDelay: "0.3s" }} />
                  <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-4" style={{ animationDelay: "0.45s" }} />
                  <span className="w-1 bg-[#28C5F6] rounded-full animate-bounce h-2" style={{ animationDelay: "0.6s" }} />
                </div>
                <span className="text-[11px] font-bold text-cyan-300 animate-pulse">
                  {language === "ta-IN" ? "நான் கவனிக்கிறேன்... பேசுங்கள்" : "Listening to your voice..."}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-200">
                  {language === "ta-IN"
                    ? "மைக்-ஐ அழுத்தி எதையும் கூறவும் (உடனே பேஜ் திறக்கும்!)"
                    : "Tap mic to speak or click quick buttons below!"}
                </span>
              </div>
            )}
          </div>

          {/* Spoken Transcript & Feedback Area */}
          {(transcript || responseMessage || actionFeedback) && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-black/50 border border-slate-700/80 text-xs">
              {transcript && (
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    You Said:
                  </span>
                  <p className="font-semibold text-[#28C5F6] text-xs leading-relaxed">{transcript}</p>
                </div>
              )}

              {responseMessage && (
                <div className="space-y-0.5 pt-1 border-t border-slate-700/60">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>AI Copilot:</span>
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed">{responseMessage}</p>
                </div>
              )}

              {actionFeedback && (
                <div className="pt-1 flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{actionFeedback}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Instant Voice Actions & Navigation Chips (1-Click Execution) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ Instant 1-Click Navigation Commands:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto dark-sidebar">
              <button
                type="button"
                onClick={() => handleQuickCommand("add employee")}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-[11px] font-bold transition flex items-center space-x-1 shadow-sm"
              >
                <span>➕ Add Employee</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand("apply leave")}
                className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[11px] font-bold transition flex items-center space-x-1 shadow-sm"
              >
                <span>📝 Apply Leave</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand("open org chart")}
                className="px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition flex items-center space-x-1"
              >
                <GitBranch className="w-3 h-3 text-purple-400" />
                <span>Org Hierarchy</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand("open attendance")}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition flex items-center space-x-1"
              >
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Attendance</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand("open internship")}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition flex items-center space-x-1"
              >
                <span>🎓 Internship</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand("open dashboard")}
                className="px-2.5 py-1 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition flex items-center space-x-1"
              >
                <span>📊 Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand("open employees")}
                className="px-2.5 py-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition flex items-center space-x-1"
              >
                <span>👥 Employees</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand("open performance")}
                className="px-2.5 py-1 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 text-[11px] font-bold transition flex items-center space-x-1"
              >
                <span>🎯 Performance</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand("punch in")}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[11px] font-bold transition flex items-center space-x-1"
              >
                <span>⏱️ Punch In</span>
              </button>
            </div>
          </div>

          {/* Text Input Fallback Bar */}
          <form onSubmit={handleFormSubmit} className="pt-1 flex items-center space-x-2">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={language === "ta-IN" ? "கட்டளையை உள்ளிடவும்..." : "Type command or page name..."}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.08] border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#28C5F6]"
            />
            <button
              type="submit"
              disabled={isProcessing || !typedInput.trim()}
              className="p-2 rounded-xl bg-[#1769FF] hover:bg-blue-600 text-white disabled:opacity-50 transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
