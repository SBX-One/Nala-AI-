import PsychiatristSideBar from "@/components/partials/PsychiatristSideBar";
import InformationBar from "@/components/partials/InformationBar";
import { getCurrentPsychiatristProfile } from "@/app/actions/psychiatrist";
import { Toaster } from "react-hot-toast";

export default async function PsychiatristLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentPsychiatristProfile();

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <PsychiatristSideBar profile={profile} />
      <div className="flex flex-col w-full h-screen ">
        <InformationBar />

        <div className="h-full overflow-y-auto ">{children}</div>
      </div>
    </>
  );
}
