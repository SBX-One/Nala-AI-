"use client";

import Image from "next/image";

interface ConsultationCardProps {
  consultation: any;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export default function ConsultationCard({
  consultation,
  isSelected,
  onSelect,
}: ConsultationCardProps) {
  return (
    <div
      onClick={() => onSelect(consultation.id)}
      className={`md:px-6 px-4 py-4 rounded-xl border transition-all cursor-pointer group relative ${
        isSelected
          ? "border-primary-500 bg-surface-primary-light shadow-sm ring-1 ring-primary-500"
          : "border-border-default bg-white hover:border-primary-200"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-body-caption-medium">
          {new Date(consultation.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="text-body-caption-medium">
          {consultation.start_time?.slice(0, 5)} -{" "}
          {consultation.end_time?.slice(0, 5)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative size-17.5 rounded-xl overflow-hidden bg-surface-background shrink-0 border border-border-default">
          {consultation.user?.avatar_url ? (
            <Image
              src={consultation.user.avatar_url}
              alt={consultation.user?.name || "Patient"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-500 font-bold uppercase">
              {consultation.user?.name?.charAt(0) || "P"}
            </div>
          )}
        </div>
        <div className="overflow-hidden">
          <h4 className="text-body-lg-semibold md:text-body-xl-semibold mb-1  truncate">
            {consultation.user?.name || "Anonymous Patient"}
          </h4>
          <p className="text-body-caption-medium truncate">
            {consultation.topic || "Follow-up consultation"}
          </p>
        </div>
      </div>
    </div>
  );
}
