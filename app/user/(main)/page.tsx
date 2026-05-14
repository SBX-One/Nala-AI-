import PlantIcon from "@/public/icon/plant-icon.svg";
import Image from "next/image";
import ConsultationSessionCard from "@/components/partials/dashboard/ConsultationSessionCard";
import NextAppointmentCard from "@/components/partials/dashboard/NextAppointmentCard";
import DailyRecommendationCard from "@/components/partials/dashboard/DailyRecommendationCard";
import ArticleRecommendationCard from "@/components/partials/dashboard/ArticleRecommendationCard";

import { getUserProfile } from "@/app/actions/user";
import { getUserConsultations, getActiveMeetingRoom } from "@/app/actions/appointment";
import { getPublishedArticles } from "@/app/actions/article";

export default async function page() {
	const [profile, consultations, articles] = await Promise.all([
		getUserProfile(),
		getUserConsultations(),
		getPublishedArticles(),
	]);

	const todayDate = new Date();
	const today = todayDate.toISOString().split("T")[0];

	// Stable Shuffle based on Date
	const dayOfYear = Math.floor(
		(todayDate.getTime() -
			new Date(todayDate.getFullYear(), 0, 0).getTime()) /
			86400000,
	);

	const randomArticles = [...articles].sort((a, b) => {
		// Use ID and dayOfYear to create a stable but daily-changing order
		const scoreA = (a.id * dayOfYear) % 100;
		const scoreB = (b.id * dayOfYear) % 100;
		return scoreA - scoreB;
	});

	// Find if there is a session today
	const currentSessionRaw = consultations.find(
		(c: any) => new Date(c.date).toISOString().split("T")[0] === today,
	);

	let currentSession = null;
	if (currentSessionRaw) {
		const roomId = await getActiveMeetingRoom(currentSessionRaw.psychiatrist_id);
		currentSession = {
			doctorName:
				currentSessionRaw.psychiatrist?.user?.user_profile?.name ||
				"Dr. Anonymous",
			specialization:
				currentSessionRaw.psychiatrist?.specialization || "Psychiatrist",
			time: currentSessionRaw.start_time.slice(0, 5),
			id: currentSessionRaw.id,
			roomId: roomId,
		};
	}

	// Upcoming are future ones or today but different from currentSession
	const upcomingAppointments = consultations
		.filter((c: any) => {
			const cDate = new Date(c.date).toISOString().split("T")[0];
			return cDate >= today && c.id !== currentSessionRaw?.id;
		})
		.map((c: any) => {
			const dateObj = new Date(c.date);
			const month = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
			const day = dateObj.getDate();
			
			const start = c.start_time.split(":");
			const end = c.end_time.split(":");
			const durationMinutes =
				parseInt(end[0]) * 60 +
				parseInt(end[1]) -
				(parseInt(start[0]) * 60 + parseInt(start[1]));

			return {
				id: c.id,
				name: c.psychiatrist?.user?.user_profile?.name || "Dr. Anonymous",
				time: `${c.start_time.slice(0, 5)} - ${c.end_time.slice(
					0,
					5,
				)} (${durationMinutes} mins)`,
				date: `${month} ${day}`,
			};
		})
		.slice(0, 2); 

	const recommendedArticles = randomArticles.slice(0, 2).map((a: any) => ({
		id: a.id,
		title: a.title,
		category: a.category?.name,
		duration: a.duration,
		author_name: a.author?.name || "Anonymous",
		author_avatar: a.author?.avatar_url,
		date: new Date(a.created_at).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		}),
		overview: a.overview
	}));

	return (
		<div className="p-6 flex flex-col gap-8">
			<div className=" grid gap-3">
				<p className="text-label-small-medium text-text-subheading">
					Welcome to your daily board
				</p>
				<p className="text-heading-2-bold ">
					Good Morning,{" "}
					<span className="text-text-action">{profile?.name || "User"}</span>{" "}
				</p>
				<div className="flex justify-between items-center">
					<div className="rounded-full border border-border-default p-4 bg-surface-primary-light w-fit flex gap-3 items-center">
						<Image
							src={PlantIcon}
							alt="Plant-Icon"
							priority
							className="size-4.5"
						/>
						<p className="text-body-base-medium text-text-body">
							&quot;Every day is a new opportunity to grow.&quot;
						</p>
					</div>
					<div className="flex gap-3  items-end">
						<button
							suppressHydrationWarning
							className="button-primary-medium"
						>
							Book Session
						</button>
						<button
							suppressHydrationWarning
							className="button-secondary-medium"
						>
							Chat With AI
						</button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2">
					<ConsultationSessionCard session={currentSession} />
				</div>
				<div className="lg:col-span-1">
					<NextAppointmentCard appointments={upcomingAppointments} />
				</div>
				<div className="lg:col-span-1">
					<DailyRecommendationCard />
				</div>
				<div className="lg:col-span-2">
					<ArticleRecommendationCard articles={recommendedArticles} />
				</div>
			</div>
		</div>
	);
}
