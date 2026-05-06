import PsychiatristSideBar from "@/components/partials/PsychiatristSideBar";
import InformationBar from "@/components/partials/InformationBar";

export default function PsychiatristLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<PsychiatristSideBar />
			<div className="flex flex-col w-full">
				<InformationBar />
				{children}
			</div>
		</>
	);
}
