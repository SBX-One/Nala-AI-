"use client";

import { savePsychiatristProfile } from "@/app/auth/actions";
import { RegisterHeader } from "@/components/ui/RegisterHeader";
import { PersonalInfoStep } from "@/components/register/PersonalInfoStep";
import { ProfessionalInfoStep } from "@/components/register/ProfessionalInfoStep";
import { AvailabilityStep } from "@/components/register/AvailabilityStep";
import { createClient } from "@/utils/supabase/client";
import { useState, useRef, useEffect, type ChangeEvent } from "react";
import {
  PsychiatristRegisterProvider,
  usePsychiatristRegister,
} from "@/context/PsychiatristRegisterContext";
import { useRouter } from "next/navigation";
import { RegistrationCompleteStep } from "@/components/register/RegistrationCompleteStep";

interface ExpertiseOption {
  id: number;
  name: string;
}

function PsychiatristProfileContent() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    step,
    setStep,
    formData,
    setFormData,
    availability,
    setAvailability,
    isPersonalValid,
    isProfessionalValid,
    resetForm,
  } = usePsychiatristRegister();

  // List expertise dari database
  const [expertiseOptions, setExpertiseOptions] = useState<ExpertiseOption[]>(
    [],
  );
  const [expertiseLoading, setExpertiseLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching expertises...");
    fetch("/api/expertises")
      .then((res) => res.json())
      .then((data) => {
        console.log("Expertises API Response:", data);
        if (Array.isArray(data)) setExpertiseOptions(data);
        setExpertiseLoading(false);
      })
      .catch((err) => {
        console.error("Expertises Fetch Error:", err);
        setExpertiseLoading(false);
      });
  }, []);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `psychiatrist-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, avatarUrl: publicUrl }));
    } catch (err: any) {
      setError("Error uploading avatar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleExpertise = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedExpertiseIds: prev.selectedExpertiseIds.includes(id)
        ? prev.selectedExpertiseIds.filter((eid) => eid !== id)
        : [...prev.selectedExpertiseIds, id],
    }));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("step");
    if (stepParam === "availability") {
      setStep("availability");
    }
  }, [setStep]);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await savePsychiatristProfile({
        fullName: formData.fullName,
        sex: formData.sex as "male" | "female",
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        description: formData.description,
        price: formData.price,
        experienceStart: formData.experienceStart,
        experienceEnd: formData.experienceEnd,
        selectedExpertiseIds: formData.selectedExpertiseIds,
        avatarUrl: formData.avatarUrl,
        availability: availability
          .filter((a) => a.enabled)
          .map((a) => ({
            day: a.day,
            startTime: a.startTime,
            endTime: a.endTime,
          })),
      });

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        if (step === "availability") {
          resetForm();
          router.push("/psychiatrist");
        } else {
          setIsSubmitting(false);
          router.push("/register/psychiatrist-profile/complete");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Please try again.");
      setIsSubmitting(false);
    }
  }

  const updateGlobalTime = (start: string, end: string) => {
    setAvailability((prev) =>
      prev.map((a) => ({ ...a, startTime: start, endTime: end })),
    );
  };

  const toggleDay = (day: string) => {
    setAvailability((prev) =>
      prev.map((a) => (a.day === day ? { ...a, enabled: !a.enabled } : a)),
    );
  };

  const updateDayTime = (
    day: string,
    type: "startTime" | "endTime",
    value: string,
  ) => {
    setAvailability((prev) =>
      prev.map((a) => (a.day === day ? { ...a, [type]: value } : a)),
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-white py-12 px-6">
      <RegisterHeader
        title={
          step === "personal"
            ? "Let’s Setup Your Personal Information"
            : step === "professional"
              ? "Tell Us About Your Professional Background"
              : step === "availability"
                ? "Set Your Availability"
                : "All Set!"
        }
        description={
          step === "complete"
            ? "Your account has been created"
            : "Fill this form with true information"
        }
      />

      {/* Main Content Card */}
      <div className="w-full max-w-2xl bg-white border border-neutral-100 rounded-[32px] p-8 md:p-12 mb-8 mt-8 shadow-sm">
        {error && (
          <div className="mb-8 p-4 bg-error-50 border border-error-200 rounded-xl text-text-error text-body-sm-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        {step === "personal" && (
          <PersonalInfoStep
            handleAvatarChange={handleAvatarChange}
            fileInputRef={fileInputRef}
            uploading={uploading}
          />
        )}

        {step === "professional" && (
          <ProfessionalInfoStep
            expertiseOptions={expertiseOptions}
            expertiseLoading={expertiseLoading}
            toggleExpertise={toggleExpertise}
          />
        )}

        {step === "availability" && (
          <AvailabilityStep
            updateGlobalTime={updateGlobalTime}
            toggleDay={toggleDay}
            updateDayTime={updateDayTime}
          />
        )}

        {step === "complete" && <RegistrationCompleteStep />}
      </div>

      {/* Navigation Buttons / Step Indicator (Outside Card) */}
      {(step === "personal" || step === "professional" || step === "availability") && (
        <div className="w-full max-w-2xl flex items-center justify-between px-4">
          <button
            onClick={() => {
              if (step === "personal") router.push("/register/role");
              else if (step === "professional") setStep("personal");
              else setStep("professional");
            }}
            className="flex items-center gap-2 text-label-base-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Previous
          </button>

          <span className="text-label-base-semibold text-primary-600">
            Step {step === "personal" ? "2" : step === "professional" ? "3" : "4"}
            /3
          </span>

          <button
            onClick={() => {
              if (step === "personal") {
                if (isPersonalValid) setStep("professional");
                else setError("Please fill all required personal information");
              } else if (step === "professional") {
                if (isProfessionalValid) handleSubmit();
                else
                  setError("Please fill all required professional information");
              } else if (step === "availability") {
                // Save and finish after availability
                handleSubmit();
              }
            }}
            disabled={
              isSubmitting ||
              (step === "personal" && !isPersonalValid) ||
              (step === "professional" && !isProfessionalValid)
            }
            className="flex items-center gap-2 text-label-base-semibold text-primary-600 hover:text-primary-700 disabled:text-text-placeholder disabled:cursor-not-allowed transition-all group"
          >
            {isSubmitting ? (
              <div className="size-5 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
            ) : (
              <>
                {step === "availability" ? "Finish" : step === "professional" ? "Create Profile" : "Next"}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function PsychiatristProfilePage() {
  return (
    <PsychiatristRegisterProvider>
      <PsychiatristProfileContent />
    </PsychiatristRegisterProvider>
  );
}
