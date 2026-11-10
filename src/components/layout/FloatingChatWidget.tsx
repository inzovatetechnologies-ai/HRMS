"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Minimize2,
  Maximize2,
  Users,
  Search,
  CheckCheck,
  Crown,
  Sparkles,
  ChevronDown,
  AtSign,
} from "lucide-react";

interface FloatingChatWidgetProps {
  user?: any;
}

export default function FloatingChatWidget({ user: propUser }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(propUser || null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastMessageIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync propUser if passed
  useEffect(() => {
    if (propUser) setCurrentUser(propUser);
  }, [propUser]);

  // 1. Fetch current user if not provided
  useEffect(() => {
    if (!currentUser) {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) setCurrentUser(data.user);
        })
        .catch(() => {});
    }
  }, [currentUser]);

  // 2. Fetch contacts
  const loadContacts = async () => {
    try {
      const res = await fetch("/api/chat?action=contacts");
      const data = await res.json();
      if (data.success && data.contacts) {
        setContacts(data.contacts);
        // Default to first contact if none selected
        if (!selectedContact && data.contacts.length > 0) {
          setSelectedContact(data.contacts[0]);
        }
      }
    } catch (e) {
      console.warn("Could not load contacts:", e);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser && contacts.length === 0) {
      loadContacts();
    }
  }, [isOpen, currentUser]);

  // 3. Fetch direct messages with selectedContact
  const loadMessages = async () => {
    if (!selectedContact) return;
    try {
      const res = await fetch(`/api/chat?channel=DIRECT&targetUserId=${selectedContact.id}`);
      const data = await res.json();
      if (data.success && data.messages) {
        const newMsgs = data.messages;
        if (newMsgs.length > 0) {
          const latest = newMsgs[newMsgs.length - 1];
          if (
            lastMessageIdRef.current &&
            latest.id !== lastMessageIdRef.current &&
            latest.senderId !== currentUser?.id
          ) {
            // New incoming message! Trigger unread intimation
            if (!isOpen) {
              setUnreadCount((prev) => prev + 1);
            }
          }
          lastMessageIdRef.current = latest.id;
        }
        setMessages(newMsgs);
      }
    } catch (err) {
      console.warn("Chat poll error:", err);
    }
  };

  useEffect(() => {
    if (!isOpen || !selectedContact) return;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedContact, currentUser, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle @mention in input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    const lastAtPos = val.lastIndexOf("@");
    if (lastAtPos !== -1 && lastAtPos === val.length - 1) {
      setShowMentionMenu(true);
      setMentionQuery("");
    } else if (lastAtPos !== -1 && lastAtPos < val.length) {
      const query = val.slice(lastAtPos + 1).toLowerCase();
      if (!query.includes(" ")) {
        setShowMentionMenu(true);
        setMentionQuery(query);
      } else {
        setShowMentionMenu(false);
      }
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleSelectMention = (contact: any) => {
    setSelectedContact(contact);
    const lastAtPos = inputMessage.lastIndexOf("@");
    if (lastAtPos !== -1) {
      const prefix = inputMessage.slice(0, lastAtPos);
      setInputMessage(`${prefix}@${contact.fullName} `);
    }
    setShowMentionMenu(false);
    inputRef.current?.focus();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedContact) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setShowMentionMenu(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "DIRECT",
          receiverId: selectedContact.id,
          message: messageText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        loadMessages();
      }
    } catch (e) {
      alert("Failed to send direct message.");
    }
  };

  const filteredMentionContacts = contacts.filter((c) =>
    c.fullName.toLowerCase().includes(mentionQuery) ||
    c.role.toLowerCase().includes(mentionQuery) ||
    c.department?.toLowerCase().includes(mentionQuery)
  );

  return (
    <div
      className={`fixed z-50 flex flex-col items-end select-none font-sans ${
        isOpen ? "bottom-6 right-6" : "bottom-[92px] right-6"
      }`}
    >
      {/* EXPANDED / OPEN FLOATING WINDOW */}
      {isOpen && (
        <div
          className={`w-[360px] sm:w-[400px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(4,12,29,0.35)] border border-cyan-500/30 overflow-hidden flex flex-col transition-all duration-300 mb-3 animate-fadeIn ${
            isMinimized ? "h-[62px]" : "h-[540px]"
          }`}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#040C1D] via-[#081B3E] to-[#0A2558] p-3.5 text-white flex items-center justify-between border-b border-cyan-500/20">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  {selectedContact?.avatarUrl ? (
                    <img
                      src={selectedContact.avatarUrl}
                      alt={selectedContact.fullName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span>{selectedContact?.fullName?.slice(0, 2).toUpperCase() || "1:1"}</span>
                  )}
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#040C1D] absolute -bottom-0.5 -right-0.5" />
              </div>

              <div className="truncate text-left">
                <div className="font-bold text-xs flex items-center space-x-1.5 text-white truncate">
                  <span className="truncate">{selectedContact?.fullName || "Select Personnel"}</span>
                  {selectedContact?.role === "SUPER_ADMIN" && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 flex-shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-cyan-300/80 font-mono truncate">
                  {selectedContact?.designation || selectedContact?.role || "Direct Chat"}
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition"
                title="Close Chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Recipient Quick Switcher Bar */}
              <div className="p-2 bg-slate-50 border-b border-slate-200/80 flex items-center space-x-2 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                  <AtSign className="w-3 h-3 text-cyan-600" />
                  <span>Chatting with:</span>
                </span>
                <select
                  value={selectedContact?.id || ""}
                  onChange={(e) => {
                    const found = contacts.find((c) => c.id === e.target.value);
                    if (found) setSelectedContact(found);
                  }}
                  className="flex-1 text-xs font-semibold py-1 px-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.role === "SUPER_ADMIN" ? "👑 Admin" : c.role}) - {c.department || "Staff"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-gradient-to-b from-white to-slate-50/50 text-xs custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-xs">No direct messages yet.</p>
                    <p className="text-[11px] text-slate-400">
                      Say hello to {selectedContact?.fullName || "colleague"}!
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = currentUser && m.senderId === currentUser.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-0.5`}
                      >
                        {!isMe && (
                          <span className="text-[9.5px] text-slate-500 font-semibold px-1">
                            {m.senderName}
                          </span>
                        )}
                        <div
                          className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                            isMe
                              ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-tr-xs"
                              : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs"
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">{m.message}</div>
                          <div
                            className={`flex items-center justify-end space-x-1 mt-0.5 text-[8.5px] ${
                              isMe ? "text-cyan-200" : "text-slate-400"
                            }`}
                          >
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-2.5 h-2.5 text-cyan-300" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* @Mention Autocomplete Dropdown */}
              {showMentionMenu && (
                <div className="border-t border-cyan-500/30 bg-[#071329] text-white p-2 max-h-36 overflow-y-auto space-y-1 text-xs animate-fadeIn shadow-xl">
                  <div className="text-[10px] uppercase font-bold text-cyan-400 px-2 py-0.5">
                    Mention to Direct Chat:
                  </div>
                  {filteredMentionContacts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectMention(c)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left transition"
                    >
                      <div className="font-semibold text-xs flex items-center space-x-1.5">
                        <span>{c.fullName}</span>
                        {c.role === "SUPER_ADMIN" && <Crown className="w-3 h-3 text-amber-400" />}
                      </div>
                      <span className="text-[10px] text-cyan-300/80 font-mono">{c.designation || c.role}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder={`Type @ to mention or message ${selectedContact?.fullName?.split(" ")[0] || "staff"}...`}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-40 text-white shadow-md transition"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* FLOATING ACTION PILL BUTTON (Docked at Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 rounded-2xl bg-gradient-to-r from-[#040C1D] via-[#092A65] to-[#1265F5] text-white shadow-[0_10px_35px_rgba(18,101,245,0.4)] border border-cyan-400/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2.5"
          title="Open INZOVATE 1-to-1 Direct Chat & Mentions"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-cyan-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#040C1D] absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-black tracking-wide text-white">1-to-1 Team Chat</span>
            <span className="text-[9.5px] text-cyan-300 font-medium">Type @ to chat</span>
          </div>

          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
