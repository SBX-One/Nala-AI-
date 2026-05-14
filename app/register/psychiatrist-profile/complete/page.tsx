"use client";

import { RegistrationCompleteStep } from "@/components/register/RegistrationCompleteStep";
import { RegisterHeader } from "@/components/ui/RegisterHeader";
import { PsychiatristRegisterProvider } from "@/context/PsychiatristRegisterContext";
import Image from "next/image";

export default function RegistrationCompletePage() {
  return (
    <PsychiatristRegisterProvider>
      <div className="flex flex-col items-center min-h-screen w-full bg-white py-12 px-6 gap-6.5">
        <RegisterHeader
          title="All Set!"
          description="Your account has been created"
        />

        <RegistrationCompleteStep />
      </div>
    </PsychiatristRegisterProvider>
  );
}
