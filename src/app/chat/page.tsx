"use client";

import React, { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  MessageSquare,
  Send,
  Hash,
  Bell,
  Users,
  CheckCheck,
  User,
  ShieldCheck,
  Briefcase,
  Search,
  Circle,
  Crown,
  Sparkles,
} from "lucide-react";

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeMode, setActiveMode] = useState<"CHANNEL" | "DIRECT">("CHANNEL");
  const [channel, setChannel] = useState("ANNOUNCEMENTS");
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [contactSearch, setContactSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load current session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Load contacts for 1-to-1 direct messaging
  const loadContacts = async () => {
    try {
      const res = await fetch("/api/chat?action=contacts");
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Load messages
  const loadMessages = async () => {
    try {
      let url = "";
      if (activeMode === "DIRECT" && selectedContact) {
        url = `/api/chat?channel=DIRECT&targetUserId=${selectedContact.id}`;
      } else {
        url = `/api/chat?channel=${channel}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadMessages();
    const interval = setInterval(loadMessages, 3500);
    return () => clearInterval(interval);
  }, [channel, activeMode, selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      const payload: any = {
        message: inputMessage.trim(),
      };
      if (activeMode === "DIRECT" && selectedContact) {
        payload.channel = "DIRECT";
        payload.receiverId = selectedContact.id;
      } else {
        payload.channel = channel;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setInputMessage("");
        loadMessages();
      }
    } catch (err) {
      alert("Failed to send message.");
    }
  };

  const selectChannel = (chId: string) => {
    setActiveMode("CHANNEL");
    setChannel(chId);
    setSelectedContact(null);
  };

  const selectDirectContact = (contact: any) => {
    setActiveMode("DIRECT");
    setSelectedContact(contact);
  };

  const channels = [
    { id: "ANNOUNCEMENTS", label: "Company Announcements", icon: Bell, desc: "Official executive broadcasts" },
    { id: "HR_OPS", label: "HR Operations & Support", icon: Users, desc: "Leave, benefits, and workplace queries" },
    { id: "ENGINEERING", label: "Engineering & Tech", icon: Hash, desc: "Sprint updates, releases, architecture" },
    { id: "GENERAL", label: "General Watercooler", icon: MessageSquare, desc: "Company-wide social discussion" },
  ];

  const filteredContacts = contacts.filter((c) => {
    if (!contactSearch.trim()) return true;
    const term = contactSearch.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(term) ||
      c.role.toLowerCase().includes(term) ||
      c.department?.toLowerCase().includes(term) ||
      c.employeeProfile?.employeeId?.toLowerCase().includes(term)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-4 animate-fadeIn max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col pb-4">
        {/* Header Banner */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>INZOVATE Direct Team &amp; HR Messenger</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Encrypted Internal Chat</span>
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Peer-to-peer 1-to-1 conversations between Employees, HR Managers, and Executive Leadership.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-mono flex items-center space-x-2">
            <span>Signed in as:</span>
            <span className="font-bold text-slate-900">{currentUser?.fullName || "Staff"}</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
              {currentUser?.role || "EMPLOYEE"}
            </span>
          </div>
        </div>

        {/* Chat Main Container */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-0">
          {/* SIDEBAR: Channels + 1-to-1 Direct Contacts */}
          <div className="md:col-span-4 lg:col-span-3 border-r border-slate-100 flex flex-col h-full bg-slate-50/60 overflow-hidden">
            {/* Search contacts */}
            <div className="p-3 border-b border-slate-200/60">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search HR, colleagues, emp ID..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {/* Broadcast Channels Section */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                  <span>Channels</span>
                  <span className="text-[9px] bg-slate-200/80 px-1.5 py-0.2 rounded font-mono">
                    {channels.length}
                  </span>
                </div>
                {channels.map((ch) => {
                  const Icon = ch.icon;
                  const isActive = activeMode === "CHANNEL" && channel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => selectChannel(ch.id)}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                        isActive
                          ? "bg-blue-900 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-200/60"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="truncate flex-1">
                        <div className="truncate font-semibold">{ch.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 1-to-1 Direct Messages Section */}
              <div className="space-y-1 pt-2 border-t border-slate-200/60">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                  <span>1-to-1 Direct Chat</span>
                  <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded font-mono">
                    {filteredContacts.length}
                  </span>
                </div>

                {filteredContacts.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">No staff found</div>
                ) : (
                  filteredContacts.map((contact) => {
                    const isActive = activeMode === "DIRECT" && selectedContact?.id === contact.id;
                    const isHR = contact.role === "HR_MANAGER" || contact.role === "SUPER_ADMIN";
                    const isSuper = contact.role === "SUPER_ADMIN";

                    return (
                      <button
                        key={contact.id}
                        onClick={() => selectDirectContact(contact)}
                        className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-xs transition text-left ${
                          isActive
                            ? "bg-blue-900 text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-200/60"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center font-bold text-[11px] shadow-2xs ${
                              isSuper
                                ? "bg-amber-500 text-slate-900"
                                : isHR
                                ? "bg-blue-600 text-white"
                                : "bg-slate-700 text-white"
                            }`}
                          >
                            {contact.avatarUrl ? (
                              <img
                                src={contact.avatarUrl}
                                alt={contact.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              contact.fullName.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>

                        {/* Name & Role */}
                        <div className="truncate flex-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`truncate font-bold ${
                                isActive ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {contact.fullName}
                            </span>
                            {isSuper && (
                              <Crown
                                className={`w-3 h-3 flex-shrink-0 ${
                                  isActive ? "text-amber-300" : "text-amber-500"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span
                              className={`text-[9.5px] uppercase font-bold tracking-tight px-1 py-0.2 rounded ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : isHR
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {contact.role === "HR_MANAGER"
                                ? "HR Operations"
                                : contact.role === "SUPER_ADMIN"
                                ? "Super Admin"
                                : "Employee"}
                            </span>
                            {contact.employeeProfile?.employeeId && (
                              <span
                                className={`text-[9.5px] font-mono ${
                                  isActive ? "text-cyan-200" : "text-slate-400"
                                }`}
                              >
                                {contact.employeeProfile.employeeId}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* CHAT MESSAGES & CONVERSATION AREA */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col h-full bg-white overflow-hidden">
            {/* Conversation Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              {activeMode === "DIRECT" && selectedContact ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    {selectedContact.avatarUrl ? (
                      <img
                        src={selectedContact.avatarUrl}
                        alt={selectedContact.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedContact.fullName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        {selectedContact.fullName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {selectedContact.role}
                      </span>
                      {selectedContact.employeeProfile?.employeeId && (
                        <span className="font-mono text-xs text-slate-500 font-semibold">
                          ({selectedContact.employeeProfile.employeeId})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                      <span>{selectedContact.department || "Operations"}</span>
                      <span>•</span>
                      <span>{selectedContact.designation || "Staff"}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Online</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-md">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      #{channels.find((c) => c.id === channel)?.label || channel}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {channels.find((c) => c.id === channel)?.desc || "Organization broadcast channel"}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-semibold text-slate-400">
                  {messages.length} Message(s)
                </span>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-white to-slate-50/50 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-xs text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <div>
                    No messages yet{" "}
                    {activeMode === "DIRECT" && selectedContact
                      ? `with ${selectedContact.fullName}`
                      : `in #${channel}`}
                    .
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Type a message below to start the conversation.
                  </div>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = currentUser && m.senderId === currentUser.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                    >
                      {!isMe && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 px-1">
                          <span className="font-bold text-slate-800">{m.senderName}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold uppercase">
                            {m.senderRole}
                          </span>
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? "bg-blue-900 text-white rounded-tr-xs"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs"
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">{m.message}</div>
                        <div
                          className={`flex items-center justify-end space-x-1 mt-1 text-[9px] ${
                            isMe ? "text-cyan-200" : "text-slate-400"
                          }`}
                        >
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe && <CheckCheck className="w-3 h-3 text-cyan-300" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  activeMode === "DIRECT" && selectedContact
                    ? `Message ${selectedContact.fullName}...`
                    : `Post message to #${channels.find((c) => c.id === channel)?.label || channel}...`
                }
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
