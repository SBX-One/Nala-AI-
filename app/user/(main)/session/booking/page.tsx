"use client";

import { useState } from "react";

const PSYCHIATIST_DATA = [
	{
		id: 1,
		name: "Dr. Nanda Mahardika",
		status: "Available",
		spesialist: "Psychologist",
		description: "Psychologist and relationship counselor",
		advertise: ["Anaxiety ", "Depression", "OCD"],
		experience: 18,
		PatientCount: 1800,
		Price: 200000,
		rating: 4.8,
	},
	{
		id: 2,
		name: "Dr. Samantha Leonardo",
		status: "Available",
		spesialist: "Psychiatrist",
		description: "Psychiatrist and clinical psychologist",
		advertise: ["Anaxiety ", "Depression", "ADHD"],
		experience: 21,
		PatientCount: 2345,
		Price: 223000,
		rating: 4.8,
	},
];

const DATES = [
	{ label: "Besok", day: "25", month: "OCT", status: true },
	{ label: "Lusa", day: "26", month: "OCT", status: true },
	{ label: "Rabu", day: "27", month: "OCT", status: false },
	{ label: "Kamis", day: "28", month: "OCT", status: false },
];

const TIMES = ["09:00-09:45", "09:45-10:30", "10:30-11:15", "11:15-12:00"];

const FILTERS = [
	"All Specialist",
	"Anaxiety",
	"Panic",
	"Deppresion",
	"Childhood Trauma",
	"Bipolar Disoreder",
];

const idr = (number: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(number);
};

