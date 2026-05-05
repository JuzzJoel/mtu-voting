"use client";

import { create } from "zustand";

type AuthState = {
  email: string;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  setEmail: (email: string) => void;
  hydrateSession: (payload: { isAuthenticated: boolean; isOnboarded: boolean }) => void;
  logoutLocal: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  email: "",
  isAuthenticated: false,
  isOnboarded: false,
  setEmail: (email) => set({ email }),
  hydrateSession: ({ isAuthenticated, isOnboarded }) => set({ isAuthenticated, isOnboarded }),
  logoutLocal: () => set({ email: "", isAuthenticated: false, isOnboarded: false })
}));
