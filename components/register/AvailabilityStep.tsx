import React from "react";
import { usePsychiatristRegister } from "@/context/PsychiatristRegisterContext";

interface AvailabilityStepProps {
  updateGlobalTime: (start: string, end: string) => void;
  toggleDay: (day: string) => void;
  updateDayTime: (
    day: string,
    type: "startTime" | "endTime",
    value: string,
  ) => void;
}

export const AvailabilityStep: React.FC<AvailabilityStepProps> = ({
  updateGlobalTime,
  toggleDay,
  updateDayTime,
}) => {
  const { availability } = usePsychiatristRegister();
  return (
    <div className="flex flex-col gap-8">
      <div className="p-6 bg-primary-50 rounded-2xl flex flex-col gap-4">
        <p className="text-label-base-semibold text-primary-700">
          Set Global Hours
        </p>
        <div className="flex items-center gap-3">
          <input
            id="globalStart"
            type="time"
            defaultValue="09:00"
            className="flex-1 px-4 py-2.5 rounded-xl border border-primary-100 outline-none"
          />
          <span className="text-primary-300">to</span>
          <input
            id="globalEnd"
            type="time"
            defaultValue="17:00"
            className="flex-1 px-4 py-2.5 rounded-xl border border-primary-100 outline-none"
          />
          <button
            onClick={() => {
              const start = (
                document.getElementById("globalStart") as HTMLInputElement
              ).value;
              const end = (
                document.getElementById("globalEnd") as HTMLInputElement
              ).value;
              updateGlobalTime(start, end);
            }}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-label-small-bold hover:bg-primary-600 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {availability.map((a) => (
          <div
            key={a.day}
            className={`p-4 rounded-2xl border transition-all ${
              a.enabled
                ? "border-primary-100 bg-white"
                : "border-neutral-100 bg-neutral-50 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleDay(a.day)}
                  className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    a.enabled
                      ? "border-primary-500 bg-primary-500"
                      : "border-neutral-200"
                  }`}
                >
                  {a.enabled && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <span
                  className={`text-label-base-bold ${
                    a.enabled ? "text-text-heading" : "text-text-placeholder"
                  }`}
                >
                  {a.day}
                </span>
              </div>

              {a.enabled && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                  <input
                    type="time"
                    value={a.startTime}
                    onChange={(e) =>
                      updateDayTime(a.day, "startTime", e.target.value)
                    }
                    className="px-3 py-1.5 rounded-lg border border-neutral-100 text-label-small-medium outline-none focus:border-primary-500"
                  />
                  <span className="text-neutral-300">-</span>
                  <input
                    type="time"
                    value={a.endTime}
                    onChange={(e) =>
                      updateDayTime(a.day, "endTime", e.target.value)
                    }
                    className="px-3 py-1.5 rounded-lg border border-neutral-100 text-label-small-medium outline-none focus:border-primary-500"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
