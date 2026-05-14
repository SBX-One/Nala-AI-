"use client";

import Link from "next/link";

interface PastConsultationCardProps {
  id: number;
  name: string;
  time: string;
}

export default function PastConsultationCard({
  id,
  name,
  time,
}: PastConsultationCardProps) {
  return (
    <div className="py-4 px-6 rounded-xl bg-surface-default border border-border-default space-y-4 ">
      <div>
        <h4 className="text-body-lg-semibold text-text-heading ">{name}</h4>
        <p className="text-body-sm-medium text-text-label">{time}</p>
      </div>
      <Link 
        href={`/psychiatrist/consultation/history?id=${id}`}
        className="button-secondary-medium block text-center"
      >
        Write Feedback
      </Link>
    </div>
  );
}
