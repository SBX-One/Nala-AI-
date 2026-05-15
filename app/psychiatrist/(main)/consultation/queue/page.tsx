"use client";

import KPICard from "@/components/partials/KPICard";
import React, { useState, useEffect } from "react";
import ActiveConsultationCard from "@/components/queue/ActiveConsultationCard";
import QueueItemCard from "@/components/queue/QueueItemCard";
import PastConsultationCard from "@/components/queue/PastConsultationCard";
import PatientInfoModal from "@/components/queue/PatientInfoModal";
import { getQueueData, joinMeetingRoom } from "@/app/actions/consultation";
import { useRouter } from "next/navigation";

function formatTime(timeStr: string | null) {
  if (!timeStr) return "--:--";
  // timeStr is likely "HH:MM:SS"
  const [h, m] = timeStr.split(":");
  const hours = parseInt(h);
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}.${m} ${ampm}`;
}

export default function ConsultationQueuePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const result = await getQueueData();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-text-placeholder">
        {error || "Failed to load queue data"}
      </div>
    );
  }

  const { kpis, ongoing, queue, past } = data;

  // Helper to check if time is reached or passed
  const isTimeReached = (startTime: string) => {
    const now = new Date();
    const [h, m] = startTime.split(":").map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    return now >= start;
  };

  // Helper to check if a consultation is "about to start" (within 10 mins)
  const isAboutToStart = (startTime: string) => {
    const now = new Date();
    const [h, m] = startTime.split(":").map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);

    const diffInMinutes = (start.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes <= 10 && diffInMinutes > 0;
  };

  const formattedQueue = queue.map((item: any) => {
    const timeReached = isTimeReached(item.start_time);
    const aboutToStart = isAboutToStart(item.start_time);
    const isOngoing = item.status === "on_going";
    const isFinished =
      item.status === "finished" || item.status === "published";

    const canEnter = !isFinished && (isOngoing || timeReached);

    const statusText = isOngoing
      ? "Patient in Meeting"
      : timeReached && !isFinished
        ? "Ready to Start"
        : `Today, ${formatTime(item.start_time)}`;

    return {
      id: item.id,
      name: item.user?.name || "Unknown Patient",
      status: statusText,
      avatar: item.user?.avatar_url || "/images/hospital-wheelchair/bro.svg",
      tags: item.complaint
        ? item.complaint.split(",").map((t: string) => t.trim())
        : [],
      isActive: canEnter,
      timeLeft: isOngoing
        ? "In Progress"
        : timeReached && !isFinished
          ? "Start Now"
          : aboutToStart
            ? "Starts Soon"
            : null,
      originalData: item,
    };
  });

  // Decide which session to show in the "Active" card
  const activeSessionData =
    ongoing ||
    queue.find((item: any) => {
      const isFinished =
        item.status === "finished" || item.status === "published";
      return !isFinished && isTimeReached(item.start_time);
    });

  const formattedPast = past.map((item: any) => ({
    id: item.id,
    name: item.user?.name || "Unknown Patient",
    time: `${formatTime(item.start_time)}, ${new Date(item.date).toLocaleDateString("en-US", { weekday: "long" })}`,
  }));

  // Format Next Session KPI
  const nextSessionTime = kpis.nextSession
    ? formatTime(kpis.nextSession)
    : "--:--";
  const [nextVal, nextUnit] = nextSessionTime.split(" ");

  const getRemainingTime = (endTime: string) => {
    const now = new Date();
    const [h, m, s] = endTime.split(":").map(Number);
    const end = new Date();
    end.setHours(h, m, s || 0, 0);

    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return null;

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const openPatientModal = (patient: any) => {
    setSelectedPatient({
      name: patient.user?.name || patient.name,
      avatar_url: patient.user?.avatar_url || patient.avatar,
      complaint: patient.complaint,
      topic: patient.topic,
      status: patient.status,
    });
    setIsModalOpen(true);
  };

  const handleEnterRoom = async (
    userId: number,
    psychiatristId: number,
    consultationId: number,
    currentStatus: string,
  ) => {
    // Client-side block for finished sessions
    if (currentStatus === "finished" || currentStatus === "published") {
      alert("This consultation has already ended.");
      return;
    }

    if (!userId || !psychiatristId || !consultationId) {
      alert("Error: Missing required IDs to enter room.");
      return;
    }

    if (isJoining) return;
    setIsJoining(true);
    try {
      const res = await joinMeetingRoom(userId, psychiatristId, consultationId);
      if (res.error) {
        alert("Failed to join room: " + res.error);
      } else {
        router.push(`/psychiatrist/consultation-room?roomId=${res.roomId}`);
      }
    } catch (err) {
      console.error("Critical error in handleEnterRoom:", err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-surface-default min-h-screen">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              title="Today's Appointment"
              value={kpis.today.toString()}
              unit="Patient"
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"></path>
                </svg>
              }
            />
            <KPICard
              title="Next Session"
              value={nextVal}
              unit={nextUnit || ""}
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              }
            />
            <KPICard
              title="Completed"
              value={kpis.completed.toString()}
              unit="Session"
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              }
            />
          </div>

          {/* On-Going Consultation Card or Empty State */}
          {activeSessionData ? (
            <ActiveConsultationCard
              patientName={activeSessionData.user?.name || "Unknown"}
              timeRange={`${formatTime(activeSessionData.start_time)} - ${formatTime(activeSessionData.end_time)}`}
              elapsedTime={
                activeSessionData.status === "on_going"
                  ? "In Progress"
                  : "Ready to Start"
              }
              remainingTime={
                activeSessionData.status === "on_going"
                  ? getRemainingTime(activeSessionData.end_time) || ""
                  : "Scheduled Time"
              }
              onBackToRoom={() => {
                handleEnterRoom(
                  activeSessionData.user_id,
                  activeSessionData.psychiatrist_id,
                  activeSessionData.id,
                  activeSessionData.status,
                );
              }}
            />
          ) : (
            <div className="py-24 bg-white rounded-xl border border-border-default flex flex-col items-center justify-center text-center space-y-4 shadow-sm animate-in fade-in duration-500">
              <h2 className="text-heading-3-bold text-primary-600">
                No On Going Consultation
              </h2>
              <p className="text-body-xl-medium text-primary-500">
                Next consultation at {nextSessionTime}
              </p>
            </div>
          )}

          {/* Consultation Queue List */}
          <div className="bg-white rounded-xl p-6 md:p-8 border border-border-default space-y-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0066FF"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                  <circle cx="19" cy="11" r="2"></circle>
                </svg>
              </div>
              <h3 className="text-body-xl-semibold text-text-heading">
                Consultation Queue
              </h3>
            </div>

            <div className="space-y-4">
              {formattedQueue.length > 0 ? (
                formattedQueue.map((item: any) => (
                  <QueueItemCard
                    key={item.id}
                    name={item.name}
                    status={item.status}
                    avatar={item.avatar}
                    tags={item.tags}
                    isActive={item.isActive}
                    timeLeft={item.timeLeft}
                    onMoreInfo={() => openPatientModal(item.originalData)}
                    onEnterRoom={() => {
                      handleEnterRoom(
                        item.originalData.user_id,
                        item.originalData.psychiatrist_id,
                        item.originalData.id,
                        item.originalData.status,
                      );
                    }}
                  />
                ))
              ) : (
                <p className="py-8 text-center text-body-base-medium text-text-placeholder">
                  No appointments scheduled for today.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="w-full xl:w-96 space-y-6">
          <div className="bg-white rounded-xl p-6 md:p-8 border border-border-default sticky top-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0066FF"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 className=" text-body-xl-bold md:text-heading-5-bold text-text-heading">
                Past Consultation
              </h3>
            </div>

            <div className="space-y-4">
              {formattedPast.length > 0 ? (
                formattedPast.map((item: any) => (
                  <PastConsultationCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    time={item.time}
                  />
                ))
              ) : (
                <p className="py-4 text-sm text-text-placeholder">
                  No past sessions found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <PatientInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={selectedPatient}
      />
    </div>
  );
}
