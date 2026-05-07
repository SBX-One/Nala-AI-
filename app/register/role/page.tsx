"use client";

import { selectRole } from "@/app/auth/actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RoleChoice = "user" | "psychiatrist" | null;

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<RoleChoice>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setIsLoading(true);

    try {
      // Map role psychiatrist to psychiatry (sesuai Enum di DB)
      const mappedRole = selected === "psychiatrist" ? "psychiatry" : "user";
      await selectRole(mappedRole);
    } catch (error) {
      console.error("Failed to select role:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-500 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 opacity-90" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-xl" />
          <div className="absolute top-1/3 -right-10 w-60 h-60 rounded-full bg-white/5 blur-xl" />
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-8 px-12">
          <Image
            src="/icon/Nala-Logo.svg"
            alt="Nala Logo"
            width={120}
            height={96}
            className="brightness-0 invert"
          />
          <div className="text-center">
            <h1 className="text-heading-4-bold text-white mb-4">
              Choose Your Role
            </h1>
            <p className="text-body-lg-regular text-white/80 max-w-md">
              Tell us how you&apos;d like to use Nala. You can always update
              your preferences later.
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <div className="w-8 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white/60" />
          </div>
        </div>
      </div>

      {/* Right Panel - Role Selection */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg flex flex-col items-center gap-8">
          {/* Mobile Logo */}
          <div className="lg:hidden">
            <Image
              src="/icon/Nala-Logo.svg"
              alt="Nala Logo"
              width={64}
              height={52}
            />
          </div>

          {/* Header */}
          <div className="text-center w-full">
            <h2 className="text-heading-5-bold text-text-heading mb-2">
              How will you use Nala?
            </h2>
            <p className="text-body-base-regular text-text-subheading">
              Select your role to personalize your experience
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 w-full max-w-xs mx-auto">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-success-default text-white flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3 4.3L6 11.6L2.7 8.3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-label-small-medium text-text-success">
                Sign Up
              </span>
            </div>
            <div className="h-[2px] flex-1 bg-success-default" />
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-label-small-semibold">
                2
              </div>
              <span className="text-label-small-medium text-text-heading">
                Role
              </span>
            </div>
            <div className="h-[2px] flex-1 bg-border-default" />
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-neutral-100 text-text-placeholder flex items-center justify-center text-label-small-semibold">
                3
              </div>
              <span className="text-label-small-medium text-text-placeholder">
                Profile
              </span>
            </div>
          </div>

          {/* Role Cards */}
          <div className="w-full grid gap-4">
            {/* Client Card */}
            <button
              onClick={() => setSelected("user")}
              className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer group
                ${
                  selected === "user"
                    ? "border-primary-500 bg-primary-50 shadow-md"
                    : "border-border-default bg-white hover:border-primary-200 hover:shadow-sm"
                }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                  ${selected === "user" ? "bg-primary-500" : "bg-primary-50 group-hover:bg-primary-100"}`}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                      stroke={selected === "user" ? "#ffffff" : "#0060E5"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                      stroke={selected === "user" ? "#ffffff" : "#0060E5"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-label-large-semibold text-text-heading mb-1">
                    I&apos;m a Client
                  </h3>
                  <p className="text-body-sm-regular text-text-subheading">
                    I want to connect with psychiatrists, track my mental health
                    journey, and access wellness resources.
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors
                  ${selected === "user" ? "border-primary-500 bg-primary-500" : "border-border-default"}`}
                >
                  {selected === "user" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>

            {/* Psychiatrist Card */}
            <button
              onClick={() => setSelected("psychiatrist")}
              className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer group
                ${
                  selected === "psychiatrist"
                    ? "border-accent-500 bg-accent-50 shadow-md"
                    : "border-border-default bg-white hover:border-accent-200 hover:shadow-sm"
                }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                  ${selected === "psychiatrist" ? "bg-accent-500" : "bg-accent-50 group-hover:bg-accent-100"}`}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 12H18L15 21L9 3L6 12H2"
                      stroke={
                        selected === "psychiatrist" ? "#ffffff" : "#704FE6"
                      }
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-label-large-semibold text-text-heading mb-1">
                    I&apos;m a Psychiatrist
                  </h3>
                  <p className="text-body-sm-regular text-text-subheading">
                    I want to provide consultations, manage my schedule, and
                    publish articles for clients.
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors
                  ${selected === "psychiatrist" ? "border-accent-500 bg-accent-500" : "border-border-default"}`}
                >
                  {selected === "psychiatrist" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selected || isLoading}
            className={`w-full py-4 rounded-xl text-label-base-semibold transition-all duration-200 cursor-pointer flex items-center justify-center
              ${
                selected && !isLoading
                  ? "bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98]"
                  : "bg-neutral-100 text-text-disabled cursor-not-allowed"
              }`}
          >
            {isLoading ? (
              <div className="size-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
