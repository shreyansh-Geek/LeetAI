"use client";

import { create } from "zustand";

interface CourseUIState {
  activeModuleIndex: number; // which module the user is viewing
  sidebarOpen: boolean;

  setActiveModule: (index: number) => void;
  toggleSidebar: () => void;
}

export const useCourseStore = create<CourseUIState>((set) => ({
  activeModuleIndex: 0,
  sidebarOpen: true,

  setActiveModule: (index) => set({ activeModuleIndex: index }),
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
