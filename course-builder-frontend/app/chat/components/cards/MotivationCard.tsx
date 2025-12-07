"use client";

import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { StructurePreference } from "../../types/profile";

export default function MotivationCard() {
  const updatePending = useChatStore((s) => s.updatePendingCardField);
  const completeCard = useChatStore((s) => s.completeCardAndSubmit);

  const [mot, setMot] = useState("");
  const [structure, setStructure] = useState<StructurePreference | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function allFilled() {
    return mot.trim() !== "" && structure !== null;
  }

  async function trySubmit() {
    if (!allFilled() || isSubmitting) return;

    const parsed = Number(mot);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10) return;

    setIsSubmitting(true);

    updatePending("motivation", parsed);
    updatePending("structurePreference", structure!);

    await Promise.resolve();
    await completeCard();
  }

  return (
    <div
      className="
        animate-cardRise rounded-2xl p-6 space-y-5
        bg-[#050808]/70 border border-[#24CFA6]/20 
        backdrop-blur-xl shadow-[0_0_24px_rgba(36,207,166,0.12)]
      "
    >
      <h3 className="text-sm font-semibold text-[#24CFA6]">
        Motivation & Learning Structure
      </h3>

      {/* Motivation */}
      <div>
        <label className="block text-xs text-slate-300 mb-1">
          Motivation (1–10)
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={mot}
          onChange={(e) => setMot(e.target.value)}
          onBlur={trySubmit}
          placeholder="e.g. 7"
          className="
            w-full px-3 py-2 rounded-lg text-sm text-slate-100
            bg-[#0a0f0e]/70 border border-[#24CFA6]/25
            outline-none placeholder:text-slate-400/60
            focus:border-[#24CFA6]/40 focus:shadow-[0_0_12px_rgba(36,207,166,0.25)]
          "
        />
      </div>

      {/* Structure Preference */}
      <div>
        <label className="block text-xs text-slate-300 mb-1">
          Preferred learning structure
        </label>

        <div className="flex gap-3">
          {["strict", "flexible"].map((opt) => (
            <button
              key={opt}
              disabled={isSubmitting}
              onClick={async () => {
                setStructure(opt as StructurePreference);
                await Promise.resolve();
                trySubmit();
              }}
              className={`
                px-3 py-2 text-xs rounded-lg border transition
                ${
                  structure === opt
                    ? "bg-[#24CFA6]/90 text-black border-[#24CFA6]/70 shadow-[0_0_15px_rgba(36,207,166,0.35)]"
                    : "bg-[#0a0f0e]/70 border-[#24CFA6]/25 text-slate-200 hover:bg-[#0f1a18]"
                }
              `}
            >
              {opt === "strict" ? "Strict / disciplined" : "Flexible / relaxed"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
