import React from "react";
import Image from "next/image";

interface FeedbackItem {
  id: number;
  name: string;
  description: string;
  hours: number;
  image?: string;
}

const dummyFeedback: FeedbackItem[] = [
  {
    id: 1,
    name: "Rico Christian Ferry",
    description: "Childhood Trauma Therapy",
    hours: 2,
  },
  {
    id: 2,
    name: "Rico Christian Ferry",
    description: "Childhood Trauma Therapy",
    hours: 1,
  },
  {
    id: 3,
    name: "Rico Christian Ferry",
    description: "Childhood Trauma Therapy",
    hours: 5,
  },
  {
    id: 4,
    name: "Rico Christian Ferry",
    description: "Childhood Trauma Therapy",
    hours: 8,
  },
  {
    id: 5,
    name: "Rico Christian Ferry",
    description: "Childhood Trauma Therapy",
    hours: 12,
  },
];

const getStatus = (hours: number): "new" | "pending" | "urgent" => {
  if (hours <= 2) return "new";
  if (hours <= 6) return "pending";
  return "urgent";
};

interface UnfinishedFeedbackProps {
  items?: FeedbackItem[];
  icon?: React.ReactNode;
  limit?: number;
}

export default function UnfinishedFeedback({
  items = dummyFeedback,
  icon,
  limit,
}: UnfinishedFeedbackProps) {
  const displayItems = limit ? items.slice(0, limit) : items;
  const hasItems = displayItems && displayItems.length > 0;

  return (
    <div className="bg-surface-background border border-border-default rounded-2xl p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="text-icon-action">
            {icon ? (
              icon
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-8"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M1 18q-.425 0-.712-.288T0 17v-.575q0-1.075 1.1-1.75T4 14q.325 0 .625.013t.575.062q-.35.525-.525 1.1t-.175 1.2V18zm6 0q-.425 0-.712-.288T6 17v-.625q0-.8.438-1.463t1.237-1.162T9.588 13T12 12.75q1.325 0 2.438.25t1.912.75t1.225 1.163t.425 1.462V17q0 .425-.287.713T17 18zm12.5 0v-1.625q0-.65-.162-1.225t-.488-1.075q.275-.05.563-.062T20 14q1.8 0 2.9.663t1.1 1.762V17q0 .425-.288.713T23 18zM8.125 16H15.9q-.25-.5-1.388-.875T12 14.75t-2.512.375T8.125 16M4 13q-.825 0-1.412-.587T2 11q0-.85.588-1.425T4 9q.85 0 1.425.575T6 11q0 .825-.575 1.413T4 13m16 0q-.825 0-1.412-.587T18 11q0-.85.588-1.425T20 9q.85 0 1.425.575T22 11q0 .825-.575 1.413T20 13m-8-1q-1.25 0-2.125-.875T9 9q0-1.275.875-2.137T12 6q1.275 0 2.138.863T15 9q0 1.25-.862 2.125T12 12m0-2q.425 0 .713-.288T13 9t-.288-.712T12 8t-.712.288T11 9t.288.713T12 10m0-1"
                />
              </svg>
            )}
          </div>
          <h3 className="text-body-lg-semibold md:text-body-xl-semibold text-text-body">
            Unfinished Feedback
          </h3>
        </div>
        <button className="text-links-action text-label-small-medium hover:underline">
          See All
        </button>
      </div>

      {/* Content */}
      {hasItems ? (
        <div className="flex flex-col gap-4">
          {displayItems.map((item) => {
            const status = getStatus(item.hours);
            return (
              <div
                key={item.id}
                className={`flex flex-col gap-4 md:flex-row md:items-center justify-between p-4 rounded-xl border-2 border-border-default transition-all duration-300 hover:cursor-pointer ${
                  status === "new"
                    ? "hover:border-border-information"
                    : status === "pending"
                      ? "hover:border-border-warning"
                      : "hover:border-border-error"
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className="relative size-12 overflow-hidden rounded-full border border-border-default bg-surface-primary-light flex items-center justify-center text-text-action font-semibold">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      item.name.charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-body-lg-semibold text-text-heading max-w-40 truncate">
                      {item.name}
                    </p>
                    <p className="text-body-sm-medium text-text-label">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-label-caption-medium w-fit self-end md:self-auto ${
                    status === "new"
                      ? "bg-surface-information text-text-information border border-border-information"
                      : status === "pending"
                        ? "bg-surface-warning text-text-warning border border-border-warning"
                        : "bg-surface-error text-text-error border border-border-error"
                  }`}
                >
                  <div
                    className={`w-fit  ${
                      status === "new"
                        ? "bg-surface-information text-icon-information "
                        : status === "pending"
                          ? "bg-surface-warning text-icon-warning"
                          : "bg-surface-error text-icon-error"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11z"
                      />
                    </svg>
                  </div>
                  {item.hours}h ago
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl border border-dashed border-border-default bg-surface-default/50 text-center">
          <div className="size-16 bg-surface-primary-light rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-8 text-icon-action"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4l8-8z"
              />
            </svg>
          </div>
          <h4 className="text-label-large-semibold text-text-heading mb-2">
            Your clinical notes are all caught up.
          </h4>
          <p className="text-body-sm-regular text-text-subheading max-w-sm">
            You have no pending drafts or unfinished feedback. Every patient
            summary has been successfully finalized and sent.
          </p>
        </div>
      )}
    </div>
  );
}
