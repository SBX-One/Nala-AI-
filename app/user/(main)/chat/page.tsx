"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
  messages?: { content: string }[];
}

export default function NalaChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Debug: Log session ID
  console.log("Current Session ID:", currentSessionId);

  // 1. Fetch all chat sessions (History Sidebar)
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/sessions");
      const data = await res.json();
      if (!data.error) {
        setSessions(data);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsSessionsLoading(false);
    }
  }, []);

  // 2. Fetch messages for a specific session
  const fetchMessages = async (sessionId: string) => {
    setIsLoading(true);
    setCurrentSessionId(sessionId);
    try {
      const res = await fetch(`/api/ai/sessions/${sessionId}`);
      const data = await res.json();
      if (!data.error) {
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/ai/sessions");
        const data = await res.json();
        if (!data.error && isMounted) {
          setSessions(data);
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        if (isMounted) setIsSessionsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Start New Chat
  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([
      {
        role: "assistant",
        content:
          "Halo! Saya Nala AI. Ada yang bisa saya bantu terkait kesehatan mental Anda hari ini?",
      },
    ]);
  };

  // 4. Send Message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: input,
    };

    console.log(userMsg);

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          sessionId: currentSessionId,
        }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (!currentSessionId && data.sessionId) {
        setCurrentSessionId(data.sessionId);
        fetchSessions();
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
        },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Maaf, terjadi kesalahan saat menghubungi Nala AI. Silakan coba lagi nanti.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-surface-background rounded-3xl border border-border-default overflow-hidden shadow-sm m-4">
      {/* SIDEBAR: Chat History */}
      <div className="w-80 border-r border-border-default flex flex-col bg-white">
        <div className="p-5 border-b border-border-default">
          <button
            onClick={startNewChat}
            className="w-full py-3 bg-primary-500 text-white rounded-2xl text-label-base-semibold flex items-center justify-center gap-2 hover:bg-primary-600 transition-all active:scale-[0.98]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="px-3 py-2 text-label-caption-medium text-text-placeholder uppercase tracking-wider">
            History
          </p>
          {isSessionsLoading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-neutral-50 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-body-caption-regular text-text-placeholder">
              Belum ada percakapan.
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => fetchMessages(session.id)}
                className={`w-full p-4 rounded-2xl text-left transition-all border group ${
                  currentSessionId === session.id
                    ? "bg-primary-50 border-primary-200"
                    : "hover:bg-neutral-50 border-transparent"
                }`}
              >
                <h4
                  className={`text-label-base-semibold truncate ${
                    currentSessionId === session.id
                      ? "text-primary-600"
                      : "text-text-heading"
                  }`}
                >
                  {session.title}
                </h4>
                <p className="text-body-caption-regular text-text-subheading truncate mt-1">
                  {session.messages?.[0]?.content || "Tidak ada pesan"}
                </p>
                <span className="text-[10px] text-text-placeholder mt-2 block">
                  {new Date(session.updated_at).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* MAIN: Chat Interface */}
      <div className="flex-1 flex flex-col bg-neutral-50/30">
        {/* Header */}
        <div className="px-8 py-5 bg-white border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="size-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-xl shadow-lg shadow-primary-200">
                ✨
              </div>
              <div className="absolute -bottom-1 -right-1 size-4 bg-success-default border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="text-heading-6-bold text-text-heading">
                Nala AI Assistant
              </h3>
              <p className="text-body-caption-regular text-text-success">
                Online & Ready to help
              </p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
              <div className="size-20 rounded-3xl bg-primary-50 flex items-center justify-center text-primary-500 text-4xl">
                ✨
              </div>
              <h2 className="text-heading-5-bold text-text-heading">
                Bicaralah dengan Nala
              </h2>
              <p className="text-body-base-regular text-text-subheading">
                Ceritakan apa yang Anda rasakan hari ini. Nala di sini untuk
                mendengarkan tanpa menghakimi.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-end gap-3`}
            >
              {m.role === "assistant" && (
                <div className="size-8 rounded-lg bg-primary-500 flex items-center justify-center text-white text-xs shrink-0">
                  ✨
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[75%]">
                <div
                  className={`px-5 py-3.5 rounded-3xl shadow-sm ${
                    m.role === "user"
                      ? "bg-primary-500 text-white rounded-br-none"
                      : "bg-white border border-border-default text-text-heading rounded-bl-none"
                  }`}
                >
                  <p className="text-body-base-regular leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
                {m.created_at && (
                  <span
                    className={`text-[10px] text-text-placeholder ${m.role === "user" ? "text-right" : "text-left"}`}
                  >
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 px-12 py-2">
              <div
                className="size-2 rounded-full bg-primary-300 animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="size-2 rounded-full bg-primary-400 animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="size-2 rounded-full bg-primary-500 animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
              <span className="text-body-caption-regular text-text-placeholder ml-2">
                Nala is thinking...
              </span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white border-t border-border-default">
          <div className="max-w-4xl mx-auto relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ceritakan apa yang sedang Anda pikirkan..."
              className="w-full px-6 py-4.5 bg-neutral-50 border border-border-default rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all text-text-heading max-w-4/5 text-wrap min-h-fit"
            />
            <div className="absolute right-3 flex items-center gap-2">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`px-6 py-2.5 rounded-xl text-label-small-semibold transition-all ${
                  input.trim() && !isLoading
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-100 hover:bg-primary-600 active:scale-95"
                    : "bg-neutral-200 text-text-disabled cursor-not-allowed"
                }`}
              >
                Kirim
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-text-placeholder mt-4 italic">
            Nala AI dapat memberikan saran, namun tetap konsultasikan kondisi
            medis Anda dengan profesional.
          </p>
        </div>
      </div>
    </div>
  );
}
