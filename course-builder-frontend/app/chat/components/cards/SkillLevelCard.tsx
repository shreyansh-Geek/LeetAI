"use client";

import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { SkillLevel } from "../../types/profile";

export default function SkillLevelCard() {
  const updatePending = useChatStore((s) => s.updatePendingCardField);
  const completeCard = useChatStore((s) => s.completeCardAndSubmit);

  const [submitted, setSubmitted] = useState(false);

  const options = [
    {
      label: "Absolute Beginner",
      value: "absolute-beginner",
      description: "New to coding / DSA. Starting from scratch.",
    },
    {
      label: "Beginner",
      value: "beginner",
      description: "Know basics but not confident.",
    },
    {
      label: "Intermediate",
      value: "intermediate",
      description: "Comfortable coding, solved some problems.",
    },
    {
      label: "Advanced",
      value: "advanced",
      description: "Strong problem-solving, want depth.",
    },
  ];

  function handleSelect(level: SkillLevel) {
    if (submitted) return;
    setSubmitted(true);
    updatePending("skillLevel", level);
    completeCard();
  }

  return (
    <div
      className="
        animate-cardRise rounded-2xl p-6
        bg-[#050808]/70 border border-[#24CFA6]/20 
        backdrop-blur-xl shadow-[0_0_24px_rgba(36,207,166,0.12)]
      "
    >
      <h3 className="text-sm font-semibold text-[#24CFA6] mb-3">
        Where are you right now with DSA?
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            disabled={submitted}
            onClick={() => handleSelect(opt.value as SkillLevel)}
            className={`
              text-left px-4 py-3 rounded-xl border transition
              ${
                submitted
                  ? "bg-black/40 border-[#24CFA6]/10 text-slate-500 cursor-not-allowed"
                  : "bg-[#0a0f0e]/70 border-[#24CFA6]/25 text-slate-200 hover:bg-[#0f1a18]"
              }
            `}
          >
            <div className="font-medium">{opt.label}</div>
            <div className="text-xs mt-1 text-slate-400">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
