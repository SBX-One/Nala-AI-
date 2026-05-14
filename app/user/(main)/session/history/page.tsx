"use client";

import { useState, useEffect } from "react";
import { getUserConsultations } from "@/app/actions/appointment";
import { useRouter, useSearchParams } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPsychiatristId = searchParams.get("psyId");

  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      const data = await getUserConsultations();
      setConsultations(data);
      setLoading(false);
    };
    fetchConsultations();
  }, []);

  // Filter consultations for the selected psychiatrist
  const filteredConsultations = consultations.filter(
    (c) => c.psychiatrist_id.toString() === selectedPsychiatristId
  );

  const idr = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "paid": return "bg-green-100 text-green-700";
      case "canceled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-heading-5-bold text-text-heading">Consultation Sessions</h1>
          <p className="text-body-base-medium text-text-subheading">View detailed history for this specialist</p>
        </div>

        {filteredConsultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-border-default">
            <p className="text-body-sm-medium text-text-placeholder">
              {selectedPsychiatristId ? "No sessions found for this specialist" : "Select a specialist to view history"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredConsultations.map((con) => (
              <div
                key={con.id}
                onClick={() => router.push(`/user/session/history/${con.id}`)}
                className="bg-white border border-border-default p-6 rounded-2xl flex items-center justify-between hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-surface-background rounded-full flex items-center justify-center text-text-action border border-border-default group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 7H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-body-base-bold text-text-heading">
                      {new Date(con.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-body-sm-medium text-text-subheading">
                      {con.start_time?.slice(0, 5)} - {con.end_time?.slice(0, 5)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-label-small-bold ${getStatusColor(con.billing?.status)}`}>
                    {con.billing?.status || "Pending"}
                  </span>
                  <p className="text-body-base-bold text-text-action">{idr(con.billing?.total || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
