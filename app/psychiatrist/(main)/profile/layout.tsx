"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";

interface TabItem {
  label: string;
  href: string;
}

const TABS: TabItem[] = [
  { label: "Account", href: "/psychiatrist/profile" },
  { label: "Availability", href: "/psychiatrist/profile/availability" },
  { label: "App Settings", href: "/psychiatrist/profile/settings" },
  { label: "Data & Privacy", href: "/psychiatrist/profile/privacy" },
  { label: "Payment & Billing", href: "/psychiatrist/profile/billing" },
  { label: "Notification", href: "/psychiatrist/profile/notifications" },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="bg-surface-default min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-b border-border-default sticky top-0 z-40">
        {/* Tab Navigation Bar */}
        <div className="px-6 flex items-center justify-between overflow-x-auto custom-scrollbar border-t border-border-default/50">
          <div className="flex items-center gap-2 py-4">
            {TABS.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-6 py-3.5 rounded-xl text-label-base-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "bg-surface-primary text-white"
                      : "text-text-placeholder "
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="button-error-secondary-large"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </div>

      {/* Logout Confirmation Modal (Reusing existing logic/style) */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-md flex flex-col gap-6 border border-border-default animate-in zoom-in-95 duration-300">
            <div className="flex flex-col gap-3 text-center">
              <div className="size-16 bg-error-50 text-error-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <h3 className="text-heading-5-bold text-text-heading">
                Logout Account
              </h3>
              <p className="text-body-base-medium text-text-subheading leading-relaxed">
                Are you sure you want to log out from your account? You will
                need to sign in again to access the dashboard.
              </p>
            </div>
            <div className="flex gap-4 mt-2">
              <button
                className="button-outline-large flex-1"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="button-error-large flex-1"
                onClick={async () => {
                  await signOut();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
