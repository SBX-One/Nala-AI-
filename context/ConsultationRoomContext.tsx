"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ConsultationRoomContextType {
  diagnoseDraft: string;
  setDiagnoseDraft: (value: string) => void;
  consultationNotes: string;
  setConsultationNotes: (value: string) => void;
  roomId: number | null;
  setRoomId: (id: number) => void;
  roomStatus: string | null;
  setRoomStatus: (status: string) => void;
  patientProfile: any | null;
  setPatientProfile: (profile: any) => void;
  medicationHistory: any[];
  setMedicationHistory: (history: any[]) => void;
  aiSummary: string | null;
  setAiSummary: (summary: string) => void;
  sessionAiSummary: string;
  setSessionAiSummary: (value: string) => void;
  consultationContext: string;
  setConsultationContext: (value: string) => void;
  observationNotes: string;
  setObservationNotes: (value: string) => void;
  prescribedMedicines: any[];
  setPrescribedMedicines: (medicines: any[]) => void;
  psychiatristFeedback: string;
  setPsychiatristFeedback: (value: string) => void;
  resetConsultationData: () => void;
}

const ConsultationRoomContext = createContext<
  ConsultationRoomContextType | undefined
>(undefined);

export function ConsultationRoomProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [diagnoseDraft, setDiagnoseDraft] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [roomId, setRoomId] = useState<number | null>(null);
  const [roomStatus, setRoomStatus] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<any | null>(null);
  const [medicationHistory, setMedicationHistory] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [sessionAiSummary, setSessionAiSummary] = useState<string>("");
  const [consultationContext, setConsultationContext] = useState<string>("");
  const [observationNotes, setObservationNotes] = useState<string>("");
  const [prescribedMedicines, setPrescribedMedicines] = useState<any[]>([]);
  const [psychiatristFeedback, setPsychiatristFeedback] = useState<string>("");

  const resetConsultationData = () => {
    setDiagnoseDraft("");
    setConsultationNotes("");
    setSessionAiSummary("");
    setConsultationContext("");
    setObservationNotes("");
    setPrescribedMedicines([]);
    setPsychiatristFeedback("");
  };

  return (
    <ConsultationRoomContext.Provider
      value={{
        diagnoseDraft,
        setDiagnoseDraft,
        consultationNotes,
        setConsultationNotes,
        roomId,
        setRoomId,
        roomStatus,
        setRoomStatus,
        patientProfile,
        setPatientProfile,
        medicationHistory,
        setMedicationHistory,
        aiSummary,
        setAiSummary,
        sessionAiSummary,
        setSessionAiSummary,
        consultationContext,
        setConsultationContext,
        observationNotes,
        setObservationNotes,
        prescribedMedicines,
        setPrescribedMedicines,
        psychiatristFeedback,
        setPsychiatristFeedback,
        resetConsultationData,
      }}
    >
      {children}
    </ConsultationRoomContext.Provider>
  );
}

export function useConsultationRoom() {
  const context = useContext(ConsultationRoomContext);
  if (context === undefined) {
    throw new Error(
      "useConsultationRoom must be used within a ConsultationRoomProvider",
    );
  }
  return context;
}
