

import InformationBar from "@/components/partials/informationBarActiveMeeting";

export default function MeetingLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex flex-col w-full min-h-screen">
			<InformationBar/>
			{children}
		</div>
	);
}
