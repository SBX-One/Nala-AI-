"use client";

import React from "react";
import Image from "next/image";

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
    name: string;
    avatar_url?: string;
    complaints?: string;
    aiSummary?: string;
    medicines?: Medicine[];
  } | null;
}

export default function PatientInfoModal({
  isOpen,
  onClose,
  patient,
}: PatientInfoModalProps) {
  if (!isOpen || !patient) return null;

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
            <h4 className="text-body-xl-bold text-text-heading">Complaints</h4>
            <div className="p-6 rounded-2xl bg-surface-default border border-border-default">
              <p className="text-body-lg-medium text-text-body leading-relaxed">
                {patient.complaints ||
                  "No specific complaint provided for this session."}
              </p>
            </div>
          </div>

          {/* AI Summary */}
          {patient.aiSummary && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <h4 className="text-body-xl-bold text-text-heading">
                AI Summary
              </h4>
              <div className="p-6 rounded-2xl bg-surface-default border border-border-default">
                <p className="text-body-lg-medium text-text-body leading-relaxed">
                  {patient.aiSummary}
                </p>
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
                    className="flex items-center gap-4 p-4 rounded-2xl bg-surface-default border border-border-default"
                  >
                    <div className="size-14 rounded-xl bg-surface-primary-light flex items-center justify-center text-text-action">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-7"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-1 11h-3v3h-2v-3H9v-2h4V8h2v4h3v2Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-body-xl-bold text-text-heading">
                        {med.name} {med.dose}
                      </h5>
                      <p className="text-body-base-medium text-text-placeholder">
                        {med.use}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
  );
}
