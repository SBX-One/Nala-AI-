"use client";

import { saveUserProfile } from "@/app/auth/actions";
import Image from "next/image";
import { useState, useRef, type ChangeEvent } from "react";

export default function UserProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    avatarPreview: "",
    displayName: "",
    fullName: "",
    sex: "" as "male" | "female" | "",
    location: "",
    birthDate: "",
  });

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          avatarPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid =
    form.displayName.trim() !== "" &&
    form.fullName.trim() !== "" &&
    form.sex !== "" &&
    form.birthDate !== "";

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    // Kirim sex manual karena button bukan input real
    formData.append("sex", form.sex);

    try {
      const result = await saveUserProfile(formData);
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-500 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-primary-600 via-primary-500 to-accent-500 opacity-90" />
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <Image src="/icon/Nala-Logo.svg" alt="Nala Logo" width={120} height={96} className="brightness-0 invert" />
          <h1 className="text-heading-4-bold text-white">Complete Your Profile</h1>
          <p className="text-body-lg-regular text-white/80 max-w-md">Help us personalize your experience.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <form action={handleSubmit} className="w-full max-w-lg flex flex-col items-center gap-6">
          <div className="text-center">
            <h2 className="text-heading-5-bold text-text-heading">Personal Information</h2>
            <p className="text-body-base-regular text-text-subheading">Fill in your details to get started</p>
          </div>

          {error && (
            <div className="w-full p-4 bg-error-50 border border-error-200 rounded-xl text-text-error text-body-sm-medium">
              {error}
            </div>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full border-2 border-dashed border-border-default bg-neutral-50 flex items-center justify-center overflow-hidden cursor-pointer group"
            >
              {form.avatarPreview ? (
                <img src={form.avatarPreview} className="w-full h-full object-cover" />
              ) : (
                <span className="text-text-placeholder group-hover:text-primary-500">Upload</span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Fields */}
          <div className="w-full space-y-4">
            <div>
              <label className="text-label-small-medium text-text-label mb-1 block">Display Name *</label>
              <input
                name="displayName"
                required
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="How should we call you?"
                className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="text-label-small-medium text-text-label mb-1 block">Full Name *</label>
              <input
                name="fullName"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Enter your legal full name"
                className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="text-label-small-medium text-text-label mb-1 block">Sex *</label>
              <div className="flex gap-3">
                {["male", "female"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, sex: s as any })}
                    className={`flex-1 py-3 rounded-xl border-2 capitalize transition-all ${
                      form.sex === s ? "border-primary-500 bg-primary-50 text-primary-500" : "border-border-default text-text-label"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-label-small-medium text-text-label mb-1 block">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, Country"
                className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="text-label-small-medium text-text-label mb-1 block">Birth Date *</label>
              <input
                name="birthDate"
                type="date"
                required
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border-default focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-4 rounded-xl text-label-base-semibold transition-all ${
              isFormValid && !isSubmitting ? "bg-primary-500 text-white hover:bg-primary-600" : "bg-neutral-100 text-text-disabled cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Saving..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
