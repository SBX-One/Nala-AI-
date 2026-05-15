"use client";

import React, { useState, useEffect } from "react";
import { FormInput } from "../ui/FormInput";

interface BreakEntry {
  id?: number;
  date: string; // ISO string date
  isFullDay: boolean;
  startTime: string;
  endTime: string;
}

interface BreakDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entries: BreakEntry[]) => Promise<void>;
  initialBreaks?: any[];
  activeDays: string[];
  isLoading?: boolean;
}

export default function BreakDateModal({
  isOpen,
  onClose,
  onSave,
  initialBreaks,
  activeDays,
  isLoading,
}: BreakDateModalProps) {
  const [selectedEntries, setSelectedEntries] = useState<BreakEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen && initialBreaks) {
      const initial = initialBreaks.map((b) => ({
        id: b.id,
        date: new Date(b.date).toISOString().split("T")[0],
        isFullDay: b.is_full_day,
        startTime: b.start_time?.slice(0, 5) || "09:00",
        endTime: b.end_time?.slice(0, 5) || "17:00",
      }));
      setSelectedEntries(initial);
    } else if (isOpen) {
      setSelectedEntries([]);
    }
  }, [isOpen, initialBreaks]);

  if (!isOpen) return null;

  const toggleDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const exists = selectedEntries.find((e) => e.date === dateStr);

    if (exists) {
      setSelectedEntries(selectedEntries.filter((e) => e.date !== dateStr));
    } else {
      setSelectedEntries([
        ...selectedEntries,
        {
          date: dateStr,
          isFullDay: true,
          startTime: "09:00",
          endTime: "17:00",
        },
      ]);
    }
  };

  const updateEntry = (
    dateStr: string,
    field: keyof BreakEntry,
    value: any,
  ) => {
    setSelectedEntries(
      selectedEntries.map((e) =>
        e.date === dateStr ? { ...e, [field]: value } : e,
      ),
    );
  };

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split("T")[0].split("-");
    const date = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2]),
    );
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Calendar Logic
  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const days = [];

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let i = 0; i < startOffset; i++) days.push(<div key={`empty-${i}`} />);
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);

      const yStr = date.getFullYear();
      const mStr = String(date.getMonth() + 1).padStart(2, "0");
      const dStr = String(date.getDate()).padStart(2, "0");
      const dateStr = `${yStr}-${mStr}-${dStr}`;

      const dayName = dayNames[date.getDay()];

      const isSelected = selectedEntries.some((e) => e.date === dateStr);
      const isActive = activeDays.includes(dayName);

      days.push(
        <button
          key={d}
          onClick={() => toggleDate(date)}
          className={`size-10 mx-auto flex items-center justify-center rounded-full text-body-sm-bold transition-all ${
            isSelected
              ? "bg-surface-disabled text-text-placeholder border border-border-default"
              : isActive
                ? "bg-primary-600 text-white shadow-sm"
                : "text-text-placeholder hover:bg-surface-disabled"
          }`}
        >
          {d}
        </button>,
      );
    }
    return days;
  };

  return (
    <div className="fixed inset-0 z-120 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" />

      <div
        className="relative w-full rounded-l-xl max-w-lg bg-white h-full flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-out shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col gap-6">
          <h2 className="text-heading-6-bold md:text-heading-5-bold text-text-heading">
            Break Date
          </h2>

          {/* Inline Calendar Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-7 text-center text-label-small-medium text-text-label mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-3 text-center">
              {renderCalendar()}
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-primary-600" />
                <span className="text-body-caption-medium text-text-subheading">
                  Active day
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-[#E2E8F0]" />
                <span className="text-body-caption-medium text-text-subheading">
                  Break day
                </span>
              </div>
            </div>
          </div>

          {/* Config Area */}
          <div className="space-y-6 ">
            {selectedEntries.length > 0 ? (
              selectedEntries.map((entry, index) => (
                <div
                  key={
                    entry.id
                      ? `break-${entry.id}`
                      : `new-${entry.date}-${index}`
                  }
                  className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-body-base-semibold text-text-heading">
                      {formatDate(entry.date)}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-body-sm-medium text-text-placeholder">
                        Full day
                      </span>
                      <button
                        onClick={() =>
                          updateEntry(entry.date, "isFullDay", !entry.isFullDay)
                        }
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${entry.isFullDay ? "bg-primary-600" : "bg-surface-disabled"}`}
                      >
                        <div
                          className={`absolute top-1 left-1 size-4 bg-white rounded-full transition-transform duration-200 ${entry.isFullDay ? "translate-x-6" : "translate-x-0"}`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      id={`${entry.date}-start`}
                      placeholder={entry.isFullDay ? "Fullday" : "Start time"}
                      type={entry.isFullDay ? "text" : "time"}
                      disabled={entry.isFullDay}
                      value={entry.isFullDay ? "" : entry.startTime}
                      onChange={(e) =>
                        updateEntry(entry.date, "startTime", e.target.value)
                      }
                      className={
                        entry.isFullDay
                          ? "bg-surface-disabled text-text-disabled"
                          : ""
                      }
                    />
                    <FormInput
                      id={`${entry.date}-end`}
                      placeholder={entry.isFullDay ? "Fullday" : "End time"}
                      type={entry.isFullDay ? "text" : "time"}
                      disabled={entry.isFullDay}
                      value={entry.isFullDay ? "" : entry.endTime}
                      onChange={(e) =>
                        updateEntry(entry.date, "endTime", e.target.value)
                      }
                      className={
                        entry.isFullDay
                          ? "bg-surface-disabled text-text-disabled"
                          : ""
                      }
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 border-2 border-dashed border-border-default rounded-xl bg-surface-default flex flex-col items-center justify-center text-center space-y-2">
                <h4 className="text-body-base-bold text-text-heading">
                  Select date first
                </h4>
                <p className="text-body-sm-medium text-text-placeholder">
                  Select date to add a break date
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border-default flex gap-3 bg-white rounded-bl-3xl">
          <button
            disabled={isLoading}
            onClick={() => onSave(selectedEntries)}
            className="button-primary-large "
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} className="button-outline-large ">
            Cancel
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
