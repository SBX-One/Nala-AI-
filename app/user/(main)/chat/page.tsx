"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import NalaLogo from "@/public/icon/Nala-Logo.svg";
import starIcon from "@/public/icon/starWhite.svg";
import starIconDefault from "@/public/icon/starDefault.svg";

interface Message {
	id?: string;
	role: "user" | "assistant";
	content: string;
	created_at?: string;
	isAnalysis?: boolean; // For special AI Analysis card
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
	const [currentSessionId, setCurrentSessionId] = useState<string | null>(
		null,
	);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const scrollRef = useRef<HTMLDivElement>(null);

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
		fetchSessions();
	}, [fetchSessions]);

	useEffect(() => {
		scrollRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// 3. Start New Chat
	const startNewChat = () => {
		setCurrentSessionId(null);
		setMessages([]);
	};

	// 4. Send Message
	const handleSend = async (overrideInput?: string) => {
		const textToSend = overrideInput || input;
		if (!textToSend.trim() || isLoading) return;

		const userMsg: Message = {
			role: "user",
			content: textToSend,
		};

		setMessages((prev) => [...prev, userMsg]);
		if (!overrideInput) setInput("");
		setIsLoading(true);

		try {
			const res = await fetch("/api/ai/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: textToSend,
					sessionId: currentSessionId,
				}),
			});

			const data = await res.json();
			if (data.error) throw new Error(data.error);

			if (!currentSessionId && data.sessionId) {
				setCurrentSessionId(data.sessionId);
				fetchSessions();
			}

			const assistantMsg: Message = {
				role: "assistant",
				content: data.content,
			};

			// Mock AI Analysis detection for "harm" or "help"
			if (
				textToSend.toLowerCase().includes("harm") ||
				textToSend.toLowerCase().includes("bantu")
			) {
				setMessages((prev) => [
					...prev,
					assistantMsg,
					{
						role: "assistant",
						content: "Self Harm Detected",
						isAnalysis: true,
					},
				]);
			} else {
				setMessages((prev) => [...prev, assistantMsg]);
			}
		} catch (error) {
			console.error("Chat Error:", error);
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content:
						"Maaf, terjadi kesalahan. Silakan coba lagi nanti.",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	// Helper: Group sessions
	const getGroupedSessions = () => {
		const today = new Date().toDateString();
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		const groups: Record<string, ChatSession[]> = {
			Today: [],
			Past: [],
		};

		sessions.forEach((s) => {
			const dateStr = new Date(s.updated_at).toDateString();
			if (dateStr === today) {
				groups.Today.push(s);
			} else {
				groups.Past.push(s);
			}
		});

		return groups;
	};

	const grouped = getGroupedSessions();

	const getRelativeTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		if (diffInHours < 1) return "Just now";
		if (diffInHours < 24) return `${diffInHours} hours ago`;
		const yesterday = new Date();
		yesterday.setDate(now.getDate() - 1);
		if (date.toDateString() === yesterday.toDateString())
			return "Yesterday";
		return date.toLocaleDateString();
	};

	return (
		<div className="flex h-full bg-white overflow-hidden relative">
			{/* Floating Sidebar Toggle — mobile only, only when sidebar is closed */}
			{!isSidebarOpen && (
				<button
					onClick={() => setIsSidebarOpen(true)}
					className="lg:hidden absolute top-6 left-0 z-50 p-2.5 bg-white border border-l-0 border-border-default rounded-r-2xl shadow-md text-icon-default hover:text-text-heading hover:border-border-action transition-all"
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<rect width="18" height="18" x="3" y="3" rx="2" />
						<path d="M9 3v18" />
						<path d="m14 15 2-3-2-3" />
					</svg>
				</button>
			)}

			{/* SIDEBAR: Chat History */}
			<div
				className={`${
				isSidebarOpen
					? "w-full lg:w-100 border-r border-border-default"
					: "w-0 lg:w-20 lg:border-r lg:border-border-default"
			} transition-all duration-300 flex flex-col bg-white overflow-hidden shrink-0`}
			>
				<div className="w-full lg:w-100 flex flex-col h-full shrink-0">
					{isSidebarOpen ? (
					<>
						<div className="p-6 flex items-center justify-between">
							<h2 className="text-body-xl-semibold text-text-heading">
								Chat History
							</h2>
							<button
								onClick={() => setIsSidebarOpen(false)}
								className="text-icon-default hover:text-text-heading transition-colors"
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect
										width="18"
										height="18"
										x="3"
										y="3"
										rx="2"
									/>
									<path d="M9 3v18" />
									<path d="m14 9-2 3 2 3" />
								</svg>
							</button>
						</div>

						<div className="px-6 pb-4">
							<button
								onClick={startNewChat}
								className="button-primary-large w-full text-center items-center justify-center gap-2"
							>
								<Image src={starIcon} alt="star icon" />
								New Chat
							</button>
						</div>

						<div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-6 space-y-6 pb-6">
							{sessions.length === 0 && !isSessionsLoading ? (
								<div className="bg-surface-background border border-border-default rounded-2xl p-6 text-center space-y-3 mt-4">
									<h4 className="text-body-base-semibold text-text-heading">
										I'm ready when you are.
									</h4>
									<p className="text-body-caption-medium text-text-subheading leading-relaxed">
										Every conversation we have will be saved
										here for you to revisit. Need to clear
										your head or understand your mood? Let's
										start with a simple check-in.
									</p>
								</div>
							) : (
								Object.entries(grouped).map(
									([label, groupSessions]) =>
										groupSessions.length > 0 && (
											<div
												key={label}
												className="space-y-3"
											>
												<p className="text-label-caption-medium text-text-subheading uppercase tracking-wider">
													{label}
												</p>
												{groupSessions.map(
													(session) => (
														<button
															key={session.id}
															onClick={() =>
																fetchMessages(
																	session.id,
																)
															}
															className={`w-full py-4 px-6 rounded-2xl text-left transition-all border ${
																currentSessionId ===
																session.id
																	? " border-border-action bg-surface-primary-light"
																	: "bg-surface-background border-border-default"
															}`}
														>
															<h4 className="text-body-base-semibold text-text-boody ">
																{session.title ||
																	"New Chat"}
															</h4>
															<p className="text-body-caption-medium text-text-placeholder mt-1">
																{getRelativeTime(
																	session.updated_at,
																)}
															</p>
														</button>
													),
												)}
											</div>
										),
								)
							)}

							{isSessionsLoading && (
								<div className="space-y-4">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className="h-20 bg-neutral-50 animate-pulse rounded-xl border border-border-default"
										/>
									))}
								</div>
							)}
						</div>
					</>
				) : (
					// Collapsed state — only visible on desktop (lg+) as a narrow icon strip
					<div className="hidden lg:flex flex-col items-center py-6 gap-6 w-20">
						<button
							onClick={() => setIsSidebarOpen(true)}
							className="p-2.5 bg-white border border-border-default rounded-full text-icon-default hover:text-text-heading hover:border-border-action transition-all"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect width="18" height="18" x="3" y="3" rx="2" />
								<path d="M9 3v18" />
								<path d="m14 15 2-3-2-3" />
							</svg>
						</button>
						<button
							onClick={startNewChat}
							className="p-2.5 bg-white border border-border-default rounded-full text-icon-default hover:text-text-heading hover:border-border-action transition-all"
						>
							<Image src={starIconDefault} alt="New Chat" width={20} height={20} />
						</button>
					</div>
				)}
				</div>
			</div>

			{/* MAIN: Chat Interface */}
			<div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
				{/* Messages List */}
				<div
					className={`flex-1 px-6 scroll-smooth ${messages.length === 0 ? "overflow-y-hidden flex flex-col justify-center" : "overflow-y-auto py-8 space-y-8"}`}
				>
					{messages.length === 0 && (
						<div className="flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto py-10">
							<div className="space-y-2 flex flex-col items-center">
								<div className="flex items-center gap-1">
									<Image
										src={NalaLogo}
										alt="Logo"
										className="size-6"
									/>
									<span className="text-label-caption-bold text-text-action">
										Nala AI
									</span>
								</div>
								<div className="grid gap-2">
									<h1 className="text-body-lg-semibold text-text-heading">
										Hello, I'm here for you.
									</h1>
									<p className="text-body-sm-medium text-text-subheading max-w-md">
										I can help you understand what you're
										feeling and guide you to the right
										support. You can talk to me about
										anything. What's on your mind today?
									</p>
								</div>
							</div>

							{/* Input in Welcome State */}
							<div className="w-full max-w-xl mt-8">
								<div className="flex items-center gap-4">
									<div className="relative flex-1 flex items-center">
										<div className="absolute left-4 text-text-placeholder">
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<circle
													cx="12"
													cy="12"
													r="10"
												/>
												<path d="M12 8v8M8 12h8" />
											</svg>
										</div>
										<input
											value={input}
											onChange={(e) =>
												setInput(e.target.value)
											}
											onKeyDown={(e) =>
												e.key === "Enter" &&
												handleSend()
											}
											placeholder="Type A Message"
											className="w-full pl-10 pr-2 py-4 bg-white border border-border-default rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-text-heading"
										/>
									</div>
									<button
										onClick={() => handleSend()}
										disabled={!input.trim() || isLoading}
										className="button-primary-rounded"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
										>
											<path
												d="M0 0h24v24H0z"
												fill="none"
											/>
											<path
												fill="currentColor"
												d="M4 18.5v-5.154L9.846 12L4 10.654V5.5L19.423 12z"
											/>
										</svg>
									</button>
								</div>

								{/* Suggested Prompts */}
								<div className="flex flex-wrap justify-center gap-3 mt-6">
									{[
										"Check my symptoms",
										"I need to talk",
										"How does this work?",
									].map((prompt) => (
										<button
											key={prompt}
											onClick={() => handleSend(prompt)}
											className="px-5 py-2.5 bg-white border border-border-default rounded-xl text-label-small-medium text-text-subheading hover:bg-neutral-50 hover:border-primary-200 transition-all"
										>
											{prompt}
										</button>
									))}
								</div>
							</div>
						</div>
					)}

					{messages.map((m, i) => (
						<div
							key={i}
							className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} gap-2`}
						>
							{m.role === "assistant" && !m.isAnalysis && (
								<div className="flex items-center gap-2 ml-1 mb-1">
									<div className="size-5 relative">
										<Image src={NalaLogo} alt="Logo" fill />
									</div>
									<span className="text-label-caption-bold text-primary-600">
										Nala AI
									</span>
								</div>
							)}

							{m.isAnalysis ? (
								<div className="max-w-md w-full bg-[#FFF5F0] border border-[#FFD9C7] rounded-3xl p-6 space-y-4">
									<div className="flex flex-col gap-1">
										<span className="text-[12px] font-bold text-[#FF6B2C] uppercase tracking-wider">
											AI Analysis
										</span>
										<h3 className="text-heading-6-bold text-text-heading">
											{m.content}
										</h3>
										<p className="text-body-caption-regular text-text-subheading">
											Lets see what kind of psychiatry to
											help you through your problem
										</p>
									</div>
									<button className="w-full py-3 bg-[#C80000] text-white rounded-xl text-label-base-semibold hover:bg-red-800 transition-all">
										Book Specialist
									</button>
								</div>
							) : (
								<div
									className={`px-6 py-4 rounded-3xl max-w-[85%] ${
										m.role === "user"
											? "bg-primary-500 text-white rounded-tr-sm"
											: "bg-white border border-border-default text-text-heading rounded-tl-sm"
									}`}
								>
									<p className="text-body-base-regular leading-relaxed whitespace-pre-wrap">
										{m.content}
									</p>
								</div>
							)}
						</div>
					))}

					{isLoading && (
						<div className="flex flex-col items-start gap-2">
							<div className="flex items-center gap-2 ml-1">
								<div className="size-5 relative animate-pulse">
									<Image src={NalaLogo} alt="Logo" fill />
								</div>
								<span className="text-label-caption-bold text-primary-600 animate-pulse">
									Nala is thinking...
								</span>
							</div>
							<div className="px-6 py-4 rounded-3xl bg-neutral-50 border border-border-default flex gap-1">
								<div className="size-1.5 bg-primary-400 rounded-full animate-bounce" />
								<div className="size-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]" />
								<div className="size-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]" />
							</div>
						</div>
					)}
					<div ref={scrollRef} />
				</div>

				{/* Bottom Input Area (Only visible when there are messages) */}
				{messages.length > 0 && (
					<div className="p-6 bg-white border-t border-border-default shrink-0">
						<div className="max-w-4xl mx-auto">
							<div className="flex items-center gap-4">
								<div className="relative flex-1 flex items-center">
									<div className="absolute left-4 text-text-placeholder">
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<circle cx="12" cy="12" r="10" />
											<path d="M12 8v8M8 12h8" />
										</svg>
									</div>
									<input
										value={input}
										onChange={(e) =>
											setInput(e.target.value)
										}
										onKeyDown={(e) =>
											e.key === "Enter" && handleSend()
										}
										placeholder="Type A Message"
										className="w-full pl-10 pr-2 py-4 bg-white border border-border-default rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all text-text-heading"
									/>
								</div>
								<button
									onClick={() => handleSend()}
									disabled={!input.trim() || isLoading}
									className="button-primary-rounded"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
									>
										<path d="M0 0h24v24H0z" fill="none" />
										<path
											fill="currentColor"
											d="M4 18.5v-5.154L9.846 12L4 10.654V5.5L19.423 12z"
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
