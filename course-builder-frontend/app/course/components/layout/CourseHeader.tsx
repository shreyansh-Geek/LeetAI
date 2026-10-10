"use client";

import { useCourseStore } from "../../store/useCourseStore";
import { useCourseBuildStore } from "../../store/useCourseBuildStore";
import {
  ArrowLeftCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function CourseHeader() {
  const router = useRouter();

  const { sidebarOpen, toggleSidebar } = useCourseStore();
  const { reset, course } = useCourseBuildStore();

  const courseTitle =
    course?.title?.trim() || "Your Learning Roadmap";

  return (
    <header className="w-full h-14 border-b border-[#1f1f1f] bg-[#0d0d0d] flex items-center justify-between px-5 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            reset();
            router.push("/chat");
          }}
          className="text-gray-300 hover:text-white transition"
          aria-label="Back to chat"
        >
          <ArrowLeftCircle className="w-6 h-6" />
        </button>

        <h1 className="font-semibold text-white text-lg">
          {courseTitle}
        </h1>
      </div>

      <button
        onClick={toggleSidebar}
        className="text-gray-400 hover:text-white transition"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="w-5 h-5" />
        ) : (
          <PanelLeftOpen className="w-5 h-5" />
        )}
      </button>
    </header>
  );
}
