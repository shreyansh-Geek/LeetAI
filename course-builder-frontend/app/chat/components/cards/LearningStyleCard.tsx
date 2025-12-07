"use client";

import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { LearningStyle, VideoLengthPreference } from "../../types/profile";
import ToggleRow from "../ToggleRow";

export default function LearningStyleCard() {
  const updatePending = useChatStore((s) => s.updatePendingCardField);
  const completeCard = useChatStore((s) => s.completeCardAndSubmit);

  // Typed local state
  const [localState, setLocalState] = useState<{
    learningStyle: LearningStyle | null;
    videoLength: VideoLengthPreference | null;
    wantsQuizzes: boolean | null;
    wantsProjects: boolean | null;
  }>({
    learningStyle: null,
    videoLength: null,
    wantsQuizzes: null,
    wantsProjects: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const learningOptions: LearningStyle[] = [
    "project-first",
    "theory-first",
    "balanced",
  ];

  const lengthOptions: VideoLengthPreference[] = ["short", "long", "mixed"];

  function allFilled(nextState = localState) {
    return (
      nextState.learningStyle &&
      nextState.videoLength &&
      nextState.wantsQuizzes !== null &&
      nextState.wantsProjects !== null
    );
  }

  // 🔥 Fully typed, no `any` used
  async function setField<K extends keyof typeof localState>(
    key: K,
    value: typeof localState[K]
  ) {
    if (isSubmitting) return;
    if (localState[key] !== null) return;

    const nextState = { ...localState, [key]: value };

    setLocalState(nextState);
    updatePending(key, value);

    await Promise.resolve();

    if (allFilled(nextState)) {
      setIsSubmitting(true);
      await completeCard();
    }
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
        Learning Style & Preferences
      </h3>

      {/* Learning Style */}
      <div>
        <label className="text-xs text-slate-300">Learning Style</label>
        <div className="grid md:grid-cols-3 gap-3 mt-2">
          {learningOptions.map((opt) => (
            <button
              key={opt}
              disabled={localState.learningStyle !== null || isSubmitting}
              onClick={() => setField("learningStyle", opt)}
              className="
                px-4 py-3 rounded-xl border text-sm transition
                bg-[#0a0f0e]/70 border-[#24CFA6]/25 text-slate-200 
                hover:bg-[#0f1a18]
                disabled:opacity-40 disabled:hover:bg-[#0a0f0e]
              "
            >
              {opt.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Video Length */}
      <div>
        <label className="text-xs text-slate-300">Video Length Preference</label>
        <div className="flex flex-wrap gap-3 mt-2">
          {lengthOptions.map((opt) => (
            <button
              key={opt}
              disabled={localState.videoLength !== null || isSubmitting}
              onClick={() => setField("videoLength", opt)}
              className="
                rounded-full px-4 py-1.5 text-xs border transition
                bg-[#0a0f0e]/70 border-[#24CFA6]/25 text-slate-200
                hover:bg-[#0f1a18]
                disabled:opacity-40 disabled:hover:bg-[#0a0f0e]
              "
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes & Projects */}
      <div className="grid md:grid-cols-2 gap-4">
        <ToggleRow
          label="Include quizzes"
          value={localState.wantsQuizzes}
          disabled={localState.wantsQuizzes !== null || isSubmitting}
          onChange={(v) => setField("wantsQuizzes", v)}
        />

        <ToggleRow
          label="Include mini projects"
          value={localState.wantsProjects}
          disabled={localState.wantsProjects !== null || isSubmitting}
          onChange={(v) => setField("wantsProjects", v)}
        />
      </div>
    </div>
  );
}
