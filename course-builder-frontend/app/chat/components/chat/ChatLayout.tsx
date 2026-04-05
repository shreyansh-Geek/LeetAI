// app/chat/components/chat/ChatLayout.tsx
"use client";

import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useChatStore } from "../../store/useChatStore";
import FinalConfirmationCard from "../cards/FinalConfirmationCard";

export default function ChatLayout() {
  const showFinalModal = useChatStore((s) => s.showFinalModal);

  return (
    <div
      className="relative flex min-h-screen flex-col text-slate-100"
      style={{
        background:
          "radial-gradient(circle at top, #020b09 0%, #000000 45%, #000000 100%)",
      }}
    >
      {/* TOP CENTER MINT GLOW */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[-140px] h-[320px] opacity-[0.45]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(36,207,166,0.38), transparent 65%)",
          filter: "blur(26px)",
        }}
      />

      {/* LEFT MID-SIDE ASSISTANT MINT GLOW (NEW) */}
      <div
        className="pointer-events-none absolute left-[-120px] top-[260px] w-[420px] h-[420px] opacity-[0.22]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(36,207,166,0.28), transparent 75%)",
          filter: "blur(50px)",
        }}
      />

      {/* BOTTOM DARKENING VIGNETTE */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[180px] opacity-[0.4]"
        style={{
          background:
            "radial-gradient(circle at 50% 100%, rgba(0,0,0,0.85), transparent 70%)",
        }}
      />

      {/* HEADER */}
      <header
        className="z-10 border-b border-white/10 px-6 py-5 text-center md:px-10"
        style={{
          backdropFilter: "blur(18px)",
          background: "rgba(0,0,0,0.45)",
        }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">
          LeetAI · Course Architect
        </h1>
        <p className="mt-1 text-xs text-slate-300">
          Conversational onboarding → Structured profile →{" "}
          <span className="text-[#24CFA6]">Personalized roadmap</span>
        </p>
      </header>

      {/* MAIN CHAT AREA */}
      <main className="flex flex-1 justify-center">
        <div className="flex w-full max-w-4xl flex-col px-4 md:px-6 lg:px-0">
          <section
            id="chat-scroll"
            className="flex-1 overflow-y-auto py-8 md:py-10 space-y-8"
          >
            <MessageList />
          </section>

          <section className="pb-6 md:pb-10">
            <ChatInput />
          </section>
        </div>
      </main>
      {showFinalModal && <FinalConfirmationCard />}
    </div>
  );
}
