"use client";

import React from "react";
import { useCourseStore } from "../../store/useCourseStore";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function SplitPane({ left, right }: SplitPaneProps) {
  const { sidebarOpen } = useCourseStore();

  return (
    <div className="w-full h-screen flex overflow-hidden bg-[#0d0d0d] text-white">

      {/* LEFT PANE */}
      <div
        className={`transition-all duration-300
          ${sidebarOpen ? "w-[28%] max-w-[360px]" : "w-0"} 
          border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col`}
      >
        {sidebarOpen && left}
      </div>

      {/* RIGHT PANE */}
      <div className="flex-1 overflow-y-auto">
        {right}
      </div>
    </div>
  );
}
