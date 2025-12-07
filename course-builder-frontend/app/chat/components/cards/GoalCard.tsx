"use client";

import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { GoalType } from "../../types/profile";

export default function GoalCard() {
  const updatePending = useChatStore((s) => s.updatePendingCardField);
  const completeCard = useChatStore((s) => s.completeCardAndSubmit);

  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [localDetail, setLocalDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options: { label: string; value: GoalType }[] = [
    { label: "Get a job / internship", value: "job" },
    { label: "Build projects", value: "projects" },
    { label: "College / exams", value: "college" },
    { label: "Freelance", value: "freelance" },
    { label: "Startup / product", value: "startup" },
    { label: "Learn as a hobby", value: "hobby" },
    { label: "Something else", value: "other" },
  ];

  async function selectPrimary(type: GoalType) {
    if (goalType !== null) return;
    setGoalType(type);
    updatePending("goalType", type);
    await Promise.resolve();
  }

  async function handleSubmit() {
    if (!goalType || isSubmitting) return;
    setIsSubmitting(true);

    if (localDetail.trim()) {
      updatePending("goalDetail", localDetail.trim());
    }

    await Promise.resolve();
    await completeCard();
  }

  return (
    <div
      className="
        animate-cardRise rounded-2xl p-6 space-y-5
        bg-[#050808]/70 border border-[#24CFA6]/20
        backdrop-blur-xl shadow-[0_0_22px_rgba(36,207,166,0.10)]
      "
    >
      <h3 className="text-sm font-semibold text-[#24CFA6]">
        What’s your primary goal?
      </h3>

      {/* Goal selections */}
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((opt) => {
          const active = goalType === opt.value;
          return (
            <button
              key={opt.value}
              disabled={goalType !== null}
              onClick={() => selectPrimary(opt.value)}
              className={`
                rounded-xl px-4 py-3 text-left text-sm transition border
                ${
                  active
                    ? "bg-[#24CFA6]/90 border-[#24CFA6]/80 text-black shadow-[0_0_18px_rgba(36,207,166,0.35)]"
                    : "bg-[#0a0f0e]/70 border-[#24CFA6]/20 text-slate-200 hover:bg-[#0f1a18]"
                }
                disabled:opacity-50 disabled:hover:bg-[#0a0f0e]
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Optional detail */}
      <div>
        <label className="block text-xs text-slate-300 mb-1">
          Add more detail (optional)
        </label>

        <input
          value={localDetail}
          onChange={(e) => setLocalDetail(e.target.value)}
          placeholder="e.g. Crack SDE internship in 6 months"
          className="
            w-full px-3 py-2 rounded-lg text-sm text-slate-100
            bg-[#0a0f0e]/70 border border-[#24CFA6]/20
            placeholder:text-slate-400/60 outline-none
            focus:border-[#24CFA6]/40 focus:shadow-[0_0_12px_rgba(36,207,166,0.25)]
          "
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!goalType || isSubmitting}
        className="
          w-full px-3 py-2 rounded-lg text-sm font-semibold
          bg-[#24CFA6]/90 text-black
          hover:bg-[#24CFA6] transition
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        Continue
      </button>
    </div>
  );
}
