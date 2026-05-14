"use client";

import { useState } from "react";
import { FormInput } from "../ui/FormInput";
import { FormTextarea } from "../ui/FormTextarea";

interface Medicine {
  name: string;
  dose: string;
  use: string;
  notes: string;
}

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (medicines: Medicine[]) => void;
  initialMedicines?: Medicine[];
}

export default function MedicineModal({
  isOpen,
  onClose,
  onAdd,
  initialMedicines = [],
}: MedicineModalProps) {
  const [medicines, setMedicines] = useState<Medicine[]>(
    initialMedicines.length > 0
      ? initialMedicines
      : [{ name: "", dose: "", use: "", notes: "" }],
  );

  if (!isOpen) return null;

  const handleAddRow = () => {
    setMedicines([...medicines, { name: "", dose: "", use: "", notes: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof Medicine,
    value: string,
  ) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSave = () => {
    // Filter out empty rows
    const validMedicines = medicines.filter((m) => m.name.trim() !== "");
    onAdd(validMedicines);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-heading-6-bold text-text-heading">
            Add Prescription
          </h2>
          <button
            onClick={onClose}
            className="text-text-placeholder hover:text-text-heading transition-colors"
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

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          {medicines.map((med, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-border-default space-y-4 relative bg-surface-background"
            >
              {medicines.length > 1 && (
                <button
                  onClick={() => handleRemoveRow(index)}
                  className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all z-10"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                  </svg>
                </button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  id={`med-name-${index}`}
                  leftLabel="Medicine Name"
                  placeholder="e.g. Seteraline"
                  value={med.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                />
                <FormInput
                  id={`med-dose-${index}`}
                  leftLabel="Dosage"
                  placeholder="e.g. 40g"
                  value={med.dose}
                  onChange={(e) => handleChange(index, "dose", e.target.value)}
                />
              </div>

              <FormInput
                id={`med-use-${index}`}
                leftLabel="Usage / Frequency"
                placeholder="e.g. 1x Time a day"
                value={med.use}
                onChange={(e) => handleChange(index, "use", e.target.value)}
              />

              <FormTextarea
                id={`med-notes-${index}`}
                leftLabel="Clinical Notes"
                placeholder="Additional instructions for the patient..."
                value={med.notes}
                onChange={(e) => handleChange(index, "notes", e.target.value)}
                className="h-24"
              />
            </div>
          ))}

          <button
            onClick={handleAddRow}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-border-default text-text-placeholder hover:border-primary-300 hover:text-primary-600 transition-all flex items-center justify-center gap-2 group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="group-hover:scale-110 transition-transform"
            >
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Add Another Medicine
          </button>
        </div>

        <div className="pt-6 flex gap-4 mt-auto">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-neutral-200 text-text-subheading text-label-base-bold hover:bg-neutral-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl bg-primary-600 text-white text-label-base-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
          >
            Save Prescription
          </button>
        </div>
      </div>
    </div>
  );
}
