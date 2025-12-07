"use client";

import { useChatStore } from "../../store/useChatStore";

export default function FinalConfirmationCard() {
  const sendFinal = useChatStore((s) => s.sendFinalBuildRequest);
  const setShowFinalModal = useChatStore((s) => s.setShowFinalModal);

  async function handleStart() {
    await sendFinal();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowFinalModal(false)}
      />

      {/* Modal */}
      <div
        className="
          relative w-[90%] max-w-md space-y-4 p-6 rounded-2xl
          bg-[#050808]/85 backdrop-blur-xl 
          border border-[#24CFA6]/25
          shadow-[0_0_35px_rgba(36,207,166,0.25)]
          animate-cardRise
        "
      >
        <h2 className="text-center text-lg font-semibold text-[#24CFA6]">
          Ready to Build Your Course?
        </h2>

        <p className="text-center text-xs text-slate-300">
          You&apos;re all set — confirm to generate your personalized roadmap.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setShowFinalModal(false)}
            className="
              flex-1 py-2 text-xs rounded-xl
              bg-black/40 border border-[#24CFA6]/20 text-slate-200
              hover:bg-black/60 transition
            "
          >
            Go Back
          </button>

          <button
            onClick={handleStart}
            className="
              flex-1 py-2 text-xs rounded-xl
              font-semibold bg-[#24CFA6] text-black
              hover:bg-[#20b796] transition
              shadow-[0_8px_20px_rgba(0,0,0,0.7)]
            "
          >
            Start Building
          </button>
        </div>
      </div>
    </div>
  );
}
