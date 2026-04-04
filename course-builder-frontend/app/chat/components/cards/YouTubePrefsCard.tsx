"use client";

import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";

export default function YouTubePrefsCard() {
  const updatePending = useChatStore((s) => s.updatePendingCardField);
  const completeCard = useChatStore((s) => s.completeCardAndSubmit);

  const [fav, setFav] = useState("");
  const [avoid, setAvoid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function saveAll() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // If left empty, set to "None" so the backend LLM loop breaks and recognizes them as complete
    updatePending("favoriteChannels", fav.trim() || "None");
    updatePending("avoidChannels", avoid.trim() || "None");

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
        YouTube Preferences
      </h3>

      {/* Favorite Channels */}
      <div>
        <label className="text-xs text-slate-300 mb-1 block">Favorite channels (optional)</label>
        <input
          value={fav}
          onChange={(e) => setFav(e.target.value)}
          placeholder="e.g., Hitesh Choudhary, Fireship"
          className="
            w-full bg-[#0a0f0e]/70 border border-[#24CFA6]/25 rounded-xl
            px-3 py-2 text-sm text-slate-200 outline-none
            focus:border-[#24CFA6]
          "
        />
      </div>

      {/* Avoid Channels */}
      <div>
        <label className="text-xs text-slate-300 mb-1 block">Channels to avoid (optional)</label>
        <input
          value={avoid}
          onChange={(e) => setAvoid(e.target.value)}
          placeholder="e.g., long unstructured tutorials"
          className="
            w-full bg-[#0a0f0e]/70 border border-[#24CFA6]/25 rounded-xl
            px-3 py-2 text-sm text-slate-200 outline-none
            focus:border-[#24CFA6]
          "
        />
      </div>

      <button
        onClick={saveAll}
        disabled={isSubmitting}
        className="
          w-full py-2 rounded-xl text-sm
          bg-[#24CFA6] text-black font-medium
          hover:bg-[#1fb893] transition
          shadow-[0_0_18px_rgba(36,207,166,0.25)]
          disabled:opacity-40
        "
      >
        Save YouTube Preferences
      </button>
    </div>
  );
}
