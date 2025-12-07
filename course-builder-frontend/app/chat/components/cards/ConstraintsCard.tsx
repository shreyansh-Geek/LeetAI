"use client";

import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import ToggleRow from "../ToggleRow";

export default function ConstraintsCard() {
  const updatePending = useChatStore((s) => s.updatePendingCardField);
  const completeCard = useChatStore((s) => s.completeCardAndSubmit);

  const [lang, setLang] = useState("");
  const [needsSubs, setNeedsSubs] = useState<boolean | null>(null);
  const [hardware, setHardware] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function canSubmit() {
    return lang.trim() !== "" && needsSubs !== null;
  }

  async function handleSubmit() {
    if (!canSubmit() || isSubmitting) return;

    setIsSubmitting(true);

    updatePending("language", lang.trim());
    updatePending("needsSubtitles", needsSubs);

    if (hardware.trim()) {
      updatePending("hardwareConstraints", hardware.trim());
    }

    await Promise.resolve();
    await completeCard();
  }

  return (
    <div
      className="
        animate-cardRise 
        rounded-2xl p-6 space-y-5 
        bg-[#050808]/70 border border-[#24CFA6]/20
        backdrop-blur-xl shadow-[0_0_22px_rgba(36,207,166,0.10)]
      "
    >
      <h3 className="text-sm font-semibold text-[#24CFA6]">
        Constraints & Accessibility
      </h3>

      {/* Language */}
      <div>
        <label className="block text-xs text-slate-300 mb-1">
          Preferred Language (required)
        </label>
        <input
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          placeholder="e.g., English, Hinglish"
          className="
            w-full px-3 py-2 rounded-lg text-sm text-slate-100
            bg-[#0a0f0e]/70 border border-[#24CFA6]/20 
            placeholder:text-slate-400/60 outline-none
            focus:border-[#24CFA6]/40 focus:shadow-[0_0_12px_rgba(36,207,166,0.25)]
          "
        />
      </div>

      {/* Subtitles */}
      <ToggleRow
        label="Do you need subtitles? (required)"
        value={needsSubs}
        onChange={(v) => setNeedsSubs(v)}
      />

      {/* Hardware */}
      <div>
        <label className="block text-xs text-slate-300 mb-1">
          Hardware constraints (optional)
        </label>
        <textarea
          value={hardware}
          onChange={(e) => setHardware(e.target.value)}
          placeholder="e.g., Low-end laptop, slow internet"
          className="
            w-full min-h-[80px] px-3 py-2 rounded-lg text-sm text-slate-100
            bg-[#0a0f0e]/70 border border-[#24CFA6]/20
            placeholder:text-slate-400/60 outline-none
            focus:border-[#24CFA6]/40 focus:shadow-[0_0_12px_rgba(36,207,166,0.25)]
          "
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit() || isSubmitting}
        className="
          w-full px-3 py-2 rounded-lg 
          text-sm font-semibold
          bg-[#24CFA6]/90 text-black
          hover:bg-[#24CFA6] transition
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-[0_8px_18px_rgba(0,0,0,0.65)]
        "
      >
        Continue
      </button>
    </div>
  );
}
