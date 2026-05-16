"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPsychiatristById } from "@/app/actions/psychiatrist";
import { createAppointment } from "@/app/actions/appointment";

// Components
import { ChevronRight, Star, Clock, Calendar, ShieldCheck, GraduationCap, User } from "lucide-react";

const idr = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const getDayName = (date: Date) => {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[date.getDay()];
};

export default function PsychiatristDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [psychiatrist, setPsychiatrist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null);
  const [complaint, setComplaint] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastBookingInfo, setLastBookingInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getPsychiatristById(id);
      if (!data) {
        router.push("/user/session/booking");
        return;
      }
      setPsychiatrist(data);
      setLoading(false);
    }
    fetchData();
  }, [id, router]);

  const nextSevenDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const availableDates = useMemo(() => {
    if (!psychiatrist?.availability) return [];
    return nextSevenDays.map((date, index) => {
      const dayName = getDayName(date);
      const isAvailable = psychiatrist.availability.some((a: any) => a.day.toLowerCase() === dayName.toLowerCase());
      const i = index + 1;
      return {
        date,
        isAvailable,
        label: i === 1 ? "Besok" : i === 2 ? "Lusa" : date.toLocaleDateString("id-ID", { weekday: "short" }),
        dayNum: date.getDate().toString(),
        month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      };
    });
  }, [psychiatrist, nextSevenDays]);

  const timeSlots = useMemo(() => {
    if (!psychiatrist || !selectedDate) return [];
    const dayName = getDayName(selectedDate);
    const availability = psychiatrist.availability.find((a: any) => a.day.toLowerCase() === dayName.toLowerCase());
    if (!availability) return [];
    const slots = [];
    const current = new Date(`2000-01-01T${availability.availability_start_time}`);
    const end = new Date(`2000-01-01T${availability.availability_end_time}`);
    while (current < end) {
      const slotStart = current.toTimeString().slice(0, 5);
      current.setMinutes(current.getMinutes() + 45);
      if (current > end) break;
      const slotEnd = current.toTimeString().slice(0, 5);
      slots.push({ start: slotStart, end: slotEnd });
    }
    return slots;
  }, [psychiatrist, selectedDate]);

  const handleBookNow = async () => {
    if (!psychiatrist || !selectedDate || !selectedTimeSlot) return;
    setIsSubmitting(true);
    try {
      const result = await createAppointment({
        psychiatristId: psychiatrist.id,
        complaint: complaint || "General consultation",
        date: selectedDate.toISOString().split("T")[0],
        startTime: `${selectedTimeSlot.start}:00`,
        endTime: `${selectedTimeSlot.end}:00`,
        paymentMethod: "QRIS", // Default for direct booking in detail page
        price: psychiatrist.Price,
      });

      if (result.success) {
        setLastBookingInfo({
          psychiatrist: psychiatrist.name,
          date: selectedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          time: `${selectedTimeSlot.start} - ${selectedTimeSlot.end}`,
        });
        setIsSuccessModalOpen(true);
      } else {
        alert("Booking failed: " + result.error);
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    const cleanName = name.replace(/^Dr\.?\s+/i, "");
    const parts = cleanName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  const dummyReviews = [
    {
      id: 1,
      name: "A**** D****",
      date: "2 days ago",
      rating: 5,
      content: "It appears that your migraines may be linked to underlying mental health issues. We recommend exploring stress management techniques and possibly consulting a mental health professional to address these concerns. Taking care of your mental well-being could significantly alleviate your migraine symptoms."
    },
    {
      id: 2,
      name: "A**** D****",
      date: "2 days ago",
      rating: 5,
      content: "It appears that your migraines may be linked to underlying mental health issues. We recommend exploring stress management techniques and possibly consulting a mental health professional to address these concerns. Taking care of your mental well-being could significantly alleviate your migraine symptoms."
    }
  ];

  const ratingStats = [
    { star: 5, percentage: 85 },
    { star: 4, percentage: 10 },
    { star: 3, percentage: 3 },
    { star: 2, percentage: 1 },
    { star: 1, percentage: 1 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-default">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-default"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-default min-h-screen p-6 md:p-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-label-base-medium text-text-subheading mb-8">
        <Link href="/user/session/booking" className="hover:text-text-action transition-colors">Find Psychiatry</Link>
        <ChevronRight className="size-4" />
        <span className="text-text-heading">Details</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white border border-border-default rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="size-40 rounded-2xl bg-surface-disabled overflow-hidden shrink-0 border border-border-default">
              {psychiatrist.image ? (
                <img src={psychiatrist.image} alt={psychiatrist.name} className="size-full object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center bg-primary-100 text-primary-700 text-heading-2-bold">
                  {getInitials(psychiatrist.name)}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <h1 className="text-heading-4-bold text-text-heading">{psychiatrist.name}</h1>
                <p className="text-body-base-semibold text-text-action">{psychiatrist.spesialist}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {psychiatrist.advertise.map((tag: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-surface-primary-light text-text-action text-label-small-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="pt-4 border-t border-border-default">
                <p className="text-label-small-semibold text-text-subheading uppercase tracking-wider mb-1">Certifications Number</p>
                <p className="text-body-base-bold text-text-heading">{psychiatrist.license_number || "ZH00000258901541"}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Experience", value: `${psychiatrist.experience}+ Years` },
              { label: "Patient", value: "120K" },
              { label: "Rating", value: "4.5", icon: <Star className="size-5 text-orange-400 fill-orange-400" /> }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-border-default rounded-2xl p-6 text-center">
                <p className="text-label-small-semibold text-text-subheading mb-2">{stat.label}</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-heading-6-bold text-text-heading">{stat.value}</p>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          {/* About & Education */}
          <div className="bg-white border border-border-default rounded-2xl p-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-heading-6-bold text-text-heading">More About {psychiatrist.name}</h2>
              <div className="space-y-2">
                <p className="text-label-base-bold text-text-subheading">About</p>
                <div className="p-6 bg-surface-default border border-border-default rounded-2xl">
                  <p className="text-body-base-medium text-text-body leading-relaxed">
                    {psychiatrist.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-label-base-bold text-text-subheading">Education & Certification</p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="size-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-default shrink-0">
                    <GraduationCap className="size-6" />
                  </div>
                  <div>
                    <p className="text-body-base-bold text-text-heading">Spesialis Kedokteran Jiwa (Sp.KJ)</p>
                    <p className="text-label-small-medium text-text-subheading">Universitas Indonesia, 2021</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="size-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <p className="text-body-base-bold text-text-heading">Cognitive Behavioral Therapy (CBT)</p>
                    <p className="text-label-small-medium text-text-subheading">Asia CBT Association, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white border border-border-default rounded-2xl p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Rating Summary */}
              <div className="text-center md:text-left shrink-0">
                <p className="text-heading-1-bold text-text-heading leading-none">4.9</p>
                <div className="flex gap-1 justify-center md:justify-start my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-5 text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-label-small-medium text-text-subheading">129 Review</p>
              </div>

              {/* Progress Bars */}
              <div className="flex-1 w-full space-y-2">
                {ratingStats.map((stat) => (
                  <div key={stat.star} className="flex items-center gap-4">
                    <span className="text-label-small-bold text-text-subheading w-2">{stat.star}</span>
                    <div className="flex-1 h-2 bg-surface-disabled rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-400 rounded-full" 
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-border-default" />

            {/* Individual Reviews */}
            <div className="space-y-6">
              {dummyReviews.map((review) => (
                <div key={review.id} className="bg-white border border-border-default rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className="size-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                        <User className="size-6" />
                      </div>
                      <div>
                        <p className="text-body-base-bold text-text-heading">{review.name}</p>
                        <p className="text-label-small-medium text-text-subheading">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="size-4 text-orange-400 fill-orange-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-body-sm-medium text-text-body leading-relaxed italic">
                    &quot;{review.content}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Card */}
        <div className="bg-white border border-border-default rounded-2xl p-8 sticky top-8 space-y-8">
          <h2 className="text-heading-6-bold text-text-heading">Book Consultation</h2>
          
          {/* Select Date */}
          <div className="space-y-4">
            <p className="text-label-base-bold text-text-label">Select Date</p>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {availableDates.map((d, idx) => (
                <button
                  key={idx}
                  disabled={!d.isAvailable}
                  onClick={() => { setSelectedDate(d.date); setSelectedTimeSlot(null); }}
                  className={`flex flex-col gap-1 items-center justify-center rounded-xl border transition-all min-w-18 py-4 shrink-0 ${
                    !d.isAvailable
                      ? "opacity-30 cursor-not-allowed bg-neutral-50"
                      : selectedDate?.toDateString() === d.date.toDateString()
                        ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500"
                        : "border-border-default bg-white hover:border-primary-200"
                  }`}
                >
                  <span className="text-label-small-semibold uppercase tracking-wider">{d.label}</span>
                  <span className="text-heading-5-bold">{d.dayNum}</span>
                  <span className="text-label-caption-medium opacity-70">{d.month}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Select Time */}
          <div className="space-y-4">
            <p className="text-label-base-bold text-text-label">Select Time</p>
            {selectedDate ? (
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTimeSlot(t)}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all text-center ${
                      selectedTimeSlot?.start === t.start
                        ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500"
                        : "border-border-default bg-white hover:border-primary-200"
                    }`}
                  >
                    {t.start}-{t.end}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 border-2 border-dashed border-border-default rounded-2xl flex flex-col items-center justify-center gap-2 text-text-placeholder">
                <Calendar className="size-6 opacity-30" />
                <p className="text-body-sm-medium">Select a date first</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-border-default space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-body-base-medium text-text-subheading">Grand Total</p>
              <p className="text-heading-6-bold text-text-action">{idr(psychiatrist.Price)}</p>
            </div>
            <button
              disabled={!selectedDate || !selectedTimeSlot || isSubmitting}
              onClick={handleBookNow}
              className="button-primary-large w-full justify-center py-4 rounded-xl text-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="size-6 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              ) : (
                "Book Now"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            <div className="size-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <ShieldCheck className="size-10" />
            </div>
            <div className="text-center">
              <h3 className="text-heading-5-bold text-text-heading mb-2">Booking Successful!</h3>
              <p className="text-body-base-medium text-text-subheading">
                Your consultation with <span className="text-text-action font-semibold">{lastBookingInfo?.psychiatrist}</span> has been scheduled.
              </p>
            </div>
            <div className="w-full bg-surface-default rounded-2xl p-5 border border-border-default flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-label-small-semibold text-text-subheading">Date</span>
                <span className="text-label-base-bold text-text-heading">{lastBookingInfo?.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-label-small-semibold text-text-subheading">Time</span>
                <span className="text-label-base-bold text-text-heading">{lastBookingInfo?.time}</span>
              </div>
            </div>
            <div className="flex flex-col w-full gap-3">
              <button onClick={() => router.push("/user/session/history")} className="button-primary-large w-full justify-center">View My Sessions</button>
              <button onClick={() => setIsSuccessModalOpen(false)} className="button-outline-large w-full justify-center">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
