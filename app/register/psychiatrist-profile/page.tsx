"use client";

import { savePsychiatristProfile } from "@/app/auth/actions";
import Image from "next/image";
import { useState, useRef, useEffect, type ChangeEvent } from "react";

type Sex = "male" | "female";
type Step = "personal" | "professional";

interface ExpertiseOption {
  id: number;
  name: string;
}

export default function PsychiatristProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // List expertise dari database
  const [expertiseOptions, setExpertiseOptions] = useState<ExpertiseOption[]>(
    [],
  );
  const [expertiseLoading, setExpertiseLoading] = useState(true);

  // Step 1: Data Personal
  const [personal, setPersonal] = useState({
    avatarPreview: "",
    fullName: "",
    sex: "" as Sex | "",
  });

  // Step 2: Data Professional (semua field dari schema PsychiatristProfile)
  const [professional, setProfessional] = useState({
    specialization: "",
    licenseNumber: "",
    description: "",
    price: "",
    experienceStart: "",
    experienceEnd: "",
    selectedExpertiseIds: [] as number[],
  });

  // Ambil data Expertise dari database saat komponen mount
  useEffect(() => {
    fetch("/api/expertises")
      .then((res) => res.json())
      .then((data) => {
        // Pastikan response adalah array sebelum di-set
        if (Array.isArray(data)) {
          setExpertiseOptions(data);
        } else {
          console.error("Unexpected expertise response format:", data);
          setExpertiseOptions([]);
        }
        setExpertiseLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load expertises:", err);
        setExpertiseOptions([]);
        setExpertiseLoading(false);
      });
  }, []);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonal((prev) => ({
          ...prev,
          avatarPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleExpertise = (id: number) => {
    setProfessional((prev) => ({
      ...prev,
      selectedExpertiseIds: prev.selectedExpertiseIds.includes(id)
        ? prev.selectedExpertiseIds.filter((eid) => eid !== id)
        : [...prev.selectedExpertiseIds, id],
    }));
  };

  const isPersonalValid =
    personal.fullName.trim() !== "" && personal.sex !== "";

  const isProfessionalValid =
    professional.experienceStart !== "" && professional.price !== "";

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await savePsychiatristProfile({
        fullName: personal.fullName,
        sex: personal.sex,
        specialization: professional.specialization,
        licenseNumber: professional.licenseNumber,
        description: professional.description,
        price: professional.price,
        experienceStart: professional.experienceStart,
        experienceEnd: professional.experienceEnd,
        selectedExpertiseIds: professional.selectedExpertiseIds,
      });
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch {
      setError("Failed to save profile. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-accent-600 via-accent-500 to-primary-500" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <Image
            src="/icon/Nala-Logo.svg"
            alt="Nala Logo"
            width={120}
            height={96}
            className="brightness-0 invert"
          />
          <h1 className="text-heading-4-bold text-white">
            {step === "personal" ? "Personal Details" : "Professional Profile"}
          </h1>
          <p className="text-body-lg-regular text-white/80 max-w-md">
            Share your background to start helping clients through Nala.
          </p>
          {/* Step Progress */}
          <div className="flex items-center gap-3">
            {["personal", "professional"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-label-small-semibold transition-all ${step === s ? "bg-white text-accent-600" : i === 0 && step === "professional" ? "bg-white/30 text-white" : "bg-white/10 text-white/50"}`}
                >
                  {i + 1}
                </div>
                {i === 0 && <div className="w-12 h-0.5 bg-white/30" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-heading-5-bold text-text-heading">
              {step === "personal"
                ? "Personal Information"
                : "Professional Details"}
            </h2>
            <p className="text-body-base-regular text-text-subheading">
              Step {step === "personal" ? "1" : "2"} of 2 — Psychiatrist
              Registration
            </p>
          </div>

          {error && (
            <div className="w-full p-4 bg-error-50 border border-error-200 rounded-xl text-text-error text-body-sm-medium">
              {error}
            </div>
          )}

          {/* ─── STEP 1: PERSONAL ─── */}
          {step === "personal" && (
            <div className="space-y-5">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-full border-2 border-dashed border-border-default bg-neutral-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-accent-400 transition-colors group"
                >
                  {personal.avatarPreview ? (
                    <img
                      src={personal.avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-text-placeholder group-hover:text-accent-500">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M3 16.8V9.2C3 8 3.8 7 5 7h.6c.5 0 1-.3 1.2-.7L7.8 4.5C8 4.2 8.5 4 9 4h6c.5 0 1 .2 1.2.5l.9 1.8c.2.4.7.7 1.2.7H19c1.2 0 2 1 2 2.2v7.6C21 17 20.2 18 19 18H5c-1.2 0-2-1-2-1.2Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                      <span className="text-body-caption-regular">Upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <p className="text-body-caption-regular text-text-placeholder">
                  Profile Photo (optional)
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-label-small-medium text-text-label mb-1.5 block">
                  Full Name <span className="text-error-default">*</span>
                </label>
                <input
                  value={personal.fullName}
                  onChange={(e) =>
                    setPersonal({ ...personal, fullName: e.target.value })
                  }
                  placeholder="Dr. Full Name"
                  className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-all"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="text-label-small-medium text-text-label mb-1.5 block">
                  Gender <span className="text-error-default">*</span>
                </label>
                <div className="flex gap-3">
                  {(["male", "female"] as Sex[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPersonal({ ...personal, sex: s })}
                      className={`flex-1 py-3 rounded-xl border-2 capitalize font-medium transition-all ${personal.sex === s ? "border-accent-500 bg-accent-50 text-accent-600" : "border-border-default text-text-label hover:border-accent-200"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep("professional")}
                disabled={!isPersonalValid}
                className={`w-full py-4 rounded-xl text-label-base-semibold transition-all ${isPersonalValid ? "bg-accent-500 text-white hover:bg-accent-600 shadow-md active:scale-[0.98]" : "bg-neutral-100 text-text-disabled cursor-not-allowed"}`}
              >
                Next: Professional Details →
              </button>
            </div>
          )}

          {/* ─── STEP 2: PROFESSIONAL ─── */}
          {step === "professional" && (
            <div className="space-y-5">
              {/* Specialization */}
              <div>
                <label className="text-label-small-medium text-text-label mb-1.5 block">
                  Specialization
                </label>
                <input
                  value={professional.specialization}
                  onChange={(e) =>
                    setProfessional({
                      ...professional,
                      specialization: e.target.value,
                    })
                  }
                  placeholder="e.g. Clinical Psychology"
                  className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-all"
                />
              </div>

              {/* License Number */}
              <div>
                <label className="text-label-small-medium text-text-label mb-1.5 block">
                  License Number (SIP/SIPP)
                </label>
                <input
                  value={professional.licenseNumber}
                  onChange={(e) =>
                    setProfessional({
                      ...professional,
                      licenseNumber: e.target.value,
                    })
                  }
                  placeholder="e.g. SIP-12345/DKI/2024"
                  className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-all"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-label-small-medium text-text-label mb-1.5 block">
                  Price per Session (IDR){" "}
                  <span className="text-error-default">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-placeholder text-body-base-regular">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={professional.price}
                    onChange={(e) =>
                      setProfessional({
                        ...professional,
                        price: e.target.value,
                      })
                    }
                    placeholder="150000"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-default focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Experience Start & End */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-small-medium text-text-label mb-1.5 block">
                    Career Start <span className="text-error-default">*</span>
                  </label>
                  <input
                    type="date"
                    value={professional.experienceStart}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setProfessional({
                        ...professional,
                        experienceStart: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-label-small-medium text-text-label mb-1.5 block">
                    Career End{" "}
                    <span className="text-body-caption-regular text-text-placeholder">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={professional.experienceEnd}
                    min={professional.experienceStart}
                    onChange={(e) =>
                      setProfessional({
                        ...professional,
                        experienceEnd: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-label-small-medium text-text-label mb-1.5 block">
                  Professional Description{" "}
                  <span className="text-body-caption-regular text-text-placeholder">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={professional.description}
                  onChange={(e) =>
                    setProfessional({
                      ...professional,
                      description: e.target.value,
                    })
                  }
                  placeholder="Share your background, approach to treatment, and what clients can expect..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-all resize-none"
                />
              </div>

              {/* Expertise — dari tabel Expertise di database */}
              <div>
                <label className="text-label-small-medium text-text-label mb-1.5 block">
                  Areas of Expertise{" "}
                  <span className="text-body-caption-regular text-text-placeholder">
                    (select all that apply)
                  </span>
                </label>
                {expertiseLoading ? (
                  <div className="flex items-center gap-2 text-text-placeholder py-3">
                    <div className="w-4 h-4 rounded-full border-2 border-accent-400 border-t-transparent animate-spin" />
                    <span className="text-body-sm-regular">
                      Loading expertise options...
                    </span>
                  </div>
                ) : expertiseOptions.length === 0 ? (
                  <p className="text-body-sm-regular text-text-placeholder py-2">
                    No expertise options available. Please add some in the
                    database first.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {expertiseOptions.map((exp) => {
                      const isSelected =
                        professional.selectedExpertiseIds.includes(exp.id);
                      return (
                        <button
                          key={exp.id}
                          type="button"
                          onClick={() => toggleExpertise(exp.id)}
                          className={`px-4 py-2 rounded-full border-2 text-body-sm-medium transition-all active:scale-95 ${
                            isSelected
                              ? "border-accent-500 bg-accent-500 text-white shadow-sm"
                              : "border-border-default text-text-label hover:border-accent-300 hover:bg-accent-50"
                          }`}
                        >
                          {isSelected && <span className="mr-1">✓</span>}
                          {exp.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                {professional.selectedExpertiseIds.length > 0 && (
                  <p className="text-body-caption-regular text-accent-600 mt-2">
                    {professional.selectedExpertiseIds.length} expertise
                    selected
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("personal")}
                  className="flex-1 py-4 border-2 border-border-default rounded-xl hover:bg-neutral-50 transition-all text-label-base-medium text-text-heading"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isProfessionalValid || isSubmitting}
                  className={`flex-2 py-4 rounded-xl text-label-base-semibold transition-all ${
                    isProfessionalValid && !isSubmitting
                      ? "bg-accent-500 text-white hover:bg-accent-600 shadow-md active:scale-[0.98]"
                      : "bg-neutral-100 text-text-disabled cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