export default function BookingPage() {
	const [selectedPsychiatrist, setSelectedPsychiatrist] = useState<any>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState(1);
	const [selectedDate, setSelectedDate] = useState("25");
	const [selectedTime, setSelectedTime] = useState("09:45-10:30");
	const [paymentMethod, setPaymentMethod] = useState("Credit Card");
	const [selectedFilter, setSelectedFilter] = useState("All Specialist");

	const handleBookClick = (psychiatrist: any) => {
		setSelectedPsychiatrist(psychiatrist);
		setStep(1);
		setIsOpen(true);
	};

	return (
		<div>
			<div className="px-6 py-8  border-b border-border-default">
				<div className="flex justify-between items-end">
					<div>
						<p className="text-heading-3-semibold text-text-heading">
							Find Your Specialist
						</p>
						<p className="text-body-base-medium text-text-subheading">
							Find Your Specialist
						</p>
					</div>
					<div className="flex gap-3 ">
						<button className="button-outline-medium">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="size-4"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M11.77 19q-.33 0-.55-.22t-.22-.55v-5.576L5.604 5.83q-.202-.27-.055-.55t.47-.28h11.962q.323 0 .47.28q.147.282-.055.55L13 12.655v5.577q0 .328-.22.549t-.55.22z"
								/>
							</svg>
							More Filter
						</button>
						<button className="button-outline-medium">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="size-4"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V3q0-.425.288-.712T7 2t.713.288T8 3v1h8V3q0-.425.288-.712T17 2t.713.288T18 3v1h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5z"
								/>
							</svg>
							Availbility
						</button>
					</div>
				</div>
				<div className="flex gap-2 mt-8">
					{FILTERS.map((f) => (
						<button
							key={f}
							onClick={() => setSelectedFilter(f)}
							className={`select-default-medium ${selectedFilter === f ? "active" : ""}`}
						>
							{f}
						</button>
					))}
				</div>
			</div>

			<div className="px-6 py-6.5 grid grid-cols-2 gap-4 relative bg-surface-default">
				{PSYCHIATIST_DATA.filter((i) =>
					selectedFilter === "All Specialist"
						? true
						: i.advertise.some(
								(tag) =>
									tag.trim().toLowerCase() ===
									selectedFilter.toLowerCase(),
							),
				).map((i) => (
					<div
						key={i.id}
						className="px-6 py-8 border border-border-default rounded-2xl w-full "
					>
						<div className="grid gap-6">
							<div className="flex items-center gap-4">
								<div className="bg-surface-disabled size-[90px] rounded-lg"></div>
								<div className="w-fit grid gap-3">
									<div>
										<p className="text-body-xl-semibold">
											{i.name}
										</p>
										<p className="text-body-sm-semibold text-text-action">
											{i.spesialist}
										</p>
									</div>

									<div className="flex justify-between items-center gap-4">
										<p className="text-label-caption-semibold text-text-subheading whitespace-nowrap">
											{i.experience} Years exp.
										</p>
										<p className="text-label-caption-semibold text-text-subheading whitespace-nowrap">
											{i.PatientCount} Patients
										</p>
									</div>
								</div>
							</div>

							<div className="w-full">
								<div className="flex gap-2">
									{i.advertise.map((t) => (
										<span
											key={t}
											className="text-label-small-medium border border-border-action px-2 py-1 rounded-sm bg-surface-primary-light text-text-action"
										>
											{t}
										</span>
									))}
								</div>
							</div>

							<div>
								<p className="text-label-caption-bold text-text-subheading mb-1">
									Description
								</p>
								<p className="text-body-sm-medium">
									{i.description}
								</p>
							</div>

							<hr className="text-border-default" />

							<div className="flex justify-between items-center">
								<div className="grid gap-1">
									<p className="text-label-large-bold text-text-action">
										{idr(i.Price)}
									</p>

									<div className="flex gap-2 items-center">
										<p className="text-icon-rating text-body-caption-semibold">
											★ {i.rating}
										</p>
										<p className="text-body-caption-medium text-text-subheading">
											(1100 Reviews)
										</p>
									</div>
								</div>
								<button
									onClick={() => handleBookClick(i)}
									className="button-primary-large"
								>
									Book Now
								</button>
							</div>
						</div>
					</div>
				))}

				{/* Booking Modal Overlay */}
				{isOpen && (
					<div className="fixed inset-0 bg-black/50 z-100 flex justify-end items-center ">
						<div className="bg-white w-full max-w-lg h-full rounded-l-3xl shadow-2xl overflow-hidden flex flex-col">
							{/* Modal Header */}
							<div className="px-8 pt-8 pb-4 flex justify-between items-center">
								<h2 className="text-heading-6-bold text-text-heading">
									{step === 1 ? "Book Specialist" : "Payment"}
								</h2>
							</div>

							<div className="flex-1 overflow-y-auto px-8 pb-8">
								{step === 1 ? (
									<div className="flex flex-col gap-8">
										{/* Specialist Mini Card */}

										<div className="flex items-center gap-4 rounded-2xl">
											<div className="bg-surface-disabled size-20 rounded-lg shrink-0"></div>
											<div className="grid">
												<p className="text-body-xl-semibold">
													{selectedPsychiatrist?.name}
												</p>
												<p className="text-body-sm-semibold text-text-action">
													{
														selectedPsychiatrist?.spesialist
													}
												</p>
											</div>
										</div>

										<div className="flex gap-2 mt-1">
											{selectedPsychiatrist?.advertise
												.slice(0, 3)
												.map((t: string) => (
													<span
														key={t}
														className="text-label-small-medium bg-surface-primary-light text-text-action px-2 py-1 rounded-sm "
													>
														{t.trim()}
													</span>
												))}
										</div>

										{/* Description */}
										<div className="flex flex-col gap-1">
											<p className="text-label-caption-bold text-text-subheading ">
												Description
											</p>
											<p className="text-body-sm-medium text-text-body">
												{
													selectedPsychiatrist?.description
												}
											</p>
										</div>

										<hr className="border-border-default" />

										{/* Select Date */}
										<div className="flex flex-col gap-4">
											<p className="text-label-base-bold text-text-label">
												Select Date
											</p>
											<div className="flex gap-4">
												{DATES.map((d) => (
													<button
														key={d.day}
														disabled={
															d.status === false
														}
														onClick={() =>
															setSelectedDate(
																d.day,
															)
														}
														className={`flex flex-col gap-1 items-center justify-center rounded-lg border transition-all availbility ${selectedDate === d.day ? "active" : ""}`}
													>
														<span className="text-label-small-semibold">
															{d.label}
														</span>
														<span className="text-body-xl-semibold">
															{d.day}
														</span>
														<span className="text-label-caption-medium">
															{d.month}
														</span>
													</button>
												))}
											</div>
										</div>

										{/* Select Time */}
										<div className="flex flex-col gap-4">
											<p className="text-label-base-bold text-text-label">
												Select Time
											</p>
											<div className="grid grid-cols-3 gap-3">
												{TIMES.map((t) => (
													<button
														key={t}
														onClick={() =>
															setSelectedTime(t)
														}
														className={`py-3 rounded-xl border text-sm transition-all text-center select-default-large ${selectedTime === t ? "active" : ""}`}
													>
														{t}
													</button>
												))}
											</div>
										</div>

										{/* Complaints */}
										<div className="flex flex-col gap-3">
											<p className="text-label-base-bold text-text-label">
												Complaints
											</p>
											<textarea
												className="w-full h-32 p-4 rounded-xl border border-border-default bg-surface-default text-body-sm-regular focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
												placeholder="Describe your complaints here..."
											/>
										</div>
										<div className="grid gap-4">
											<div className="flex justify-between items-center mt-4">
												<p className="text-body-base-medium text-text-subheading">
													Grand Total
												</p>
												<p className="text-body-xl-bold text-text-action">
													{idr(
														selectedPsychiatrist?.Price ||
															0,
													)}
												</p>
											</div>
											<button
												onClick={() => setStep(2)}
												className="button-primary-large w-full justify-center py-4 rounded-xl text-lg"
											>
												Book Now
											</button>
										</div>
									</div>
								) : (
									<div className="flex flex-col justify-between min-h-full h-fit gap-8">
										{/* Payment Method */}
										<div className="flex flex-col gap-4">
											<p className="text-body-base-bold">
												Payment Method
											</p>
											<div className="flex flex-col gap-3">
												{[
													"Credit Card",
													"QRIS",
													"Bank Transfer",
												].map((pm) => (
													<button
														key={pm}
														onClick={() =>
															setPaymentMethod(pm)
														}
														className={`w-full py-4 rounded-xl border transition-all text-center font-semibold select-default-large ${paymentMethod === pm ? "active" : ""} `}
													>
														{pm}
													</button>
												))}
											</div>
											<hr className="border-border-default" />
										</div>

										{/* Card Form - Only for Credit Card */}
										{paymentMethod === "Credit Card" && (
											<div className="flex flex-col gap-5">
												<div className="flex flex-col gap-2">
													<label className="text-label-small-semibold text-text-label">
														Card Holder Name
													</label>
													<input
														type="text"
														className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
														placeholder="Name on card"
													/>
												</div>
												<div className="flex flex-col gap-2">
													<label className="text-label-small-semibold text-text-label">
														Card Number
													</label>
													<input
														type="text"
														className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
														placeholder="1234 5678 9101 1121"
													/>
												</div>
												<div className="grid grid-cols-2 gap-4">
													<div className="flex flex-col gap-2">
														<label className="text-label-small-semibold text-text-label">
															Expire Date
														</label>
														<input
															type="text"
															className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
															placeholder="MM/YY"
														/>
													</div>
													<div className="flex flex-col gap-2">
														<label className="text-label-small-semibold text-text-label">
															CVV
														</label>
														<input
															type="text"
															className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
															placeholder="123"
														/>
													</div>
												</div>
											</div>
										)}

										<div className="flex flex-col gap-4">
											<div className="flex flex-col gap-4">
												<div className="flex justify-between items-center text-text-subheading">
													<span className="text-label-base-semibold text-text-subheading">
														Specialist
													</span>
													<span className="text-label-base-medium text-text-body">
														{idr(
															selectedPsychiatrist?.Price ||
																0,
														)}
													</span>
												</div>
												<div className="flex justify-between items-center text-text-subheading">
													<span className="text-label-base-semibold text-text-subheading">
														Platform Fee
													</span>
													<span className="text-label-base-medium text-text-body">
														{idr(2000)}
													</span>
												</div>
												<div className="flex justify-between items-center">
													<span className="text-label-base-semibold text-text-subheading">
														Grand Total
													</span>
													<span className="text-label-large-bold text-text-action">
														{idr(
															(selectedPsychiatrist?.Price ||
																0) + 2000,
														)}
													</span>
												</div>
											</div>

											<button
												onClick={() => {
													alert(
														"Booking Successful!",
													);
													setIsOpen(false);
												}}
												className="button-primary-large w-full justify-center py-4 rounded-xl text-lg"
											>
												Pay
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
