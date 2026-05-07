"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ConversationChat from "@/components/partials/ConversationChat";

type Tab = "conversation" | "notes" | "patientInfo";

const tabs: { key: Tab; label: string }[] = [
  { key: "conversation", label: "Conversation" },
  { key: "notes", label: "Notes" },
  { key: "patientInfo", label: "Psychiatrist Info" },
];

export default function ActiveConsultationPage() {
  const searchParams = useSearchParams();
  const roomId = Number(searchParams.get("roomId")) || 0;

  const [active, setActive] = useState<Tab>("conversation");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [otherName, setOtherName] = useState("Psychiatrist");
  const [loading, setLoading] = useState(true);

  // Ambil ID user dari session
  useEffect(() => {
    async function loadSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Ambil UserProfile.id karena itu yang digunakan di MeetingRoom.user_id
      const { data: profile } = await supabase
        .from("UserProfile")
        .select("id")
        .eq("user_id", (
          await supabase
            .from("User")
            .select("id")
            .eq("auth_user_id", user.id)
            .single()
        ).data?.id)
        .single();

      if (profile) {
        setCurrentUserId(profile.id);
      }

      // Ambil nama psikiater dari room
      if (roomId) {
        const { data: room } = await supabase
          .from("MeetingRoom")
          .select("psychiatrist_id")
          .eq("id", roomId)
          .single();

        if (room) {
          const { data: psychiatristProfile } = await supabase
            .from("PsychiatristProfile")
            .select("user_id")
            .eq("id", room.psychiatrist_id)
            .single();

          if (psychiatristProfile) {
            // Ambil nama dari User table via user_id
            const { data: userData } = await supabase
              .from("UserProfile")
              .select("name")
              .eq("user_id", psychiatristProfile.user_id)
              .single();

            // Fallback: Jika psikiater tidak punya UserProfile, gunakan nama default
            if (userData) {
              setOtherName(userData.name);
            }
          }
        }
      }

      setLoading(false);
    }

    loadSession();
  }, [roomId]);

  if (!roomId) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: "calc(100vh - 57px)" }}>
        <div className="text-center space-y-3">
          <p className="text-heading-6-bold text-text-heading">
            No Active Consultation
          </p>
          <p className="text-body-base-regular text-text-placeholder">
            Book a consultation to start chatting with your psychiatrist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex" style={{ height: "calc(100vh - 57px)" }}>
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
            Psychiatrist Info coming soon
          </div>
        )}
      </div>
    </div>
  );
}
