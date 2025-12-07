// app/chat/components/chat/MessageList.tsx
"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import MessageBubble from "./MessageBubble";
import CardRenderer from "./CardRenderer";

export default function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);

  const lastAssistantWithCards = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.uiCards?.length);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!endRef.current) return;
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <>
      {/* Messages */}
      {messages.map((msg) => (
        <div key={msg.id} className="space-y-3 animate-softFade">
          <MessageBubble message={msg} />
        </div>
      ))}

      {/* Active Cards */}
      {lastAssistantWithCards?.uiCards?.map((card) => (
        <div key={card} className="animate-cardRise">
          <CardRenderer type={card} />
        </div>
      ))}

      {/* Thinking loader */}
      {status === "loading" && (
        <div className="mt-2 flex items-center gap-2 animate-softFade">
          <div className="flex gap-1">
            <span className="loader-dot" />
            <span className="loader-dot loader-delay-1" />
            <span className="loader-dot loader-delay-2" />
          </div>
          <span className="text-[13px] tracking-wide text-slate-200/80">
            LeetAI is thinking…
          </span>
        </div>
      )}

      <div ref={endRef} />

      {/* Local animations + loader styles */}
      <style jsx>{`
        .loader-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            rgba(36, 207, 166, 0.98),
            rgba(7, 54, 44, 0.9)
          );
          box-shadow: 0 0 10px rgba(36, 207, 166, 0.7);
          animation: floatDot 1.4s ease-in-out infinite;
        }
        .loader-delay-1 {
          animation-delay: 0.2s;
        }
        .loader-delay-2 {
          animation-delay: 0.4s;
        }

        @keyframes floatDot {
          0% {
            transform: translateY(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-4px);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
        }

        .animate-softFade {
          animation: softFade 0.32s ease-out;
        }
        @keyframes softFade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-cardRise {
          animation: cardRise 0.35s ease-out;
        }
        @keyframes cardRise {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
