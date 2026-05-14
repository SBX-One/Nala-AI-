"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ConversationChat from "@/components/partials/ConversationChat";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { useConsultationRoom } from "@/context/ConsultationRoomContext";
import { getPatientInfo, endMeetingRoom } from "@/app/actions/consultation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Tab = "conversation" | "notes" | "patientInfo";

function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const tabs: { key: Tab; label: string }[] = [
  { key: "conversation", label: "Conversation" },
  { key: "notes", label: "Notes" },
  { key: "patientInfo", label: "Patient Info" },
];

function ActiveConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdFromUrl = Number(searchParams.get("roomId")) || 0;

  const {
    diagnoseDraft,
    setDiagnoseDraft,
    consultationNotes,
    setConsultationNotes,
    roomId,
    setRoomId,
    roomStatus,
    setRoomStatus,
    patientProfile,
    setPatientProfile,
    medicationHistory,
    setMedicationHistory,
    aiSummary,
    setAiSummary,
  } = useConsultationRoom();

  const [active, setActive] = useState<Tab>("conversation");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [otherName, setOtherName] = useState("Patient");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Accordion states
  const [isDiagnoseOpen, setIsDiagnoseOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [isMedicationOpen, setIsMedicationOpen] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [consultationData, setConsultationData] = useState<any>(null);

  // Initialize roomId from URL
  useEffect(() => {
    if (roomIdFromUrl && roomIdFromUrl !== roomId) {
      setRoomId(roomIdFromUrl);
    }
  }, [roomIdFromUrl, roomId, setRoomId]);

  // Load session and data
  useEffect(() => {
    async function loadData() {
      if (!roomId) return;
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: userData } = await supabase
          .from("User")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        // Ambil PsychiatristProfile.id for currentUserId
        const { data: profileData } = await supabase
          .from("PsychiatristProfile")
          .select("id")
          .eq("user_id", userData?.id)
          .maybeSingle();

        if (profileData) setCurrentUserId(profileData.id);

        const { data: meeting } = await supabase
          .from("MeetingRoom")
          .select("*, user:UserProfile(id, name)")
          .eq("id", roomId)
          .single();

        if (meeting) {
          setRoomStatus(meeting.status);
          setOtherName(meeting.user?.name || "Patient");

          // Fetch patient info and medication history
          const info = await getPatientInfo(meeting.user_id);
          if (info.data) {
            setPatientProfile(info.data.profile);
            setMedicationHistory(info.data.medicationHistory);
          }

          // Fetch current consultation complaint
          const { data: cons } = await supabase
            .from("Consultation")
            .select("*")
            .eq("user_id", meeting.user_id)
            .eq("psychiatrist_id", meeting.psychiatrist_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (cons) setConsultationData(cons);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load consultation data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [
    roomId,
    setRoomId,
    setRoomStatus,
    setPatientProfile,
    setMedicationHistory,
  ]);

  const handleAnalyzeAI = async () => {
    if (!consultationData?.complaint) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/psychiatrist/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint: consultationData.complaint,
          medicationHistory: medicationHistory,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setAiSummary(data.summary);
        setIsAiOpen(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate AI summary");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [showEndModal, setShowEndModal] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const handleEndRoom = async () => {
    if (!roomId) return;

    setIsEnding(true);
    try {
      const res = await endMeetingRoom(
        roomId,
        consultationNotes,
        diagnoseDraft,
        aiSummary || "",
      );
      if (res.success) {
        router.push(`/psychiatrist/consultation-room/post?roomId=${roomId}`);
      } else {
        alert(res.error || "Failed to end session");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while ending the session");
    } finally {
      setIsEnding(false);
      setShowEndModal(false);
    }
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

  if (!roomId || roomStatus === "finished") {
    return (
      <div className="w-full flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <p className="text-heading-6-bold text-text-heading">
            {roomStatus === "finished"
              ? "Consultation Ended"
              : "No Active Consultation"}
          </p>
          <p className="text-body-base-regular text-text-placeholder">
            {roomStatus === "finished"
              ? "This session has been completed."
              : "Select a consultation to start a conversation."}
          </p>
          <button
            onClick={() => router.push("/psychiatrist/consultation/queue")}
            className="button-primary-large"
          >
            Back to Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex h-full">
      {/* Left – video placeholder */}
      <div className="flex-1 bg-surface-disabled flex items-center justify-center relative">
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

        {/* Floating Session Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-surface-background backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl z-10">
          {/* Mic Button */}
          <button className="size-12 rounded-full border border-border-default text-icon-default flex items-center justify-center transition-all group">
            <svg
              className="size-6 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>

          {/* Video Button */}
          <button className="size-12 rounded-full border border-border-default text-icon-default flex items-center justify-center transition-all group">
            <svg
              className="size-6 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>

          {/* End Room Button (Center) */}
          <button
            onClick={() => setShowEndModal(true)}
            disabled={isEnding}
            className="size-16 rounded-full bg-button-error hover:bg-error-600 text-white flex items-center justify-center transition-all shadow-lg shadow-error-500/40 group relative"
          >
            {isEnding ? (
              <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="size-8 group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.95.95 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
              </svg>
            )}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-error-600 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
              END SESSION
            </div>
          </button>

          {/* Screen Share Button */}
          <button className="size-12 rounded-full border border-border-default text-icon-default flex items-center justify-center transition-all group">
            <svg
              className="size-6 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <polyline points="8 21 12 17 16 21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </button>

          {/* More Options / Chat Toggle Placeholder */}
          <button className="size-12 rounded-full border border-border-default text-icon-default flex items-center justify-center transition-all group">
            <svg
              className="size-6 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
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
          <div className="flex-1 flex flex-col bg-surface-background">
            {/* Header Title */}
            <div className="px-5 py-6 border-b border-border-default">
              <h2 className="text-heading-6-bold text-text-heading">Notes</h2>
            </div>

            {/* Accordion Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Diagnose Draft Section */}
              <div className="border-b border-border-default">
                <button
                  onClick={() => setIsDiagnoseOpen(!isDiagnoseOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-body-lg-medium text-text-heading">
                    Diagnose draft
                  </span>
                  <svg
                    className={`size-5 text-text-placeholder transition-transform duration-200 ${isDiagnoseOpen ? "rotate-45" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                {isDiagnoseOpen && (
                  <div className="px-5 pb-6">
                    <FormInput
                      id="diagnose-draft"
                      placeholder="Enter diagnose (not verified)"
                      value={diagnoseDraft}
                      onChange={(e) => setDiagnoseDraft(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Consultation Notes Section */}
              <div className="border-b border-border-default">
                <button
                  onClick={() => setIsNotesOpen(!isNotesOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-body-lg-medium text-text-heading">
                    Consultation Notes
                  </span>
                  <svg
                    className={`size-5 text-text-placeholder transition-transform duration-200 ${isNotesOpen ? "rotate-45" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                {isNotesOpen && (
                  <div className="px-5 pb-6">
                    <FormTextarea
                      id="consultation-notes"
                      placeholder="Enter notes"
                      rows={8}
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {active === "patientInfo" && (
          <div className="flex-1 flex flex-col bg-surface-background overflow-hidden">
            <div className="px-5 py-6 border-b border-border-default">
              <h2 className="text-heading-6-bold text-text-heading">
                Patient Info
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Profile Card */}
              <div className="p-5 border-b border-border-default ">
                <h3 className="text-heading-6-semibold text-text-body mb-1">
                  {patientProfile?.name || otherName}
                </h3>
                <p className="text-body-sm-semibold text-text-action mb-6">
                  {patientProfile?.location || "Unknown Location"},{" "}
                  {patientProfile?.birth_date
                    ? calculateAge(patientProfile.birth_date)
                    : "?"}{" "}
                  Years Old
                </p>

                <div className="flex items-center justify-between border-b pb-4 border-border-default  gap-6 text-text-placeholder text-body-caption-medium mb-6">
                  <div className="flex items-center gap-2">
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {consultationData?.date
                      ? new Date(consultationData.date).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" },
                        )
                      : "-"}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {consultationData?.start_time
                      ? new Date(
                          `2000-01-01T${consultationData.start_time}`,
                        ).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "-"}{" "}
                    -{" "}
                    {consultationData?.end_time
                      ? new Date(
                          `2000-01-01T${consultationData.end_time}`,
                        ).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "-"}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-body-sm-bold text-text-subheading">
                    Complaint
                  </p>
                  <p className="text-body-base-medium text-text-body ">
                    {consultationData?.complaint || "No complaint provided"}
                  </p>
                </div>
              </div>

              {/* AI Summary Accordion */}
              <div className="border-b border-border-default">
                <button
                  onClick={() => setIsAiOpen(!isAiOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-body-lg-medium text-text-heading">
                    AI Summary
                  </span>
                  <svg
                    className={`size-5 text-text-placeholder transition-transform duration-200 ${isAiOpen ? "rotate-45" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                {isAiOpen && (
                  <div className="px-5 pb-6">
                    {aiSummary ? (
                      <div className="p-4 bg-[#F8F9FA] border border-border-default rounded-2xl text-body-base-regular text-text-secondary leading-relaxed prose prose-sm max-w-none prose-headings:text-text-heading prose-headings:text-label-base-semibold prose-p:mb-2 prose-li:mb-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {aiSummary}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 py-4">
                        <p className="text-body-sm-regular text-text-placeholder text-center">
                          Generate an AI summary based on current complaints and
                          medication history.
                        </p>
                        <button
                          onClick={handleAnalyzeAI}
                          disabled={isAnalyzing || !consultationData?.complaint}
                          className="px-6 py-2.5 bg-[#0066FF] text-white rounded-xl text-label-base-semibold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isAnalyzing && (
                            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Medication History Accordion */}
              <div className="border-b border-border-default">
                <button
                  onClick={() => setIsMedicationOpen(!isMedicationOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-body-lg-medium text-text-heading">
                    Medication History
                  </span>
                  <svg
                    className={`size-5 text-text-placeholder transition-transform duration-200 ${isMedicationOpen ? "rotate-45" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                {isMedicationOpen && (
                  <div className="px-5 pb-6 space-y-3">
                    {medicationHistory.length > 0 ? (
                      medicationHistory.map((med, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white border border-border-default rounded-2xl flex items-center gap-4 shadow-sm"
                        >
                          <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
                            <svg
                              className="size-6"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-body-base-bold text-text-heading">
                              {med.name} {med.dose}
                            </p>
                            <p className="text-body-sm-regular text-text-placeholder">
                              {med.use}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4 text-text-placeholder text-body-sm-regular">
                        No medication history found.
                      </p>
                    )}
                    <div className="pt-2 flex justify-center">
                      <button className="text-label-sm-medium text-text-placeholder hover:text-[#0066FF] transition-colors">
                        Show More
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md transition-opacity"
            onClick={() => !isEnding && setShowEndModal(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-border-default animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Warning Icon */}
              <div className="size-20 rounded-full bg-error-50 flex items-center justify-center text-error-500">
                <svg
                  className="size-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-heading-5-bold text-text-heading">
                  End Consultation?
                </h3>
                <p className="text-body-base-regular text-text-placeholder leading-relaxed">
                  Are you sure you want to end this session? You will be
                  redirected to the post-consultation form to finalize patient
                  documentation.
                </p>
              </div>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleEndRoom}
                  disabled={isEnding}
                  className="w-full py-4 bg-button-error text-white rounded-2xl text-label-base-semibold hover:bg-error-600 shadow-lg shadow-error-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isEnding ? (
                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  {isEnding ? "Ending Session..." : "Yes, End Session"}
                </button>
                <button
                  onClick={() => setShowEndModal(false)}
                  disabled={isEnding}
                  className="w-full py-4 bg-white text-text-placeholder rounded-2xl text-label-base-semibold hover:bg-neutral-50 transition-all border border-border-default"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
