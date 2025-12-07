// app/chat/components/chat/ChatInput.tsx
"use client";

import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";

export default function ChatInput() {
  const [text, setText] = useState("");

  const sendMessage = useChatStore((s) => s.sendUserMessage);
  const status = useChatStore((s) => s.status);
  const activeCard = useChatStore((s) => s.activeCard);

  const locked = status === "loading" || Boolean(activeCard);

  async function handleSend() {
    if (!text.trim() || locked) return;
    await sendMessage(text);
    setText("");
  }

  return (
    <div className="flex justify-center w-full">
      <div
        className="
          flex w-full max-w-3xl items-center gap-3 rounded-2xl px-4 py-3
          border border-[#24CFA6]/45
          bg-black/65 backdrop-blur-xl
          shadow-[0_0_30px_rgba(0,0,0,0.9)]
          transition-all duration-200
        "
        style={{
          boxShadow:
            "0 0 30px rgba(0,0,0,0.9), 0 0 32px rgba(36,207,166,0.16)",
        }}
      >
        <input
          disabled={locked}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={
            locked
              ? "Complete the card above to continue…"
              : "Describe your goals or ask anything…"
          }
          className="
            flex-1 bg-transparent text-sm text-slate-100
            placeholder:text-slate-400/70
            outline-none
          "
        />

        <button
          disabled={locked}
          onClick={handleSend}
          className="
            rounded-xl px-4 py-2 text-sm font-semibold
            bg-[#24CFA6] text-black
            hover:bg-[#20b796]
            transition
            shadow-[0_8px_20px_rgba(0,0,0,0.7)]
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          Send
        </button>
      </div>
    </div>
  );
}
