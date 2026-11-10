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
  CheckCircle2,
  AlertTriangle,
  Compass,
  Clock,
  CalendarDays,
  Users,
  ShieldCheck,
  Send,
  Loader2,
  Radio,
  GraduationCap,
  Briefcase,
  Banknote,
  LayoutDashboard,
  Building2,
  UserPlus,
  Zap,
} from "lucide-react";
import { resolveVoiceIntent } from "@/lib/voice";

interface VoiceCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: "ta-IN", label: "தமிழ்", title: "Tamil" },
  { code: "en-IN", label: "English", title: "Indian English" },
  { code: "te-IN", label: "తెలుగు", title: "Telugu" },
  { code: "ml-IN", label: "മലയാളം", title: "Malayalam" },
  { code: "kn-IN", label: "ಕನ್ನಡ", title: "Kannada" },
  { code: "hi-IN", label: "हिन्दी", title: "Hindi" },
];

export default function VoiceCopilotModal({ isOpen, onClose }: VoiceCopilotModalProps) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("ta-IN");
  const [isProcessing, setIsProcessing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const currentTranscriptRef = useRef<string>("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Text-to-speech feedback
  const speakFeedback = (text: string, lang = "ta-IN") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TTS error:", e);
      }
    }
  };

  // Immediate Action Execution and Page Navigation
  const executeVoiceCommand = async (commandText: string) => {
    if (!commandText || !commandText.trim()) return;
    const cleanCmd = commandText.trim();
    setIsProcessing(true);
    setResponseMessage(null);
    setMicError(null);

    // Stop listening immediately
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsListening(false);

    // 1. Resolve Intent with multilingual dictionary
    const resolved = resolveVoiceIntent(cleanCmd, language);

    // Handle Direct Action: ADD EMPLOYEE
    if (resolved.intent === "ADD_EMPLOYEE") {
      setResponseMessage(resolved.spokenResponse);
      speakFeedback(resolved.spokenResponse, resolved.language || language);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("inzovate_open_add_employee"));
      }
      setTimeout(() => {
        setIsProcessing(false);
        router.push("/employees?action=new");
        onClose();
      }, 500);
      return;
    }

    // Handle Direct Action: APPLY LEAVE
    if (resolved.intent === "APPLY_LEAVE") {
      setResponseMessage(resolved.spokenResponse);
      speakFeedback(resolved.spokenResponse, resolved.language || language);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("inzovate_open_apply_leave"));
      }
      setTimeout(() => {
        setIsProcessing(false);
        router.push("/leave?action=apply");
        onClose();
      }, 500);
      return;
    }

    // Handle Server Actions (PUNCH IN, PUNCH OUT, LOGOUT, QUERIES)
    if (
      resolved.intent === "PUNCH_IN" ||
      resolved.intent === "PUNCH_OUT" ||
      resolved.intent === "LOGOUT" ||
      resolved.intent === "QUERY"
    ) {
      try {
        const res = await fetch("/api/voice-copilot/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: cleanCmd, language }),
        });
        const data = await res.json();
        const spoken = data.resolution?.spokenResponse || resolved.spokenResponse;
        setResponseMessage(spoken);
        speakFeedback(spoken, resolved.language || language);

        if (resolved.intent === "PUNCH_IN" || resolved.intent === "PUNCH_OUT") {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("inzovate_punch_updated"));
          }
        } else if (resolved.intent === "LOGOUT") {
          setTimeout(async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
          }, 1200);
        }
      } catch (e) {
        setResponseMessage(resolved.spokenResponse);
        speakFeedback(resolved.spokenResponse, resolved.language || language);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Dynamic Navigation Routing
    let target = resolved.targetRoute;
    let spokenReply = resolved.spokenResponse;

    if (target) {
      setResponseMessage(spokenReply || `Navigating to ${target}...`);
      speakFeedback(spokenReply || `Navigating to ${target}`, resolved.language || language);

      setTimeout(() => {
        setIsProcessing(false);
        router.push(target);
        onClose();
      }, 500);
      return;
    }

    // Conversational or fallback
    setResponseMessage(resolved.spokenResponse);
    speakFeedback(resolved.spokenResponse, resolved.language || language);
    setIsProcessing(false);
  };

  // Start Speech Recognition
  const startListening = () => {
    setMicError(null);
    setResponseMessage(null);
    setTranscript("");
    currentTranscriptRef.current = "";

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("Speech recognition not supported in this browser. Please use Chrome or Edge, or pick an action below.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let full = "";
        for (let i = 0; i < event.results.length; i++) {
          full += event.results[i][0].transcript;
        }
        const text = full.trim();
        setTranscript(text);
        currentTranscriptRef.current = text;

        // Auto execute on 1.2s silence
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (currentTranscriptRef.current && currentTranscriptRef.current.trim()) {
            executeVoiceCommand(currentTranscriptRef.current.trim());
          }
        }, 1200);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "no-speech") return;
        if (event.error === "not-allowed") {
          setMicError("Microphone permission denied. Allow mic in browser settings, or tap any quick action below.");
        } else {
          setMicError(`Listening standby (${event.error}). You can speak or tap below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Mic init notice:", err);
      setMicError("Click microphone to speak or click any quick command below.");
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    if (currentTranscriptRef.current) {
      executeVoiceCommand(currentTranscriptRef.current);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(t);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      setIsListening(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  const quickCommands = [
    { label: "Add Employee", icon: UserPlus, cmd: "ஆட் எம்ப்ளாய்", color: "from-blue-600 to-cyan-500" },
    { label: "Dashboard", icon: LayoutDashboard, cmd: "டேஷ்போர்டு", color: "from-indigo-600 to-blue-500" },
    { label: "Employees", icon: Users, cmd: "பணியாளர்கள்", color: "from-sky-600 to-cyan-500" },
    { label: "Attendance", icon: Clock, cmd: "அட்டெண்டன்ஸ்", color: "from-emerald-600 to-teal-500" },
    { label: "Punch In", icon: Zap, cmd: "பஞ்ச் இன்", color: "from-amber-500 to-yellow-600" },
    { label: "Apply Leave", icon: CalendarDays, cmd: "லீவ் அப்ளை பண்ணு", color: "from-purple-600 to-pink-500" },
    { label: "Payroll", icon: Banknote, cmd: "பேரோல்", color: "from-emerald-500 to-green-600" },
    { label: "Org Chart", icon: Building2, cmd: "ஆர்கனைசேஷன் சார்ட்", color: "from-cyan-600 to-blue-600" },
    { label: "Internships", icon: GraduationCap, cmd: "இன்டர்ன்ஷிப்", color: "from-violet-600 to-indigo-500" },
    { label: "Tasks", icon: Briefcase, cmd: "பணிகள்", color: "from-blue-500 to-sky-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#0B1528] via-[#070D1B] to-[#040812] border border-cyan-500/30 text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden relative">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-wide flex items-center space-x-2">
                <span>INZOVATE AI VOICE COPILOT</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-cyan-300/80 font-medium tracking-tight">
                Multilingual Voice Navigation & Autonomous Operations
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multilingual Selector Bar */}
        <div className="px-4 py-2.5 border-b border-cyan-500/10 bg-black/40 flex items-center space-x-2 overflow-x-auto custom-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Language:
          </span>
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            {SUPPORTED_LANGUAGES.map((l) => {
              const isActive = language === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                    isActive
                      ? "bg-cyan-500 text-black font-extrabold shadow-sm shadow-cyan-500/50"
                      : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5"
                  }`}
                  title={l.title}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Central Audio Visualizer & Mic Button */}
        <div className="p-6 text-center space-y-4">
          <div className="relative flex items-center justify-center py-2">
            {/* Animated Ripples when listening */}
            {isListening && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-cyan-500/20 animate-ping" />
                <div className="absolute w-24 h-24 rounded-full bg-blue-500/20 animate-pulse" />
              </>
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                isListening
                  ? "bg-gradient-to-tr from-rose-500 to-red-600 shadow-rose-500/50 scale-105"
                  : "bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-cyan-500/50 hover:scale-105"
              }`}
              title={isListening ? "Listening... Click to execute" : "Click to Speak"}
            >
              {isListening ? (
                <Radio className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-cyan-300">
              {isListening ? "🎙️ Listening... Speak your command in any language" : "Click mic to speak or click quick buttons below"}
            </div>
            <div className="text-[11px] text-slate-400">
              Say: &ldquo;Add Employee&rdquo;, &ldquo;Open Dashboard&rdquo;, &ldquo;Open Employees&rdquo;, &ldquo;Open Attendance&rdquo;, &ldquo;Apply Leave&rdquo;, &ldquo;Open Payroll&rdquo;
            </div>
          </div>

          {/* Transcript / Spoken Preview */}
          <div className="min-h-[52px] p-3 rounded-2xl bg-white/[0.04] border border-cyan-500/20 flex items-center justify-center text-center">
            {transcript ? (
              <span className="text-sm font-semibold text-white tracking-wide">
                &ldquo;{transcript}&rdquo;
              </span>
            ) : responseMessage ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{responseMessage}</span>
              </span>
            ) : micError ? (
              <span className="text-xs text-amber-300">{micError}</span>
            ) : (
              <span className="text-xs text-slate-500 italic">Listening for voice command...</span>
            )}
          </div>

          {/* Direct Text Search / Command fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualInput.trim()) {
                executeVoiceCommand(manualInput.trim());
                setManualInput("");
              }
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or type here: add employee, dashboard, attendance, payroll, leave..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition flex items-center space-x-1 shadow-md disabled:opacity-50"
            >
              <span>Execute</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* 1-Tap Quick Action Chips */}
          <div className="pt-2 text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Instant One-Click Voice Operations</span>
              <span className="text-cyan-400 text-[9px] font-mono">100% RELIABLE</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {quickCommands.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => executeVoiceCommand(item.cmd)}
                    className="p-2 rounded-xl bg-white/[0.03] hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-left transition flex items-center space-x-2 group"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
