"use client";

import { useState, useEffect, useRef } from "react";
import { useConsultationRoom } from "@/context/ConsultationRoomContext";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getPostConsultationData,
  finalizeConsultation,
} from "@/app/actions/consultation";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import MedicineCard from "@/components/consultation/MedicineCard";
import MedicineEditCard from "@/components/consultation/MedicineEditCard";
import { searchMedicines } from "@/app/actions/medicine";
import Image from "next/image";

type Tab = "patient" | "diagnostic";

export default function PostConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRoomId = searchParams.get("roomId");

  const {
    patientProfile,
    setPatientProfile,
    medicationHistory,
    setMedicationHistory,
    aiSummary,
    setAiSummary,
    consultationNotes,
    setConsultationNotes,
    diagnoseDraft,
    setDiagnoseDraft,
    sessionAiSummary,
    setSessionAiSummary,
    consultationContext,
    setConsultationContext,
    observationNotes,
    setObservationNotes,
    prescribedMedicines,
    setPrescribedMedicines,
    psychiatristFeedback,
    setPsychiatristFeedback,
    resetConsultationData,
  } = useConsultationRoom();

  const [activeTab, setActiveTab] = useState<Tab>("patient");
  const [loading, setLoading] = useState(!patientProfile && !!queryRoomId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!patientProfile && queryRoomId) {
        setLoading(true);
        try {
          const res = await getPostConsultationData(parseInt(queryRoomId));
          if (res.data) {
            setPatientProfile(res.data.patientProfile);
            setMedicationHistory(res.data.medicationHistory);
            if (res.data.consultation) {
              setConsultationNotes(
                res.data.consultation.consultation_notes || "",
              );
              setPsychiatristFeedback(
                res.data.consultation.psychiatrist_feedback || "",
              );
              setDiagnoseDraft(res.data.consultation.diagnose || "");
              setAiSummary(res.data.consultation.ai_summary || "");
              setSessionAiSummary(
                res.data.consultation.session_ai_summary || "",
              );
              setConsultationContext(
                res.data.consultation.consultation_context || "",
              );
              setObservationNotes(
                res.data.consultation.observation_notes || "",
              );
              setPrescribedMedicines(res.data.consultation.medicines || []);
            }
          }
        } catch (err) {
          console.error("Failed to load post consultation data:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [
    queryRoomId,
    patientProfile,
    setPatientProfile,
    setMedicationHistory,
    setConsultationNotes,
    setPsychiatristFeedback,
    setDiagnoseDraft,
    setAiSummary,
    setSessionAiSummary,
    setConsultationContext,
    setObservationNotes,
    setPrescribedMedicines,
  ]);

  const handleSubmit = async () => {
    if (!queryRoomId) return;
    setIsSubmitting(true);
    try {
      const res = await finalizeConsultation(parseInt(queryRoomId), {
        diagnose: diagnoseDraft,
        sessionAiSummary: sessionAiSummary,
        consultationContext: consultationContext,
        observationNotes: observationNotes,
        consultationNotes: consultationNotes,
        psychiatristFeedback: psychiatristFeedback,
        medicines: prescribedMedicines,
        status: "finished",
      });

      if (res.success) {
        resetConsultationData();
        router.push("/psychiatrist/consultation/queue");
      } else {
        alert(res.error || "Failed to submit consultation form");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("An unexpected error occurred while submitting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!queryRoomId) return;
    setIsSubmitting(true);
    try {
      const res = await finalizeConsultation(parseInt(queryRoomId), {
        diagnose: diagnoseDraft,
        sessionAiSummary: sessionAiSummary,
        consultationContext: consultationContext,
        observationNotes: observationNotes,
        consultationNotes: consultationNotes,
        psychiatristFeedback: psychiatristFeedback,
        medicines: prescribedMedicines,
        status: "draft",
      });

      if (res.success) {
        resetConsultationData();
        router.push("/psychiatrist/consultation/queue");
      } else {
        alert(res.error || "Failed to save draft");
      }
    } catch (err) {
      console.error("Save Draft Error:", err);
      alert("An unexpected error occurred while saving draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSessionSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/psychiatrist/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialAiSummary: aiSummary,
          consultationNotes,
          consultationContext,
          observationNotes,
          psychiatristFeedback,
          diagnose: diagnoseDraft,
          medicines: prescribedMedicines,
        }),
      });

      const data = await response.json();
      if (data.summary) {
        setSessionAiSummary(data.summary);
      } else {
        alert(data.error || "Failed to generate session summary");
      }
    } catch (error) {
      console.error("Generate Summary Error:", error);
      alert("An error occurred while generating summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const result = await searchMedicines(query);
      if (result.data) {
        setSuggestions(result.data);
      }
      setIsSearching(false);
    }, 300);
  };

  const addMedicine = (s: any) => {
    const newMed = {
      name: s.name,
      description: s.description,
      dose: "",
      use: "",
      notes: "",
    };
    const newList = [...prescribedMedicines, newMed];
    setPrescribedMedicines(newList);
    setSearchQuery("");
    setSuggestions([]);
    setEditingIndex(newList.length - 1);
  };

  const handleSaveMedicine = (index: number, updated: any) => {
    const newList = [...prescribedMedicines];
    newList[index] = updated;
    setPrescribedMedicines(newList);
    setEditingIndex(null);
  };

  const handleCancelMedicine = (index: number) => {
    const med = prescribedMedicines[index];
    if (!med.dose && !med.use && !med.notes) {
      setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== index));
    }
    setEditingIndex(null);
  };

  const handleDeleteMedicine = (index: number) => {
    setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== index));
  };

  // Format date helper
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

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

  return (
    <div className="flex-1 bg-[#FDFDFF] p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-heading-3-bold text-text-heading">
            Consultation Form
          </h1>
          <p className="text-body-base-regular text-text-placeholder">
            Fill the post consultation form to clarify the patient struggle
          </p>
        </div>

        {/* Tabs */}
        <div className="inline-flex p-1 bg-white border border-border-default rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab("patient")}
            className={`px-6 py-2.5 rounded-lg text-label-base-semibold transition-all ${
              activeTab === "patient"
                ? "bg-[#0066FF] text-white shadow-md"
                : "text-text-placeholder hover:text-text-heading"
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`px-6 py-2.5 rounded-lg text-label-base-semibold transition-all ${
              activeTab === "diagnostic"
                ? "bg-[#0066FF] text-white shadow-md"
                : "text-text-placeholder hover:text-text-heading"
            }`}
          >
            Diagnostic
          </button>
        </div>

        {activeTab === "patient" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Row 1, Col 1: Profile */}
            <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm space-y-6">
              <div>
                <h2 className="text-heading-6-semibold text-text-body mb-1">
                  {patientProfile?.name || "Patient Name"}
                </h2>
                <p className="text-body-sm-semibold text-text-action">
                  {patientProfile?.location || "Unknown Location"},{" "}
                  {patientProfile?.birth_date
                    ? calculateAge(patientProfile.birth_date)
                    : "?"}{" "}
                  Years Old
                </p>
              </div>

              <div className="flex items-center gap-8 py-6 border-y border-border-default">
                <div className="flex items-center gap-2.5 text-text-subheading">
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="text-body-sm-medium text-text-secondary">
                    {formatDate(new Date().toISOString())}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-text-subheading">
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-body-sm-medium text-text-secondary">
                    12:00 PM - 12:45 PM
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-label-small-bold text-text-subheading ">
                  Complaint
                </p>
                <p className="text-body-base-regular text-text-heading leading-relaxed">
                  {patientProfile?.complaint ||
                    "No specific complaint recorded for this patient."}
                </p>
              </div>
            </div>

            {/* Row 1, Col 2: Notes */}
            <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
                  <svg
                    className="size-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                  </svg>
                </div>
                <h3 className="text-body-xl-semibold text-text-body">
                  Consultation Notes
                </h3>
              </div>
              <FormTextarea
                id="consultation-notes-patient-tab"
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                placeholder="Write down patient complaints, behavioral observations and clinical notes"
                className="min-h-[120px]"
              />
            </div>

            {/* Row 2, Col 1: Medicine */}
            <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
                  <svg
                    className="size-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                  </svg>
                </div>
                <h3 className="text-body-xl-semibold text-text-body">
                  Medicine History
                </h3>
              </div>

              <div className="space-y-4">
                {medicationHistory.length > 0 ? (
                  medicationHistory.slice(0, 3).map((med, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-[#F8F9FA] border border-border-default rounded-xl flex items-center gap-4 transition-all hover:border-[#0066FF]/30"
                    >
                      <div className="size-12 rounded-xl bg-white border border-border-default flex items-center justify-center text-[#0066FF] shadow-sm">
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
                          {med.use || "1x Time a day"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-text-placeholder text-body-base-regular italic bg-[#F8F9FA] rounded-xl border border-dashed border-border-default">
                    No medications recorded for this session.
                  </p>
                )}
              </div>
            </div>

            {/* Row 2, Col 2: AI Summary */}
            <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
                  <svg
                    className="size-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <h3 className="text-body-xl-semibold text-text-body">
                  Patient AI Summary
                </h3>
              </div>
              <div className="p-6 bg-[#F8F9FA] border border-border-default rounded-xl prose prose-sm max-w-none prose-p:mb-2 prose-li:mb-1">
                {aiSummary ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiSummary}
                  </ReactMarkdown>
                ) : (
                  <p className="text-body-base-regular text-text-secondary leading-relaxed italic">
                    No AI summary generated during this session.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column: Documentation (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sessions AI Summary */}
              <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 3L14.5 9L21 10L16 15L17.5 21L12 18L6.5 21L8 15L3 10L9.5 9L12 3Z" />
                    </svg>
                  </div>
                  <h3 className="text-body-xl-semibold text-text-body">
                    Sessions AI Summary
                  </h3>
                  <button
                    onClick={handleGenerateSessionSummary}
                    disabled={isGenerating}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0066FF] rounded-xl text-label-sm-semibold hover:bg-blue-100 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="size-3.5 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 3L14.5 9L21 10L16 15L17.5 21L12 18L6.5 21L8 15L3 10L9.5 9L12 3Z" />
                      </svg>
                    )}
                    {isGenerating ? "Analyzing..." : "Generate Analysis"}
                  </button>
                </div>
                <div className="p-6 bg-[#F8F9FA] border border-border-default rounded-xl min-h-32 text-body-base-regular text-text-secondary leading-relaxed">
                  {sessionAiSummary ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {sessionAiSummary}
                    </ReactMarkdown>
                  ) : (
                    <p className="italic text-text-placeholder">
                      Click the button above to generate a comprehensive session
                      analysis...
                    </p>
                  )}
                </div>
              </div>

              {/* Consultation Context */}
              <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <h3 className="text-body-xl-semibold text-text-body">
                    Consultation Context
                  </h3>
                </div>
                <FormInput
                  id="consultation-context"
                  value={consultationContext}
                  onChange={(e) => setConsultationContext(e.target.value)}
                  placeholder="Enter consultation short context"
                />
              </div>

              {/* Notes & Feedback */}
              <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2524 22.1614 16.5523C21.6184 15.8522 20.8581 15.3516 20 15.13" />
                      <path d="M17 7.13C17.8604 7.35031 18.623 7.85071 19.1676 8.55191C19.7122 9.25311 20.0078 10.116 20.0078 11.005C20.0078 11.894 19.7122 12.7569 19.1676 13.4581C18.623 14.1593 17.8604 14.6597 17 14.88" />
                    </svg>
                  </div>
                  <h3 className="text-body-xl-semibold text-text-body">
                    Notes & Feedback
                  </h3>
                </div>

                <div className="space-y-4">
                  <FormTextarea
                    id="observation-notes"
                    leftLabel="Observation Notes"
                    value={observationNotes}
                    onChange={(e) => setObservationNotes(e.target.value)}
                    placeholder="Write down patient complaints, behavioral observations and clinical notes"
                    className="min-h-32"
                  />
                  <FormTextarea
                    id="psychiatry-feedback"
                    leftLabel="Psychiatry's Feedback"
                    value={psychiatristFeedback}
                    onChange={(e) => setPsychiatristFeedback(e.target.value)}
                    placeholder="Write feedback for patient"
                    className="min-h-32"
                  />
                </div>
              </div>

              {/* Diagnose */}
              <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h3 className="text-body-xl-semibold text-text-body">
                    Diagnose
                  </h3>
                </div>
                <FormInput
                  id="patient-diagnose"
                  value={diagnoseDraft}
                  onChange={(e) => setDiagnoseDraft(e.target.value)}
                  placeholder="Enter patient fixed diagnose"
                />
              </div>
            </div>

            {/* Right Column: Sidebar (1/3) */}
            <div className="space-y-6">
              {/* Finalitation Card */}
              <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3 className="text-body-xl-semibold text-text-body">
                    Finalitation
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="px-4 py-3 border border-[#0066FF] text-[#0066FF] rounded-xl text-label-base-semibold hover:bg-blue-50 transition-colors"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-3 bg-[#0066FF] text-white rounded-xl text-label-base-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting && (
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    Submit
                  </button>
                </div>
              </div>

              {/* Add Medicine Card */}
              <div className="bg-white p-6 rounded-xl border border-border-default shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF]">
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <h3 className="text-body-xl-semibold text-text-body">
                    Add Medicine
                  </h3>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <FormInput
                    id="medicine-search"
                    placeholder="Find Medicine"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12"
                    autoComplete="off"
                    icon={
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-placeholder">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </div>
                    }
                  />

                  {/* Suggestions Dropdown */}
                  {(suggestions.length > 0 || isSearching) && (
                    <div className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-white border border-border-default rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 p-3 flex flex-col gap-2">
                      {isSearching ? (
                        <div className="p-4 text-center text-body-sm-medium text-text-placeholder">
                          Searching...
                        </div>
                      ) : (
                        suggestions.map((s) => (
                          <button
                            key={s.id}
                            className="w-full text-left px-5 py-4 rounded-xl border border-border-default hover:border-[#0066FF] hover:bg-blue-50 transition-all duration-200 bg-white group"
                            onClick={() => addMedicine(s)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                <Image
                                  src="/icon/medicine.svg"
                                  alt="medicine"
                                  width={24}
                                  height={24}
                                />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-body-base-bold text-text-heading truncate">
                                  {s.name}
                                </h3>
                                <p className="text-body--medium text-text-placeholder truncate">
                                  {s.description || "Medicine master data"}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}

                      {!isSearching &&
                        searchQuery &&
                        !suggestions.find(
                          (s) =>
                            s.name.toLowerCase() === searchQuery.toLowerCase(),
                        ) && (
                          <button
                            className="w-full text-left px-5 py-4 rounded-xl border border-dashed border-blue-300 hover:bg-blue-50 text-[#0066FF] transition-all duration-200"
                            onClick={() => addMedicine({ name: searchQuery })}
                          >
                            Add new:{" "}
                            <span className="font-bold">
                              &quot;{searchQuery}&quot;
                            </span>
                          </button>
                        )}
                    </div>
                  )}
                </div>

                {/* Medicine List */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {prescribedMedicines.length > 0 ? (
                    prescribedMedicines.map((med: any, index: number) => (
                      <div key={index}>
                        {editingIndex === index ? (
                          <MedicineEditCard
                            medicine={med}
                            onSave={(updated) =>
                              handleSaveMedicine(index, updated)
                            }
                            onCancel={() => handleCancelMedicine(index)}
                          />
                        ) : (
                          <MedicineCard
                            {...med}
                            onEdit={() => setEditingIndex(index)}
                            onDelete={() => handleDeleteMedicine(index)}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-16 px-6 rounded-3xl border border-dashed border-border-default bg-surface-default flex flex-col items-center justify-center text-center space-y-3">
                      <div className="size-16 rounded-full bg-white flex items-center justify-center border border-border-default">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#94A3B8"
                          strokeWidth="2"
                        >
                          <path d="M12 5v14M5 12h14"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-body-base-bold text-text-heading">
                          No Medicine Prescribed
                        </h4>
                        <p className="text-body-sm-medium text-text-placeholder max-w-56 mx-auto">
                          Search and select medications to add them to this
                          patient&apos;s record.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {prescribedMedicines.length > 2 && (
                  <button className="w-full py-2 text-label-sm-medium text-text-placeholder hover:text-text-secondary transition-colors border-t border-border-default">
                    Show More
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[110] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-body-base-semibold text-text-heading animate-pulse">
              Fetching clinical data...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
