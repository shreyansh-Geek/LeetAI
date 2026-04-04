import { ChatRequestPayload, BackendHybridResponse } from "../types/chat";
import { useAuthStore } from "@/store/useAuthStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export async function sendToBackend(payload: ChatRequestPayload): Promise<BackendHybridResponse> {
  try {
    const token = useAuthStore.getState().token;
    
    const res = await fetch(`${BASE_URL}/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Backend error:", text);
      throw new Error("Backend returned error: " + text);
    }

    const json = await res.json();
    return json as BackendHybridResponse;
  } catch (err) {
    console.error("API failure:", err);
    throw err;
  }
}
