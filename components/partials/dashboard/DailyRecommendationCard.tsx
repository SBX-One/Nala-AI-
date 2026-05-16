"use client";

import starImage from "@/public/icon/star-outline.svg";
import Image from "next/image";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

export default function DailyRecommendationCard() {
	const [items, setItems] = useState([
		{ id: 1, title: "Drink 4L of Water", time: "12.00 PM", completed: true },
		{ id: 2, title: "Meditate for 15 Minutes", completed: false },
		{ id: 3, title: "Eat 5 Servings of Vegetables", completed: false },
	]);

	const toggleTask = (id: number) => {
		setItems((prev) =>
			prev.map((item) =>
				item.id === id ? { ...item, completed: !item.completed } : item,
			),
		);
	};

	const completedCount = items.filter((i) => i.completed).length;

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
					{completedCount}/{items.length} Done
				</span>
			</div>

			{/* Task List */}
			<div className="flex flex-col gap-4 mt-6">
				{items.map((item) => (
					<div
						key={item.id}
						onClick={() => toggleTask(item.id)}
						className="flex items-center gap-4 p-5 border border-border-default rounded-xl hover:bg-surface-default transition-all group cursor-pointer active:scale-[0.98]"
					>
						<div className="shrink-0 transition-transform group-hover:scale-110">
							{item.completed ? (
								<CheckCircle2 className="size-8 text-text-action fill-text-action text-white" />
							) : (
								<Circle className="size-7 text-text-action" />
							)}
						</div>
						<span
							className={`text-body-xl-semibold flex-1 transition-colors ${item.completed ? "text-text-placeholder line-through" : "text-text-heading"}`}
						>
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
