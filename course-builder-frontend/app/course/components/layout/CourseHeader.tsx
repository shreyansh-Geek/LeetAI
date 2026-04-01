"use client";

import { useCourseStore } from "../../store/useCourseStore";
import { useCourseBuildStore } from "../../store/useCourseBuildStore";
import { ArrowLeftCircle, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export function CourseHeader() {
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useCourseStore();
  const { reset } = useCourseBuildStore();

  return (
    <header
      className="w-full h-14 border-b border-[#1f1f1f] bg-[#0d0d0d] 
                 flex items-center justify-between px-5 sticky top-0 z-20"
    >
      <div className="flex items-center gap-3">
        {/* Back button */}
        <button
          onClick={() => {
            reset();
            router.push("/chat");
          }}
          className="text-gray-300 hover:text-white transition"
        >
          <ArrowLeftCircle className="w-6 h-6" />
        </button>

        {/* Title */}
        <h1 className="font-semibold text-white text-lg">Your Custom DSA Roadmap</h1>
      </div>

      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="text-gray-400 hover:text-white transition"
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
