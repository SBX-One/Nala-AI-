"use client";

import React, { useState, useEffect } from "react";
import { FormInput } from "@/components/ui/FormInput";
import {
  getCurrentPsychiatristProfile,
  updatePsychiatristProfile,
} from "@/app/actions/psychiatrist";
import {
  getPsychiatristSchedule,
  updateAvailability,
} from "@/app/actions/schedule";
import { toast } from "react-hot-toast";

const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const SESSION_OPTIONS = [45, 60, 90];

export default function AvailabilityProfilePage() {
  const [loading, setLoading] = useState(true);
  const [savingPrice, setSavingPrice] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Price State
  const [priceData, setPriceData] = useState({
    price: 0,
    sessionDuration: 45,
  });
  const [initialPriceData, setInitialPriceData] = useState<any>(null);

  // Availability State (Global/General)
  const [generalTimes, setGeneralTimes] = useState({
    startTime: "09:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [customAvailabilities, setCustomAvailabilities] = useState<any[]>([]);
  const [initialAvailabilityData, setInitialAvailabilityData] =
    useState<any>(null);
  const [psychiatristId, setPsychiatristId] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const [profile, schedule] = await Promise.all([
        getCurrentPsychiatristProfile(),
        getPsychiatristSchedule(),
      ]);

      if (profile) {
        const pData = {
          price: profile.price,
          sessionDuration: profile.sessionDuration || 45,
        };
        setPriceData(pData);
        setInitialPriceData(pData);
      }

      if (schedule.data) {
        setPsychiatristId(schedule.data.psychiatristId);

        const activeDays = schedule.data.availability.map((a: any) => {
          const dayName = a.day.charAt(0).toUpperCase() + a.day.slice(1);
          return dayName;
        });
        setSelectedDays(activeDays);

        const customs = schedule.data.availability.map((a: any) => ({
          day: a.day.charAt(0).toUpperCase() + a.day.slice(1),
          startTime: a.availability_start_time.slice(0, 5),
          endTime: a.availability_end_time.slice(0, 5),
          breakStart: a.break_start_time?.slice(0, 5) || "",
          breakEnd: a.break_end_time?.slice(0, 5) || "",
        }));
        setCustomAvailabilities(customs);

        const initialAvail = {
          selectedDays: activeDays,
          customAvailabilities: customs,
        };
        setInitialAvailabilityData(initialAvail);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
      setCustomAvailabilities(
        customAvailabilities.filter((a) => a.day !== day),
      );
    } else {
      setSelectedDays([...selectedDays, day]);
      setCustomAvailabilities([
        ...customAvailabilities,
        { day, ...generalTimes },
      ]);
    }
  };

  const handleUpdateCustom = (day: string, field: string, value: string) => {
    setCustomAvailabilities(
      customAvailabilities.map((a) =>
        a.day === day ? { ...a, [field]: value } : a,
      ),
    );
  };

  const hasPriceChanges =
    initialPriceData &&
    (priceData.price !== initialPriceData.price ||
      priceData.sessionDuration !== initialPriceData.sessionDuration);

  const hasAvailabilityChanges =
    initialAvailabilityData &&
    (JSON.stringify([...selectedDays].sort()) !==
      JSON.stringify([...initialAvailabilityData.selectedDays].sort()) ||
      JSON.stringify(customAvailabilities) !==
        JSON.stringify(initialAvailabilityData.customAvailabilities));

  const handleSavePrice = async () => {
    setSavingPrice(true);
    try {
      // Since we don't have sessionDuration in schema yet, we only update price
      const res = await updatePsychiatristProfile({ price: priceData.price });
      if (res.error) throw new Error(res.error);

      setInitialPriceData(priceData);
      toast.success("Price settings updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update price");
    } finally {
      setSavingPrice(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!psychiatristId) return;
    setSavingAvailability(true);
    try {
      const payload = DAYS_FULL.map((day) => {
        const custom = customAvailabilities.find((a) => a.day === day);
        return {
          day: day,
          isActive: selectedDays.includes(day),
          startTime: custom?.startTime || generalTimes.startTime,
          endTime: custom?.endTime || generalTimes.endTime,
          breakStart: custom?.breakStart || generalTimes.breakStart,
          breakEnd: custom?.breakEnd || generalTimes.breakEnd,
        };
      });

      const res = await updateAvailability(psychiatristId, payload);
      if (!res.success) throw new Error(res.error);

      setInitialAvailabilityData({ selectedDays, customAvailabilities });
      toast.success("Availability updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update availability");
    } finally {
      setSavingAvailability(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20">
      {/* Price Card */}
      <div className="bg-white border border-border-default rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 flex flex-col gap-6">
          <h2 className="text-body-xl-semibold text-text-body">Price</h2>

          <div className="flex flex-col gap-4">
            <label className="text-label-small-medium text-text-label">
              Session Time
            </label>
            <div className="flex gap-3">
              {SESSION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() =>
                    setPriceData({ ...priceData, sessionDuration: opt })
                  }
                  className={`px-6 py-2.5 rounded-xl border text-label-small-medium transition-all ${
                    priceData.sessionDuration === opt
                      ? "bg-primary-50 border-primary-500 text-primary-600 shadow-sm"
                      : "bg-white border-border-default text-text-placeholder hover:bg-surface-disabled"
                  }`}
                >
                  {opt} Mins
                </button>
              ))}
            </div>
          </div>

          <FormInput
            id="price"
            leftLabel="Enter Your Rate Per Session"
            type="number"
            value={priceData.price}
            onChange={(e) =>
              setPriceData({ ...priceData, price: Number(e.target.value) })
            }
            placeholder="Ex: 200.000"
          />
        </div>

        <div className="px-6 py-6 flex justify-end gap-3">
          {hasPriceChanges && (
            <>
              <button
                onClick={() => setPriceData(initialPriceData)}
                className="button-outline-large"
              >
                Revert
              </button>
              <button
                onClick={handleSavePrice}
                disabled={savingPrice}
                className="button-primary-large"
              >
                {savingPrice ? "Saving..." : "Save Change"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Availability Card */}
      <div className="bg-white border border-border-default rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 flex flex-col gap-8">
          <h2 className="text-body-xl-semibold text-text-body">Availability</h2>

          {/* Available Days Picker */}
          <div className="flex flex-col gap-4">
            <label className="text-label-small-medium text-text-label">
              Available Day
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_FULL.map((day) => (
                <button
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`px-4 py-2.5 rounded-xl border text-label-small-medium transition-all ${
                    selectedDays.includes(day)
                      ? "bg-primary-50 border-primary-500 text-primary-600 shadow-sm"
                      : "bg-white border-border-default text-text-placeholder hover:bg-surface-disabled"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Global Times (Applied to all newly selected days) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-label-small-medium text-text-label">
                Available Time
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={generalTimes.startTime}
                  onChange={(e) =>
                    setGeneralTimes({
                      ...generalTimes,
                      startTime: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 rounded-xl border border-border-default outline-none focus:border-primary-500"
                />
                <input
                  type="time"
                  value={generalTimes.endTime}
                  onChange={(e) =>
                    setGeneralTimes({
                      ...generalTimes,
                      endTime: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 rounded-xl border border-border-default outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-small-medium text-text-label">
                Break Time
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={generalTimes.breakStart}
                  onChange={(e) =>
                    setGeneralTimes({
                      ...generalTimes,
                      breakStart: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 rounded-xl border border-border-default outline-none focus:border-primary-500"
                />
                <input
                  type="time"
                  value={generalTimes.breakEnd}
                  onChange={(e) =>
                    setGeneralTimes({
                      ...generalTimes,
                      breakEnd: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 rounded-xl border border-border-default outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Custom Availabilities List */}
          {customAvailabilities.length > 0 && (
            <div className="flex flex-col gap-6 pt-4 border-t border-border-default/50">
              <div className="flex items-center justify-between">
                <h3 className="text-label-base-semibold text-text-body">
                  Custom Availability
                </h3>
              </div>

              {customAvailabilities.map((avail) => (
                <div key={avail.day} className="flex flex-col gap-4 ">
                  <div className="flex items-center justify-between">
                    <span className="text-label-base-bold text-text-heading">
                      {avail.day}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-label-small-semibold text-text-subheading">
                        Available Time
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={avail.startTime}
                          onChange={(e) =>
                            handleUpdateCustom(
                              avail.day,
                              "startTime",
                              e.target.value,
                            )
                          }
                          className="flex-1 px-3 py-2.5 rounded-xl border border-border-default bg-white outline-none focus:border-primary-500"
                        />
                        <input
                          type="time"
                          value={avail.endTime}
                          onChange={(e) =>
                            handleUpdateCustom(
                              avail.day,
                              "endTime",
                              e.target.value,
                            )
                          }
                          className="flex-1 px-3 py-2.5 rounded-xl border border-border-default bg-white outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-label-small-semibold text-text-subheading">
                        Break Time
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={avail.breakStart}
                          onChange={(e) =>
                            handleUpdateCustom(
                              avail.day,
                              "breakStart",
                              e.target.value,
                            )
                          }
                          className="flex-1 px-3 py-2.5 rounded-xl border border-border-default bg-white outline-none focus:border-primary-500"
                        />
                        <input
                          type="time"
                          value={avail.breakEnd}
                          onChange={(e) =>
                            handleUpdateCustom(
                              avail.day,
                              "breakEnd",
                              e.target.value,
                            )
                          }
                          className="flex-1 px-3 py-2.5 rounded-xl border border-border-default bg-white outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDayToggle(avail.day)}
                      className="button-outline-medium border-border-default text-label-caption-medium text-text-body"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-6 flex justify-end gap-3">
          {hasAvailabilityChanges && (
            <>
              <button
                onClick={() => {
                  setSelectedDays(initialAvailabilityData.selectedDays);
                  setCustomAvailabilities(
                    initialAvailabilityData.customAvailabilities,
                  );
                }}
                className="button-outline-large"
              >
                Revert
              </button>
              <button
                onClick={handleSaveAvailability}
                disabled={savingAvailability}
                className="button-primary-large"
              >
                {savingAvailability ? "Saving..." : "Save Change"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
