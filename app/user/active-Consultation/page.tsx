"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ConversationChat from "@/components/partials/ConversationChat";
import {
	LiveKitRoom,
	VideoTrack,
	useTracks,
	useLocalParticipant,
	TrackToggle,
	useParticipants,
	RoomAudioRenderer,
	useAudioPlayback,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";

interface Psychiatrist {
	name: string;
	specialization: string;
	photo_url?: string;
	expertises: string[];
	experience: number;
	patientCount: number;
}

// Video + Controls combined in one component with proper layout
function VideoCallSection({
	onEndCall,
	isChatOpen,
	setIsChatOpen,
}: {
	onEndCall: () => void;
	isChatOpen: boolean;
	setIsChatOpen: (v: boolean) => void;
}) {
	const tracks = useTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.Microphone, withPlaceholder: false },
		],
		{ onlySubscribed: false },
	);

	const participants = useParticipants();
	const { isMicrophoneEnabled, isCameraEnabled, localParticipant } =
		useLocalParticipant();

	const remoteTracks = tracks.filter(
		(t) =>
			t.participant.identity !== localParticipant.identity &&
			t.source === Track.Source.Camera,
	);

	const localTracks = tracks.filter(
		(t) =>
			t.participant.identity === localParticipant.identity &&
			t.source === Track.Source.Camera,
	);

	const remoteParticipant = participants.find(
		(p) => p.identity !== localParticipant.identity,
	);

	return (
		<div className="relative w-full h-full bg-black overflow-hidden">
			{/* Remote (Psychiatrist) Video - Full Area */}
			{remoteTracks.length > 0 && remoteTracks[0].publication?.track ? (
				<VideoTrack
					trackRef={remoteTracks[0]}
					className="w-full h-full object-cover"
				/>
			) : (
				<div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-4">
					<div className="size-24 rounded-full bg-white/10 flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-12"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
							/>
						</svg>
					</div>
					<p className="text-body-lg-medium text-center px-4">
						{remoteParticipant
							? `Waiting for ${remoteParticipant.name || "psychiatrist"} to enable camera...`
							: "Waiting for psychiatrist to join..."}
					</p>
				</div>
			)}

			{/* Local (You) Video - Picture in Picture */}
			<div className="absolute top-6 left-6 w-40 md:w-48 aspect-4/3 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black z-20">
				{localTracks.length > 0 && localTracks[0].publication?.track ? (
					<VideoTrack
						trackRef={localTracks[0]}
						className="w-full h-full object-cover scale-x-[-1]"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-surface-disabled text-text-placeholder">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-8"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zM16 18H4V6h12v12z"
							/>
						</svg>
					</div>
				)}
			</div>

			{/* Controls */}
			<div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-30">
				<div className="flex items-center gap-2 md:gap-4 bg-white/10 backdrop-blur-xl rounded-full px-3 md:px-6 py-2 md:py-3 border border-white/20 shadow-2xl">
					<button
						onClick={() =>
							localParticipant.setMicrophoneEnabled(
								!isMicrophoneEnabled,
							)
						}
						className={`size-10 md:size-12 rounded-full flex items-center justify-center transition-all border ${
							!isMicrophoneEnabled
								? "bg-error-default text-white border-transparent"
								: "border-white/20 bg-white/10 text-white hover:bg-white/20"
						}`}
					>
						{!isMicrophoneEnabled ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="size-5 md:size-6"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.17l6.02 6zM4.41 2.86L3 4.27l6 6V11c0 1.66 1.34 3 3 3c.23 0 .44-.03.65-.08l2.39 2.39c-.97.43-2.06.69-3.21.69c-2.8 0-5.41-1.66-6.66-4h-2.1c1.3 3.33 4.41 5.7 8.01 5.94V22h4v-3.03c.87-.13 1.71-.41 2.48-.82l3.29 3.29l1.41-1.41L4.41 2.86z"
								/>
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="size-5 md:size-6"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
								/>
								<path
									fill="currentColor"
									d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
								/>
							</svg>
						)}
					</button>

					<button
						onClick={() =>
							localParticipant.setCameraEnabled(!isCameraEnabled)
						}
						className={`size-10 md:size-12 rounded-full flex items-center justify-center transition-all border ${
							!isCameraEnabled
								? "bg-error-default text-white border-transparent"
								: "border-white/20 bg-white/10 text-white hover:bg-white/20"
						}`}
					>
						{!isCameraEnabled ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="size-5 md:size-6"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27L4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21L21 19.73L3.27 2z"
								/>
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="size-5 md:size-6"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
								/>
							</svg>
						)}
					</button>

					<button
						onClick={() => setIsChatOpen(!isChatOpen)}
						className={`size-10 md:size-12 rounded-full flex lg:hidden items-center justify-center transition-all border ${
							isChatOpen
								? "bg-primary-default text-white border-transparent"
								: "border-white/20 bg-white/10 text-white hover:bg-white/20"
						}`}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-5 md:size-6"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
						</svg>
					</button>

					<div className="w-px h-6 md:h-8 bg-white/20 mx-1" />

					<button
						onClick={onEndCall}
						className="size-10 md:size-12 rounded-full bg-error-default text-white flex items-center justify-center hover:bg-red-700 transition-all shadow-lg"
						title="End Call"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-5 md:size-6"
							viewBox="0 0 24 24"
						>
							<path
								fill="none"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M10 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5m4 13l3-3m0 0l-3-3m3 3H9"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}

