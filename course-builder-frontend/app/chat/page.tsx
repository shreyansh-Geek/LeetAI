"use client";

import { useState } from "react";

type Message = {
  id: number;
  sender: "user" | "ai";
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);

    const userInput = input;
    setInput("");

    const res = await fetch("http://localhost:8000/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput })
    });

    const data = await res.json();

    const aiMessage: Message = {
      id: Date.now() + 1,
      sender: "ai",
      text: data.reply
    };

    setMessages((prev) => [...prev, aiMessage]);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 px-6 py-4">
      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-24">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xl px-4 py-2 rounded-xl text-sm ${
              msg.sender === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-800 text-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 outline-none"
          />

          <button
            onClick={sendMessage}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
