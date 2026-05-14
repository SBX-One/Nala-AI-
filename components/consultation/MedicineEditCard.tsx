"use client";

import React, { useState } from "react";
import { FormInput } from "../ui/FormInput";
import { FormTextarea } from "../ui/FormTextarea";

interface Medicine {
  id?: number;
  name: string;
  dose: string;
  use: string;
  notes: string;
  description?: string;
}

interface MedicineEditCardProps {
  medicine: Medicine;
  onSave: (updated: Medicine) => void;
  onCancel: () => void;
}

export default function MedicineEditCard({
  medicine,
  onSave,
  onCancel,
}: MedicineEditCardProps) {
  const [edited, setEdited] = useState<Medicine>({ ...medicine });

  return (
    <div className="bg-surface-default rounded-xl border border-border-default py-4 px-6 shadow-sm animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="size-16 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="5"
              y="6"
              width="14"
              height="15"
              rx="2"
              stroke="#0066FF"
              strokeWidth="2"
            />
            <path
              d="M9 2H15"
              stroke="#0066FF"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M10 13H14"
              stroke="#0066FF"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 11V15"
              stroke="#0066FF"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-heading-5-bold text-text-heading">
            {edited.name}
          </h3>
          <p className="text-body-base-medium text-text-placeholder">
            {edited.description || "Medicine description not available"}
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            id="edit-dose"
            leftLabel="Dose"
            placeholder="in gram (g)"
            value={edited.dose}
            onChange={(e) => setEdited({ ...edited, dose: e.target.value })}
          />
          <FormInput
            id="edit-use"
            leftLabel="Consume /day"
            placeholder="ex: 1"
            value={edited.use}
            onChange={(e) => setEdited({ ...edited, use: e.target.value })}
          />
        </div>

        <FormTextarea
          id="edit-notes"
          leftLabel="Notes"
          placeholder="enter notes"
          value={edited.notes}
          onChange={(e) => setEdited({ ...edited, notes: e.target.value })}
          className="min-h-24"
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <button
          onClick={() => onSave(edited)}
          className="button-primary-small flex justify-center w-full"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="button-error-outline-small  flex justify-center w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
