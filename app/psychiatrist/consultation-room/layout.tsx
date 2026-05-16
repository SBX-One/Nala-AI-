import InformationBar from "@/components/partials/informationBarActiveMeeting";
import { ConsultationRoomProvider } from "@/context/ConsultationRoomContext";

export default function MeetingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConsultationRoomProvider>
      <div className="flex flex-col w-full min-h-screen">
        <InformationBar />
        {children}
      </div>
    </ConsultationRoomProvider>
  );
}
