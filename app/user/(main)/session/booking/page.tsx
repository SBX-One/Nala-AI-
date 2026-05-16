"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getPsychiatrists, getExpertises } from "@/app/actions/psychiatrist";
import { createAppointment } from "@/app/actions/appointment";

// Components
import BookingHeader from "@/components/partials/BookingHeader";
import FilterDrawer from "@/components/partials/FilterDrawer";
import PsychiatristCard from "@/components/partials/PsychiatristCard";
import BookingModal from "@/components/partials/BookingModal";
import AvailabilityDrawer from "@/components/partials/AvailabilityDrawer";

const idr = (number: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(number);
};

const getDayName = (date: Date) => {
	const days = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	];
	return days[date.getDay()];
};

export default function BookingPage() {
	const [psychiatrists, setPsychiatrists] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedPsychiatrist, setSelectedPsychiatrist] = useState<any>(null);
	const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
	const [step, setStep] = useState(1);

	// Filter States
	const [expertises, setExpertises] = useState<any[]>([]);
	const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
	const [selectedExpertise, setSelectedExpertise] = useState<number | null>(
		null,
	);
	const [selectedRating, setSelectedRating] = useState<number | null>(null);
	const [selectedGender, setSelectedGender] = useState<string | null>(null);
	const [selectedExperience, setSelectedExperience] = useState<string | null>(
		null,
	);
	const [minPrice, setMinPrice] = useState<string>("");
	const [maxPrice, setMaxPrice] = useState<string>("");

	// Temp Filter States
	const [tempExpertise, setTempExpertise] = useState<number | null>(null);
	const [tempRating, setTempRating] = useState<number | null>(null);
	const [tempGender, setTempGender] = useState<string | null>(null);
	const [tempExperience, setTempExperience] = useState<string | null>(null);
	const [tempMinPrice, setTempMinPrice] = useState<string>("");
	const [tempMaxPrice, setTempMaxPrice] = useState<string>("");

	// Availability Filter States
	const [availStartDate, setAvailStartDate] = useState<Date | null>(null);
	const [availEndDate, setAvailEndDate] = useState<Date | null>(null);
	const [availFromTime, setAvailFromTime] = useState("");
	const [availToTime, setAvailToTime] = useState("");
	const [isAvailabilityDrawerOpen, setIsAvailabilityDrawerOpen] =
		useState(false);

	// Form States
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
		start: string;
		end: string;
	} | null>(null);
	const [complaint, setComplaint] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("Credit Card");
	const [billingInfo, setBillingInfo] = useState({
		cardHolder: "",
		cardNumber: "",
		expireDate: "",
		cvv: "",
	});
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [lastBookingInfo, setLastBookingInfo] = useState<any>(null);

	useEffect(() => {
		async function fetchData() {
			const [psychData, expData] = await Promise.all([
				getPsychiatrists(),
				getExpertises(),
			]);
			setPsychiatrists(psychData);
			setExpertises(expData);
			setLoading(false);
		}
		fetchData();
	}, []);

	const nextSevenDays = useMemo(() => {
		const days = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date();
			d.setDate(d.getDate() + i);
			days.push(d);
		}
		return days;
	}, []);

	const availableDates = useMemo(() => {
		if (!selectedPsychiatrist?.availability) return [];
		return nextSevenDays.map((date, index) => {
			const dayName = getDayName(date);
			const isAvailable = selectedPsychiatrist.availability.some(
				(a: any) => a.day === dayName,
			);
			return {
				date,
				isAvailable,
				label:
					index === 0
						? "Hari Ini"
						: index === 1
							? "Besok"
							: index === 2
								? "Lusa"
								: date.toLocaleDateString("id-ID", {
										weekday: "short",
									}),
				dayNum: date.getDate().toString(),
				month: date
					.toLocaleDateString("en-US", { month: "short" })
					.toUpperCase(),
			};
		});
	}, [selectedPsychiatrist, nextSevenDays]);

	const timeSlots = useMemo(() => {
		if (!selectedPsychiatrist || !selectedDate) return [];
		const dayName = getDayName(selectedDate);
		const availability = selectedPsychiatrist.availability.find(
			(a: any) => a.day === dayName,
		);
		if (!availability) return [];
		
		const slots = [];
		const current = new Date(
			`2000-01-01T${availability.availability_start_time}`,
		);
		const end = new Date(
			`2000-01-01T${availability.availability_end_time}`,
		);

		const isToday = selectedDate.toDateString() === new Date().toDateString();
		const now = new Date();
		const currentHours = now.getHours();
		const currentMinutes = now.getMinutes();

		while (current < end) {
			const slotStartStr = current.toTimeString().slice(0, 5);
			const [slotHours, slotMinutes] = slotStartStr.split(":").map(Number);

			const isPast = isToday && (slotHours < currentHours || (slotHours === currentHours && slotMinutes <= currentMinutes));

			const slotStart = slotStartStr;
			current.setMinutes(current.getMinutes() + 45);
			if (current > end) break;
			const slotEnd = current.toTimeString().slice(0, 5);
			
			if (!isPast) {
				slots.push({ start: slotStart, end: slotEnd });
			}
		}
		return slots;
	}, [selectedPsychiatrist, selectedDate]);

	// Helper to get filter summary text
	const getFilterSummary = () => {
		const parts = [];

		const expName =
			expertises.find((e) => e.id === selectedExpertise)?.name ||
			"All Specialist";
		parts.push(expName);

		if (selectedRating) parts.push(`${selectedRating}.0+ Rating`);
		if (selectedGender)
			parts.push(
				selectedGender.charAt(0).toUpperCase() +
					selectedGender.slice(1),
			);
		if (selectedExperience)
			parts.push(
				selectedExperience.charAt(0).toUpperCase() +
					selectedExperience.slice(1),
			);
		if (minPrice || maxPrice) parts.push("Price Filtered");

		return parts.join(", ");
	};

	const isFiltering =
		selectedRating !== null ||
		selectedGender !== null ||
		selectedExperience !== null ||
		minPrice !== "" ||
		maxPrice !== "";

	const isAvailabilityFiltering =
		availStartDate !== null || availFromTime !== "" || availToTime !== "";

	const getAvailabilitySummary = () => {
		if (!isAvailabilityFiltering) return "";
		const parts = [];
		if (availStartDate && availEndDate) {
			const startStr = availStartDate.toLocaleDateString("id-ID", {
				day: "numeric",
				month: "short",
			});
			const endStr = availEndDate.toLocaleDateString("id-ID", {
				day: "numeric",
				month: "short",
			});
			parts.push(`${startStr} - ${endStr}`);
		} else if (availStartDate) {
			parts.push(
				availStartDate.toLocaleDateString("id-ID", {
					day: "numeric",
					month: "short",
				}),
			);
		}

		if (availFromTime && availToTime) {
			parts.push(`${availFromTime} - ${availToTime}`);
		} else if (availFromTime) {
			parts.push(`From ${availFromTime}`);
		} else if (availToTime) {
			parts.push(`Until ${availToTime}`);
		}
		return parts.join(", ");
	};

	const handleBookClick = (psychiatrist: any) => {
		setSelectedPsychiatrist(psychiatrist);
		setSelectedDate(null);
		setSelectedTimeSlot(null);
		setComplaint("");
		setStep(1);
		setIsBookingModalOpen(true);
	};

	const handlePaymentSubmit = async () => {
		if (!selectedPsychiatrist || !selectedDate || !selectedTimeSlot) return;
		setIsSubmitting(true);
		try {
			const result = await createAppointment({
				psychiatristId: selectedPsychiatrist.id,
				complaint,
				date: selectedDate.toISOString().split("T")[0],
				startTime: `${selectedTimeSlot.start}:00`,
				endTime: `${selectedTimeSlot.end}:00`,
				paymentMethod,
				...billingInfo,
				price: selectedPsychiatrist.Price,
			});

			if (result.success) {
				setLastBookingInfo({
					psychiatrist: selectedPsychiatrist.name,
					date: selectedDate.toLocaleDateString("id-ID", {
						day: "numeric",
						month: "long",
						year: "numeric",
					}),
					time: `${selectedTimeSlot.start} - ${selectedTimeSlot.end}`,
				});
				setIsBookingModalOpen(false);
				setIsSuccessModalOpen(true);
			} else {
				alert("Booking failed: " + result.error);
			}
		} catch {
			alert("An unexpected error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	const filteredPsychiatrists = useMemo(() => {
		return psychiatrists.filter((p) => {
			if (selectedExpertise) {
				const expName = expertises.find(
					(e) => e.id === selectedExpertise,
				)?.name;
				if (!p.advertise.includes(expName)) return false;
			}
			if (selectedRating && p.rating < selectedRating) return false;
			if (selectedGender && p.sex !== selectedGender) return false;
			if (selectedExperience) {
				if (selectedExperience === "junior" && p.experience > 2)
					return false;
				if (
					selectedExperience === "intermediate" &&
					(p.experience <= 2 || p.experience > 5)
				)
					return false;
				if (selectedExperience === "expert" && p.experience <= 5)
					return false;
			}
			if (minPrice && p.Price < parseInt(minPrice)) return false;
			if (maxPrice && p.Price > parseInt(maxPrice)) return false;

			// Filter Availability
			if (availStartDate) {
				// Find if psychiatrist is available on ANY day in the range
				const daysInRange: string[] = [];
				const curr = new Date(availStartDate);
				const limit = availEndDate || availStartDate;

				// Ensure we compare only the date part to avoid issues with time components
				const limitTime = new Date(limit).setHours(0, 0, 0, 0);

				while (curr.setHours(0, 0, 0, 0) <= limitTime) {
					daysInRange.push(getDayName(curr));
					curr.setDate(curr.getDate() + 1);
				}

				const isAvailableInRange = p.availability.some((a: any) => {
					if (!daysInRange.includes(a.day.toLowerCase()))
						return false;

					// Normalize times to HH:mm for comparison
					const dbStart = a.availability_start_time.slice(0, 5);
					const dbEnd = a.availability_end_time.slice(0, 5);
					const reqFrom = availFromTime || "00:00";
					const reqTo = availToTime || "23:59";

					if (reqFrom < dbStart) return false;
					if (reqTo > dbEnd) return false;

					return true;
				});

				if (!isAvailableInRange) return false;
			}

			return true;
		});
	}, [
		psychiatrists,
		selectedExpertise,
		selectedRating,
		selectedGender,
		selectedExperience,
		minPrice,
		maxPrice,
		expertises,
		availStartDate,
		availEndDate,
		availFromTime,
		availToTime,
	]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen">
			<BookingHeader
				onOpenFilter={() => {
					setTempExpertise(selectedExpertise);
					setTempRating(selectedRating);
					setTempGender(selectedGender);
					setTempExperience(selectedExperience);
					setTempMinPrice(minPrice);
					setTempMaxPrice(maxPrice);
					setIsFilterDrawerOpen(true);
				}}
				expertises={expertises}
				selectedExpertise={selectedExpertise}
				onSelectExpertise={setSelectedExpertise}
				isFiltering={isFiltering}
				filterSummary={getFilterSummary()}
				isAvailabilityFiltering={isAvailabilityFiltering}
				availabilitySummary={getAvailabilitySummary()}
				onOpenAvailability={() => setIsAvailabilityDrawerOpen(true)}
			/>

			<div className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-default min-h-150 items-start">
				{filteredPsychiatrists.length > 0 ? (
					filteredPsychiatrists.map((p) => (
						<PsychiatristCard
							key={p.id}
							psychiatrist={p}
							onBookClick={handleBookClick}
							idr={idr}
						/>
					))
				) : (
					<div className="col-span-full h-full flex flex-col items-center justify-center">
						<div className="relative size-60 mb-8">
							<Image
								src="/images/notfoundChar.png"
								alt="No Specialist Found"
								fill
								className="object-contain"
							/>
						</div>
						<div className="text-center max-w-2xl px-6 grid gap-6">
							<h2 className="text-heading-2-bold text-text-heading mb-4">
								Let&apos;s try a different path.
							</h2>
							<p className="text-body-base-medium text-text-subheading leading-relaxed">
								We couldn&apos;t find a specialist matching
								those exact filters. Try broadening your search
								or resetting the filters to see more
								professionals ready to support you.
							</p>
						</div>
					</div>
				)}
			</div>

			<FilterDrawer
				isOpen={isFilterDrawerOpen}
				onClose={() => setIsFilterDrawerOpen(false)}
				expertises={expertises}
				tempStates={{
					expertise: tempExpertise,
					rating: tempRating,
					gender: tempGender,
					experience: tempExperience,
					minPrice: tempMinPrice,
					maxPrice: tempMaxPrice,
				}}
				setTempStates={{
					setExpertise: setTempExpertise,
					setRating: setTempRating,
					setGender: setTempGender,
					setExperience: setTempExperience,
					setMinPrice: setTempMinPrice,
					setMaxPrice: setTempMaxPrice,
				}}
				onSave={() => {
					setSelectedExpertise(tempExpertise);
					setSelectedRating(tempRating);
					setSelectedGender(tempGender);
					setSelectedExperience(tempExperience);
					setMinPrice(tempMinPrice);
					setMaxPrice(tempMaxPrice);
					setIsFilterDrawerOpen(false);
				}}
				onClear={() => {
					setTempExpertise(null);
					setTempRating(null);
					setTempGender(null);
					setTempExperience(null);
					setTempMinPrice("");
					setTempMaxPrice("");
					setSelectedExpertise(null);
					setSelectedRating(null);
					setSelectedGender(null);
					setSelectedExperience(null);
					setMinPrice("");
					setMaxPrice("");
				}}
			/>

			<BookingModal
				isOpen={isBookingModalOpen}
				onClose={() => setIsBookingModalOpen(false)}
				selectedPsychiatrist={selectedPsychiatrist}
				availableDates={availableDates}
				selectedDate={selectedDate}
				onSelectDate={(date) => {
					setSelectedDate(date);
					setSelectedTimeSlot(null);
				}}
				timeSlots={timeSlots}
				selectedTimeSlot={selectedTimeSlot}
				onSelectTimeSlot={setSelectedTimeSlot}
				complaint={complaint}
				onComplaintChange={setComplaint}
				step={step}
				setStep={setStep}
				paymentMethod={paymentMethod}
				onPaymentMethodChange={setPaymentMethod}
				billingInfo={billingInfo}
				onBillingInfoChange={setBillingInfo}
				isSubmitting={isSubmitting}
				onPaymentSubmit={handlePaymentSubmit}
				idr={idr}
			/>

			<AvailabilityDrawer
				isOpen={isAvailabilityDrawerOpen}
				onClose={() => setIsAvailabilityDrawerOpen(false)}
				initialStartDate={availStartDate}
				initialEndDate={availEndDate}
				initialFromTime={availFromTime}
				initialToTime={availToTime}
				onSave={(start, end, from, to) => {
					setAvailStartDate(start);
					setAvailEndDate(end);
					setAvailFromTime(from);
					setAvailToTime(to);
					setIsAvailabilityDrawerOpen(false);
				}}
				onClear={() => {
					setAvailStartDate(null);
					setAvailEndDate(null);
					setAvailFromTime("");
					setAvailToTime("");
					setIsAvailabilityDrawerOpen(false);
				}}
			/>

			{/* Success Modal */}
			{isSuccessModalOpen && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200 flex items-center justify-center px-4">
					<div className="bg-surface-background w-full max-w-md rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl animate-in fade-in zoom-in duration-300">
						<div className="size-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
							<svg
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M20 6L9 17L4 12"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
						<div className="text-center">
							<h3 className="text-heading-5-bold text-text-heading mb-2">
								Booking Successful!
							</h3>
							<p className="text-body-base-medium text-text-subheading">
								Your consultation with{" "}
								<span className="text-text-action font-semibold">
									{lastBookingInfo?.psychiatrist}
								</span>{" "}
								has been scheduled.
							</p>
						</div>
						<div className="w-full bg-surface-background rounded-2xl p-5 border border-border-default flex flex-col gap-3">
							<div className="flex justify-between items-center">
								<span className="text-label-small-semibold text-text-subheading">
									Date
								</span>
								<span className="text-label-base-bold text-text-heading">
									{lastBookingInfo?.date}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-label-small-semibold text-text-subheading">
									Time
								</span>
								<span className="text-label-base-bold text-text-heading">
									{lastBookingInfo?.time}
								</span>
							</div>
						</div>
						<div className="flex flex-col w-full gap-3">
							<button
								onClick={() =>
									(window.location.href =
										"/user/session/history")
								}
								className="button-primary-large w-full justify-center"
							>
								View My Sessions
							</button>
							<button
								onClick={() => setIsSuccessModalOpen(false)}
								className="button-outline-large w-full justify-center"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
