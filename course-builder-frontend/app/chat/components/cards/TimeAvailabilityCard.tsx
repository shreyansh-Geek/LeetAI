"use client";

import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";

export default function TimeAvailabilityCard() {
  const updatePending = useChatStore((s) => s.updatePendingCardField);
  const completeCard = useChatStore((s) => s.completeCardAndSubmit);

  const [hours, setHours] = useState("");
  const [days, setDays] = useState("");
  const [duration, setDuration] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const durationOptions = ["2–4 weeks", "1–3 months", "3–6 months", "self-paced"];

  function allFilled() {
    return hours.trim() !== "" && days.trim() !== "" && duration !== null;
  }

  async function trySubmit() {
    if (!allFilled() || isSubmitting) return;

    const hoursNum = Number(hours);
    const daysNum = Number(days);

    if (hoursNum <= 0 || daysNum <= 0) return;

    setIsSubmitting(true);

    updatePending("hoursPerDay", hoursNum);
    updatePending("daysPerWeek", daysNum);
    updatePending("durationPreference", duration!);

    await Promise.resolve();
    await completeCard();
  }

  return (
    <div
      className="
        animate-cardRise rounded-2xl p-6 space-y-6
        bg-[#050808]/70 border border-[#24CFA6]/20
        backdrop-blur-xl shadow-[0_0_24px_rgba(36,207,166,0.12)]
      "
    >
      <h3 className="text-sm font-semibold text-[#24CFA6]">
        How much time can you commit?
      </h3>

      {/* Hours & Days */}
      <div className="grid md:grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Hours per day"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          onBlur={trySubmit}
          className="
            bg-[#0a0f0e]/70 border border-[#24CFA6]/25 rounded-xl px-3 py-2 
            text-sm text-slate-200 outline-none
            focus:border-[#24CFA6]
          "
        />

        <input
          type="number"
          placeholder="Days per week"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          onBlur={trySubmit}
          className="
            bg-[#0a0f0e]/70 border border-[#24CFA6]/25 rounded-xl px-3 py-2 
            text-sm text-slate-200 outline-none
            focus:border-[#24CFA6]
          "
        />
      </div>

      <h4 className="text-xs text-slate-300">Preferred overall duration</h4>

      {/* Duration Buttons */}
      <div className="grid gap-2">
        {durationOptions.map((opt) => {
          const active = duration === opt;
          return (
            <button
              key={opt}
              disabled={isSubmitting}
              onClick={async () => {
                setDuration(opt);
                await Promise.resolve();
                await trySubmit();
              }}
              className={`
                rounded-xl px-4 py-2 text-left text-sm transition
                ${
                  active
                    ? "bg-[#24CFA6]/90 border-[#24CFA6] text-black shadow-[0_0_12px_rgba(36,207,166,0.35)]"
                    : "bg-[#0a0f0e]/70 border border-[#24CFA6]/25 text-slate-200 hover:bg-[#0f1a18]"
                }
              `}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
