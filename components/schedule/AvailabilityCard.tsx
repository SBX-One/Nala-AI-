"use client";

import React from "react";
import { FormInput } from "@/components/ui/FormInput";

interface AvailabilityCardProps {
  selectedDays: string[];
  daysFull: string[];
  generalTimes: {
    startTime: string;
    endTime: string;
    breakStart: string;
    breakEnd: string;
  };
  customAvailabilities: any[];
  onDayToggle: (day: string) => void;
  onGeneralTimeChange: (field: string, value: string) => void;
  onUpdateCustom: (day: string, field: string, value: string) => void;
  onSave: () => void;
  onRevert: () => void;
  isSaving: boolean;
  hasChanges?: boolean;
}

export const AvailabilityCard: React.FC<AvailabilityCardProps> = ({
  selectedDays,
  daysFull,
  generalTimes,
  customAvailabilities,
  onDayToggle,
  onGeneralTimeChange,
  onUpdateCustom,
  onSave,
  onRevert,
  isSaving,
  hasChanges = false,
}) => {
  return (
    <div className="bg-white border border-border-default rounded-xl p-6 space-y-6">
      <h2 className="text-body-xl-semibold text-text-body ">Availability</h2>

      {/* Available Day */}
      <div className="flex flex-col gap-2">
        <label className="text-label-small-semibold text-text-label">
          Available Day
        </label>
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar ">
          {daysFull.map((day) => (
            <button
              key={day}
              onClick={() => onDayToggle(day)}
              className={`px-6 py-3 rounded-xl text-label-base-medium transition-all border ${
                selectedDays.includes(day)
                  ? "bg-blue-50 border-[#0066FF] text-[#0066FF]"
                  : "bg-[#F8F9FA] border-border-default text-text-placeholder hover:border-blue-300"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* General Time Inputs */}
      <div className="grid grid-cols-2 gap-4 items-end">
        <FormInput
          id="start-time"
          leftLabel="Default Available Time"
          placeholder="Start Time"
          type="time"
          value={generalTimes.startTime}
          onChange={(e) => onGeneralTimeChange("startTime", e.target.value)}
        />
        <FormInput
          id="end-time"
          leftLabel=" "
          placeholder="End Time"
          type="time"
          value={generalTimes.endTime}
          onChange={(e) => onGeneralTimeChange("endTime", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <FormInput
          id="break-start"
          leftLabel="Default Break Time"
          placeholder="Start Time"
          type="time"
          value={generalTimes.breakStart}
          onChange={(e) => onGeneralTimeChange("breakStart", e.target.value)}
        />
        <FormInput
          id="break-end"
          leftLabel=" "
          placeholder="End Time"
          type="time"
          value={generalTimes.breakEnd}
          onChange={(e) => onGeneralTimeChange("breakEnd", e.target.value)}
        />
      </div>

      {/* Custom Availability Header */}
      <div className="flex items-center justify-between pt-4 border-t border-dashed border-border-default">
        <h3 className="text-label-small-semibold text-text-label">
          Custom Availability
        </h3>
        <div className="size-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center shadow-sm">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>

      {/* Custom Configs */}
      <div className="space-y-10">
        {customAvailabilities.map((avail, index) => (
          <div
            key={avail.day}
            className={`space-y-4 ${index > 0 ? "pt-10 border-t border-dashed border-border-default" : "pt-2"}`}
          >
            <h4 className="text-label-base-bold text-text-label">
              {avail.day}
            </h4>
            <div className="grid grid-cols-2 items-end gap-4">
              <FormInput
                id={`${avail.day}-start`}
                leftLabel="Available Time"
                placeholder="Start Time"
                type="time"
                value={avail.startTime}
                onChange={(e) =>
                  onUpdateCustom(avail.day, "startTime", e.target.value)
                }
              />
              <FormInput
                id={`${avail.day}-end`}
                leftLabel=" "
                placeholder="End Time"
                type="time"
                value={avail.endTime}
                onChange={(e) =>
                  onUpdateCustom(avail.day, "endTime", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 items-end gap-4">
              <FormInput
                id={`${avail.day}-break-start`}
                leftLabel="Break Time"
                placeholder="Start Time"
                type="time"
                value={avail.breakStart}
                onChange={(e) =>
                  onUpdateCustom(avail.day, "breakStart", e.target.value)
                }
              />
              <FormInput
                id={`${avail.day}-break-end`}
                leftLabel=" "
                placeholder="End Time"
                type="time"
                value={avail.breakEnd}
                onChange={(e) =>
                  onUpdateCustom(avail.day, "breakEnd", e.target.value)
                }
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => onDayToggle(avail.day)}
                className="px-4 py-2 border border-border-default rounded-lg text-label-sm-medium text-[#E11D48] hover:bg-red-50 transition-colors"
              >
                Remove Custom
              </button>
            </div>
          </div>
        ))}

        {customAvailabilities.length === 0 && (
          <p className="text-center py-10 text-body-sm-medium text-text-placeholder italic">
            No custom availability set. Default times will be used for active
            days.
          </p>
        )}
      </div>

      {/* Footer Buttons - Only visible if there are changes */}
      {hasChanges && (
        <div className="flex justify-end gap-3 pt-6 border-t border-border-default animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button onClick={onRevert} className="button-outline-large">
            Revert
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="button-primary-large"
          >
            {isSaving ? "Saving..." : "Save Change"}
          </button>
        </div>
      )}
    </div>
  );
};
