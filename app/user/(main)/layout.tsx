import SideBar from "@/components/partials/SideBar";
import InformationBar from "@/components/partials/InformationBar";
import { getUserProfile } from "@/app/actions/user";
import { createClient } from "@/utils/supabase/server";

import { SidebarProvider } from "@/context/SidebarContext";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getUserProfile();

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-surface-default w-full">
        <SideBar user={user} profile={profile} />
        <div className="flex flex-col flex-1  overflow-hidden">
          <InformationBar />
          <div className="flex-1 overflow-y-auto w-full">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
