// app/chat/types/chat.ts

export type Role = "user" | "assistant";

/**
 * UI Cards the assistant can trigger.
 * Each card corresponds to a structured React component
 * that appears INSIDE the chat thread.
 */
export type UiCardType =
  | "skillLevel"
  | "goal"
  | "timeAvailability"
  | "learningStyle"
  | "youtubePrefs"
  | "constraints"
  | "motivation"
  | "summary"
  | "final_confirmation"; // optional, but useful

/**
 * A single message inside the chat stream.
 * The UI should render this as a bubble.
 * If uiCards[] is present, render card components under the assistant message.
 */
export interface ChatMessage {
  id: string;
  role: Role;
  text: string;

  /**
   * Cards the model wants the UI to show
   * directly beneath this assistant message.
   */
  uiCards?: UiCardType[];

  /**
   * Whether the model is still generating text.
   * Useful for loading/thinking indicators.
   */
  isThinking?: boolean;
}

/**
 * Shape of the API response returned by /api/chat.
 * The LLM *must* return this JSON format.
 */
export interface ChatResponse {
  reply: string;
  uiCards?: UiCardType[];
  profileUpdates?: Record<string, unknown>;
}

export type ProfileUpdateValue =
  | string
  | number
  | boolean
  | null;

export type ProfileUpdates = Record<string, ProfileUpdateValue>;


export interface ChatRequestPayload {
  message: string;
  history: ChatMessage[];
  profile: Record<string, unknown>;
}


export interface BackendHybridResponse {
  reply: string;
  uiCards?: UiCardType[];
  profileUpdates?: ProfileUpdates;
}


