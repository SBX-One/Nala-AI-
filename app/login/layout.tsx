import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Nala",
  description: "Sign in to your Nala account",
};

export default function LoginLayout({
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
