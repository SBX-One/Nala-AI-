"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { FormRadioGroup } from "@/components/ui/FormRadioGroup";
import { createClient } from "@/utils/supabase/client";
import {
  getCurrentPsychiatristProfile,
  updatePsychiatristProfile,
} from "@/app/actions/psychiatrist";
import { toast } from "react-hot-toast";

interface ExpertiseOption {
  id: number;
  name: string;
}

export default function AccountProfilePage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [initialData, setInitialData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    fullName: "",
    sex: "male",
    description: "",
    specialization: "",
    licenseNumber: "",
    price: 0,
    experienceStart: "",
    experienceEnd: "",
    avatarUrl: "",
    selectedExpertiseIds: [],
  });

  const [expertiseOptions, setExpertiseOptions] = useState<ExpertiseOption[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [profile, expertises] = await Promise.all([
        getCurrentPsychiatristProfile(),
        fetch("/api/expertises").then((res) => res.json()),
      ]);

      if (profile) {
        setFormData(profile);
        setInitialData(profile);
      }
      if (Array.isArray(expertises)) {
        setExpertiseOptions(expertises);
      }
      setLoading(false);
    }
    loadData();
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

      setFormData((prev: any) => ({ ...prev, avatarUrl: publicUrl }));
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error("Error uploading avatar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRevert = (section: "personal" | "professional") => {
    if (section === "personal") {
      setFormData((prev: any) => ({
        ...prev,
        fullName: initialData.fullName,
        sex: initialData.sex,
        description: initialData.description,
        avatarUrl: initialData.avatarUrl,
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        specialization: initialData.specialization,
        licenseNumber: initialData.licenseNumber,
        price: initialData.price,
        experienceStart: initialData.experienceStart,
        experienceEnd: initialData.experienceEnd,
        selectedExpertiseIds: initialData.selectedExpertiseIds,
      }));
    }
    toast.success("Changes reverted");
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updatePsychiatristProfile(formData);
    if (result.success) {
      setInitialData({ ...formData });
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.error || "Failed to update profile");
    }
    setSaving(false);
  };

  const toggleExpertise = (id: number) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedExpertiseIds: prev.selectedExpertiseIds.includes(id)
        ? prev.selectedExpertiseIds.filter((eid: number) => eid !== id)
        : [...prev.selectedExpertiseIds, id],
    }));
  };

  const hasPersonalChanges =
    initialData &&
    (formData.fullName !== initialData.fullName ||
      formData.sex !== initialData.sex ||
      formData.description !== initialData.description ||
      formData.avatarUrl !== initialData.avatarUrl);

  const hasProfessionalChanges =
    initialData &&
    (formData.specialization !== initialData.specialization ||
      formData.licenseNumber !== initialData.licenseNumber ||
      formData.price !== initialData.price ||
      formData.experienceStart !== initialData.experienceStart ||
      formData.experienceEnd !== initialData.experienceEnd ||
      JSON.stringify(formData.selectedExpertiseIds) !==
        JSON.stringify(initialData.selectedExpertiseIds));

  if (loading) {
    return (
      <div className="flex items-center justify-center ">
        <div className="size-12 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20">
      {/* Personal Information Card */}
      <div className="bg-white border border-border-default rounded-xl ">
        <div className="p-6">
          <h2 className="text-body-xl-semibold text-text-body mb-6">
            Personal Information
          </h2>

          <div className="flex flex-col gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col gap-4">
              <label className="text-label-base-semibold text-text-label">
                Profile Picture
              </label>
              <div className="flex  items-center gap-6">
                <div className="relative size-24 rounded-full overflow-hidden bg-surface-disabled border border-border-default flex items-center justify-center">
                  {uploading ? (
                    <div className="animate-spin size-8 border-b-2 border-primary-600 rounded-full" />
                  ) : formData.avatarUrl ? (
                    <Image
                      src={formData.avatarUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-primary-600 text-heading-3-bold">
                      {formData.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() =>
                        setFormData({ ...formData, avatarUrl: "" })
                      }
                      className="px-4 py-2 rounded-lg border border-border-default text-label-small-semibold text-text-body hover:bg-surface-disabled transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg border border-border-default text-label-small-semibold text-text-body hover:bg-surface-disabled transition-colors"
                    >
                      Change Picture
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <FormInput
              id="fullName"
              leftLabel="Full Name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Enter full name with titles"
            />

            <FormRadioGroup
              leftLabel="Gender"
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ]}
              value={formData.sex}
              onChange={(val) => setFormData({ ...formData, sex: val })}
            />

            <FormTextarea
              id="description"
              leftLabel="Professional Bio"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Explain yourself"
              rows={5}
            />
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-6  flex justify-end gap-3">
          {hasPersonalChanges && (
            <>
              <button
                onClick={() => handleRevert("personal")}
                className="button-outline-large"
              >
                Revert
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="button-primary-large"
              >
                {saving ? "Saving..." : "Save Change"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Professional Credentials Card */}
      <div className="bg-white border border-border-default rounded-xl overflow-hidden shadow-sm">
        <div className="p-6">
          <h2 className="text-body-xl-semibold text-text-body mb-6">
            Professional Credentials
          </h2>
          <div className="flex flex-col gap-6">
            <FormInput
              id="specialization"
              leftLabel="Medical Specialization"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              placeholder="Ex: Clinical Specialist, Childhood Trauma"
            />

            <FormInput
              id="licenseNumber"
              leftLabel="License Number"
              value={formData.licenseNumber}
              onChange={(e) =>
                setFormData({ ...formData, licenseNumber: e.target.value })
              }
              placeholder="Verify your certificate"
            />

            <div className="flex flex-col gap-4 mb-6">
              <label className="text-label-small-medium text-text-heading">
                Expertise Tags
              </label>
              <div className="flex flex-col gap-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Ex: OCD, Trauma, Depression"
                    value={searchQuery}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() =>
                      setTimeout(() => setIsDropdownOpen(false), 200)
                    }
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-border-default outline-none focus:border-primary-500 text-body-base-medium transition-all"
                  />
                  {isDropdownOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-border-default rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                      {expertiseOptions
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
                            className="w-full text-left px-4 py-3 hover:bg-primary-50 text-body-sm-medium text-text-body transition-colors border-b last:border-0 border-border-default/50"
                          >
                            {exp.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedExpertiseIds.map((id: number) => {
                    const exp = expertiseOptions.find((e) => e.id === id);
                    if (!exp) return null;
                    return (
                      <div
                        key={id}
                        className="px-4 py-2 bg-primary-50 text-primary-600 border border-primary-100 rounded-full flex items-center gap-2 group animate-in zoom-in-95 duration-200"
                      >
                        <span className="text-label-small-medium">
                          {exp.name}
                        </span>
                        <button
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
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label-small-medium text-text-heading">
              Professional Career Duration
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="experienceStart"
                type="date"
                value={formData.experienceStart}
                onChange={(e) =>
                  setFormData({ ...formData, experienceStart: e.target.value })
                }
                placeholder="Start Date"
              />
              <FormInput
                id="experienceEnd"
                type="date"
                value={formData.experienceEnd}
                onChange={(e) =>
                  setFormData({ ...formData, experienceEnd: e.target.value })
                }
                placeholder="End Date (leave empty if currently working in clinic)"
              />
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-6  flex justify-end gap-3">
          {hasProfessionalChanges && (
            <>
              <button
                onClick={() => handleRevert("professional")}
                className="button-secondary-large"
              >
                Revert
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="button-primary-large"
              >
                {saving ? "Saving..." : "Save Change"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
