"use client";

interface PastConsultationCardProps {
  name: string;
  time: string;
  onWriteFeedback?: () => void;
}

export default function PastConsultationCard({
  name,
  time,
  onWriteFeedback,
}: PastConsultationCardProps) {
  return (
    <div className="py-4 px-6 rounded-xl bg-surface-default border border-border-default space-y-4 ">
      <div>
        <h4 className="text-body-lg-semibold text-text-heading ">{name}</h4>
        <p className="text-body-sm-medium text-text-label">{time}</p>
      </div>
      <button onClick={onWriteFeedback} className="button-secondary-medium">
        Write Feedback
      </button>
    </div>
  );
}
