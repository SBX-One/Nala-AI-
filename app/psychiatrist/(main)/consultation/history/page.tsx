"use client";

import { useState, useEffect } from "react";
import { getConsultationHistory } from "@/app/actions/consultation";
import Image from "next/image";
import ConsultationCard from "@/components/consultation/ConsultationCard";
import ConsultationDetail from "@/components/consultation/ConsultationDetail";
import { useSearchParams } from "next/navigation";

export default function ConsultationHistoryPage() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");

  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(
    urlId ? parseInt(urlId) : null,
  );
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleRefresh = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await getConsultationHistory();
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setConsultations(result.data);

        // Priority for selection:
        // 1. Current selectedId (if set via state or url)
        // 2. URL ID (if not yet in selectedId)
        // 3. First item in list
        const effectiveId = selectedId || (urlId ? parseInt(urlId) : null);

        if (effectiveId) {
          setSelectedId(effectiveId);
        } else if (result.data.length > 0) {
          setSelectedId(result.data[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  // Automatically close sidebar on mobile when a session is selected
  useEffect(() => {
    if (selectedId && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [selectedId]);

  const selectedSession = consultations.find((c) => c.id === selectedId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-body-base-medium text-text-subheading">
          Loading sessions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 p-8 text-center">
        <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="text-heading-6-bold text-text-heading">
          Failed to load consultations
        </h3>
        <p className="text-body-base-medium text-text-placeholder max-w-sm">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 w-full h-[calc(100vh-70px)] bg-surface-default overflow-hidden relative">
      {/* Mobile Header Toggle */}
      <div className="lg:hidden p-4 border-b border-border-default flex items-center justify-between bg-white z-30 shrink-0">
        <h2 className="text-body-lg-bold text-text-heading">
          {isSidebarOpen ? "Consultation List" : "Consultation Detail"}
        </h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-primary-50 text-primary-600 active:scale-95 transition-all"
        >
          {isSidebarOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Left Column - List */}
      <div
        className={`
          fixed inset-0 top-31.25 overflow-y-auto lg:static lg:inset-auto lg:col-span-4 bg-white border-r border-border-default flex flex-col shrink-0 h-full z-50 transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="hidden lg:block px-5 py-5 shrink-0">
          <h2 className="text-heading-6-semibold text-text-heading">
            Past Consultation
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-1 pb-20 lg:pb-0 space-y-4 custom-scrollbar">
          {consultations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-body-sm-medium text-text-placeholder">
                No consultations found.
              </p>
            </div>
          ) : (
            consultations.map((con) => (
              <ConsultationCard
                key={con.id}
                consultation={con}
                isSelected={selectedId === con.id}
                onSelect={setSelectedId}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Column - Detail */}
      <div className="flex-1 lg:col-span-8 overflow-y-auto bg-surface-default custom-scrollbar">
        {selectedSession ? (
          <ConsultationDetail
            session={selectedSession}
            onRefresh={() => handleRefresh(true)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <div className="size-48 lg:size-72 relative mb-8 grayscale opacity-30">
              <Image
                src="/images/hospital-wheelchair/bro-2.svg"
                alt="Select session"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-heading-6-bold lg:text-heading-5-bold text-text-heading mb-2">
              Select a Consultation
            </h3>
            <p className="text-body-sm-medium lg:text-body-base-medium text-text-placeholder max-w-xs mx-auto">
              Choose a session from the left list to view detailed patient
              information and manage clinical records.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d1d1;
        }
      `}</style>
    </div>
  );
}
