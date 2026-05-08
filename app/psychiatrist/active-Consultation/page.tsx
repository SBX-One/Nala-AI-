"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ConversationChat from "@/components/partials/ConversationChat";

type Tab = "conversation" | "notes" | "patientInfo";

const tabs: { key: Tab; label: string }[] = [
  { key: "conversation", label: "Conversation" },
  { key: "notes", label: "Notes" },
  { key: "patientInfo", label: "Patient Info" },
];


function ActiveConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = Number(searchParams.get("roomId")) || 0;

  const [active, setActive] = useState<Tab>("conversation");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [otherName, setOtherName] = useState("Patient");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil ID psikiater dari session
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

      // Ambil PsychiatristProfile.id
      const { data: profile, error: profileError } = await supabase
        .from("PsychiatristProfile")
        .select("id")
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
          const { data: userProfile, error: userProfileError } = await supabase
            .from("UserProfile")
            .select("name")
            .eq("id", room.user_id)
            .maybeSingle();

          if (userProfile) {
            setOtherName(userProfile.name);
          } else if (userProfileError) {
            console.error("Error fetching user profile:", userProfileError);
          }
        } else if (roomError) {
          console.error("Error fetching room:", roomError);
          setError("Failed to fetch consultation room details.");
        }
      }

      setLoading(false);
    }

    loadSession();
  }, [roomId, router]);

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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-heading-6-bold text-text-heading">Something went wrong</h2>
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
      {/* Left – video placeholder */}
      <div className="flex-1 bg-surface-disabled flex items-center justify-center">
        <div className="text-center space-y-2 text-text-placeholder">
          <svg
            className="size-16 mx-auto opacity-20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
          <p className="text-sm">Video area</p>
        </div>
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
    <Suspense fallback={
      <div className="w-full flex h-full items-center justify-center text-text-placeholder">
        <div className="size-8 rounded-full border-3 border-accent-400 border-t-transparent animate-spin" />
      </div>
    }>
      <ActiveConsultationContent />
    </Suspense>
  );
}
