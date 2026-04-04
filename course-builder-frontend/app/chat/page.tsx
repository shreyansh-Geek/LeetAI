"use client";

import ChatLayout from "./components/chat/ChatLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ChatPage() {
  useRequireAuth();
  return <ChatLayout />;
}
