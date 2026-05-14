import KPICard from "@/components/partials/KPICard";
import React from "react";
import ActiveConsultationCard from "@/components/queue/ActiveConsultationCard";
import QueueItemCard from "@/components/queue/QueueItemCard";
import PastConsultationCard from "@/components/queue/PastConsultationCard";

export default function ConsultationQueuePage() {
  const queueData = [
    {
      id: 1,
      name: "Rico Christian Ferry",
      status: "Patient in Waiting Room",
      timeLeft: "4 Mins Left",
      avatar: "/images/hospital-wheelchair/bro.svg",
      tags: ["Insomnia", "Work Strss", "Childhood Trauma"],
      isActive: true,
    },
    {
      id: 2,
      name: "Mahendra Arya",
      status: "Today, 10.00 - 10.45",
      avatar: "/images/hospital-wheelchair/bro.svg",
      tags: ["Insomnia", "Work Strss", "Childhood Trauma"],
      isActive: false,
    },
  ];

  const pastConsultations = [
    {
      id: 101,
      name: "Rico Christian Ferry",
      time: "39:12 Mins, Yesterday",
    },
    {
      id: 102,
      name: "Mahendra Arya",
      time: "39:12 Mins, Yesterday",
    },
  ];

  return (
    <div className="p-8 bg-surface-default min-h-screen">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              title="Today's Appointment"
              value="4"
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
              value="12:00"
              unit="AM"
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
              value="2"
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

          {/* On-Going Consultation Card */}
          <ActiveConsultationCard
            patientName="Rico Christian Ferry"
            timeRange="12.00 PM - 12.45 PM"
            elapsedTime="15:00"
            remainingTime="30:00"
          />

          {/* Consultation Queue List */}
          <div className="bg-white rounded-xl p-6 border border-border-default space-y-6">
            <div className="flex items-center gap-3 mb-6">
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
              <h3 className="text-body-xl-semibold text-text-heading">
                Consultation Queue
              </h3>
            </div>

            <div className="space-y-4">
              {queueData.map((item) => (
                <QueueItemCard
                  key={item.id}
                  name={item.name}
                  status={item.status}
                  avatar={item.avatar}
                  tags={item.tags}
                  isActive={item.isActive}
                  timeLeft={item.timeLeft}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="w-full xl:w-87.5 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-border-default sticky top-8">
            <div className="flex items-center gap-3 mb-6">
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
              <h3 className="text-body-xl-semibold text-text-heading">
                Past Consultation
              </h3>
            </div>

            <div className="space-y-4">
              {pastConsultations.map((item) => (
                <PastConsultationCard
                  key={item.id}
                  name={item.name}
                  time={item.time}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