function AudioPlaybackHandler() {
	const { canPlayAudio, startAudio } = useAudioPlayback();
	if (canPlayAudio) return null;

	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
			<div className="text-center space-y-6 p-8 bg-white rounded-[32px] max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
				<div className="size-20 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 mx-auto">
					<svg
						className="size-10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M11 5L6 9H2v6h4l5 4V5z" />
						<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
					</svg>
				</div>
				<div className="space-y-2">
					<h3 className="text-heading-6-bold text-text-heading">
						Audio is Blocked
					</h3>
					<p className="text-body-base-regular text-text-placeholder">
						Your browser has blocked audio playback. Click the
						button below to enable sound for this consultation.
					</p>
				</div>
				<button
					onClick={startAudio}
					className="w-full py-4 bg-primary-default text-white rounded-2xl text-label-base-semibold hover:bg-primary-dark shadow-lg shadow-primary-500/20 transition-all"
				>
					Enable Audio
				</button>
			</div>
		</div>
	);
}

function ActiveConsultationContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const roomId = Number(searchParams.get("roomId")) || 0;

	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [psychiatrist, setPsychiatrist] = useState<Psychiatrist | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [livekitToken, setLivekitToken] = useState<string>("");
	const [isChatOpen, setIsChatOpen] = useState(false);

	// Ambil data session + token
	useEffect(() => {
		async function loadSession() {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				setLoading(false);
				return;
			}

			// Ambil User record
			const { data: userData, error: userError } = await supabase
				.from("User")
				.select("id")
				.eq("auth_user_id", user.id)
				.maybeSingle();

			if (userError || !userData) {
				router.push("/register/role");
				return;
			}

			// Ambil UserProfile
			const { data: profile } = await supabase
				.from("UserProfile")
				.select("id, name")
				.eq("user_id", userData.id)
				.maybeSingle();

			if (profile) {
				setCurrentUserId(profile.id);
			} else {
				router.push("/register/user-profile");
				return;
			}

			// Ambil data psikiater & room
			if (roomId) {
				// Step 1: Get room basic data and psychiatrist info with nested joins
				const { data: room, error: roomError } = await supabase
					.from("MeetingRoom")
					.select(
						`
            psychiatrist_id,
            psychiatrist:PsychiatristProfile (
              id,
              name,
              specialization,
              avatar_url,
              experience_start,
              experience_end,
              user:User (
                user_profile:UserProfile (
                  name,
                  display_name,
                  avatar_url
                )
              ),
              expertises:PsychiatristExpertise (
                expertise:Expertise (name)
              )
            )
          `,
					)
					.eq("id", roomId)
					.maybeSingle();

				if (roomError || !room) {
					console.error("Room fetch error:", roomError);
					setError("Failed to fetch room details.");
				} else if (room.psychiatrist) {
					const p = room.psychiatrist as any;
					// Priority: PsychiatristProfile.name -> UserProfile.display_name -> UserProfile.name -> "Psychiatrist"
					const name =
						p.name ||
						p.user?.user_profile?.display_name ||
						p.user?.user_profile?.name ||
						"Psychiatrist";
					// Priority: PsychiatristProfile.avatar_url -> UserProfile.avatar_url
					const avatar =
						p.avatar_url || p.user?.user_profile?.avatar_url;

					// Calculate experience years
					let expYears = 0;
					if (p.experience_start) {
						const start = new Date(p.experience_start);
						const end = p.experience_end
							? new Date(p.experience_end)
							: new Date();
						expYears = end.getFullYear() - start.getFullYear();
					}

					setPsychiatrist({
						name: name,
						specialization:
							p.specialization || "Mental Health Specialist",
						photo_url: avatar,
						expertises:
							p.expertises
								?.map((e: any) => e.expertise?.name)
								.filter(Boolean) || [],
						experience: expYears > 0 ? expYears : 1,
						patientCount: Math.floor(Math.random() * 500) + 100, // Matching dummy logic from actions
					});
				}

				// Fetch token
				try {
					const resp = await fetch(
						`/api/livekit-token?room=meeting-${roomId}&identity=user-${profile.id}&name=${encodeURIComponent(profile.name || "User")}`,
					);
					const data = await resp.json();
					if (data.token) {
						setLivekitToken(data.token);
					}
				} catch (err) {
					console.error("Token fetch failed", err);
				}
			}

			setLoading(false);
		}

		loadSession();
	}, [roomId, router]);

	const handleEndCall = () => {
		router.push(`/user/post-consultation?roomId=${roomId}`);
	};

	const getInitials = (name: string) => {
		const cleanName = name.replace(/^Dr\.?\s+/i, "");
		const parts = cleanName.split(" ");
		if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
		return cleanName.substring(0, 2).toUpperCase();
	};

	if (loading) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<div className="size-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
			</div>
		);
	}

	if (error || !roomId) {
		return (
			<div className="w-full h-full flex items-center justify-center p-6 text-center">
				<div>
					<p className="text-heading-6-bold text-text-heading mb-2">
						No Active Session
					</p>
					<p className="text-text-subheading">
						{error || "Please select a consultation room."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full flex" style={{ height: "calc(100vh - 57px)" }}>
			{/* Left – Video Area */}
			<div className="flex-1 relative bg-black overflow-hidden">
				{livekitToken ? (
					<LiveKitRoom
						video={true}
						audio={true}
						token={livekitToken}
						serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
						onDisconnected={handleEndCall}
						style={{ height: "100%" }}
					>
						<VideoCallSection
							onEndCall={handleEndCall}
							isChatOpen={isChatOpen}
							setIsChatOpen={setIsChatOpen}
						/>
						<RoomAudioRenderer />
						<AudioPlaybackHandler />
					</LiveKitRoom>
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-4">
						<div className="size-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
						<p>Connecting...</p>
					</div>
				)}
			</div>

			{/* Right – Sidebar Panel */}
			<div
				className={`bg-white border-l border-border-default flex flex-col shrink-0 overflow-hidden transition-all duration-300 z-50
          ${isChatOpen ? "fixed inset-0 w-full lg:relative lg:w-[380px]" : "w-0 lg:w-[380px] lg:flex"} 
          ${!isChatOpen && "hidden lg:flex"}`}
			>
				{/* Mobile Close Button */}
				{isChatOpen && (
					<div className="lg:hidden p-4 flex justify-end bg-surface-background border-b border-border-default">
						<button
							onClick={() => setIsChatOpen(false)}
							className="p-2 hover:bg-surface-default rounded-full text-icon-default"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="size-6"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
				)}

				{/* Psychiatrist Info Card */}
				{psychiatrist && (
					<div className="p-6 border-b border-border-default space-y-4">
						<div className="flex items-center  gap-4">
							<div className="bg-primary-100 size-20 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
								{psychiatrist.photo_url ? (
									<img
										src={psychiatrist.photo_url}
										alt={psychiatrist.name}
										className="size-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-primary-700 text-heading-4-bold">
										{getInitials(psychiatrist.name)}
									</div>
								)}
							</div>
							<div className="flex flex-col gap-1 ">
								<h3 className="text-body-xl-bold text-text-heading leading-tight">
									{psychiatrist.name}
								</h3>
								<p className="text-body-base-medium text-text-action">
									{psychiatrist.specialization}
								</p>
							</div>
						</div>

						<div className="flex gap-2 flex-wrap">
							{psychiatrist.expertises.map((e) => (
								<span
									key={e}
									className="text-label-small-medium px-2 py-1 rounded-sm bg-surface-primary-light text-text-action"
								>
									{e}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Chat Section */}
				<div className="flex-1 flex flex-col min-h-0 bg-surface-background">
					{currentUserId && (
						<ConversationChat
							roomId={roomId}
							currentUserId={currentUserId}
							otherParticipantName={
								psychiatrist?.name || "Psychiatrist"
							}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

export default function ActiveConsultationPage() {
	return (
		<Suspense
			fallback={
				<div className="p-10 text-center">Loading session...</div>
			}
		>
			<ActiveConsultationContent />
		</Suspense>
	);
}
