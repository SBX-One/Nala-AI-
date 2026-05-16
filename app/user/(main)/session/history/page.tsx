"use client";

import { useState, useEffect, Suspense } from "react";
import { getUserConsultations } from "@/app/actions/appointment";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
	Calendar,
	Clock,
	Stethoscope,
	MessageSquare,
	Pill,
	ChevronRight,
	ChevronLeft,
} from "lucide-react";

function HistoryContent() {
	const router = useRouter();
	const [consultations, setConsultations] = useState<any[]>([]);
	const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [isDetailView, setIsDetailView] = useState(false);

	useEffect(() => {
		async function loadData() {
			const data = await getUserConsultations();
			const now = new Date();
			const todayStr =
				now.getFullYear() +
				"-" +
				String(now.getMonth() + 1).padStart(2, "0") +
				"-" +
				String(now.getDate()).padStart(2, "0");

			// Filter consultations that have reached today or are in the past
			const reachedConsultations = data.filter((c: any) => {
				const consultationDate = new Date(c.date);
				const dateStr =
					consultationDate.getFullYear() +
					"-" +
					String(consultationDate.getMonth() + 1).padStart(2, "0") +
					"-" +
					String(consultationDate.getDate()).padStart(2, "0");
				return dateStr <= todayStr;
			});

			setConsultations(reachedConsultations);
			if (reachedConsultations.length > 0) {
				setSelectedConsultation(reachedConsultations[0]);
			}
			setLoading(false);
		}
		loadData();
	}, []);

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (timeStr: string) => {
		// timeStr is usually like "HH:mm:ss"
		const [h, m] = timeStr.split(":");
		const hour = parseInt(h);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour.toString().padStart(2, "0")}.${m} ${ampm}`;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
			</div>
		);
	}

	return (
		<div className="flex h-full bg-surface-default overflow-hidden relative">
			{/* Left Column: List */}
			<div
				className={`${
					isDetailView ? "hidden xl:flex" : "flex"
				} w-full xl:w-[400px] border-r border-border-default bg-white flex-col shrink-0`}
			>
				<div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min">
					<h2 className="text-heading-6-semibold text-text-heading leading-tight mb-2">
						Review Your Consultation History
					</h2>

					{consultations.length === 0 ? (
						<div className="bg-surface-default border border-border-default rounded-2xl p-8 flex flex-col items-center text-center gap-4">
							<h4 className="text-body-lg-semibold text-text-heading">
								Your milestones start here.
							</h4>
							<p className="text-body-sm-medium text-text-subheading">
								Take your time. We'll gather your professional
								feedback right here whenever you're ready.
							</p>
							<button
								onClick={() =>
									router.push("/user/session/booking")
								}
								className="button-primary-medium"
							>
								Explore Specialists
							</button>
						</div>
					) : (
						consultations.map((con) => (
							<button
								key={con.id}
								onClick={() => {
									setSelectedConsultation(con);
									setIsDetailView(true);
								}}
								className={`w-full text-left px-6 py-4 rounded-2xl border transition-all group ${
									selectedConsultation?.id === con.id
										? "border-primary-default border-2 border-border-action bg-surface-primary-light"
										: "border-border-default hover:border-border-action"
								}`}
							>
								<div className="flex items-center justify-between mb-3">
									<span className="text-body-caption-medium text-text-placeholder">
										{formatDate(con.date)}
									</span>
									<span className="text-body-caption-medium text-text-placeholder">
										{formatTime(con.start_time)} -{" "}
										{formatTime(con.end_time)}
									</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="size-18.5 rounded-lg bg-surface-disabled overflow-hidden shrink-0">
										{con.psychiatrist?.avatar_url ? (
											<img
												src={
													con.psychiatrist.avatar_url
												}
												alt={con.psychiatrist.name}
												className="size-full object-cover"
											/>
										) : (
											<div className="size-full flex items-center justify-center bg-primary-100 text-primary-700 font-bold text-lg">
												{con.psychiatrist?.name?.charAt(
													0,
												)}
											</div>
										)}
									</div>
									<div className="flex flex-col gap-1 min-w-0">
										<h4 className="text-body-xl-semibold text-text-body truncate">
											{con.psychiatrist?.name}
										</h4>
										<p className="text-body-caption-medium text-text-subheading truncate">
											{con.topic ||
												"Follow-up consultation"}
										</p>
									</div>
								</div>
							</button>
						))
					)}
				</div>
			</div>

			{/* Right Column: Details */}
			<div
				className={`${
					isDetailView ? "flex" : "hidden xl:flex"
				} flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-surface-default max-xl:animate-in max-xl:slide-in-from-right-10 max-xl:duration-300`}
			>
				{consultations.length === 0 ? (
					<div className="h-full w-full flex items-center justify-center">
						<div className="relative size-40 lg:size-50">
							<Image
								src="/images/notfoundChar.png"
								alt="Doctor Illustration"
								fill
								className="object-contain"
							/>
						</div>
					</div>
				) : selectedConsultation ? (
					<div className="max-w-4xl mx-auto space-y-6 w-full">
						{/* Back Button for Mobile */}
						<button
							onClick={() => setIsDetailView(false)}
							className="xl:hidden flex items-center gap-2 text-text-action font-medium mb-4"
						>
							<ChevronLeft className="size-5" />
							Back to History
						</button>

						{/* Doctor Header Card */}
						<div className="bg-white rounded-2xl p-6 sm:p-8 border border-border-default shadow-sm flex flex-col sm:flex-row gap-6  items-center sm:items-start text-center sm:text-left">
							<div className="size-24 sm:size-28 rounded-2xl bg-surface-disabled overflow-hidden shrink-0 border border-border-default">
								{selectedConsultation.psychiatrist
									?.avatar_url ? (
									<img
										src={
											selectedConsultation.psychiatrist
												.avatar_url
										}
										alt={
											selectedConsultation.psychiatrist
												.name
										}
										className="size-full object-cover"
									/>
								) : (
									<div className="size-full flex items-center justify-center bg-primary-100 text-primary-700 text-heading-3-bold">
										{selectedConsultation.psychiatrist?.name?.charAt(
											0,
										)}
									</div>
								)}
							</div>
							<div className="flex-1 flex flex-col gap-4 w-full">
								<div className="flex flex-col sm:flex-row items-center sm:items-start justify-between pb-4 sm:py-4 border-b border-border-default gap-4">
									<div className="space-y-1">
										<h2 className="text-body-xl-semibold sm:text-heading-6-semibold text-text-body">
											{
												selectedConsultation
													.psychiatrist?.name
											}
										</h2>
										<p className="text-body-sm-semibold text-text-action">
											{
												selectedConsultation
													.psychiatrist
													?.specialization
											}
										</p>
									</div>
									<div className="flex gap-2 flex-wrap justify-center sm:justify-end max-w-full sm:max-w-[300px]">
										{selectedConsultation.psychiatrist?.expertises?.map(
											(e: any, idx: number) => (
												<span
													key={idx}
													className="px-2.5 py-1 rounded-sm bg-surface-primary-light text-text-action text-label-small-medium"
												>
													{e.expertise.name}
												</span>
											),
										)}
									</div>
								</div>

								<div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 sm:gap-6 py-2">
									<div className="flex items-center gap-2">
										<Calendar className="size-4 text-icon-default" />
										<span className="text-body-caption-medium text-text-subheading">
											{formatDate(
												selectedConsultation.date,
											)}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Clock className="size-4 text-icon-default" />
										<span className="text-body-caption-medium text-text-subheading">
											{formatTime(
												selectedConsultation.start_time,
											)}{" "}
											-{" "}
											{formatTime(
												selectedConsultation.end_time,
											)}
										</span>
									</div>
								</div>

								<div className="space-y-1 text-center sm:text-left">
									<p className="text-body-sm-bold text-text-subheading">
										Consultation Topic
									</p>
									<p className="text-body-base-medium text-text-body">
										{selectedConsultation.topic ||
											"No topic specified"}
									</p>
								</div>
							</div>
						</div>

						{/* Sections */}
						<div className="space-y-4">
							{!selectedConsultation.psychiatrist_feedback ? (
								/* Feedback Section ONLY (Insights in progress) */
								<div className="bg-surface-background rounded-2xl p-6 border border-border-default space-y-4.5">
									<h3 className="text-body-xl-bold text-text-heading">
										Psychiatry's Feedback
									</h3>

									<div className="p-6 bg-surface-default border border-border-default rounded-2xl">
										<div className="flex flex-col items-center justify-center text-center py-6 gap-3">
											<h4 className="text-body-base-bold text-text-heading">
												Insights in progress.
											</h4>
											<p className="text-body-sm-medium text-text-subheading max-w-sm">
												Your specialist is carefully
												preparing your personal
												feedback. We'll notify you as
												soon as your guidance is ready
												to view.
											</p>
										</div>
									</div>
								</div>
							) : (
								<>
									{/* Diagnose Section */}
									<div className="bg-surface-background rounded-2xl p-6 border border-border-default  space-y-4.5">
										<h3 className="text-body-xl-bold text-text-heading">
											Diagnose
										</h3>

										<div className="p-6 bg-surface-default border border-border-default rounded-2xl">
											<p className="text-body-base-medium text-text-body">
												{selectedConsultation.diagnose ||
													"The diagnosis for this session is not yet available."}
											</p>
										</div>
									</div>

									{/* Feedback Section */}
									<div className="bg-surface-background rounded-2xl p-6 border border-border-default  space-y-4.5">
										<h3 className="text-body-xl-bold text-text-heading">
											Psychiatry's Feedback
										</h3>

										<div className="p-6 bg-surface-default border border-border-default rounded-2xl">
											<p className="text-body-base-medium text-text-body">
												{
													selectedConsultation.psychiatrist_feedback
												}
											</p>
										</div>
									</div>

									{/* Medicine Section */}
									<div className="bg-surface-background rounded-2xl p-6 border border-border-default  space-y-4.5">
										<h3 className="text-body-xl-bold text-text-heading">
											Medicine
										</h3>

										{selectedConsultation.medicines &&
										selectedConsultation.medicines.length >
											0 ? (
											<div className="grid grid-cols-2 gap-4">
												{selectedConsultation.medicines.map(
													(m: any, idx: number) => (
														<div
															key={idx}
															className="p-6 bg-surface-background border border-border-default rounded-2xl flex items-center gap-4"
														>
															<div className="size-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-default">
																<Pill className="size-6" />
															</div>
															<div className="flex-1">
																<h4 className="text-body-base-bold text-text-heading">
																	{
																		m
																			.medicine
																			?.name
																	}{" "}
																	{m.dose}
																</h4>
																<p className="text-label-small-medium text-text-subheading">
																	{m.use}
																</p>
															</div>
														</div>
													),
												)}
											</div>
										) : (
											<div className="p-6 bg-surface-background border border-border-default rounded-2xl text-center">
												<p className="text-body-base-medium text-text-placeholder">
													No medicine prescribed for
													this session.
												</p>
											</div>
										)}
									</div>
								</>
							)}
						</div>
					</div>
				) : (
					<div className="flex items-center justify-center h-full text-text-placeholder">
						Select a consultation session to view details
					</div>
				)}
			</div>
		</div>
	);
}

export default function HistoryPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center h-full">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
				</div>
			}
		>
			<HistoryContent />
		</Suspense>
	);
}
