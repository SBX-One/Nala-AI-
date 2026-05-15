import PsychiatristSideBar from "@/components/partials/PsychiatristSideBar";
import InformationBar from "@/components/partials/InformationBar";
import { getCurrentPsychiatristProfile } from "@/app/actions/psychiatrist";
import { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/context/SidebarContext";

export default async function PsychiatristLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentPsychiatristProfile();

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full custom-scrollbar bg-surface-default">
        <Toaster position="top-center" reverseOrder={false} />
        <PsychiatristSideBar profile={profile} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <InformationBar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
