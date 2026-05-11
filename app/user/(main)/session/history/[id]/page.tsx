"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getConsultationById } from "@/app/actions/appointment";

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      const id = parseInt(params.id as string);
      const data = await getConsultationById(id);
      setConsultation(data);
      setLoading(false);
    };
    fetchDetail();
  }, [params.id]);

  const idr = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-heading-6-bold">Consultation not found</h2>
        <button onClick={() => router.back()} className="button-primary-large mt-4">Back</button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-heading-4-bold text-text-heading">Session Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl border border-border-default overflow-hidden shadow-sm">
            <div className="bg-primary-50/50 p-8 flex flex-col items-center text-center gap-4 border-b border-border-default">
              <div className="size-28 bg-white rounded-2xl shadow-md overflow-hidden border-4 border-white">
                {consultation.psychiatrist?.user?.user_profile?.avatar_url ? (
                  <img src={consultation.psychiatrist.user.user_profile.avatar_url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-primary-100 flex items-center justify-center text-primary-500 text-4xl font-bold">
                    {consultation.psychiatrist?.user?.user_profile?.name?.charAt(0) || "P"}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-heading-5-bold text-text-heading">{consultation.psychiatrist?.user?.user_profile?.name}</h2>
                <p className="text-body-lg-semibold text-text-action">{consultation.psychiatrist?.specialization}</p>
              </div>
            </div>

            <div className="p-8 grid grid-cols-2 gap-8 bg-white">
              <div>
                <p className="text-label-small-bold text-text-label uppercase tracking-widest mb-1">Date</p>
                <p className="text-body-base-bold text-text-heading">
                  {new Date(consultation.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-label-small-bold text-text-label uppercase tracking-widest mb-1">Time</p>
                <p className="text-body-base-bold text-text-heading">
                  {consultation.start_time?.slice(0, 5)} - {consultation.end_time?.slice(0, 5)}
                </p>
              </div>
            </div>
          </div>

          {/* Complaint Details */}
          <div className="bg-white rounded-3xl border border-border-default p-8 shadow-sm">
            <h3 className="text-body-lg-bold text-text-heading mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 8H17M7 12H17M7 16H13M19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Patient Complaint
            </h3>
            <div className="p-6 bg-surface-background rounded-2xl border border-border-default text-text-body text-body-base-medium italic leading-relaxed">
              "{consultation.complaint || "No complaint described for this session."}"
            </div>
          </div>
        </div>

        {/* Right Column: Billing */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-border-default p-8 shadow-sm sticky top-8">
            <h3 className="text-body-lg-bold text-text-heading mb-6">Payment Summary</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-body-sm-medium text-text-subheading">Consultation Fee</span>
                <span className="text-body-sm-bold text-text-heading">{idr(consultation.billing?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm-medium text-text-subheading">Platform Fee</span>
                <span className="text-body-sm-bold text-text-heading">{idr(consultation.billing?.fee || 0)}</span>
              </div>
              <hr className="border-border-default border-dashed" />
              <div className="flex justify-between items-center">
                <span className="text-body-base-bold text-text-heading">Total Amount</span>
                <span className="text-body-lg-bold text-text-action">{idr(consultation.billing?.total || 0)}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border-default">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-label-small-semibold text-text-subheading uppercase">Status</span>
                  <span className={`px-3 py-1 rounded-full text-label-small-bold ${
                    consultation.billing?.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {consultation.billing?.status || "Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-label-small-semibold text-text-subheading uppercase">Method</span>
                  <span className="text-label-small-bold text-text-heading uppercase">{consultation.billing?.payment_method}</span>
                </div>
              </div>
            </div>

            <button className="button-primary-large w-full mt-8 justify-center">Download Invoice</button>
          </div>
        </div>
      </div>
    </div>
  );
}
