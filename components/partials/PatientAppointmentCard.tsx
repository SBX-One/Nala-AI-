import React from "react";
import Image from "next/image";
import starIcon from "@/public/icon/star.svg";

export type AppointmentType =
	| "upcoming"
	| "upcoming_urgent"
	| "waiting"
	| "ongoing"
	| "ended"
	| "past";

export interface PatientAppointmentCardProps {
	name: string;
	status: string;
	type: AppointmentType;
	duration?: string;
	hasAiInsights?: boolean;
	aiInsights?: string[];
	isHighlighted?: boolean;
}

const PatientAppointmentCard: React.FC<PatientAppointmentCardProps> = ({
	name,
	status,
	type,
	duration,
	hasAiInsights = true,
	aiInsights = ["Insomnia", "Work Strss", "Childhood Trauma"],
	isHighlighted = false,
}) => {
	// Configuration mapping for different appointment states
	const appointmentConfigs = {
		upcoming: {
			displayStatus: status,
			timeBadgeText: duration,
			badgeVariant: "light-blue" as const,
			actions: ["more-info"],
			borderClass: "border-border-default",
		},
		upcoming_urgent: {
			displayStatus: status,
			timeBadgeText: duration,
			badgeVariant: "information" as const,
			actions: ["more-info", "video"],
			borderClass: "border-border-default",
		},
		waiting: {
			displayStatus: "Patient in Waiting Room",
			timeBadgeText: duration,
			badgeVariant: "warning" as const,
			actions: ["more-info", "enter-room"],
			borderClass: "border-2 border-border-warning",
		},
		ongoing: {
			displayStatus: "On Going Sessions",
			timeBadgeText: `${duration} On going`,
			badgeVariant: "information" as const,
			actions: ["more-info"],
			borderClass: "border-border-default",
		},
		ended: {
			displayStatus: "Meetings Ended",
			timeBadgeText: `${duration} Mins`,
			badgeVariant: "information" as const,
			actions: ["write-feedback"],
			borderClass: "border-border-default",
		},
		past: {
			displayStatus: `${duration}, Yesterday`,
			timeBadgeText: "",
			badgeVariant: "light-blue" as const,
			actions: ["write-feedback"],
			borderClass: "border-border-default",
		},
	};

	const config = appointmentConfigs[type] || appointmentConfigs.upcoming;

	const badgeClasses = {
		warning: "bg-surface-warning text-text-warning border border-border-warning",
		information: "bg-surface-information text-text-information border border-border-information",
		"light-blue": "bg-surface-primary-light text-text-action border border-border-action",
	};

	return (
		<div
			className={`flex flex-col p-4 rounded-xl border ${
				isHighlighted || type === "waiting" ? "border-2 border-border-warning" : config.borderClass
			} hover:bg-surface-default/50 transition-colors gap-4`}
		>
			<div className="flex items-center justify-between">
				<div className="flex gap-4.5 items-center">
					{/* Avatar */}
					<div className="size-12 overflow-hidden rounded-full border border-border-default bg-surface-primary-light flex items-center justify-center text-text-action font-semibold text-lg">
						{name.charAt(0)}
					</div>
					<div className="flex flex-col">
						<div className="flex items-center gap-2">
							<p className="text-body-lg-semibold text-text-heading">
								{name}
							</p>
							{config.timeBadgeText && (
								<span
									className={`px-3 py-1 rounded-full text-body-caption-medium ${
										badgeClasses[config.badgeVariant]
									}`}
								>
									{config.timeBadgeText}
								</span>
							)}
						</div>
						<p className="text-body-sm-medium text-text-label">
							{config.displayStatus}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="text-icon-action">
						<Image
							src={starIcon}
							alt="starIcon"
							width={24}
							height={24}
							className="size-5"
						/>
					</div>

					<div className="flex gap-2">
						{config.actions.includes("more-info") && (
							<button className="button-secondary-medium">
								More Info
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="size-4"
									viewBox="0 0 24 24"
								>
									<path
										fill="none"
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 12h14m-4 4l4-4m-4-4l4 4"
									/>
								</svg>
							</button>
						)}

						{config.actions.includes("video") && (
							<button className="button-secondary-rounded size-10 flex items-center justify-center p-0">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="size-5"
									viewBox="0 0 24 24"
								>
									<path
										fill="currentColor"
										d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4Z"
									/>
								</svg>
							</button>
						)}

						{config.actions.includes("enter-room") && (
							<button className="button-primary-medium">
								Enter Room
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="size-4"
									viewBox="0 0 24 24"
								>
									<path
										fill="currentColor"
										d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4Z"
									/>
								</svg>
							</button>
						)}

						{config.actions.includes("write-feedback") && (
							<button className="button-secondary-medium">
								Write Feedback
							</button>
						)}
					</div>
				</div>
			</div>

			{hasAiInsights && (
				<div className="flex flex-col gap-2 pt-2 border-t border-border-default">
					<p className="text-body-caption-medium text-text-subheading">
						AI Insight Based on Complaint & Journal
					</p>
					<div className="flex flex-wrap gap-2">
						{aiInsights?.map((insight, index) => (
							<span
								key={index}
								className="px-3 py-1 rounded-full bg-surface-primary-light text-text-action border border-border-action text-body-caption-medium"
							>
								{insight}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default PatientAppointmentCard;
