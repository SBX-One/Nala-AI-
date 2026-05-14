"use client";

import React, { useState, useEffect, useRef } from "react";
import { FormInput } from "../ui/FormInput";
import { FormTextarea } from "../ui/FormTextarea";
import MedicineCard from "./MedicineCard";
import MedicineEditCard from "./MedicineEditCard";
import { searchMedicines } from "@/app/actions/medicine";
import Image from "next/image";

interface Medicine {
  id?: number;
  name: string;
  dose: string;
  use: string;
  notes: string;
  description?: string;
}

interface UpdateConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: { diagnose: string; feedback: string; medicines: Medicine[] },
    status: "draft" | "published",
  ) => Promise<void>;
  initialData: {
    diagnose: string;
    feedback: string;
    medicines: Medicine[];
  };
  isLoading?: boolean;
}

export default function UpdateConsultationModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading,
}: UpdateConsultationModalProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "diagnostic">(
    "diagnostic",
  );
  const [diagnose, setDiagnose] = useState(initialData.diagnose);
  const [feedback, setFeedback] = useState(initialData.feedback);
  const [medicines, setMedicines] = useState<Medicine[]>(initialData.medicines);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDiagnose(initialData.diagnose);
      setFeedback(initialData.feedback);
      setMedicines(initialData.medicines.map((m) => ({ ...m })));
      setSearchQuery("");
      setSuggestions([]);
      setEditingIndex(null);
    }
  }, [isOpen, initialData]);

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
    const newMed: Medicine = {
      name: s.name,
      description: s.description,
      dose: "",
      use: "",
      notes: "",
    };
    const newList = [...medicines, newMed];
    setMedicines(newList);
    setSearchQuery("");
    setSuggestions([]);
    setEditingIndex(newList.length - 1);
  };

  const handleSaveMedicine = (index: number, updated: Medicine) => {
    const newList = [...medicines];
    newList[index] = updated;
    setMedicines(newList);
    setEditingIndex(null);
  };

  const handleCancelMedicine = (index: number) => {
    const med = medicines[index];
    if (!med.dose && !med.use && !med.notes) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
    setEditingIndex(null);
  };

  const handleDeleteMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Modal Content */}
      <div
        className="relative w-full rounded-l-xl max-w-lg bg-white h-full flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header and Body Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col gap-8">
          <h2 className="text-heading-5-bold text-text-heading">
            Feedback for Patient
          </h2>

          {/* Tab Switcher */}
          <div className="flex p-1.5 rounded-xl w-fit border border-border-default bg-surface-default">
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-6 py-2 rounded-lg text-label-base-medium transition-all ${
                activeTab === "notes"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-text-placeholder"
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab("diagnostic")}
              className={`px-6 py-2 rounded-lg text-label-base-medium transition-all ${
                activeTab === "diagnostic"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-text-placeholder"
              }`}
            >
              Diagnostic
            </button>
          </div>

          <div className="space-y-8">
            {activeTab === "diagnostic" ? (
              <div className="space-y-6">
                {/* Feedback Area */}
                <FormTextarea
                  id="psychiatrist-feedback"
                  leftLabel="Psychiatry's Feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Please type feedback for patient using easy to understand language"
                  className="min-h-40"
                />

                {/* Medicine Area */}
                <div className="space-y-4">
                  <div className="relative">
                    <FormInput
                      id="medicine-search"
                      leftLabel="Medicine"
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
                              className="w-full text-left px-5 py-4 rounded-xl border border-border-default hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 bg-white group"
                              onClick={() => addMedicine(s)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="size-12 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
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
                                  <p className="text-body-sm-medium text-text-placeholder truncate">
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
                              s.name.toLowerCase() ===
                              searchQuery.toLowerCase(),
                          ) && (
                            <button
                              className="w-full text-left px-5 py-4 rounded-xl border border-dashed border-primary-300 hover:bg-primary-50 text-primary-600 transition-all duration-200"
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

                  {medicines.length > 0 ? (
                    <div className="space-y-6">
                      {medicines.map((med, idx) => (
                        <div key={idx}>
                          {editingIndex === idx ? (
                            <MedicineEditCard
                              medicine={med}
                              onSave={(updated) =>
                                handleSaveMedicine(idx, updated)
                              }
                              onCancel={() => handleCancelMedicine(idx)}
                            />
                          ) : (
                            <MedicineCard
                              {...med}
                              onEdit={() => setEditingIndex(idx)}
                              onDelete={() => handleDeleteMedicine(idx)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
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
              </div>
            ) : (
              <FormTextarea
                id="clinical-notes"
                leftLabel="Clinical Notes / Diagnose"
                value={diagnose}
                onChange={(e) => setDiagnose(e.target.value)}
                placeholder="Type your internal notes or diagnostic here..."
                className="min-h-[500px]"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border-default flex gap-4 bg-white rounded-bl-xl">
          <button
            onClick={() => onSave({ diagnose, feedback, medicines }, "draft")}
            disabled={isLoading || editingIndex !== null}
            className="button-primary-large"
          >
            {editingIndex !== null
              ? "Finish Editing Medicine First"
              : isLoading
                ? "Saving..."
                : "Save Draft"}
          </button>
          <button onClick={onClose} className="button-outline-large">
            Cancel
          </button>
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
