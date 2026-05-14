"use client";

import { selectRole } from "@/app/auth/actions";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { RegisterHeader } from "@/components/ui/RegisterHeader";

type RoleChoice = "user" | "psychiatry" | null;

export default function RoleSelectionPage() {
  const [selected, setSelected] = useState<RoleChoice>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setIsLoading(true);

    try {
      await selectRole(selected);
    } catch (error) {
      console.error("Failed to select role:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-white py-12 px-6">
      <RegisterHeader
        title="Join as a patient or psychiatrist"
        description="Choose one that fits you best"
      />

      {/* Role Selection Grid */}
      <div className="w-full max-w-2xl flex flex-col justify-center md:flex-row gap-6 mb-12 mt-8">
        {/* Patient Card */}
        <button
          onClick={() => setSelected("user")}
          className={`relative group w-full md:w-54 aspect-square p-8 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-between
            ${
              selected === "user"
                ? "border-primary-500 bg-white"
                : "border-neutral-100 bg-white hover:border-primary-200"
            }`}
        >
          <div className="relative w-full aspect-square mb-8">
            <Image
              src="/images/hospital-wheelchair/bro.svg"
              alt="Patient Illustration"
              fill
              className="object-contain"
            />
          </div>
          <span
            className={`text-label-base-semibold transition-colors
            ${selected === "user" ? "text-primary-600" : "text-text-heading"}`}
          >
            I&apos;m a Patient
          </span>
          {selected === "user" && (
            <div className="absolute top-4 right-4 size-6 rounded-full bg-primary-500 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </button>

        {/* Psychiatry Card */}
        <button
          onClick={() => setSelected("psychiatry")}
          className={`relative group w-full md:w-54 aspect-square p-8 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-between
            ${
              selected === "psychiatry"
                ? "border-primary-500 bg-white"
                : "border-neutral-100 bg-white hover:border-primary-200"
            }`}
        >
          <div className="relative w-full aspect-square mb-8">
            <Image
              src="/images/hospital-wheelchair/bro-1.svg"
              alt="Psychiatry Illustration"
              fill
              className="object-contain"
            />
          </div>
          <span
            className={`text-label-base-semibold transition-colors
            ${selected === "psychiatry" ? "text-primary-600" : "text-text-heading"}`}
          >
            I&apos;m a Psychiatry
          </span>
          {selected === "psychiatry" && (
            <div className="absolute top-4 right-4 size-6 rounded-full bg-primary-500 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="w-full max-w-lg flex items-center justify-between  mt-8">
        <Link
          href="/register"
          className="flex items-center gap-2 text-label-base-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Previous
        </Link>

        <span className="text-label-base-semibold text-primary-600">
          Step 1/3
        </span>

        <button
          onClick={handleContinue}
          disabled={!selected || isLoading}
          className="flex items-center gap-2 text-label-base-semibold text-primary-600 hover:text-primary-700 disabled:text-text-placeholder disabled:cursor-not-allowed transition-all group"
        >
          {isLoading ? (
            <div className="size-5 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
          ) : (
            <>
              Next
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
