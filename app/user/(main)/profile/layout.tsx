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
  { label: "Account", href: "/user/profile" },
  { label: "App Settings", href: "/user/profile/settings" },
  { label: "Data & Privacy", href: "/user/profile/privacy" },
  { label: "Payment & Billing", href: "/user/profile/billing" },
  { label: "Notification", href: "/user/profile/notifications" },
];

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="bg-surface-default min-h-screen">
      <div className="bg-white border-b border-border-default sticky top-0 z-40">
        <div className="p-4 flex items-center justify-between overflow-x-auto scrollbar-hide border-t border-border-default/50">
          <div className="flex items-center gap-2 ">
            {TABS.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}

                  className={`button-tab px-10 py-3 ${isActive ? "button-tab-active" : ""}`}
                >
                  {tab.label}
                </Link>
              );
            })}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="button-error-secondary-small px-10 py-3"
          >
            Logout
          </button>
          </div>

        </div>
      </div>

      <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-surface-background p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col gap-4 border border-border-default">
            <div className="flex flex-col gap-2">
              <h3 className="text-heading-6-semibold text-text-heading">
                Logout Account
              </h3>
              <p className="text-body-base-regular text-text-subheading">
                Are you sure you want to log out from your account? You will
                need to sign in again to access the dashboard.
              </p>
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button
                className="button-outline-medium flex-1 justify-center"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="button-error-medium flex-1 justify-center"
                onClick={async () => {
                  await signOut();
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
