"use client";

import React from "react";

interface BreakDateListProps {
  breaks: any[];
  onDelete: (id: number) => void;
  onEdit: () => void;
  formatDate: (date: string) => string;
}

export const BreakDateList: React.FC<BreakDateListProps> = ({
  breaks,
  onDelete,
  onEdit,
  formatDate,
}) => {
  return (
    <div className="bg-white border border-border-default rounded-xl p-6  space-y-6">
      <h2 className="text-body-xl-semibold text-text-body">Break date</h2>

      <div className="space-y-4">
        {breaks.length > 0 ? (
          breaks.map((b) => (
            <div
              key={b.id}
              className="p-4 bg-white border border-border-default rounded-xl flex items-center justify-between group hover:bg-surface-primary transition-all duration-400 h-18"
            >
              <div className="flex w-full justify-between items-center">
                <span className="text-body-xl-semibold text-text-heading group-hover:text-white transition-colors">
                  {formatDate(b.date)}
                </span>

                <div className="flex items-center">
                  {/* Time info - visible only when NOT hovered */}
                  <div className="group-hover:hidden transition-all">
                    {!b.is_full_day ? (
                      <span className="text-body-xs-medium text-text-placeholder transition-colors">
                        {b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}
                      </span>
                    ) : (
                      <span className="text-body-xs-medium text-text-placeholder transition-colors">
                        Fullday
                      </span>
                    )}
                  </div>

                  {/* Action buttons - visible only when hovered */}
                  <div className="hidden group-hover:flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                    <button
                      onClick={() => onDelete(b.id)}
                      className="size-10 bg-white border border-border-default rounded-full flex items-center justify-center text-text-heading hover:bg-gray-50 transition-all scale-90 hover:scale-105"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      onClick={onEdit}
                      className="size-10 bg-white border border-border-default rounded-full flex items-center justify-center text-text-heading hover:bg-gray-50 transition-all scale-90 hover:scale-105 delay-75"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-body-sm-medium text-text-placeholder italic">
            No break dates scheduled.
          </div>
        )}
      </div>
    </div>
  );
};
