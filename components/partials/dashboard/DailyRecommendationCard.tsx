import starImage from "@/public/icon/star-outline.svg";
import Image from "next/image";
import { CheckCircle2, Circle } from "lucide-react";

export default function DailyRecommendationCard() {
	const recommendations = [
		{ id: 1, title: "Drink 4L of Water", time: "12.00 PM", completed: true },
		{ id: 2, title: "Meditate for 15 Minutes", completed: false },
		{ id: 3, title: "Eat 5 Servings of Vegetables", completed: false },
	];

	return (
		<div className="bg-surface-background border border-border-default rounded-2xl p-6 h-fit w-full">
			{/* Header */}
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<Image src={starImage} alt="star-outline" className="size-8" />
					<h3 className="text-body-xl-semibold text-text-heading">
						Daily Recommendation
					</h3>
				</div>
				<span className="text-label-small-semibold text-text-action">
					2/5 Done
				</span>
			</div>

			{/* Task List */}
			<div className="flex flex-col gap-4">
				{recommendations.map((item) => (
					<div
						key={item.id}
						className="flex items-center gap-4 p-5 border border-border-default rounded-xl hover:bg-surface-default transition-colors group cursor-pointer"
					>
						<div className="shrink-0">
							{item.completed ? (
								<CheckCircle2 className="size-8 text-text-action fill-text-action text-white" />
							) : (
								<Circle className="size-7 text-text-action" />
							)}
						</div>
						<span className="text-body-xl-semibold text-text-heading flex-1">
							{item.title}
						</span>
						{item.time && (
							<span className="text-body-caption-medium text-text-subheading">
								{item.time}
							</span>
						)}
					</div>
				))}
			</div>

			{/* Footer */}
			<div className="mt-8 flex items-center gap-4">
				<div className="h-px bg-border-default flex-1"></div>
				<button className="text-label-caption-semibold text-text-subheading hover:text-text-action transition-colors">
					Show More
				</button>
				<div className="h-px bg-border-default flex-1"></div>
			</div>
		</div>
	);
}
