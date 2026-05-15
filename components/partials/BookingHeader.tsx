"use client";

interface BookingHeaderProps {
  onOpenFilter: () => void;
  expertises: any[];
  selectedExpertise: number | null;
  onSelectExpertise: (id: number | null) => void;
  isFiltering: boolean;
  filterSummary: string;
  isAvailabilityFiltering: boolean;
  availabilitySummary: string;
  onOpenAvailability: () => void;
}

export default function BookingHeader({
  onOpenFilter,
  expertises,
  selectedExpertise,
  onSelectExpertise,
  isFiltering,
  filterSummary,
  isAvailabilityFiltering,
  availabilitySummary,
  onOpenAvailability,
}: BookingHeaderProps) {
  return (
    <div className="border-b border-b-border-default py-8 px-6 grid gap-6 bg-surface-background">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 ">
        <div className="flex flex-col gap-2">
          <h1 className="md:text-display-lg-bold text-heading-3-semibold text-text-heading">
            Find Your Specialist
          </h1>
          <p className="text-body-base-medium text-text-subheading">
            Connect with experienced psychiatrist tailored to your specific needs
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onOpenFilter} className="button-outline-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                fill="currentColor"
                d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z"
              />
            </svg>
            More Filter
          </button>
          <button onClick={onOpenAvailability} className="button-outline-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm.5-13H11v6l5.25 3.15l.75-1.23l-4.5-2.67z"
              />
            </svg>
            Availability
          </button>
        </div>
      </div>

      {/* Quick Filter Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {(isFiltering || isAvailabilityFiltering) ? (
          <div className="flex items-center gap-3">
            {isFiltering && (
              <div
                onClick={onOpenFilter}
                className="flex items-center gap-3 px-4 py-2 bg-surface-primary-light border border-border-default rounded-full cursor-pointer transition-all group shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6 text-text-action"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z"
                  />
                </svg>
                <span className="text-label-base-medium text-text-action">
                  {filterSummary}
                </span>
              </div>
            )}
            
            {isAvailabilityFiltering && (
              <div
                onClick={onOpenAvailability}
                className="flex items-center gap-3 px-4 py-2 bg-surface-primary-light border border-border-default rounded-full cursor-pointer transition-all group shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6 text-text-action"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
                  />
                </svg>
                <span className="text-label-base-medium text-text-action">
                  {availabilitySummary}
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => onSelectExpertise(null)}
              className={`select-default-medium ${
                selectedExpertise === null ? "active" : ""
              }`}
            >
              All Specialist
            </button>
            {expertises.map((exp) => (
              <button
                key={exp.id}
                onClick={() => onSelectExpertise(exp.id)}
                className={`select-default-medium ${
                  selectedExpertise === exp.id ? "active" : ""
                }`}
              >
                {exp.name}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
