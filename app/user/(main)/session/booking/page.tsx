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
	{ label: "Besok", day: "25", month: "OCT" },
	{ label: "Lusa", day: "26", month: "OCT" },
	{ label: "Rabu", day: "27", month: "OCT" },
	{ label: "Kamis", day: "28", month: "OCT" },
];

const TIMES = ["09:00-09:45", "09:45-10:30", "10:30-11:15", "11:15-12:00"];

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

	const handleBookClick = (psychiatrist: any) => {
		setSelectedPsychiatrist(psychiatrist);
		setStep(1);
		setIsOpen(true);
	};

	return (
		<div className="px-6 py-6.5 grid grid-cols-2 gap-4 relative">
			{PSYCHIATIST_DATA.map((i) => (
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
							<div>
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
											<p className="text-body-xl-semibold">{selectedPsychiatrist?.name}</p>
											<p className="text-body-sm-semibold text-text-action">{selectedPsychiatrist?.spesialist}</p>
										</div>
									</div>
											<div className="flex gap-2 mt-1">
												{selectedPsychiatrist?.advertise.slice(0, 3).map((t: string) => (
													<span key={t} className="text-label-small-medium bg-surface-primary-light text-text-action px-2 py-1 rounded-sm ">
														{t.trim()}
													</span>
												))}
											</div>

									{/* Description */}
									<div className="flex flex-col gap-1">
										<p className="text-label-caption-bold text-text-subheading ">Description</p>
										<p className="text-body-sm-medium text-text-body">
											Comprehensive Consultation for Professional Migraine Assessment
										</p>
									</div>

									<hr className="border-border-default" />

									{/* Select Date */}
									<div className="flex flex-col gap-4">
										<p className="text-body-base-bold">Select Date</p>
										<div className="flex gap-3 overflow-x-auto pb-2">
											{DATES.map((d) => (
												<button
													key={d.day}
													onClick={() => setSelectedDate(d.day)}
													className={`flex flex-col items-center justify-center min-w-[70px] h-[85px] rounded-xl border transition-all ${
														selectedDate === d.day
															? "border-primary-default bg-primary-50 text-primary-default ring-1 ring-primary-default"
															: "border-border-default bg-surface-default text-text-subheading"
													}`}
												>
													<span className="text-[10px] font-semibold">{d.label}</span>
													<span className="text-xl font-bold my-1">{d.day}</span>
													<span className="text-[10px] font-semibold">{d.month}</span>
												</button>
											))}
										</div>
									</div>

									{/* Select Time */}
									<div className="flex flex-col gap-4">
										<p className="text-body-base-bold">Select Time</p>
										<div className="grid grid-cols-3 gap-3">
											{TIMES.map((t) => (
												<button
													key={t}
													onClick={() => setSelectedTime(t)}
													className={`py-3 rounded-xl border text-sm transition-all text-center ${
														selectedTime === t
															? "border-primary-default bg-primary-50 text-primary-default ring-1 ring-primary-default"
															: "border-border-default bg-surface-default text-text-body hover:bg-surface-disabled"
													}`}
												>
													{t}
												</button>
											))}
										</div>
									</div>

									{/* Complaints */}
									<div className="flex flex-col gap-3">
										<p className="text-body-base-bold">Complaints</p>
										<textarea 
											className="w-full h-32 p-4 rounded-xl border border-border-default bg-surface-default text-body-sm-regular focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
											placeholder="Describe your complaints here..."
										/>
									</div>

									<div className="flex justify-between items-center mt-4">
										<p className="text-body-base-medium text-text-subheading">Grand Total</p>
										<p className="text-body-xl-bold text-text-action">{idr(selectedPsychiatrist?.Price || 0)}</p>
									</div>

									<button 
										onClick={() => setStep(2)}
										className="button-primary-large w-full justify-center py-4 rounded-xl text-lg"
									>
										Book Now
									</button>
								</div>
							) : (
								<div className="flex flex-col gap-8">
									{/* Payment Method */}
									<div className="flex flex-col gap-4">
										<p className="text-body-base-bold">Payment Method</p>
										<div className="flex flex-col gap-3">
											{["Credit Card", "QRIS", "Bank Transfer"].map((pm) => (
												<button
													key={pm}
													onClick={() => setPaymentMethod(pm)}
													className={`w-full py-4 rounded-xl border transition-all text-center font-semibold ${
														paymentMethod === pm
															? "border-primary-default bg-primary-50 text-primary-default ring-1 ring-primary-default"
															: "border-border-default bg-surface-default text-text-body hover:bg-surface-disabled"
													}`}
												>
													{pm}
												</button>
											))}
										</div>
									</div>

									<hr className="border-border-default" />

									{/* Card Form - Only for Credit Card */}
									{paymentMethod === "Credit Card" && (
										<div className="flex flex-col gap-5">
											<div className="flex flex-col gap-2">
												<label className="text-body-sm-bold text-text-body">Card Holder Name</label>
												<input 
													type="text"
													className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
													placeholder="Name on card"
												/>
											</div>
											<div className="flex flex-col gap-2">
												<label className="text-body-sm-bold text-text-body">Card Number</label>
												<input 
													type="text"
													className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
													placeholder="1234 5678 9101 1121"
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="flex flex-col gap-2">
													<label className="text-body-sm-bold text-text-body">Expire Date</label>
													<input 
														type="text"
														className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
														placeholder="MM/YY"
													/>
												</div>
												<div className="flex flex-col gap-2">
													<label className="text-body-sm-bold text-text-body">CVV</label>
													<input 
														type="text"
														className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
														placeholder="123"
													/>
												</div>
											</div>
										</div>
									)}

									<div className="mt-auto flex flex-col gap-4">
										<div className="flex flex-col gap-2">
											<div className="flex justify-between items-center text-text-subheading">
												<span>Specialist</span>
												<span>{idr(selectedPsychiatrist?.Price || 0)}</span>
											</div>
											<div className="flex justify-between items-center text-text-subheading">
												<span>Platform Fee</span>
												<span>{idr(2000)}</span>
											</div>
											<div className="flex justify-between items-center mt-2">
												<span className="text-body-base-medium">Grand Total</span>
												<span className="text-body-xl-bold text-text-action">{idr((selectedPsychiatrist?.Price || 0) + 2000)}</span>
											</div>
										</div>

										<button 
											onClick={() => {
												alert("Booking Successful!");
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
	);
}
