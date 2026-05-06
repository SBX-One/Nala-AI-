"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ─── Types (mirrors DB schema) ────────────────────────────────────────────────

export type MessageSender = "user" | "psychiatrist";

export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  /** "user" | "psychiatrist" – resolved from sender_id at the call-site */
  sender_role: MessageSender;
  message: string;
  is_read: boolean;
  is_edit: boolean;
  file_url?: string | null;
  file_type?: string | null; // e.g. "image/png", "application/pdf"
  file_size?: number | null;
  created_at: string; // ISO timestamp
}

export interface ConversationChatProps {
  /** Who is viewing this chat (controls which side is "mine") */
  viewerRole: MessageSender;
  /** Display name of the other participant shown in "is typing" */
  otherParticipantName: string;
  /** Seed messages — in a real app these come from an API/socket */
  initialMessages?: ChatMessage[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isImageType(fileType?: string | null) {
  return fileType?.startsWith("image/") ?? false;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-2">
      <span className="text-xs text-text-placeholder">{name} is typing</span>
      <span className="flex gap-[3px] items-center">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 rounded-full bg-text-placeholder animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
    </div>
  );
}

interface MessageBubbleProps {
  msg: ChatMessage;
  isMine: boolean;
}

function MessageBubble({ msg, isMine }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl shadow-sm overflow-hidden ${
          isMine
            ? "bg-[#0066FF] text-white rounded-tr-sm"
            : "bg-white border border-border-default text-text-heading rounded-tl-sm"
        }`}
      >
        {/* Image attachment */}
        {msg.file_url && isImageType(msg.file_type) && (
          <div className="relative w-full aspect-video min-w-[220px]">
            <Image
              src={msg.file_url}
              alt="attachment"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Generic file attachment */}
        {msg.file_url && !isImageType(msg.file_type) && (
          <a
            href={msg.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-3 border-b ${
              isMine ? "border-white/20" : "border-border-default"
            }`}
          >
            <svg
              className="size-5 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
            </svg>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">
                {msg.file_url.split("/").pop()}
              </p>
              {msg.file_size && (
                <p className="text-[10px] opacity-70">
                  {(msg.file_size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </a>
        )}

        {/* Text body */}
        {msg.message && (
          <p className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
            {msg.message}
          </p>
        )}
      </div>

      {/* Timestamp + read receipt */}
      <div className={`flex items-center gap-1.5 ${isMine ? "pr-1" : "pl-1"}`}>
        <span className="text-[11px] text-text-placeholder">
          {formatTime(msg.created_at)}
        </span>
        {isMine && msg.is_read && (
          <svg
            className="size-3.5 text-[#0066FF]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
          </svg>
        )}
        {isMine && !msg.is_read && (
          <svg
            className="size-3.5 text-text-placeholder"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
        {msg.is_edit && (
          <span className="text-[10px] text-text-placeholder italic">edited</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    room_id: 1,
    sender_id: 10,
    sender_role: "psychiatrist",
    message: "Hello Dr. Samantha, I'm ready to make my first consultation for today",
    is_read: false,
    is_edit: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
 
];

export default function ConversationChat({
  viewerRole,
  otherParticipantName,
  initialMessages = MOCK_MESSAGES,
}: ConversationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newMsg: ChatMessage = {
      id: messages.length + 1,
      room_id: 1,
      sender_id: viewerRole === "psychiatrist" ? 20 : 10,
      sender_role: viewerRole,
      message: trimmed,
      is_read: false,
      is_edit: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    setIsOtherTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Section title */}
      <div className="px-5 py-4 border-b border-border-default shrink-0">
        <p className="text-heading-6-bold text-text-heading">Conversation</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#FAFAFA]">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isMine={msg.sender_role === viewerRole}
          />
        ))}

        {/* Typing indicator */}
        {isOtherTyping && (
          <TypingIndicator name={otherParticipantName} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border-default bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Attachment button */}
          <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-placeholder hover:text-text-heading shrink-0">
            <svg
              className="size-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
            </svg>
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type A Message"
            className="flex-1 border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-heading bg-surface-background placeholder:text-text-placeholder focus:outline-none focus:ring-[1.5px] focus:ring-[#0066FF] focus:border-[#0066FF] transition-shadow"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-2.5 bg-[#0066FF] rounded-xl text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm group shrink-0"
          >
            <svg
              className="size-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.06-.87.49-.87.99l.01 4.61c0 .71.73 1.2 1.39.92z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
