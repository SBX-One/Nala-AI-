"use client";

import Link from "next/link";

interface PsychiatristCardProps {
  psychiatrist: any;
  onBookClick: (psychiatrist: any) => void;
  idr: (number: number) => string;
}

export default function PsychiatristCard({
  psychiatrist,
  onBookClick,
  idr,
}: PsychiatristCardProps) {
  const i = psychiatrist;
  const getInitials = (name: string) => {
    const cleanName = name.replace(/^Dr\.?\s+/i, "");
    const parts = cleanName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="px-6 py-8 border border-border-default rounded-2xl w-full bg-surface-background h-fit">
      <div className="grid gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-surface-disabled size-22.5 rounded-lg overflow-hidden shrink-0">
            {i.image ? (
              <img 
                src={i.image} 
                alt={i.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-heading-4-bold">
                {getInitials(i.name)}
              </div>
            )}
          </div>
          <div className="w-fit grid gap-3">
            <div>
              <Link href={`/user/session/booking/${i.id}`} className="hover:text-text-action transition-colors group/name">
                <p className="text-body-xl-semibold group-hover/name:underline">{i.name}</p>
              </Link>
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
          <div className="flex gap-2 flex-wrap">
            {i.advertise.map((t: string, idx: number) => (
              <span
                key={`${i.id}-${t}-${idx}`}
                className="text-label-small-medium  px-2 py-1 rounded-sm bg-surface-primary-light text-text-action"
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
            onClick={() => onBookClick(i)}
            className="button-primary-large"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
