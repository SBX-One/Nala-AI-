"use client";

import React, { useState } from "react";
import { updateAiSummary } from "@/app/actions/consultation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

interface Medicine {
  name: string;
  dose: string;
  use: string;
  notes?: string;
}

interface PatientInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    latest_consultation_id?: number;
    name: string;
    avatar_url?: string;
    complaint?: string;
    ai_summary?: string;
    medicines?: Medicine[];
  } | null;
}

export default function PatientInfoModal({
  isOpen,
  onClose,
  patient,
}: PatientInfoModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAiSummary, setCurrentAiSummary] = useState<string | undefined>(
    patient?.ai_summary,
  );
  const [prevPatientId, setPrevPatientId] = useState<number | undefined>(
    patient?.latest_consultation_id,
  );

  // Sync state with prop when patient changes
  if (patient?.latest_consultation_id !== prevPatientId) {
    setPrevPatientId(patient?.latest_consultation_id);
    setCurrentAiSummary(patient?.ai_summary);
  }

  if (!isOpen || !patient) return null;

  const handleGenerateAiSummary = async () => {
    if (!patient.complaint) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/psychiatrist/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint: patient.complaint,
          medicationHistory: patient.medicines,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setCurrentAiSummary(data.summary);
        // Save to database
        if (patient.latest_consultation_id) {
          await updateAiSummary(patient.latest_consultation_id, data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to generate AI summary:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-120 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Modal Content */}
      <div
        className="relative w-full rounded-l-xl max-w-lg bg-white h-full flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-out shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="p-8 border-b border-border-default">
          <div className="flex justify-between items-center">
            <h2 className="text-heading-5-bold text-text-heading">
              Patient Information
            </h2>
            <button
              onClick={onClose}
              className="size-10 rounded-full hover:bg-surface-default flex items-center justify-center transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Body Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col gap-8">
          {/* Complaints */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-body-xl-bold text-text-heading">
                Complaints
              </h4>
              {patient.complaint && !currentAiSummary && (
                <button
                  onClick={handleGenerateAiSummary}
                  disabled={isGenerating}
                  className="button-secondary-medium group"
                >
                  {isGenerating ? (
                    <>
                      <div className="size-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Image
                        src="/icon/star.svg"
                        alt="starIcon"
                        width={24}
                        height={24}
                        priority
                        className="size-5 group-hover:text-white"
                      />
                      Generate Insight
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="p-6 rounded-xl bg-surface-default border border-border-default">
              <p className="text-body-base-medium text-text-body leading-relaxed">
                {patient.complaint ||
                  "No specific complaint provided for this session."}
              </p>
            </div>
          </div>

          {/* AI Summary */}
          {currentAiSummary && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between">
                <h4 className="text-body-xl-bold text-text-heading">
                  AI Summary
                </h4>
              </div>
              <div className="p-6 rounded-2xl bg-surface-default border border-border-default">
                <div className="prose prose-blue max-w-none prose-p:text-body-lg-medium prose-p:text-text-body prose-p:leading-relaxed prose-headings:text-text-heading prose-headings:mb-2 prose-li:text-text-body prose-li:text-body-base-medium">
                  <ReactMarkdown>{currentAiSummary}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Medicine History */}
          {patient.medicines && patient.medicines.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <h4 className="text-body-xl-bold text-text-heading">
                Medicine History
              </h4>
              <div className="space-y-3">
                {patient.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-border-default rounded-2xl flex items-center gap-4"
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
                ))}
              </div>
            </div>
          )}
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e5e5e5;
            border-radius: 10px;
          }
        `}</style>
      </div>
    </div>
  );
}
