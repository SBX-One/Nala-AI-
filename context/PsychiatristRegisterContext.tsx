"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Sex = "male" | "female";
export type Step = "personal" | "professional" | "complete" | "availability";

interface Availability {
  day: string;
  label: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface FormData {
  fullName: string;
  sex: Sex | "";
  avatarUrl: string;
  description: string;
  specialization: string;
  licenseNumber: string;
  price: string;
  experienceStart: string;
  experienceEnd: string;
  selectedExpertiseIds: number[];
}

interface PsychiatristRegisterContextType {
  step: Step;
  setStep: (step: Step) => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  availability: Availability[];
  setAvailability: React.Dispatch<React.SetStateAction<Availability[]>>;
  resetForm: () => void;
  isPersonalValid: boolean;
  isProfessionalValid: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  sex: "",
  avatarUrl: "",
  description: "",
  specialization: "",
  licenseNumber: "",
  price: "",
  experienceStart: "",
  experienceEnd: "",
  selectedExpertiseIds: [],
};

const initialAvailability: Availability[] = [
  { day: "monday", label: "Monday", startTime: "09:00", endTime: "17:00", enabled: true },
  { day: "tuesday", label: "Tuesday", startTime: "09:00", endTime: "17:00", enabled: true },
  { day: "wednesday", label: "Wednesday", startTime: "09:00", endTime: "17:00", enabled: true },
  { day: "thursday", label: "Thursday", startTime: "09:00", endTime: "17:00", enabled: true },
  { day: "friday", label: "Friday", startTime: "09:00", endTime: "17:00", enabled: true },
  { day: "saturday", label: "Saturday", startTime: "09:00", endTime: "17:00", enabled: false },
  { day: "sunday", label: "Sunday", startTime: "09:00", endTime: "17:00", enabled: false },
];

const PsychiatristRegisterContext = createContext<PsychiatristRegisterContextType | undefined>(undefined);

export const PsychiatristRegisterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<Step>("personal");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [availability, setAvailability] = useState<Availability[]>(initialAvailability);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("psychiatrist_register_form");
    const savedStep = localStorage.getItem("psychiatrist_register_step");
    const savedAvailability = localStorage.getItem("psychiatrist_register_availability");

    if (savedData) setFormData(JSON.parse(savedData));
    if (savedStep) setStep(savedStep as Step);
    if (savedAvailability) setAvailability(JSON.parse(savedAvailability));
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("psychiatrist_register_form", JSON.stringify(formData));
      localStorage.setItem("psychiatrist_register_step", step);
      localStorage.setItem("psychiatrist_register_availability", JSON.stringify(availability));
    }
  }, [formData, step, availability, isLoaded]);

  const resetForm = () => {
    setFormData(initialFormData);
    setAvailability(initialAvailability);
    setStep("personal");
    localStorage.removeItem("psychiatrist_register_form");
    localStorage.removeItem("psychiatrist_register_step");
    localStorage.removeItem("psychiatrist_register_availability");
  };

  const isPersonalValid =
    formData.fullName.trim() !== "" &&
    formData.sex !== "" &&
    formData.description.trim() !== "";

  const isProfessionalValid =
    formData.experienceStart !== "" &&
    formData.price !== "" &&
    formData.specialization !== "";

  return (
    <PsychiatristRegisterContext.Provider
      value={{
        step,
        setStep,
        formData,
        setFormData,
        availability,
        setAvailability,
        resetForm,
        isPersonalValid,
        isProfessionalValid,
      }}
    >
      {children}
    </PsychiatristRegisterContext.Provider>
  );
};

export const usePsychiatristRegister = () => {
  const context = useContext(PsychiatristRegisterContext);
  if (context === undefined) {
    throw new Error("usePsychiatristRegister must be used within a PsychiatristRegisterProvider");
  }
  return context;
};
