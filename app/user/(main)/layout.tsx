import SideBar from "@/components/partials/SideBar";
import InformationBar from "@/components/partials/InformationBar";

export default function UserLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<SideBar />
			<div className="flex flex-col w-full">
				<InformationBar />
				{children}
			</div>
		</>
	);
}
