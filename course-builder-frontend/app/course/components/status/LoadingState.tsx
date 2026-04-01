"use client";

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCourseBuildStore } from "../../store/useCourseBuildStore";

const stepList = [
  {
    key: "planning",
    title: "Planning your roadmap",
    desc: "Designing modules tailored to your goals…",
  },
  {
    key: "youtube",
    title: "Fetching videos",
    desc: "Searching high-quality, relevant content…",
  },
  {
    key: "ranking",
    title: "Ranking & scoring",
    desc: "Matching content to your preferences…",
  },
  {
    key: "finalizing",
    title: "Finalizing course",
    desc: "Polishing the roadmap and assembling results…",
  },
];

// Map steps → progress ranges for smooth animation
const progressRanges: Record<string, [number, number]> = {
  planning: [0, 25],
  youtube: [25, 55],
  ranking: [55, 80],
  finalizing: [80, 95],
  success: [100, 100],
};

export function LoadingState() {
  const status = useCourseBuildStore((s) => s.status);
  const [smooth, setSmooth] = useState(0);

  // map SSE step → correct index
  const stepIndex = useMemo(() => {
    return Math.max(0, stepList.findIndex((s) => s.key === status));
  }, [status]);

  // animate progress continuously inside step range
  useEffect(() => {
    const [min, max] = progressRanges[status] || [0, 0];

    const interval = setInterval(() => {
      setSmooth((p) => {
        if (p < max) return p + 0.4; // smooth movement
        return p; // stop at step ceiling
      });
    }, 60);

    return () => clearInterval(interval);
  }, [status]);

  const activeStep = stepList[stepIndex];
  const progress = Math.min(smooth, 100);

  return (
    <div className="h-full flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          w-full max-w-xl
          bg-[#0A0A0A]/70 backdrop-blur-xl
          border border-[#1f1f1f]
          rounded-2xl p-8 shadow-2xl
          relative overflow-hidden
        "
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#24CFA6]/10 to-transparent pointer-events-none" />

        {/* Header */}
        <h2 className="text-2xl font-bold text-[#24CFA6]">
          Building your course…
        </h2>

        {/* AI "thinking" dots */}
        <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
          AI is assembling your personalized roadmap
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="text-[#24CFA6]"
          >
            ● ● ●
          </motion.span>
        </p>

        {/* Progress Bar */}
        <div className="w-full mt-6 h-2 rounded-full bg-[#1b1b1b] overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25 }}
            className="h-full bg-[#24CFA6] rounded-full shadow-[0_0_10px_#24CFA6]"
          />
        </div>

        {/* Steps */}
        <div className="mt-8 space-y-4">
          {stepList.map((step, idx) => {
            const active = idx === stepIndex;
            const done = idx < stepIndex;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="flex items-start gap-3"
              >
                <div
                  className={`
                    mt-1 w-3 h-3 rounded-full transition-all
                    ${
                      done
                        ? "bg-[#24CFA6]"
                        : active
                        ? "bg-[#24CFA6]/80 animate-pulse"
                        : "bg-gray-600"
                    }
                  `}
                />

                <div>
                  <p
                    className={`text-sm font-medium ${
                      active ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pulsing bottom highlight */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1 bg-[#24CFA6]/40"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.div>
    </div>
  );
}
