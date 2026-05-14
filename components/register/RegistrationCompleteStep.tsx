"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePsychiatristRegister } from "@/context/PsychiatristRegisterContext";

export const RegistrationCompleteStep: React.FC = () => {
  const router = useRouter();
  const { resetForm } = usePsychiatristRegister();

  return (
    <div className="flex items-center justify-center gap-4 w-full">
      <button
        onClick={() => {
          resetForm();
          router.push("/psychiatrist");
        }}
        className="button-outline-large text-label-base-medium"
      >
        Skip For Now
      </button>
      <button
        onClick={() => {
          // If this is on a separate page, we need a way to go to availability
          // For now, we redirect to profile page with a param or just set step if provider is shared
          router.push("/register/psychiatrist-profile?step=availability");
        }}
        className="button-primary-large  text-label-base-medium"
      >
        Setup Availability
      </button>
    </div>
  );
};
