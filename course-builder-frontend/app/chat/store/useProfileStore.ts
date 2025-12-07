"use client";

import { create } from "zustand";
import { Profile } from "../types/profile";

interface ProfileState {
  step: number;
  submitted: boolean;
  profile: Profile;

  setStep: (n: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  updateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;

  finish: () => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  step: 1,
  submitted: false,

  profile: {
    topic: null,
    skillLevel: null,
    goalType: null,
    goalDetail: "",
    hoursPerDay: null,
    daysPerWeek: null,
    durationPreference: "",
    learningStyle: null,
    videoLength: null,
    wantsQuizzes: null,
    wantsProjects: null,
    favoriteChannels: "",
    avoidChannels: "",
    language: "English",
    needsSubtitles: null,
    hardwareConstraints: "",
    motivation: null,
    structurePreference: null,
  },

  setStep: (n) => set({ step: n }),

  nextStep: () => {
    set((state) => ({ step: Math.min(state.step + 1, 8) }));
  },

  prevStep: () => {
    set((state) => ({ step: Math.max(state.step - 1, 1) }));
  },

  updateProfile: (key, value) =>
    set((state) => ({
      profile: { ...state.profile, [key]: value },
    })),

  finish: () => set({ submitted: true }),

  reset: () =>
    set({
      step: 1,
      submitted: false,
      profile: {
        topic: null,
        skillLevel: null,
        goalType: null,
        goalDetail: "",
        hoursPerDay: null,
        daysPerWeek: null,
        durationPreference: "",
        learningStyle: null,
        videoLength: null,
        wantsQuizzes: null,
        wantsProjects: null,
        favoriteChannels: "",
        avoidChannels: "",
        language: "English",
        needsSubtitles: null,
        hardwareConstraints: "",
        motivation: null,
        structurePreference: null,
      },
    }),
}));
