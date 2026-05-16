"use client";

import { useState, useMemo } from "react";

interface AvailabilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startDate: Date | null, endDate: Date | null, fromTime: string, toTime: string) => void;
  onClear: () => void;
  initialStartDate: Date | null;
  initialEndDate: Date | null;
  initialFromTime: string;
  initialToTime: string;
}

export default function AvailabilityDrawer({
  isOpen,
  onClose,
  onSave,
  onClear,
  initialStartDate,
  initialEndDate,
  initialFromTime,
  initialToTime,
}: AvailabilityDrawerProps) {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [fromTime, setFromTime] = useState(initialFromTime);
  const [toTime, setToTime] = useState(initialToTime);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isWithinRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-100 flex justify-end items-center "
      onClick={onClose}
    >
      <div 
        className="bg-white w-full md:max-w-lg h-full md:rounded-l-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-heading-6-bold sm:text-heading-4-bold text-text-heading">
              Filter Availability
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-default rounded-full text-icon-default transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 6L6 18M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="bg-surface-default p-6 rounded-3xl border border-border-default mb-8">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-body-lg-bold text-text-heading">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-1 hover:bg-surface-primary-light rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18l-6-6l6-6"/></svg>
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-1 hover:bg-surface-primary-light rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 18l6-6l-6-6"/></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <span key={d} className="text-label-small-semibold text-text-subheading uppercase mb-2">
                  {d}
                </span>
              ))}
              {daysInMonth.map((date, idx) => {
                const isSelectedStart = date && startDate && isSameDay(date, startDate);
                const isSelectedEnd = date && endDate && isSameDay(date, endDate);
                const isRange = date && isWithinRange(date);

                return (
                  <div key={idx} className={`flex justify-center items-center h-10 relative ${isRange ? "bg-surface-primary-light" : ""} ${isSelectedStart && endDate ? "rounded-l-full" : ""} ${isSelectedEnd ? "rounded-r-full" : ""}`}>
                    {date ? (
                      <button
                        onClick={() => handleDateClick(date)}
                        className={`size-10 rounded-full text-body-base-medium transition-all relative z-10 ${
                          isSelectedStart || isSelectedEnd
                            ? "bg-primary-600 text-white shadow-lg"
                            : isRange 
                              ? "text-text-action font-semibold"
                              : "hover:bg-surface-primary-light text-text-heading"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subheading">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm.5-13H11v6l5.25 3.15l.75-1.23l-4.5-2.67z"/></svg>
              </span>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full pl-10 pr-4 py-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default text-body-sm-medium"
                placeholder="From"
              />
            </div>
            <div className="text-border-default">—</div>
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subheading">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm.5-13H11v6l5.25 3.15l.75-1.23l-4.5-2.67z"/></svg>
              </span>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-full pl-10 pr-4 py-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default text-body-sm-medium"
                placeholder="To"
              />
            </div>
          </div>
        </div>

        <div className="p-8 flex gap-4 mt-auto">
          <button
            onClick={() => onSave(startDate, endDate, fromTime, toTime)}
            className="button-primary-large"
          >
            Save Filter
          </button>
          <button
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              setFromTime("");
              setToTime("");
              onClear();
            }}
            className="button-outline-large"
          >
            Clear Filter
          </button>
        </div>
      </div>
    </div>
  );
}
