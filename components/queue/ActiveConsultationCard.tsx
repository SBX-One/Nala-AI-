"use client";

import Image from "next/image";

interface ActiveConsultationCardProps {
  patientName: string;
  timeRange: string;
  elapsedTime: string;
  remainingTime: string;
  onBackToRoom?: () => void;
}

export default function ActiveConsultationCard({
  patientName,
  timeRange,
  elapsedTime,
  remainingTime,
  onBackToRoom,
}: ActiveConsultationCardProps) {
  return (
    <div className="bg-surface-primary rounded-xl p-8 text-white relative overflow-hidden ">
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-3 ">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-primary-light  rounded-full text-label-sm-medium text-text-action">
            <Image
              src="/icon/plant-icon.svg"
              width={16}
              height={16}
              alt="Nala-Logo"
            />
            On Going Consultation
          </div>
          <h2 className="text-heading-6-bold">{patientName}</h2>
          <p className="text-body-sm-medium text-text-on-action">{timeRange}</p>
        </div>
        <div className="text-right">
          <p className="text-body-xl-semibold">{elapsedTime}</p>
          <p className="text-body-sm-regular text-text-on-action">Elapsed</p>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-white/20">
        <button
          onClick={onBackToRoom}
          className="button-secondary-medium flex items-center gap-2"
        >
          Enter Room
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </button>
        {remainingTime && (
          <div className="text-label-base-medium text-text-on-action">
            {remainingTime} Remaining Time
          </div>
        )}
      </div>
    </div>
  );
}
