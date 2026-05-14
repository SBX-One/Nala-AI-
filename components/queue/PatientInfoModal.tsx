"use client";

import React from "react";
import Image from "next/image";

interface PatientInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    name: string;
    avatar_url?: string;
    complaint?: string;
    topic?: string;
    status?: string;
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
        className="relative w-full rounded-l-3xl max-w-lg bg-white h-full flex flex-col animate-in slide-in-from-right duration-300 ease-out shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="p-8 border-b border-border-default space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-heading-5-semibold text-text-heading">
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

          <div className="flex items-center gap-6 p-4 rounded-2xl bg-surface-default border border-border-default">
            <div className="relative size-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
              <Image
                src={
                  patient.avatar_url || "/images/hospital-wheelchair/bro.svg"
                }
                alt={patient.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-body-xl-bold text-text-heading">
                {patient.name}
              </h3>
              <p className="text-body-base-medium text-text-placeholder">
                {patient.topic || "General Consultation"}
              </p>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          <div className="space-y-4">
            <h4 className="text-label-base-bold text-text-label ">Complaint</h4>
            <div className="p-6 rounded-xl bg-surface-default border border-border-default min-h-48">
              <p className="text-body-lg-medium text-text-body leading-relaxed">
                {patient.complaint ||
                  "No specific complaint provided for this session."}
              </p>
            </div>
          </div>
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
