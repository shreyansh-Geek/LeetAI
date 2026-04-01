"use client";

import { useCourseBuildStore } from "../store/useCourseBuildStore";
import { useCourseStore } from "../store/useCourseStore";
import { ModuleCard } from "./modules/ModuleCard";
import { PlaylistCard } from "./playlist/PlaylistCard";

export function CourseViewer() {
  const { course } = useCourseBuildStore();
  const { activeModuleIndex } = useCourseStore();

  if (!course) return null;

  const activeModule = course.modules?.[activeModuleIndex];

  return (
    <div className="p-6 space-y-10 text-white">

      {/* SUMMARY */}
      {course.summary && (
        <section className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5 shadow-md">
          <h2 className="text-xl font-semibold text-[#24CFA6] mb-2">
            Course Summary
          </h2>
          <p className="text-gray-300 leading-relaxed">{course.summary}</p>
        </section>
      )}

      {/* ACTIVE MODULE ONLY */}
      {activeModule && (
        <ModuleCard
          module={activeModule}
          index={activeModuleIndex + 1}
          forceOpen
        />
      )}

      {/* PLAYLIST */}
      {course.playlist && (
        <PlaylistCard playlist={course.playlist} />
      )}
    </div>
  );
}
