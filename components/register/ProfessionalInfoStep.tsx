import React, { useState } from "react";
import { FormInput } from "@/components/ui/FormInput";
import { usePsychiatristRegister } from "@/context/PsychiatristRegisterContext";

interface ProfessionalInfoStepProps {
  expertiseOptions: any[];
  expertiseLoading: boolean;
  toggleExpertise: (id: number) => void;
}

export const ProfessionalInfoStep: React.FC<ProfessionalInfoStepProps> = ({
  expertiseOptions,
  expertiseLoading,
  toggleExpertise,
}) => {
  console.log(
    "ProfessionalInfoStep Render - Options Count:",
    expertiseOptions.length,
  );
  const { formData, setFormData } = usePsychiatristRegister();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-body-lg-semibold text-text-body">
        Professional Credentials
      </h3>
      <FormInput
        id="specialization"
        leftLabel="Specialization"
        value={formData.specialization}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFormData({ ...formData, specialization: e.target.value })
        }
        placeholder="e.g. Clinical Psychology"
      />

      <FormInput
        id="licenseNumber"
        leftLabel="License Number (SIP/SIPP)"
        value={formData.licenseNumber}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFormData({ ...formData, licenseNumber: e.target.value })
        }
        placeholder="e.g. SIP-12345/DKI/2024"
      />

      <FormInput
        id="price"
        leftLabel="Price per Session (IDR)"
        type="number"
        value={formData.price}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFormData({ ...formData, price: e.target.value })
        }
        placeholder="150000"
        icon={
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-placeholder text-label-base-medium z-10">
            Rp
          </span>
        }
        className="pl-12"
      />
      <div className="flex flex-col gap-4">
        <label className="text-label-base-semibold text-text-heading">
          Expertise Tags
        </label>
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: OCD, Trauma, Depression"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-100 outline-none focus:border-primary-500 text-body-base-medium transition-all"
              />
              {expertiseLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="size-5 rounded-full border-2 border-primary-100 border-t-primary-500 animate-spin" />
                </div>
              )}
            </div>

            {/* Search Dropdown / Results */}
            {isDropdownOpen && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-neutral-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                {expertiseOptions.filter(
                  (exp) =>
                    exp.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) &&
                    !formData.selectedExpertiseIds.includes(exp.id),
                ).length > 0 ? (
                  expertiseOptions
                    .filter(
                      (exp) =>
                        exp.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) &&
                        !formData.selectedExpertiseIds.includes(exp.id),
                    )
                    .map((exp) => (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => {
                          toggleExpertise(exp.id);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-primary-50 text-body-sm-medium text-text-body transition-colors border-b last:border-0 border-neutral-50"
                      >
                        {exp.name}
                      </button>
                    ))
                ) : (
                  <div className="px-4 py-3 text-body-sm-medium text-text-placeholder italic">
                    {searchQuery === ""
                      ? "No more expertises available"
                      : `No results found for "${searchQuery}"`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Tags Display */}
          <div className="flex flex-wrap gap-2">
            {formData.selectedExpertiseIds.map((id: number) => {
              const exp = expertiseOptions.find((e) => e.id === id);
              if (!exp) return null;
              return (
                <div
                  key={id}
                  className="px-4 py-2 bg-primary-50 text-primary-600 border border-primary-100 rounded-full flex items-center gap-2 group animate-in fade-in zoom-in-95 duration-200"
                >
                  <span className="text-label-small-medium">{exp.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleExpertise(id)}
                    className="hover:text-primary-800 transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          id="experienceStart"
          leftLabel="Career Start"
          type="date"
          value={formData.experienceStart}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, experienceStart: e.target.value })
          }
        />
        <FormInput
          id="experienceEnd"
          leftLabel="Career End"
          type="date"
          value={formData.experienceEnd}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, experienceEnd: e.target.value })
          }
        />
      </div>
    </div>
  );
};
