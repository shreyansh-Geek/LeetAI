"use client";

import { create } from "zustand";
import { CourseBuildResponse } from "../types/course";
import { Profile } from "@/app/chat/types/profile";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type BuildStatus =
  | "idle"
  | "loading"
  | "planning"
  | "youtube"
  | "ranking"
  | "finalizing"
  | "success"
  | "error";

interface CourseBuildState {
  status: BuildStatus;
  error: string | null;
  course: CourseBuildResponse | null;

  startBuild: (
    router: AppRouterInstance,
    profile: Profile,
    userSummary?: string
  ) => void;

  reset: () => void;
}

export const useCourseBuildStore = create<CourseBuildState>((set) => ({
  status: "idle",
  error: null,
  course: null,

  /**
   * NON-SSE VERSION — simple POST request
   */
  startBuild: async (router, profile, userSummary = "") => {
    console.log("🚀 startBuild() triggered (NON-SSE MODE)");
    console.log("Profile passed:", profile);

    // UI loading immediately
    set({
      status: "loading",
      error: null,
      course: null,
    });

    // navigate to course screen
    router.push("/course");

    try {
      const res = await fetch(`${BASE_URL}/course-build/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          userSummary,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data: CourseBuildResponse = await res.json();

      set({
        status: "success",
        course: data,
        error: null,
      });

      console.log("✅ Course build complete:", data);
    } catch (err) {
      console.error("❌ Course build failed:", err);
      set({
        status: "error",
        error: "Failed to build course. Please try again.",
      });
    }
  },

  reset: () =>
    set({
      status: "idle",
      error: null,
      course: null,
    }),
}));
