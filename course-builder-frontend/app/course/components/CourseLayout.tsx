"use client";

import React from "react";
import { SplitPane } from "./layout/SplitPane";
import { CourseHeader } from "./layout/CourseHeader";
import { CourseSidebar } from "./layout/CourseSidebar";
import { useCourseBuildStore } from "../store/useCourseBuildStore";
import { LoadingState } from "./status/LoadingState";
import { ErrorState } from "./status/ErrorState";
import { CourseViewer } from "./CourseViewer";

export function CourseLayout() {
  const { status, error } = useCourseBuildStore();

  let rightPane: React.ReactNode;
  let leftPane: React.ReactNode = null;

  const isBuilding =
    status === "loading" ||
    status === "planning" ||
    status === "youtube" ||
    status === "ranking" ||
    status === "finalizing";

  // -----------------------------
  // 1) LOADING (build in progress)
  // -----------------------------
  if (isBuilding) {
    rightPane = <LoadingState />;
  }

  // -----------------------------
  // 2) ERROR DISPLAY
  // -----------------------------
  else if (status === "error") {
    rightPane = <ErrorState message={error || "Something went wrong"} />;
  }

  // -----------------------------
  // 3) SUCCESS → Show course
  // -----------------------------
  else if (status === "success") {
    leftPane = <CourseSidebar />;

    rightPane = (
      <div className="flex flex-col h-full">
        <CourseHeader />
        <div className="flex-1 overflow-y-auto custom-scroll-sm">
          <CourseViewer />
        </div>
      </div>
    );
  }

  // -----------------------------
  // 4) IDLE (before generate)
  // -----------------------------
  else {
    rightPane = (
      <div className="p-6 text-gray-400 text-sm">
        Your course will appear here once you start building.
      </div>
    );
  }

  return <SplitPane left={leftPane} right={rightPane} />;
}