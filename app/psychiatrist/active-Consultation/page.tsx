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
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";

type Tab = "conversation" | "notes" | "patientInfo";

const tabs: { key: Tab; label: string }[] = [
  { key: "conversation", label: "Conversation" },
  { key: "notes", label: "Notes" },
  { key: "patientInfo", label: "Patient Info" },
];

// Custom Video Call Layout
function VideoCallArea() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  const remoteTracks = tracks.filter(
    (t) =>
      t.participant.sid !== localParticipant.localParticipant.sid &&
      t.source === Track.Source.Camera,
  );

  const localTracks = tracks.filter(
    (t) =>
      t.participant.sid === localParticipant.localParticipant.sid &&
      t.source === Track.Source.Camera,
  );

  const remoteParticipant = participants.find(
    (p) => p.sid !== localParticipant.localParticipant.sid,
  );

  return (
    <div className="relative w-full h-full bg-black">
      {/* Remote (Patient) Video - Full Area */}
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
          <p className="text-body-lg-medium">
            {remoteParticipant
              ? `Waiting for ${remoteParticipant.name || "patient"} to enable camera...`
              : "Waiting for patient to join..."}
          </p>
        </div>
      )}

      {/* Local (You) Video - Picture in Picture */}
      <div className="absolute bottom-6 right-6 w-48 aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black">
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
    </div>
  );
}

// Call Controls Component
function CallControls({ onEndCall }: { onEndCall: () => void }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/20 z-20">
      <TrackToggle
        source={Track.Source.Microphone}
        className="size-12 rounded-full flex items-center justify-center transition-all bg-white/20 text-white hover:bg-white/30"
      />
      <TrackToggle
        source={Track.Source.Camera}
        className="size-12 rounded-full flex items-center justify-center transition-all bg-white/20 text-white hover:bg-white/30"
      />
      <button
        onClick={onEndCall}
        className="size-12 rounded-full bg-error-default text-white flex items-center justify-center hover:bg-red-700 transition-all"
        title="End Call"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-6"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9c-.98.49-1.87 1.12-2.66 1.85c-.18.18-.43.28-.7.28c-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71c0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29c-.27 0-.52-.1-.7-.28a11.27 11.27 0 0 0-2.67-1.85a.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"
          />
        </svg>
      </button>
    </div>
  );
}

function ActiveConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = Number(searchParams.get("roomId")) || 0;

  const [active, setActive] = useState<Tab>("conversation");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [otherName, setOtherName] = useState("Patient");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livekitToken, setLivekitToken] = useState<string>("");

  // Ambil ID psikiater dari session + fetch LiveKit token
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

      // Ambil User.id
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (userError || !userData) {
        console.error("User record not found:", userError);
        router.push("/register/role");
        return;
      }

      // Ambil PsychiatristProfile.id + name
      const { data: profile, error: profileError } = await supabase
        .from("PsychiatristProfile")
        .select("id, name")
        .eq("user_id", userData.id)
        .maybeSingle();

      if (profile) {
        setCurrentUserId(profile.id);
      } else {
        console.error("PsychiatristProfile not found:", profileError);
        router.push("/register/psychiatrist-profile");
        return;
      }

      // Ambil nama pasien dari room
      if (roomId) {
        const { data: room, error: roomError } = await supabase
          .from("MeetingRoom")
          .select("user_id")
          .eq("id", roomId)
          .maybeSingle();

        if (room) {
          const { data: userProfile } = await supabase
            .from("UserProfile")
            .select("name")
            .eq("id", room.user_id)
            .maybeSingle();

          if (userProfile) {
            setOtherName(userProfile.name);
          }
        } else if (roomError) {
          console.error("Error fetching room:", roomError);
          setError("Failed to fetch consultation room details.");
        }

        // Fetch LiveKit token
        try {
          const resp = await fetch(
            `/api/livekit-token?room=meeting-${roomId}&identity=psychiatrist-${profile.id}&name=${encodeURIComponent(profile.name || "Psychiatrist")}`,
          );
          const data = await resp.json();
          if (data.token) {
            setLivekitToken(data.token);
          } else {
            console.error("Failed to get LiveKit token:", data.error);
          }
        } catch (err) {
          console.error("Error fetching LiveKit token:", err);
        }
      }

      setLoading(false);
    }

    loadSession();
  }, [roomId, router]);

  const handleEndCall = () => {
    router.push("/psychiatrist");
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="size-10 rounded-full border-4 border-accent-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-border-default shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-error-50 rounded-2xl flex items-center justify-center mx-auto text-error-default">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 8v4M12 16h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="text-heading-6-bold text-text-heading">
            Something went wrong
          </h2>
          <p className="text-body-base-regular text-text-subheading">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-accent-500 text-white rounded-xl text-label-base-semibold hover:bg-accent-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="w-full flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <p className="text-heading-6-bold text-text-heading">
            No Active Consultation
          </p>
          <p className="text-body-base-regular text-text-placeholder">
            Select a consultation to start a conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex h-full">
      {/* Left – LiveKit Video Call */}
      <div className="flex-1 relative bg-black">
        {livekitToken ? (
          <LiveKitRoom
            video={true}
            audio={true}
            token={livekitToken}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            onDisconnected={handleEndCall}
            style={{ height: "100%" }}
          >
            <VideoCallArea />
            <CallControls onEndCall={handleEndCall} />
          </LiveKitRoom>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-4">
            <div className="size-12 rounded-full border-4 border-white/20 border-t-white/60 animate-spin" />
            <p className="text-body-base-medium">Connecting to video call...</p>
          </div>
        )}
      </div>

      {/* Right – sidebar panel */}
      <div className="bg-surface-background border-l border-border-default flex flex-col w-[380px] shrink-0">
        {/* Tabs */}
        <div className="flex w-full border-b border-border-default shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex-1 py-4 text-label-base-medium transition-colors border-b-2 ${
                active === tab.key
                  ? "text-text-action border-[#0066FF]"
                  : "text-text-placeholder border-transparent hover:text-text-heading"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {active === "conversation" && currentUserId && !loading && (
          <ConversationChat
            roomId={roomId}
            currentUserId={currentUserId}
            otherParticipantName={otherName}
          />
        )}

        {active === "conversation" && loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="size-8 rounded-full border-3 border-accent-400 border-t-transparent animate-spin" />
          </div>
        )}

        {active === "notes" && (
          <div className="flex-1 flex items-center justify-center text-text-placeholder text-sm">
            Notes coming soon
          </div>
        )}

        {active === "patientInfo" && (
          <div className="flex-1 flex items-center justify-center text-text-placeholder text-sm">
            Patient Info coming soon
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActiveConsultationPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex h-full items-center justify-center text-text-placeholder">
          <div className="size-8 rounded-full border-3 border-accent-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <ActiveConsultationContent />
    </Suspense>
  );
}
