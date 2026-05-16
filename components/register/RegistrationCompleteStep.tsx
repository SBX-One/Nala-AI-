"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePsychiatristRegister } from "@/context/PsychiatristRegisterContext";
import Link from "next/link";

export const RegistrationCompleteStep: React.FC = () => {
  const router = useRouter();
  const { resetForm } = usePsychiatristRegister();

  return (
    <div className="flex items-center justify-center gap-4 w-full">
      <Link
        href={"/psychiatrist"}
        className="button-outline-large text-label-base-medium"
      >
        Skip For Now
      </Link>
      <Link
        href={"psychiatrist/profile/availability"}
        className="button-primary-large  text-label-base-medium"
      >
        Setup Availability
      </Link>
    </div>
  );
};
