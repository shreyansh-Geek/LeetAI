"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";

import {
  ChatMessage,
  UiCardType,
  ChatRequestPayload,
  BackendHybridResponse,
  ProfileUpdateValue,
} from "../types/chat";

import { sendToBackend } from "../utils/apiClient";
import { useProfileStore } from "./useProfileStore";
import { Profile } from "../types/profile";

type ProfileUpdateMap = Record<string, ProfileUpdateValue>;

interface ChatState {
  messages: ChatMessage[];
  status: "idle" | "loading" | "error";

  activeCard: UiCardType | null;
  setActiveCard: (card: UiCardType | null) => void;

  showFinalModal: boolean;
  setShowFinalModal: (v: boolean) => void;

  pendingCardData: Record<string, ProfileUpdateValue>;
  updatePendingCardField: (field: string, value: ProfileUpdateValue) => void;

  addUserMessage: (text: string) => void;

  addAssistantMessage: (msg: {
    text: string;
    uiCards?: UiCardType[] | null;
    profileUpdates?: ProfileUpdateMap;
  }) => void;

  sendUserMessage: (text: string) => Promise<void>;
  completeCardAndSubmit: () => Promise<void>;
  sendFinalBuildRequest: () => Promise<void>;

  resetChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      status: "idle",

      activeCard: null,
      setActiveCard: (card) => set({ activeCard: card }),

      showFinalModal: false,
      setShowFinalModal: (v: boolean) => set({ showFinalModal: v }),

      pendingCardData: {},
      updatePendingCardField: (field, value) =>
        set((state) => ({
          pendingCardData: {
            ...state.pendingCardData,
            [field]: value,
          },
        })),

      // ✅ Log user text as a bubble, but avoid consecutive duplicates
      addUserMessage: (text) =>
        set((state) => {
          const trimmed = text.trim();
          if (!trimmed) return state;

          const last = state.messages[state.messages.length - 1];
          if (last && last.role === "user" && last.text === trimmed) {
            return state;
          }

          const newMsg: ChatMessage = {
            id: uuid(),
            role: "user",
            text: trimmed,
          };

          return {
            ...state,
            messages: [...state.messages, newMsg],
          };
        }),

      // ✅ Apply profileUpdates → add assistant bubble → set activeCard
      addAssistantMessage: ({ text, uiCards = [], profileUpdates = {} }) => {
        const { updateProfile } = useProfileStore.getState();

        // 1) Apply all profileUpdates into global profile store
        for (const key of Object.keys(profileUpdates)) {
          updateProfile(key as keyof Profile, profileUpdates[key]);
        }

        // 2) Build assistant message
        const newMsg: ChatMessage = {
          id: uuid(),
          role: "assistant",
          text,
          uiCards: uiCards && uiCards.length ? uiCards : undefined,
        };

        // 3) Append + set activeCard from uiCards[0]
        set((state) => ({
          messages: [...state.messages, newMsg],
          activeCard: uiCards && uiCards.length ? uiCards[0] : null,
        }));
      },

      // ✅ Free-text handler (topic, clarifications, etc.)
      sendUserMessage: async (text: string) => {
        const profileBefore = useProfileStore.getState().profile;

        const trimmed = text.trim();
        if (!trimmed) return;

        const isTopicMissing = !profileBefore.topic;

        // If topic is already known and a card is active, force finishing the card
        if (get().activeCard && !isTopicMissing) return;

        // Only log REAL user messages (no control signals)
        if (!trimmed.startsWith("__")) {
          get().addUserMessage(trimmed);
        }

        // ✅ Only send USER messages to backend (no assistant / cards)
        const history = get().messages.filter((m) => m.role === "user");

        set({ status: "loading" });

        try {
          const payload: ChatRequestPayload = {
            message: trimmed,
            history,
            profile: profileBefore,
          };

          const data: BackendHybridResponse = await sendToBackend(payload);

          get().addAssistantMessage({
            text: data.reply,
            uiCards: data.uiCards ?? [],
            profileUpdates: data.profileUpdates ?? {},
          });

          set({ status: "idle" });
        } catch {
          get().addAssistantMessage({
            text: "Something went wrong. Please try again.",
          });
          set({ status: "error" });
        }
      },

      // ✅ Multi-field card submit (auto-submit cards call this once)
      completeCardAndSubmit: async () => {
        const pending = get().pendingCardData;
        const profileStore = useProfileStore.getState();

        // 1) Apply pending card fields into global profile
        for (const key of Object.keys(pending)) {
          profileStore.updateProfile(key as keyof Profile, pending[key]);
        }

        // ✅ Re-read the UPDATED profile from store (important!)
        const updatedProfile = useProfileStore.getState().profile;

        // 2) Clear local card state before backend call
        set({ activeCard: null, pendingCardData: {} });

        // ✅ Only send USER messages as history
        const history = get().messages.filter((m) => m.role === "user");

        set({ status: "loading" });

        try {
          const payload: ChatRequestPayload = {
            message: "__card_complete__",
            history,
            profile: updatedProfile,
          };

          const data: BackendHybridResponse = await sendToBackend(payload);

          get().addAssistantMessage({
            text: data.reply,
            uiCards: data.uiCards ?? [],
            profileUpdates: data.profileUpdates ?? {},
          });

          set({ status: "idle" });
        } catch {
          get().addAssistantMessage({
            text: "Something went wrong. Please try again.",
          });
          set({ status: "error" });
        }
      },

      // ✅ Final request for course generation
      sendFinalBuildRequest: async () => {
        const profile = useProfileStore.getState().profile;

        // ✅ Only send USER messages as history
        const history = get().messages.filter((m) => m.role === "user");

        set({ status: "loading" });

        try {
          const payload: ChatRequestPayload = {
            message: "__final_build__",
            history,
            profile,
          };

          const data: BackendHybridResponse = await sendToBackend(payload);

          get().addAssistantMessage({
            text: data.reply,
            uiCards: data.uiCards ?? [],
            profileUpdates: data.profileUpdates ?? {},
          });

          set({ activeCard: null, status: "idle" });
        } catch {
          get().addAssistantMessage({
            text: "Failed to start building. Please try again.",
          });
          set({ status: "error" });
        }
      },

      resetChat: () => {
        set({
          messages: [],
          status: "idle",
          activeCard: null,
          pendingCardData: {},
        });
      },
    }),
    {
      name: "leetai-chat-store",
    }
  )
);
