"use client";

import React from "react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // Save as Draft
  onDiscard: () => void; // Leave without saving
  title?: string;
  message?: string;
}

export default function UnsavedChangesModal({
  isOpen,
  onClose,
  onConfirm,
  onDiscard,
  title = "Unsaved Changes",
  message = "You have unsaved changes. Do you want to save them as a draft before leaving?",
}: UnsavedChangesModalProps) {
  return (
    <div className={`fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 transition-all duration-300 ${
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}>
      <div className={`bg-surface-background p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col gap-4 border border-border-default transition-all duration-300 ease-out ${
        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}>
        <div className="flex flex-col gap-2">
          <h3 className="text-heading-6-semibold text-text-heading ">
            {title}
          </h3>
          <p className="text-body-base-regular text-text-subheading">
            {message}
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <button
            className="button-primary-medium w-full justify-center"
            onClick={onConfirm}
          >
            Save as Draft & Leave
          </button>
          <button
            className="button-error-outline-medium w-full justify-center"
            onClick={onDiscard}
          >
            Discard Changes
          </button>
          <button
            className="button-outline-medium w-full justify-center"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
