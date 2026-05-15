"use client";

import React from "react";

interface BreakCalendarCardProps {
  breaks: any[];
  activeDays: string[]; // ["Monday", "Tuesday", etc]
  onAddBreak: () => void;
}

export const BreakCalendarCard: React.FC<BreakCalendarCardProps> = ({
  breaks,
  activeDays,
  onAddBreak,
}) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthName = now.toLocaleString("default", { month: "long" });

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayName = dayNames[date.getDay()];

      const isBreak = breaks.some((b) => {
        const parts = b.date.split("T")[0].split("-");
        const bYear = parseInt(parts[0]);
        const bMonth = parseInt(parts[1]) - 1;
        const bDay = parseInt(parts[2]);
        return bDay === day && bMonth === month && bYear === year;
      });

      const isActive = activeDays.includes(dayName);

      days.push(
        <div
          key={day}
          className={`size-10 mx-auto flex items-center justify-center rounded-full text-body-sm-bold transition-all ${
            isBreak
              ? "bg-surface-disabled text-text-placeholder border border-border-default"
              : isActive
                ? "bg-[#0066FF] text-white shadow-sm"
                : "text-text-placeholder"
          }`}
        >
          {day}
        </div>,
      );
    }
    return days;
  };

  return (
    <div className="bg-white border border-border-default rounded-xl p-6  space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-body-xl-semibold text-text-body">Break Calendar</h2>
        <span className="text-body-sm-medium text-text-placeholder">
          {monthName} {year}
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-7 text-center text-body-sm-medium text-text-heading mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2 text-center">
          {renderDays()}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-[#0066FF]" />
          <span className="text-body-xs-medium text-text-heading">
            Active day
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-[#E2E8F0]" />
          <span className="text-body-xs-medium text-text-heading">
            Break day
          </span>
        </div>
      </div>

      <button onClick={onAddBreak} className="button-primary-large ">
        Add break day
      </button>
    </div>
  );
};
