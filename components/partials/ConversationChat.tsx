"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export interface ChatMessage {
	id: number;
	room_id: number;
	sender_id: number;
	message: string | null;
	is_read: boolean;
	is_edit: boolean;
	file_url?: string | null;
	file_type?: string | null;
	file_size?: number | null;
	created_at: string;
}

export interface ConversationChatProps {
	roomId: number;
	currentUserId: number;
	otherParticipantName: string;
}

function formatTime(iso: string) {
	return new Date(iso).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function isImageType(ft?: string | null) {
	return ft?.startsWith("image/") ?? false;
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator({ name }: { name: string }) {
	return (
		<div className="flex items-center gap-2 px-1 py-2">
			<span className="text-xs text-text-placeholder">
				{name} is typing
			</span>
			<span className="flex gap-[3px] items-center">
				{[0, 150, 300].map((d) => (
					<span
						key={d}
						className="size-1.5 rounded-full bg-text-placeholder animate-bounce"
						style={{ animationDelay: `${d}ms` }}
					/>
				))}
			</span>
		</div>
	);
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({
	msg,
	isMine,
	onEdit,
	onDelete,
}: {
	msg: ChatMessage;
	isMine: boolean;
	onEdit: (msg: ChatMessage) => void;
	onDelete: (id: number) => void;
}) {
	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node))
				setShowMenu(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div
			className={`flex flex-col gap-1.5 group ${isMine ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
		>
			<div className="flex items-center gap-2 max-w-[85%] relative">
				{/* Action button (only for own messages) */}
				{isMine && (
					<div ref={menuRef} className="shrink-0 order-first">
						<button
							onClick={() => setShowMenu(!showMenu)}
							className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-neutral-100 transition-all text-text-placeholder"
						>
							<svg
								className="size-4"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
							</svg>
						</button>
						{showMenu && (
							<div className="absolute left-0 bottom-full mb-2 bg-white border border-border-default rounded-xl shadow-xl py-1 min-w-[120px] z-20 animate-in fade-in zoom-in-95 duration-200">
								<button
									onClick={() => {
										onEdit(msg);
										setShowMenu(false);
									}}
									className="w-full px-4 py-2 text-left text-sm hover:bg-surface-default flex items-center gap-2 text-text-body"
								>
									<svg
										className="size-4"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
									</svg>
									Edit
								</button>
								<button
									onClick={() => {
										onDelete(msg.id);
										setShowMenu(false);
									}}
									className="w-full px-4 py-2 text-left text-sm hover:bg-error-50 text-error-default flex items-center gap-2"
								>
									<svg
										className="size-4"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
									</svg>
									Delete
								</button>
							</div>
						)}
					</div>
				)}

				<div
					className={`rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden transition-all ${
						isMine
							? "bg-primary-600 text-white rounded-tr-none border border-primary-700"
							: "bg-white border border-border-default text-text-heading rounded-tl-none"
					}`}
				>
					{msg.file_url && isImageType(msg.file_type) && (
						<div className="relative w-full aspect-video min-w-[220px] max-w-[400px]">
							<Image
								src={msg.file_url}
								alt="attachment"
								fill
								className="object-cover"
							/>
						</div>
					)}
					{msg.file_url && !isImageType(msg.file_type) && (
						<a
							href={msg.file_url}
							target="_blank"
							rel="noopener noreferrer"
							className={`flex items-center gap-3 px-4 py-3 border-b transition-colors ${
								isMine
									? "border-white/10 hover:bg-white/5"
									: "border-border-default hover:bg-neutral-50"
							}`}
						>
							<svg
								className="size-5 shrink-0"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
							</svg>
							<div className="min-w-0">
								<p className="text-xs font-bold truncate">
									{msg.file_url.split("/").pop()}
								</p>
								<p className="text-[10px] opacity-70">
									Attachment
								</p>
							</div>
						</a>
					)}
					{msg.message && (
						<div className="px-5 py-3.5 break-words">
							<p className="text-body-base-regular leading-relaxed whitespace-pre-wrap">
								{msg.message}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Timestamp + read + edited */}
			<div
				className={`flex items-center gap-2 ${isMine ? "pr-1" : "pl-1"}`}
			>
				<span className="text-[10px] font-medium text-text-placeholder uppercase tracking-tight">
					{formatTime(msg.created_at)}
				</span>
				{isMine && (
					<div className="flex items-center">
						{msg.is_read ? (
							<svg
								className="size-3.5 text-primary-500"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M18 6L7 17l-5-5" />
								<path d="M22 10l-7.5 7.5L13 16" />
							</svg>
						) : (
							<svg
								className="size-3.5 text-text-placeholder opacity-60"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M20 6L9 17l-5-5" />
							</svg>
						)}
					</div>
				)}
				{msg.is_edit && (
					<span className="text-[10px] text-text-placeholder font-medium italic bg-surface-default px-1.5 rounded-sm">
						edited
					</span>
				)}
			</div>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ConversationChat({
	roomId,
	currentUserId,
	otherParticipantName,
}: ConversationChatProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isOtherTyping, setIsOtherTyping] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
	const [editText, setEditText] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isOtherTyping]);

	// ── Mark messages as read ─────────────────────────────────────────────────
	const markAsRead = useCallback(async () => {
		await fetch("/api/chat/read", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ room_id: roomId, reader_id: currentUserId }),
		});
	}, [roomId, currentUserId]);

	// ── Load initial messages ─────────────────────────────────────────────────
	useEffect(() => {
		async function load() {
			try {
				const res = await fetch(`/api/chat?roomId=${roomId}`);
				const data = await res.json();
				if (data.error) {
					setError(data.error);
				} else {
					setMessages(data.messages || []);
					markAsRead();
				}
			} catch {
				setError("Failed to load messages");
			} finally {
				setIsLoading(false);
			}
		}
		load();
	}, [roomId, markAsRead]);

	// ── Supabase Realtime ─────────────────────────────────────────────────────
	useEffect(() => {
		const supabase = createClient();
		const channel = supabase
			.channel(`room-${roomId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "Message",
					filter: `room_id=eq.${roomId}`,
				},
				(payload) => {
					const newMsg = payload.new as ChatMessage;
					setMessages((prev) =>
						prev.some((m) => m.id === newMsg.id)
							? prev
							: [...prev, newMsg],
					);
					if (newMsg.sender_id !== currentUserId) {
						setIsOtherTyping(false);
						markAsRead();
					}
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "Message",
					filter: `room_id=eq.${roomId}`,
				},
				(payload) => {
					const updated = payload.new as ChatMessage;
					setMessages((prev) =>
						prev.map((m) => (m.id === updated.id ? updated : m)),
					);
				},
			)
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "Message",
					filter: `room_id=eq.${roomId}`,
				},
				(payload) => {
					const deletedId = (payload.old as { id: number }).id;
					setMessages((prev) =>
						prev.filter((m) => m.id !== deletedId),
					);
				},
			)
			.on("broadcast", { event: "typing" }, (payload) => {
				if (payload.payload.userId !== currentUserId) {
					setIsOtherTyping(true);
					if (typingTimeoutRef.current)
						clearTimeout(typingTimeoutRef.current);
					typingTimeoutRef.current = setTimeout(
						() => setIsOtherTyping(false),
						3000,
					);
				}
			})
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
			if (typingTimeoutRef.current)
				clearTimeout(typingTimeoutRef.current);
		};
	}, [roomId, currentUserId, markAsRead]);

	// ── Broadcast typing ──────────────────────────────────────────────────────
	const broadcastTyping = useCallback(() => {
		const supabase = createClient();
		supabase.channel(`room-${roomId}`).send({
			type: "broadcast",
			event: "typing",
			payload: { userId: currentUserId },
		});
	}, [roomId, currentUserId]);

	// ── Send message ──────────────────────────────────────────────────────────
	const handleSend = async (fileData?: {
		url: string;
		type: string;
		size: number;
	}) => {
		const trimmed = inputValue.trim();
		if (!trimmed && !fileData) return;
		if (isSending) return;

		setIsSending(true);
		setInputValue("");

		const optimistic: ChatMessage = {
			id: Date.now(),
			room_id: roomId,
			sender_id: currentUserId,
			message: trimmed || null,
			is_read: false,
			is_edit: false,
			file_url: fileData?.url || null,
			file_type: fileData?.type || null,
			file_size: fileData?.size || null,
			created_at: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, optimistic]);

		try {
			const res = await fetch("/api/chat/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					room_id: roomId,
					sender_id: currentUserId,
					message: trimmed || null,
					file_url: fileData?.url || null,
					file_type: fileData?.type || null,
					file_size: fileData?.size || null,
				}),
			});
			const data = await res.json();
			if (data.error) {
				setMessages((prev) =>
					prev.filter((m) => m.id !== optimistic.id),
				);
				setError(data.error);
			} else {
				setMessages((prev) => {
					// If Realtime already inserted the true message, remove the optimistic one
					if (
						prev.some(
							(m) => m.id === data.id && m.id !== optimistic.id,
						)
					) {
						return prev.filter((m) => m.id !== optimistic.id);
					}
					// Otherwise, replace the optimistic message with the true message
					return prev.map((m) => (m.id === optimistic.id ? data : m));
				});
			}
		} catch {
			setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
			setError("Failed to send");
		} finally {
			setIsSending(false);
		}
	};

	// ── File Upload ──────────────────────────────────────────────────────────
	const handleImageClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Limit to images
		if (!file.type.startsWith("image/")) {
			alert("Only image files are supported.");
			return;
		}

		// Max 5MB
		if (file.size > 5 * 1024 * 1024) {
			alert("File size must be less than 5MB.");
			return;
		}

		setIsUploading(true);
		setError(null);

		try {
			const supabase = createClient();
			const fileExt = file.name.split(".").pop();
			const fileName = `${roomId}/${Date.now()}.${fileExt}`;
			const filePath = `chat_attachments/${fileName}`;

			const { data: uploadData, error: uploadError } =
				await supabase.storage
					.from("chat-attachments")
					.upload(filePath, file);

			if (uploadError) throw uploadError;

			const {
				data: { publicUrl },
			} = supabase.storage
				.from("chat-attachments")
				.getPublicUrl(filePath);

			await handleSend({
				url: publicUrl,
				type: file.type,
				size: file.size,
			});
		} catch (err: any) {
			console.error("Upload error:", err);
			setError("Failed to upload image: " + err.message);
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	// ── Edit message ──────────────────────────────────────────────────────────
	const handleStartEdit = (msg: ChatMessage) => {
		setEditingMsg(msg);
		setEditText(msg.message || "");
	};

	const handleSaveEdit = async () => {
		if (!editingMsg || !editText.trim()) return;
		try {
			const res = await fetch("/api/chat/message", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message_id: editingMsg.id,
					sender_id: currentUserId,
					new_message: editText.trim(),
				}),
			});
			const data = await res.json();
			if (!data.error) {
				setMessages((prev) =>
					prev.map((m) => (m.id === editingMsg.id ? data : m)),
				);
			} else {
				setError(data.error);
			}
		} catch {
			setError("Failed to edit message");
		} finally {
			setEditingMsg(null);
			setEditText("");
		}
	};

	// ── Delete message ────────────────────────────────────────────────────────
	const handleDelete = async (id: number) => {
		if (!confirm("Delete this message?")) return;
		const backup = messages;
		setMessages((prev) => prev.filter((m) => m.id !== id));
		try {
			const res = await fetch(
				`/api/chat/message?id=${id}&senderId=${currentUserId}`,
				{ method: "DELETE" },
			);
			const data = await res.json();
			if (data.error) {
				setMessages(backup);
				setError(data.error);
			}
		} catch {
			setMessages(backup);
			setError("Failed to delete");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	// ── Loading state ─────────────────────────────────────────────────────────
	if (isLoading)
		return (
			<div className="flex flex-col flex-1 min-h-0">
				<div className="px-5 py-4 border-b border-border-default shrink-0">
					<div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
				</div>
				<div className="flex-1 px-5 py-4 space-y-4 bg-[#FAFAFA]">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`h-12 rounded-2xl animate-pulse ${i % 2 === 0 ? "bg-blue-100 w-48" : "bg-neutral-200 w-56"}`}
							/>
						</div>
					))}
				</div>
			</div>
		);

	return (
		<div className="flex flex-col flex-1 min-h-0">
			{/* Header */}
			<div className="px-5 py-4 border-b border-border-default shrink-0 flex items-center justify-between">
				<p className="text-heading-6-bold text-text-heading">
					Conversation
				</p>
				<div className="flex items-center gap-2">
					<span className="size-2 rounded-full bg-success-default animate-pulse" />
					<span className="text-body-caption-regular text-text-placeholder">
						Live
					</span>
				</div>
			</div>

			{/* Edit banner */}
			{editingMsg && (
				<div className="mx-5 mt-3 p-3 bg-accent-50 border border-accent-200 rounded-xl flex items-center justify-between">
					<div className="flex-1 mr-3">
						<p className="text-body-caption-regular text-accent-600 mb-1">
							Editing message:
						</p>
						<input
							suppressHydrationWarning
							value={editText}
							onChange={(e) => setEditText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSaveEdit();
								if (e.key === "Escape") {
									setEditingMsg(null);
									setEditText("");
								}
							}}
							className="w-full px-3 py-2 text-sm border border-accent-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500"
							autoFocus
						/>
					</div>
					<div className="flex gap-2">
						<button
							onClick={handleSaveEdit}
							className="px-3 py-1.5 bg-accent-500 text-white text-sm rounded-lg hover:bg-accent-600"
						>
							Save
						</button>
						<button
							onClick={() => {
								setEditingMsg(null);
								setEditText("");
							}}
							className="px-3 py-1.5 border border-border-default text-sm rounded-lg hover:bg-neutral-50"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Error */}
			{error && (
				<div className="mx-5 mt-3 p-3 bg-error-50 border border-error-200 rounded-lg text-text-error text-body-sm-regular flex justify-between">
					<span>{error}</span>
					<button
						onClick={() => setError(null)}
						className="font-bold"
					>
						×
					</button>
				</div>
			)}

			{/* Messages */}
			<div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-4 bg-[#FAFAFA]">
				{messages.length === 0 && (
					<div className="flex flex-col items-center justify-center h-full gap-3 text-text-placeholder">
						<svg
							className="size-12 opacity-30"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
						</svg>
						<p className="text-sm">Start the conversation...</p>
					</div>
				)}
				{messages.map((msg) => (
					<MessageBubble
						key={msg.id}
						msg={msg}
						isMine={msg.sender_id === currentUserId}
						onEdit={handleStartEdit}
						onDelete={handleDelete}
					/>
				))}
				{isOtherTyping && (
					<TypingIndicator name={otherParticipantName} />
				)}
				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<div className="shrink-0 border-t border-border-default bg-white px-4 py-3">
				<div className="flex items-center gap-2">
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						accept="image/*"
						className="hidden"
					/>
					<button
						onClick={handleImageClick}
						disabled={isUploading}
						className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-placeholder hover:text-text-heading shrink-0 disabled:opacity-50"
					>
						{isUploading ? (
							<div className="size-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
						) : (
							<svg
								className="size-5"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
							</svg>
						)}
					</button>
					<input
						suppressHydrationWarning
						type="text"
						value={inputValue}
						onChange={(e) => {
							setInputValue(e.target.value);
							broadcastTyping();
						}}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						className="flex-1 border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-heading bg-surface-background placeholder:text-text-placeholder focus:outline-none focus:ring-[1.5px] focus:ring-[#0066FF] focus:border-[#0066FF] transition-shadow"
					/>
					<button
						onClick={() => handleSend()}
						disabled={
							(!inputValue.trim() && !isUploading) || isSending
						}
						className="p-2.5 bg-[#0066FF] rounded-xl text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm group shrink-0"
					>
						{isSending ? (
							<div className="size-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
						) : (
							<svg
								className="size-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.06-.87.49-.87.99l.01 4.61c0 .71.73 1.2 1.39.92z" />
							</svg>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
