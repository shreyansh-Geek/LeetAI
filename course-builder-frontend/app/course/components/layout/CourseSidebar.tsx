"use client";

import { useEffect, useRef } from "react";
import { useCourseBuildStore } from "../../store/useCourseBuildStore";
import { useCourseStore } from "../../store/useCourseStore";
import { cn } from "@/Lib/utils";

export function CourseSidebar() {
  const { course } = useCourseBuildStore();
  const { activeModuleIndex, setActiveModule } = useCourseStore();

  // Refs for scrolling active item
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Scroll active module into view
  useEffect(() => {
    const activeEl = itemRefs.current[activeModuleIndex];
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeModuleIndex]);

  if (!course) return null;

  return (
    <aside
      className="
        w-full h-full bg-[#0d0d0d]
        border-r border-[#1f1f1f]
        overflow-y-auto custom-scroll-sm
        flex flex-col
      "
    >
      {/* Sticky header */}
      <div className="sticky top-0 bg-[#0d0d0d] z-10 pb-2 pt-3">
        <h2 className="text-lg font-semibold text-[#24CFA6] px-4">
          Modules
        </h2>
      </div>

      {/* Module List */}
      <div className="px-4 space-y-2 pb-6">
        {course?.modules?.map((m, i) => {
          const active = i === activeModuleIndex;

          return (
            <button
  key={i}
  ref={(el) => {
    itemRefs.current[i] = el; // ← now returns void
  }}
  onClick={() => setActiveModule(i)}
  className={cn(
    "block w-full text-left px-3 py-2 rounded-md border transition relative",
    "focus:outline-none focus:ring-2 focus:ring-[#24CFA6]/60",
    "hover:-translate-y-px hover:shadow-lg hover:shadow-[#24CFA6]/10",

    active
      ? "bg-[#151515] border-[#24CFA6] text-white shadow-[0_0_10px_#24CFA6]/30"
      : "bg-[#0f0f0f] border-[#1f1f1f] text-gray-300 hover:bg-[#151515] hover:border-[#24CFA6]/40"
  )}
>

              {/* Active glow pulse animation */}
              {active && (
                <span className="absolute inset-0 rounded-md animate-pulse bg-[#24CFA6]/5 pointer-events-none"></span>
              )}

              {i + 1}. {m.title}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
