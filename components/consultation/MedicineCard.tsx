"use client";

import Image from "next/image";

interface MedicineCardProps {
  name: string;
  dose: string;
  use: string;
  notes?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export default function MedicineCard({
  name,
  dose,
  use,
  notes,
  onEdit,
  onDelete,
  isEditable = true,
}: MedicineCardProps) {
  return (
    <div className="px-6 py-4 bg-surface-default rounded-xl border border-border-default space-y-6  animate-in fade-in duration-300">
      <div className="flex  gap-4 items-center">
        <div className="size-17 rounded-2xl bg-surface-primary-light flex items-center justify-center shrink-0">
          <Image
            src="/icon/medicine.svg"
            width={32}
            height={32}
            alt="Medicine"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-body-xl-semibold text-text-heading truncate mb-1">
            {name} {use}
          </h4>
          <p className="text-body-sm-medium text-text-subheading">
            {dose} of Dose
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-label-caption-bold text-text-subheading">Notes</p>
        <p className="text-body-sm-medium text-text-body">
          {notes || "No notes provided for this medicine."}
        </p>
      </div>

      {isEditable && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="button-primary-small flex-1 flex justify-center gap-2 items-center"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button
            onClick={onDelete}
            className="button-error-outline-small flex-1 flex justify-center gap-2 items-center"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
