"use client";

import { useState } from "react";
import ConversationChat from "@/components/partials/ConversationChat";

type Tab = "conversation" | "notes" | "patientInfo";

const tabs: { key: Tab; label: string }[] = [
  { key: "conversation", label: "Conversation" },
  { key: "notes", label: "Notes" },
  { key: "patientInfo", label: "Patient Info" },
];

export default function ActiveConsultationPage() {
  const [active, setActive] = useState<Tab>("conversation");

  return (
    <div className="w-full flex h-full" >
      {/* Left – video placeholder */}
      <div className="flex-1 bg-surface-disabled" />

      {/* Right – sidebar panel */}
      <div className="bg-surface-background border-l border-border-default flex flex-col shrink-0">
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
        {active === "conversation" && (
          <ConversationChat
            viewerRole="psychiatrist"
            otherParticipantName="Dr. Samantha"
          />
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
