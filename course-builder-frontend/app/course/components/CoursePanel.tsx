"use client";

import { useCourseBuildStore } from "../store/useCourseBuildStore";
import { LoadingState } from "./status/LoadingState";
import { ErrorState } from "./status/ErrorState";
import { CourseViewer } from "./CourseViewer";
import { CourseHeader } from "./layout/CourseHeader";

export default function CoursePanel() {
  const { status, error, course } = useCourseBuildStore();

  const isBuilding =
    status === "loading" ||
    status === "planning" ||
    status === "youtube" ||
    status === "ranking" ||
    status === "finalizing";

  if (isBuilding) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#050505]">
        <LoadingState />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#050505]">
        <ErrorState message={error || "Something went wrong."} />
      </div>
    );
  }

  // No build yet
  if (!course || status === "idle") {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#050505]">
        <div className="max-w-md text-center text-slate-300 px-6">
          <h2 className="text-xl font-semibold mb-2">
            Your course will appear here
          </h2>
          <p className="text-sm text-slate-400">
            Complete the onboarding on the left, confirm your summary, and hit{" "}
            <span className="text-[#24CFA6] font-medium">
              &quot;Start Building&quot;
            </span>{" "}
            to generate your personalized roadmap.
          </p>
        </div>
      </div>
    );
  }

  // Success – show header + viewer
  return (
    <div className="h-full flex flex-col bg-[#050505]">
      <CourseHeader />
      <div className="flex-1 overflow-y-auto custom-scroll-sm">
        <CourseViewer />
      </div>
    </div>
  );
}
