"use client";

import React, { useState, useEffect } from "react";
import {
  getPsychiatristSchedule,
  updateAvailability,
  deleteBreakDate,
  addBreakDate,
  updateBreakDate,
} from "@/app/actions/schedule";
import { AvailabilityCard } from "@/components/schedule/AvailabilityCard";
import { BreakCalendarCard } from "@/components/schedule/BreakCalendarCard";
import { BreakDateList } from "@/components/schedule/BreakDateList";
import BreakDateModal from "@/components/schedule/BreakDateModal";
import { DeleteConfirmationModal } from "@/components/schedule/DeleteConfirmationModal";

const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function SchedulePage() {
  const [psychiatristId, setPsychiatristId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);

  // Availability State
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [generalTimes, setGeneralTimes] = useState({
    startTime: "09:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  });

  // Custom availability per day
  const [customAvailabilities, setCustomAvailabilities] = useState<any[]>([]);
  const [breaks, setBreaks] = useState<any[]>([]);

  // Initial data tracking for change detection
  const [initialData, setInitialData] = useState<{
    selectedDays: string[];
    customAvailabilities: any[];
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getPsychiatristSchedule();
    if (res.data) {
      setPsychiatristId(res.data.psychiatristId);
      setBreaks(res.data.breaks);

      const activeDays = res.data.availability.map((a: any) => {
        const dayName = a.day.charAt(0).toUpperCase() + a.day.slice(1);
        return dayName;
      });
      setSelectedDays(activeDays);

      const customs = res.data.availability.map((a: any) => ({
        day: a.day.charAt(0).toUpperCase() + a.day.slice(1),
        startTime: a.availability_start_time.slice(0, 5),
        endTime: a.availability_end_time.slice(0, 5),
        breakStart: a.break_start_time?.slice(0, 5) || "",
        breakEnd: a.break_end_time?.slice(0, 5) || "",
      }));
      setCustomAvailabilities(customs);

      // Save initial data for change detection
      setInitialData({
        selectedDays: activeDays,
        customAvailabilities: customs,
      });
    } else if (res.error) {
      console.error(res.error);
      alert(`Failed to load schedule: ${res.error}`);
    }
    setLoading(false);
  };

  const isChanged = () => {
    if (!initialData) return false;

    // Check if selected days changed
    if (
      JSON.stringify([...selectedDays].sort()) !==
      JSON.stringify([...initialData.selectedDays].sort())
    ) {
      return true;
    }

    // Check if custom availabilities changed
    if (
      JSON.stringify(customAvailabilities) !==
      JSON.stringify(initialData.customAvailabilities)
    ) {
      return true;
    }

    return false;
  };

  useEffect(() => {
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

  const handleGeneralTimeChange = (field: string, value: string) => {
    setGeneralTimes({ ...generalTimes, [field]: value });
  };

  const handleUpdateCustom = (day: string, field: string, value: string) => {
    setCustomAvailabilities(
      customAvailabilities.map((a) =>
        a.day === day ? { ...a, [field]: value } : a,
      ),
    );
  };

  const handleSaveChanges = async () => {
    if (!psychiatristId) {
      alert("Error: Psychiatrist profile not loaded.");
      return;
    }
    setIsSaving(true);

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

    try {
      const res = await updateAvailability(psychiatristId, payload);
      if (res.success) {
        await loadData();
      } else {
        alert(`Failed to update availability: ${res.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while saving availability.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBreaks = async (entries: any[]) => {
    if (!psychiatristId) {
      alert("Error: Psychiatrist profile not loaded.");
      return;
    }
    setIsSaving(true);

    try {
      // 1. Find entries to delete (exist in old breaks but not in new entries)
      const entryDates = entries.map((e) => e.date);
      const toDelete = breaks.filter((b) => {
        const bDate = b.date.split("T")[0];
        return !entryDates.includes(bDate);
      });

      for (const b of toDelete) {
        await deleteBreakDate(b.id);
      }

      // 2. Add or update remaining entries
      for (const entry of entries) {
        if (entry.id) {
          // Update existing
          const res = await updateBreakDate(entry.id, {
            startTime: entry.startTime,
            endTime: entry.endTime,
            isFullDay: entry.isFullDay,
          });
          if (res.error) throw new Error(res.error);
        } else {
          // Create new
          const res = await addBreakDate(psychiatristId, {
            date: entry.date,
            startTime: entry.startTime,
            endTime: entry.endTime,
            isFullDay: entry.isFullDay,
          });
          if (res.error) throw new Error(res.error);
        }
      }

      await loadData();
      setIsBreakModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save break dates: ${err.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    if (!initialData) return;
    setSelectedDays(initialData.selectedDays);
    setCustomAvailabilities(initialData.customAvailabilities);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [breakToDelete, setBreakToDelete] = useState<number | null>(null);

  const handleDeleteBreak = (id: number) => {
    setBreakToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!breakToDelete) return;
    setIsSaving(true);
    try {
      const res = await deleteBreakDate(breakToDelete);
      if (res.success) {
        setBreaks(breaks.filter((b) => b.id !== breakToDelete));
        setIsDeleteModalOpen(false);
        setBreakToDelete(null);
      } else {
        alert("Failed to delete break date.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FDFDFD]">
        <div className="animate-spin size-8 border-4 border-[#0066FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-surface-default min-h-screen">
      {/* Header */}
      <div className="space-y-1 bg-white border-b border-border-default p-4 md:p-6 md:py-8 sticky top-0 z-50">
        <h1 className="text-heading-6-semibold md:text-heading-3-semibold text-text-heading flex items-center gap-2">
          Edit Availability & Schedule
          <span className="size-1.5 rounded-full bg-[#E11D48] mt-2" />
        </h1>
        <p className="text-body-sm-medium md:text-body-base-medium text-text-placeholder">
          Manage your consultation schedule with ease
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start p-4 md:p-6">
        {/* Left Column - Availability */}
        <div className="lg:col-span-7 space-y-6">
          <AvailabilityCard
            selectedDays={selectedDays}
            daysFull={DAYS_FULL}
            generalTimes={generalTimes}
            customAvailabilities={customAvailabilities}
            onDayToggle={handleDayToggle}
            onGeneralTimeChange={handleGeneralTimeChange}
            onUpdateCustom={handleUpdateCustom}
            onSave={handleSaveChanges}
            onRevert={handleRevert}
            isSaving={isSaving}
            hasChanges={isChanged()}
          />
        </div>

        {/* Right Column - Break Calendar & List */}
        <div className="lg:col-span-5 space-y-8">
          <BreakCalendarCard
            breaks={breaks}
            activeDays={selectedDays}
            onAddBreak={() => setIsBreakModalOpen(true)}
          />
          <BreakDateList
            breaks={breaks}
            onDelete={handleDeleteBreak}
            onEdit={() => setIsBreakModalOpen(true)}
            formatDate={formatDate}
          />
        </div>
      </div>

      <BreakDateModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
        onSave={handleSaveBreaks}
        initialBreaks={breaks}
        activeDays={selectedDays}
        isLoading={isSaving}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isSaving}
      />
    </div>
  );
}
