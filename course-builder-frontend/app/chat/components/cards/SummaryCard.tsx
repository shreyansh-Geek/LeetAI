"use client";

import { useProfileStore } from "../../store/useProfileStore";
import { useChatStore } from "../../store/useChatStore";

export default function SummaryCard() {
  const profile = useProfileStore((s) => s.profile);
  const setShowFinalModal = useChatStore((s) => s.setShowFinalModal);

  const fields = [
    ["Subject", profile.topic || "—"],
    ["Skill Level", profile.skillLevel],
    ["Goal", profile.goalType],
    ["Detail", profile.goalDetail || "—"],
    ["Hours / Day", profile.hoursPerDay],
    ["Days / Week", profile.daysPerWeek],
    ["Duration", profile.durationPreference],
    ["Learning Style", profile.learningStyle],
    ["Video Length", profile.videoLength],
    ["Quizzes", profile.wantsQuizzes ? "Yes" : "No"],
    ["Projects", profile.wantsProjects ? "Yes" : "No"],
    ["Fav Channels", profile.favoriteChannels || "—"],
    ["Avoid", profile.avoidChannels || "—"],
    ["Language", profile.language],
    ["Subtitles", profile.needsSubtitles ? "Yes" : "No"],
    ["Hardware", profile.hardwareConstraints || "—"],
    ["Motivation", profile.motivation],
    ["Structure", profile.structurePreference],
  ];

  return (
    <div
      className="
        animate-cardRise rounded-2xl p-6 space-y-6 
        bg-[#050808]/70 border border-[#24CFA6]/20
        backdrop-blur-xl shadow-[0_0_24px_rgba(36,207,166,0.12)]
      "
    >
      <h3 className="text-sm font-semibold text-[#24CFA6]">
        Review Your Preferences
      </h3>

      <div className="space-y-2 text-xs">
        {fields.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between border-b border-[#24CFA6]/10 pb-1"
          >
            <span className="text-slate-400">{label}</span>
            <span className="text-slate-200 truncate max-w-[150px] text-right">
              {String(value ?? "—")}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowFinalModal(true)}
        className="
          w-full py-2 rounded-xl 
          bg-[#24CFA6] text-black text-sm font-medium
          hover:bg-[#1fb893] transition
          shadow-[0_0_20px_rgba(36,207,166,0.35)]
        "
      >
        Looks Good — Continue
      </button>
    </div>
  );
}
