"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Send,
  Sparkles,
  RefreshCw,
  Mail,
  Calendar,
  Clock,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Zap,
  ChevronRight,
  Sliders,
  Copy,
  Check
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! I am your AI Productivity Assistant powered by Gemini 3.7 Flash & LangChain.\n\nI can help you manage your **Gmail** and **Google Calendar**. Try asking me questions or requesting tasks like scheduling meetings, checking your schedule, or searching emails!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "error">("checking");
  const [threadId, setThreadId] = useState<string>(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        if (res.ok) {
          setBackendStatus("connected");
        } else {
          setBackendStatus("error");
        }
      } catch {
        setBackendStatus("error");
      }
    };
    checkHealth();
  }, [API_URL]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      // Prepare chat history payload for backend
      const history = messages
        .filter((msg) => msg.id !== "welcome-1")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          thread_id: threadId,
          history: history,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: "Failed to fetch response" }));
        throw new Error(errData.detail || `Server returned code ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Error:** ${err.message || "Unable to reach backend server."}\n\n*Please ensure the FastAPI backend is running on ${API_URL} and your GEMINI_API_KEY is configured in backend .env*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setThreadId(`session-${Date.now()}`);
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "Chat history cleared. How can I assist you today with Gmail or Google Calendar?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const samplePrompts = [
    { icon: Calendar, label: "Check Availability", text: "What is my calendar availability for tomorrow afternoon?" },
    { icon: Mail, label: "Search Emails", text: "Search for recent emails regarding project updates or deadlines." },
    { icon: Clock, label: "Schedule Meeting", text: "Draft an invite for a 30-minute sync meeting with the product team." },
    { icon: Zap, label: "Daily Summary", text: "Summarize my key priorities based on today's schedule and emails." },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col hidden md:flex">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-slate-100">Productivity Assistant</h1>
            <p className="text-xs text-slate-400">LangChain + Gemini 3.7</p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {samplePrompts.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.text)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 hover:border-slate-700 transition-all flex items-center gap-3 group"
                  >
                    <IconComponent className="h-4 w-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-slate-100">
                      {item.label}
                    </span>
                    <ChevronRight className="h-3 w-3 text-slate-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capabilities Badge */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs">
              <Zap className="h-4 w-4" /> Capabilities Preview
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1 pl-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Basic LLM Conversations
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-indigo-400" /> Gmail Tools (Coming Next)
              </li>
              <li className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-indigo-400" /> Google Calendar (Coming Next)
              </li>
            </ul>
          </div>
        </div>

        {/* Backend Status Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            {backendStatus === "connected" && (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-300">Backend Connected</span>
              </>
            )}
            {backendStatus === "checking" && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-slate-400">Checking API...</span>
              </>
            )}
            {backendStatus === "error" && (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-rose-400 font-medium">Backend Offline</span>
              </>
            )}
          </div>
          <button
            onClick={clearChat}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear Chat"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-slate-950">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 md:hidden">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-slate-100">AI Productivity Assistant</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Gmail & Calendar Conversational Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5 text-slate-400" /> New Chat
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "bg-slate-800 border border-slate-700 text-indigo-400"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`group relative rounded-2xl p-4 text-sm leading-relaxed max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-950/50"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md shadow-slate-950/50"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Footer / Copy Action */}
                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    msg.role === "user" ? "text-indigo-200" : "text-slate-500"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-slate-300 flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Thinking / Loading Animation */}
          {loading && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Bot className="h-4 w-4 animate-bounce" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-slate-400 text-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse delay-150" />
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse delay-300" />
                <span className="text-xs text-slate-400 ml-2">Gemini is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Sample Suggestions (Shown when chat is short) */}
        {messages.length <= 2 && !loading && (
          <div className="px-4 md:px-6 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-3xl mx-auto">
              {samplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.text)}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-300 group-hover:text-indigo-400 mb-1">
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{item.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 md:p-6 border-t border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your assistant (e.g., 'Schedule a team sync tomorrow' or 'Find emails about budgets')..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 pr-12 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none transition-all shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="absolute right-3 bottom-4 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-all shadow-md shadow-indigo-900/30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Powered by LangChain & Google Gemini 3.7</span>
            <span>Press Enter to send, Shift+Enter for newline</span>
          </div>
        </div>
      </main>
    </div>
  );
}
