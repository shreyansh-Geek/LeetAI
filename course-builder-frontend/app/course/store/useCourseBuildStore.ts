"use client";

import { create } from "zustand";
import { CourseBuildResponse } from "../types/course";
import { Profile } from "@/app/chat/types/profile";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useAuthStore } from "@/store/useAuthStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

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
    console.log("🚀 startBuild() triggered (SSE MODE)");
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
      const token = useAuthStore.getState().token;
      const res = await fetch(`${BASE_URL}/course-build/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          profile,
          userSummary,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream available.");

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process fully received SSE messages separated by double newlines
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const completeEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2); // rest of buffer

          if (completeEvent.startsWith("data: ")) {
            const jsonStr = completeEvent.substring(6);
            try {
              const data = JSON.parse(jsonStr);
              if (data.status === "success") {
                set({ status: "success", course: data.course, error: null });
                console.log("✅ Course build complete:", data.course);
              } else if (data.status === "error") {
                set({ status: "error", error: data.message });
              } else {
                set({ status: data.status as BuildStatus });
              }
            } catch (err) {
              console.error("JSON parse error on streaming chunk:", err);
            }
          }
          boundary = buffer.indexOf("\n\n");
        }
      }

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
