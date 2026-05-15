"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import InformationBar from "@/components/partials/informationBarActiveMeeting";
import { Star } from "lucide-react";
import doctorsImg from "@/public/images/postConsultation.png";
import Image from "next/image";

interface Psychiatrist {
	name: string;
	specialization: string;
	photo_url?: string;
	expertises: string[];
	experience: number;
	patient_count: number;
	description: string;
}

function PostConsultationContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const roomId = Number(searchParams.get("roomId")) || 0;

	const [psychiatrist, setPsychiatrist] = useState<Psychiatrist | null>(null);
	const [rating, setRating] = useState(0);
	const [hoveredRating, setHoveredRating] = useState(0);
	const [review, setReview] = useState("");
	const [hideUsername, setHideUsername] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		async function loadData() {
			const supabase = createClient();
			if (roomId) {
				const { data: room } = await supabase
					.from("MeetingRoom")
					.select(
						`
            *,
            psychiatrist:PsychiatristProfile (
              *,
              expertises:PsychiatristExpertise (
                expertise:Expertise (name)
              )
            )
          `,
					)
					.eq("id", roomId)
					.single();

				if (room && room.psychiatrist) {
					const p = room.psychiatrist;
					setPsychiatrist({
						name: p.name || "Dr. Anonymous",
						specialization:
							p.specialization || "General Psychiatrist",
						experience: 10,
						patient_count: 1200,
						description:
							p.description || "No description available",
						expertises:
							p.expertises?.map((e: any) => e.expertise.name) ||
							[],
						photo_url: p.photo_url,
					});
				}
			}
		}
		loadData();
	}, [roomId]);

	const handleSubmit = async () => {
		if (rating === 0) {
			alert("Please provide a rating");
			return;
		}
		setIsSubmitting(true);
		// Simulate submission
		setTimeout(() => {
			setIsSubmitting(false);
			router.push("/user");
		}, 1500);
	};

	return (
		<div className="min-h-screen bg-surface-default flex flex-col w-full">
			<InformationBar />

			<main className="py-12 overflow-y-auto">
				<div className="w-fit mx-auto flex flex-col gap-4">
					{/* Status Card */}
					<div className=" bg-surface-background rounded-2xl py-8 px-16 border border-border-default flex items-center gap-16 justify-between ">
						<Image
							src={doctorsImg}
							alt="Consultation Ended"
							className=""
						/>

						<div className="flex-1 flex flex-col gap-2">
							<h1 className="text-heading-5-semibold text-text-heading">
								Your Consultation Has Been Ended
							</h1>
							<p className="text-body-base-medium text-text-subheading max-w-lg">
								Please wait for psychiatry to write your
								feedback and medicine for you!, we will notified
								when its ready.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start ">
						{/* Left: Psychiatrist Info */}
						<div className=" bg-surface-background border border-border-default rounded-3xl p-6 flex flex-col gap-6 h-fit">
							{psychiatrist && (
								<>
									<div className="flex items-center gap-4">
										<div className="bg-surface-disabled size-22.5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
											{psychiatrist.photo_url ? (
												<img
													src={psychiatrist.photo_url}
													alt={psychiatrist.name}
													className="size-full object-cover"
												/>
											) : (
												<div className="size-full flex items-center justify-center bg-primary-100 text-primary-700 text-heading-4-bold">
													{psychiatrist.name
														.split(" ")
														.map((n) => n[0])
														.join("")
														.toUpperCase()}
												</div>
											)}
										</div>
										<div className="flex flex-col gap-1">
											<h3 className="text-body-xl-bold text-text-heading leading-tight">
												{psychiatrist.name}
											</h3>
											<p className="text-body-base-medium text-text-action">
												{psychiatrist.specialization}
											</p>
											<div className="flex items-center gap-4 mt-1">
												<span className="text-label-caption-bold text-text-subheading">
													{psychiatrist.experience}+
													Years Exp.
												</span>
												<span className="text-label-caption-bold text-text-subheading">
													{psychiatrist.patient_count}{" "}
													Patients
												</span>
											</div>
										</div>
									</div>

									<div className="flex gap-2 flex-wrap">
										{psychiatrist.expertises.map((e, i) => (
											<span
												key={i}
												className="text-label-small-medium px-2 py-1 rounded-sm bg-surface-primary-light text-text-action"
											>
												{e}
											</span>
										))}
									</div>

									<div>
										<p className="text-label-caption-bold text-text-subheading mb-1">
											Description
										</p>
										<p className="text-body-sm-medium text-text-body line-clamp-3">
											{psychiatrist.description}
										</p>
									</div>
								</>
							)}
						</div>

						{/* Right: Review Form */}
						<div className=" bg-surface-background border border-border-default rounded-2xl p-6 flex flex-col gap-8 h-fit">
							<div className="flex flex-col gap-6">
								<h3 className="text-body-xl-semibold text-text-heading">
									Add a public review
								</h3>

								{/* Stars */}
								<div className="flex items-center justify-center ">
									{[1, 2, 3, 4, 5].map((star) => (
										<button
											key={star}
											onMouseEnter={() =>
												setHoveredRating(star)
											}
											onMouseLeave={() =>
												setHoveredRating(0)
											}
											onClick={() => setRating(star)}
											className="transition-transform active:scale-90"
										>
											{(hoveredRating || rating) >=
											star ? (
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="1em"
													height="1em"
													className="size-16 text-text-rating
                          "
													viewBox="0 0 24 24"
												>
													<path
														d="M0 0h24v24H0z"
														fill="none"
													/>
													<path
														fill="currentColor"
														d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z"
													/>
												</svg>
											) : (
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="1em"
													height="1em"
													viewBox="0 0 24 24"
													className={`size-16`}
												>
													<path
														d="M0 0h24v24H0z"
														fill="none"
													/>
													<path
														fill="currentColor"
														d="m8.85 16.825l3.15-1.9l3.15 1.925l-.825-3.6l2.775-2.4l-3.65-.325l-1.45-3.4l-1.45 3.375l-3.65.325l2.775 2.425zM5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275zM12 12.25"
													/>
												</svg>
											)}
										</button>
									))}
								</div>

								<div className="flex flex-col gap-2">
									<label className="text-label-small-semibold text-text-label">
										Write Review
									</label>
									<textarea
										value={review}
										onChange={(e) =>
											setReview(e.target.value)
										}
										placeholder="Tell others about your experience..."
										className="w-full min-h-[160px] border border-border-default rounded-lg p-4 text-body-base-medium text-text-heading focus:outline-none focus:border-primary-default transition-colors resize-none"
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<button
											onClick={() =>
												setHideUsername(!hideUsername)
											}
											className={`relative w-12 h-6 rounded-full transition-colors ${hideUsername ? "bg-surface-primary" : "bg-surface-disabled"}`}
										>
											<div
												className={`absolute top-1 left-1 size-4 bg-white rounded-full transition-transform ${hideUsername ? "translate-x-6" : "translate-x-0 bg-surface-primary"}`}
											/>
										</button>
										<span className="text-label-small-medium text-text-heading">
											Hide my username
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className=" flex items-center gap-4 w-full justify-end col-start-2">
							<button
								onClick={() => router.push("/user")}
								className="button-outline-medium"
							>
								Skip
							</button>
							<button
								onClick={handleSubmit}
								disabled={isSubmitting}
								className="button-primary-medium"
							>
								{isSubmitting
									? "Submitting..."
									: "Submit Review"}
							</button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

export default function PostConsultationPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PostConsultationContent />
		</Suspense>
	);
}
