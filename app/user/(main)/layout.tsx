import SideBar from "@/components/partials/SideBar";
import InformationBar from "@/components/partials/InformationBar";
import { getUserProfile } from "@/app/actions/user";
import { createClient } from "@/utils/supabase/server";

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
		<>
		<div className="xl:flex hidden">
			<SideBar user={user} profile={profile} />
		</div>
			<div className="flex flex-col w-full h-screen">
				<InformationBar />
				<div className="flex-1 min-h-0 overflow-auto">{children}</div>
			</div>
		</>
	);
}
