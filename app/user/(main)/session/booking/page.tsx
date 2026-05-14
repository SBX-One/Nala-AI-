"use client";

import { useState, useEffect, useMemo } from "react";
import { getPsychiatrists } from "@/app/actions/psychiatrist";
import { createAppointment } from "@/app/actions/appointment";

const idr = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// Helper untuk mendapatkan nama hari dari Date
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
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

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

  useEffect(() => {
    async function fetchData() {
      const data = await getPsychiatrists();
      setPsychiatrists(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Generate 7 hari ke depan
  const nextSevenDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  // Filter hari yang tersedia untuk psikiater terpilih
  const availableDates = useMemo(() => {
    if (!selectedPsychiatrist || !selectedPsychiatrist.availability) return [];

    return nextSevenDays.map((date, index) => {
      const dayName = getDayName(date);
      const isAvailable = selectedPsychiatrist.availability.some(
        (a: any) => a.day === dayName,
      );
      const i = index + 1;
      return {
        date,
        isAvailable,
        label:
          i === 1
            ? "Besok"
            : i === 2
              ? "Lusa"
              : date.toLocaleDateString("id-ID", { weekday: "short" }),
        dayNum: date.getDate().toString(),
        month: date
          .toLocaleDateString("en-US", { month: "short" })
          .toUpperCase(),
      };
    });
  }, [selectedPsychiatrist, nextSevenDays]);

  // Generate time slots (45 menit per sesi)
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
    const end = new Date(`2000-01-01T${availability.availability_end_time}`);

    while (current < end) {
      const slotStart = current.toTimeString().slice(0, 5);
      current.setMinutes(current.getMinutes() + 45);
      if (current > end) break;
      const slotEnd = current.toTimeString().slice(0, 5);
      slots.push({ start: slotStart, end: slotEnd });

      // Tambah jeda 5 menit antar sesi jika mau, atau biarkan rapat
    }
    return slots;
  }, [selectedPsychiatrist, selectedDate]);

  const handleBookClick = (psychiatrist: any) => {
    setSelectedPsychiatrist(psychiatrist);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setComplaint("");
    setStep(1);
    setIsOpen(true);
  };

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastBookingInfo, setLastBookingInfo] = useState<any>(null);

  const handlePaymentSubmit = async () => {
    if (!selectedPsychiatrist || !selectedDate || !selectedTimeSlot) return;

    setIsSubmitting(true);
    try {
      const bookingData = {
        psychiatristId: selectedPsychiatrist.id,
        complaint,
        date: selectedDate.toISOString().split("T")[0],
        startTime: `${selectedTimeSlot.start}:00`,
        endTime: `${selectedTimeSlot.end}:00`,
        paymentMethod,
        cardHolder: billingInfo.cardHolder,
        cardNumber: billingInfo.cardNumber,
        expireDate: billingInfo.expireDate,
        cvv: billingInfo.cvv,
        price: selectedPsychiatrist.Price,
      };

      const result = await createAppointment(bookingData);

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
        setIsOpen(false);
        setIsSuccessModalOpen(true);
      } else {
        alert("Booking failed: " + result.error);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6.5 grid grid-cols-2 gap-4 relative">
      {psychiatrists.map((i) => (
        <div
          key={i.id}
          className="px-6 py-8 border border-border-default rounded-2xl w-full "
        >
          <div className="grid gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-surface-disabled size-22.5 rounded-lg"></div>
              <div className="w-fit grid gap-3">
                <div>
                  <p className="text-body-xl-semibold">{i.name}</p>
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
                {i.advertise.map((t: string, idx: number) => (
                  <span
                    key={`${i.id}-${t}-${idx}`}
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
              <p className="text-body-sm-medium">{i.description}</p>
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
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
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
                        {selectedPsychiatrist?.spesialist}
                      </p>
                    </div>
                  </div>

                  {/* Select Date */}
                  <div className="flex flex-col gap-4">
                    <p className="text-label-base-bold text-text-label">
                      Select Date
                    </p>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {availableDates.map((d, idx) => (
                        <button
                          key={idx}
                          disabled={!d.isAvailable}
                          onClick={() => {
                            setSelectedDate(d.date);
                            setSelectedTimeSlot(null);
                          }}
                          className={`flex flex-col gap-1 items-center justify-center rounded-lg border transition-all min-w-18 py-3 shrink-0 ${
                            !d.isAvailable
                              ? "opacity-30 cursor-not-allowed bg-neutral-50"
                              : selectedDate?.toDateString() ===
                                  d.date.toDateString()
                                ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500"
                                : "border-border-default bg-white hover:border-primary-200"
                          }`}
                        >
                          <span className="text-label-small-semibold">
                            {d.label}
                          </span>
                          <span className="text-body-xl-semibold">
                            {d.dayNum}
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
                    {selectedDate ? (
                      <div className="grid grid-cols-3 gap-3">
                        {timeSlots.length > 0 ? (
                          timeSlots.map((t, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedTimeSlot(t)}
                              className={`py-3 rounded-xl border text-sm transition-all text-center ${
                                selectedTimeSlot?.start === t.start
                                  ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500"
                                  : "border-border-default bg-white hover:border-primary-200"
                              }`}
                            >
                              {t.start}-{t.end}
                            </button>
                          ))
                        ) : (
                          <p className="col-span-3 text-body-sm-medium text-text-subheading py-4 text-center">
                            No time slots available for this day.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-body-sm-medium text-text-placeholder py-4 border-2 border-dashed border-border-default rounded-xl text-center">
                        Please select a date first
                      </p>
                    )}
                  </div>

                  {/* Complaints */}
                  <div className="flex flex-col gap-3">
                    <p className="text-label-base-bold text-text-label">
                      Complaints
                    </p>
                    <textarea
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
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
                        {idr(selectedPsychiatrist?.Price || 0)}
                      </p>
                    </div>
                    <button
                      disabled={!selectedDate || !selectedTimeSlot}
                      onClick={() => setStep(2)}
                      className="button-primary-large w-full justify-center py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-between min-h-full h-fit gap-8">
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
                              ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500"
                              : "border-border-default bg-white hover:border-primary-200"
                          }`}
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
                          value={billingInfo.cardHolder}
                          onChange={(e) =>
                            setBillingInfo({
                              ...billingInfo,
                              cardHolder: e.target.value,
                            })
                          }
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
                          value={billingInfo.cardNumber}
                          onChange={(e) =>
                            setBillingInfo({
                              ...billingInfo,
                              cardNumber: e.target.value,
                            })
                          }
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
                            value={billingInfo.expireDate}
                            onChange={(e) =>
                              setBillingInfo({
                                ...billingInfo,
                                expireDate: e.target.value,
                              })
                            }
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
                            value={billingInfo.cvv}
                            onChange={(e) =>
                              setBillingInfo({
                                ...billingInfo,
                                cvv: e.target.value,
                              })
                            }
                            className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 mt-auto">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center text-text-subheading">
                        <span className="text-label-base-semibold text-text-subheading">
                          Specialist Fee
                        </span>
                        <span className="text-label-base-medium text-text-body">
                          {idr(selectedPsychiatrist?.Price || 0)}
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
                      <div className="flex justify-between items-center pt-2 border-t border-dashed border-border-default">
                        <span className="text-label-base-semibold text-text-subheading">
                          Grand Total
                        </span>
                        <span className="text-label-large-bold text-text-action">
                          {idr((selectedPsychiatrist?.Price || 0) + 2000)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="button-outline-large flex-1 justify-center"
                      >
                        Back
                      </button>
                      <button
                        disabled={isSubmitting}
                        onClick={handlePaymentSubmit}
                        className="button-primary-large flex-2 justify-center py-4 rounded-xl text-lg disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="size-6 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                        ) : (
                          "Confirm Payment"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl animate-in fade-in zoom-in duration-300">
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
                onClick={() => (window.location.href = "/user/session/history")}
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
