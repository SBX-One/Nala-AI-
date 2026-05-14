"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateConsultation } from "@/app/actions/consultation";
import FinalizeModal from "./FinalizeModal";
import MedicineModal from "./MedicineModal";
import MedicineCard from "./MedicineCard";
import UpdateConsultationModal from "./UpdateConsultationModal";

interface ConsultationDetailProps {
  session: any;
  onRefresh?: () => void;
}

export default function ConsultationDetail({
  session,
  onRefresh,
}: ConsultationDetailProps) {
  const router = useRouter();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  // View States (Synced with session)
  const [diagnose, setDiagnose] = useState(session.diagnose || "");
  const [feedback, setFeedback] = useState(session.psychiatrist_feedback || "");
  const [medicines, setMedicines] = useState<any[]>(session.medicines || []);

  useEffect(() => {
    setDiagnose(session.diagnose || "");
    setFeedback(session.psychiatrist_feedback || "");
    setMedicines(session.medicines || []);
  }, [session]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "N/A";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (
    data: { diagnose: string; feedback: string; medicines: any[] },
    status: "draft" | "published" = "published"
  ) => {
    setLoading(true);
    const result = await updateConsultation(session.id, {
      diagnose: data.diagnose,
      psychiatrist_feedback: data.feedback,
      status: status,
      medicines: data.medicines,
    });

    if (result.success) {
      setShowUpdateModal(false);
      if (onRefresh) onRefresh();
      router.refresh();
    } else {
      alert("Failed to update: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="pb-24 lg:pb-0 bg-surface-default">
      {/* Header Action */}
      <div className="flex items-center justify-between border-b border-border-default p-5 sticky top-0 bg-white z-20">
        <span className="text-body-base-medium text-text-subheading">
          Last Updated at{" "}
          {new Date(session.created_at).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpdateModal(true)}
            className="button-secondary-medium"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          {session.status === "draft" && (
            <button
              onClick={() => setShowFinalizeModal(true)}
              className="button-primary-medium"
            >
              Submit Consultation
            </button>
          )}
        </div>
      </div>

      <UpdateConsultationModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        initialData={{ diagnose, feedback, medicines }}
        onSave={handleSubmit}
        isLoading={loading}
      />

      <FinalizeModal
        isOpen={showFinalizeModal}
        onClose={() => setShowFinalizeModal(false)}
        onConfirm={async () => {
          await handleSubmit({ diagnose, feedback, medicines }, "published");
          setShowFinalizeModal(false);
        }}
        isLoading={loading}
      />

      <div className="bg-surface-default p-6 flex flex-col gap-4">
        {/* Patient Profile Card */}
        <div className="bg-white rounded-xl border border-border-default p-6 flex gap-8 items-start ">
          <div className="relative size-32 rounded-lg overflow-hidden bg-surface-background shrink-0 border border-border-default">
            {session.user?.avatar_url ? (
              <Image
                src={session.user.avatar_url}
                alt="Patient"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-500 font-bold text-3xl uppercase">
                {session.user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-heading-6-semibold text-text-heading mb-2">
                {session.user?.name}
              </h2>
              <p className="text-body-sm-semibold text-text-action">
                {session.user?.location || "Unknown Location"},{" "}
                {calculateAge(session.user?.birth_date)} Years Old
              </p>
            </div>

            <div className="flex justify-between  py-5 border-y border-border-default">
              <div className="flex items-center gap-2">
                <svg
                  className="text-text-placeholder"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span className="text-body-caption-medium text-text-subheading">
                  {new Date(session.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="text-text-placeholder"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span className="text-body-caption-medium text-text-subheading">
                  {session.start_time?.slice(0, 5)} -{" "}
                  {session.end_time?.slice(0, 5)} PM
                </span>
              </div>
            </div>

            <div>
              <p className="text-body-sm-bold text-text-subheading">
                Complaint
              </p>
              <p className="text-body-base-medium text-text-body">
                {session.complaint ||
                  "No clinical notes drafted yet for this complaint."}
              </p>
            </div>
          </div>
        </div>

        {/* Diagnose Section */}
        <div className="bg-white rounded-xl border border-border-default p-6 space-y-4.5 ">
          <h3 className="text-body-xl-semibold text-text-body">
            Diagnose {session.status === "draft" && "(Draft)"}
          </h3>
          <div className="w-full min-h-40 rounded-2xl border border-dashed border-border-default bg-surface-default flex flex-col items-center justify-start">
            {diagnose ? (
              <div className="w-full p-6 text-left">
                <p className="text-body-base-medium text-text-heading whitespace-pre-wrap">
                  {diagnose}
                </p>
              </div>
            ) : (
              <div className="py-14 px-6 text-center space-y-2">
                <h4 className="text-body-base-bold text-text-heading">
                  No clinical diagnose drafted yet.
                </h4>
                <p className="text-body-sm-medium text-text-placeholder max-w-sm">
                  You haven&apos;t added your diagnose for this session. Click Edit to start.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-xl border border-border-default p-6 space-y-4.5 ">
          <h3 className="text-body-xl-semibold text-text-body">
            Psychiatry&apos;s Feedback {session.status === "draft" && "(Draft)"}
          </h3>
          <div className="w-full min-h-40 rounded-2xl border border-dashed border-border-default bg-surface-default flex flex-col items-center justify-start">
            {feedback ? (
              <div className="w-full p-6 text-left">
                <p className="text-body-base-medium text-text-heading whitespace-pre-wrap">
                  {feedback}
                </p>
              </div>
            ) : (
              <div className="py-14 px-6 text-center space-y-2">
                <h4 className="text-body-base-bold text-text-heading">
                  No clinical feedback drafted yet.
                </h4>
                <p className="text-body-sm-medium text-text-placeholder max-w-sm">
                  You haven&apos;t started your feedback for this session. Click Edit to start.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Medicine Section */}
        <div className="bg-white rounded-xl border border-border-default p-6 space-y-4.5 ">
          <div className="flex justify-between items-center">
            <h3 className="text-body-xl-semibold text-text-body">
              Medicine {session.status === "draft" && "(Draft)"}
            </h3>
          </div>

          {medicines && medicines.length > 0 ? (
            <div className="grid grid-cols-2 gap-4.5">
              {medicines.map((med: any, idx: number) => (
                <MedicineCard
                  key={idx}
                  name={med.name}
                  dose={med.dose}
                  use={med.use}
                  notes={med.notes}
                  isEditable={false}
                />
              ))}
            </div>
          ) : (
            <div className="w-full py-14 px-6 rounded-2xl border border-dashed border-border-default bg-surface-default flex flex-col items-center justify-center text-center space-y-2">
              <h4 className="text-body-base-bold text-text-heading">
                No medication added to this prescription.
              </h4>
              <p className="text-body-sm-medium text-text-placeholder max-w-sm">
                No medicine has been prescribed for this patient yet. Click Edit to manage prescription.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
