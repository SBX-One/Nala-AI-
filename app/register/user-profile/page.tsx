"use client";

import { saveUserProfile } from "@/app/auth/actions";
import { RegisterHeader } from "@/components/ui/RegisterHeader";
import { FormInput } from "@/components/ui/FormInput";
import { FormRadioGroup } from "@/components/ui/FormRadioGroup";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useState, useRef, type ChangeEvent } from "react";
import Link from "next/link";

export default function UserProfilePage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    avatarUrl: "",
    displayName: "",
    fullName: "",
    sex: "" as "male" | "female" | "",
    location: "",
    birthDate: "",
  });

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `user-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, avatarUrl: publicUrl }));
    } catch (err: any) {
      setError("Error uploading avatar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const isFormValid =
    form.displayName.trim() !== "" &&
    form.fullName.trim() !== "" &&
    form.sex !== "" &&
    form.birthDate !== "";

  async function handleAction() {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await saveUserProfile({
        fullName: form.fullName,
        displayName: form.displayName,
        sex: form.sex as "male" | "female",
        location: form.location,
        birthDate: form.birthDate,
        avatarUrl: form.avatarUrl,
      });
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-white py-12 px-6">
      <RegisterHeader
        title="Let's Setup Your Personal Information"
        description="Fill this form with true information"
      />

      {/* Main Content Card */}
      <div className="w-full max-w-2xl bg-white border border-neutral-100 rounded-xl p-8 md:p-12 mb-8 mt-8 shadow-sm">
        {error && (
          <div className="mb-8 p-4 bg-error-50 border border-error-200 rounded-xl text-text-error text-body-sm-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Avatar Section - Centered Modern Style */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="relative size-32 rounded-full overflow-hidden border-2 border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center transition-all group-hover:border-primary-300">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-8 rounded-full border-2 border-primary-100 border-t-primary-500 animate-spin" />
                  </div>
                ) : form.avatarUrl ? (
                  <Image
                    src={form.avatarUrl}
                    alt="Avatar Preview"
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-text-placeholder">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                      <path d="M3 16.8V9.2C3 8 3.8 7 5 7h.6c.5 0 1-.3 1.2-.7L7.8 4.5C8 4.2 8.5 4 9 4h6c.5 0 1 .2 1.2.5l.9 1.8c.2.4.7.7 1.2.7H19c1.2 0 2 1 2 2.2v7.6C21 17 20.2 18 19 18H5c-1.2 0-2-1-2-1.2Z" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 size-10 bg-primary-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg hover:bg-primary-600 transition-all active:scale-90"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
            <div className="text-center">
              <h4 className="text-body-base-semibold text-text-heading">
                Profile Picture
              </h4>
              <p className="text-body-sm-medium text-text-placeholder">
                Upload your best photo
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <FormInput
            id="displayName"
            leftLabel="Display Name"
            value={form.displayName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, displayName: e.target.value })
            }
            placeholder="How should we call you?"
          />

          <FormInput
            id="fullName"
            leftLabel="Full Name"
            value={form.fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, fullName: e.target.value })
            }
            placeholder="Enter your legal full name"
          />

          <FormRadioGroup
            leftLabel="Gender"
            value={form.sex}
            onChange={(val) => setForm({ ...form, sex: val as any })}
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
          />

          <div className="grid md:grid-cols-2 gap-8">
            <FormInput
              id="location"
              leftLabel="Location"
              value={form.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, location: e.target.value })
              }
              placeholder="City, Country"
            />

            <FormInput
              id="birthDate"
              leftLabel="Birth Date"
              type="date"
              value={form.birthDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, birthDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons (Outside Card) */}
      <div className="w-full max-w-2xl flex items-center justify-between px-4">
        <Link
          href="/register/role"
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
        </Link>

        <span className="text-label-base-semibold text-primary-600">
          Step 2/2
        </span>

        <button
          onClick={handleAction}
          disabled={!isFormValid || isSubmitting}
          className="flex items-center gap-2 text-label-base-semibold text-primary-600 hover:text-primary-700 disabled:text-text-placeholder disabled:cursor-not-allowed transition-all group"
        >
          {isSubmitting ? (
            <div className="size-5 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
          ) : (
            <>
              Complete
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
    </div>
  );
}
