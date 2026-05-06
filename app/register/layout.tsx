import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - Nala",
  description: "Create your Nala account",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-surface-background">
      {children}
    </div>
  );
}
