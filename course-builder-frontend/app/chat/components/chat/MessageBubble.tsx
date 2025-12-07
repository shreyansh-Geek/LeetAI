// app/chat/components/chat/MessageBubble.tsx
"use client";

import { ChatMessage } from "../../types/chat";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed
          backdrop-blur-xl border shadow-xl transition-all
          ${
            isUser
              ? "bg-[#031612]/90 border-[#24CFA6]/70 text-slate-50 rounded-br-md"
              : "bg-[#050808]/90 border-[#24CFA6]/18 text-slate-100 rounded-bl-md"
          }
        `}
        style={{
          boxShadow: isUser
            ? "0 0 26px rgba(36,207,166,0.35)"
            : "0 0 20px rgba(0,0,0,0.85)",
        }}
      >
        {message.text}
      </div>
    </div>
  );
}
