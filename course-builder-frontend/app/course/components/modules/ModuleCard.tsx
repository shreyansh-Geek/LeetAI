"use client";

import { useCourseStore } from "../../store/useCourseStore";
import { ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { CourseModule } from "../../types/module";
import { ModuleVideoList } from "./ModuleVideoList";
import { motion, AnimatePresence } from "framer-motion";
import { fadeSlide } from "../animations/fadeSlide";

interface ModuleCardProps {
  module: CourseModule;
  index: number;
  forceOpen?: boolean; // auto-open when active
}

export function ModuleCard({ module, index, forceOpen }: ModuleCardProps) {
  const { activeModuleIndex, setActiveModule } = useCourseStore();

  const isActive = activeModuleIndex === index - 1;
  const open = forceOpen || isActive;

  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5 shadow-md transition hover:border-[#24CFA6]/40">

      {/* HEADER */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setActiveModule(index - 1)}
      >
        <div>
          <h3 className="text-lg font-semibold text-white">
            {index}. {module.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{module.duration}</p>
        </div>

        {open ? (
          <ChevronUp className="text-gray-300" />
        ) : (
          <ChevronDown className="text-gray-300" />
        )}
      </div>

      {/* DESCRIPTION */}
      <p className="text-gray-300 mt-3 text-sm leading-relaxed">
        {module.description}
      </p>

      {/* OUTCOMES */}
      <ul className="mt-3 text-gray-400 text-sm list-disc list-inside space-y-1">
        {module.outcomes?.map((o, i) => <li key={i}>{o}</li>)}
      </ul>

      {/* EXPAND SECTION */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="module-content"
            className="mt-4"
            variants={fadeSlide}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-[#24CFA6]" />
              Videos
            </h4>

            <ModuleVideoList videos={module.videos} />

            <motion.div layout transition={{ duration: 0.3 }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
