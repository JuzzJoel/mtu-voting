"use client";

import { create } from "zustand";

type OnboardingState = {
  step: 1 | 2 | 3;
  name: string;
  level: string;
  department: string;
  setField: (key: "name" | "level" | "department", value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 1,
  name: "",
  level: "",
  department: "",
  setField: (key, value) => set({ [key]: value } as Partial<OnboardingState>),
  nextStep: () => set({ step: Math.min(3, get().step + 1) as 1 | 2 | 3 }),
  prevStep: () => set({ step: Math.max(1, get().step - 1) as 1 | 2 | 3 }),
  reset: () => set({ step: 1, name: "", level: "", department: "" })
}));
