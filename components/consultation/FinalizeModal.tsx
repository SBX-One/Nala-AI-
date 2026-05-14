"use client";

import { useEffect } from "react";

interface FinalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function FinalizeModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: FinalizeModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-300">
      <div
        className="bg-white rounded-xl p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-6">
          <h2 className="text-heading-6-semibold text-text-heading">
            Finalize Consultation Record?
          </h2>
          <p className="text-body-base-medium text-text-subheading leading-relaxed">
            You are about to send this summary, feedback, and prescription to
            the patient. Please ensure all clinical details and diagnoses are
            accurate, as this will be permanently archived in the patient&apos;s
            longitudinal health record.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="button-primary-large"
            >
              Review Again
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="button-secondary-large"
            >
              {isLoading ? "Finalizing..." : "Finalize & Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
