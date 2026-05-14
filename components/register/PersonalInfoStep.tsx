import React from "react";
import Image from "next/image";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { FormRadioGroup } from "@/components/ui/FormRadioGroup";
import { usePsychiatristRegister } from "@/context/PsychiatristRegisterContext";

interface PersonalInfoStepProps {
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  handleAvatarChange,
  fileInputRef,
  uploading,
}) => {
  const { formData, setFormData } = usePsychiatristRegister();
  return (
    <div className="flex flex-col gap-10">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <label className="w-full text-label-base-semibold text-text-label text-left">
          Profile Picture
        </label>
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-25 rounded-full overflow-hidden border-2 border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            ) : formData.avatarUrl ? (
              <Image
                src={formData.avatarUrl}
                alt="Avatar Preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-text-placeholder">
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
            disabled={uploading}
            className="px-3 py-3 rounded-xl border border-neutral-100 text-label-caption-medium text-text-body disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
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

      {/* Full Name */}
      <FormInput
        id="fullName"
        leftLabel="Full Name"
        value={formData.fullName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFormData({ ...formData, fullName: e.target.value })
        }
        placeholder="Enter full name with titles"
      />

      {/* Gender Selection */}
      <FormRadioGroup
        leftLabel="Gender"
        options={[
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
        ]}
        value={formData.sex}
        onChange={(val) =>
          setFormData({ ...formData, sex: val as "male" | "female" })
        }
      />

      {/* Professional Bio (Description) */}
      <FormTextarea
        id="description"
        leftLabel="Professional Bio"
        value={formData.description}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Explain yourself"
        rows={5}
      />
    </div>
  );
};
