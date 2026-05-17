"use client";

import React from "react";

interface DeleteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeleteSessionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Chat History",
  message = "Are you sure you want to delete this chat session? This action cannot be undone.",
}: DeleteSessionModalProps) {
  return (
    <div className={`fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 transition-all duration-300 ${
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}>
      <div className={`bg-surface-background p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col gap-4 border border-border-default transition-all duration-300 ease-out ${
        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}>
        <div className="flex flex-col gap-2">
          <div className="size-12 rounded-full bg-error-50 flex items-center justify-center text-error-600 mb-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </div>
          <h3 className="text-heading-6-semibold text-text-heading">
            {title}
          </h3>
          <p className="text-body-base-regular text-text-subheading">
            {message}
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <button
            className="button-error-medium w-full justify-center"
            onClick={onConfirm}
          >
            Delete Permanently
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
