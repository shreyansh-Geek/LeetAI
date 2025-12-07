import { ChatRequestPayload, BackendHybridResponse } from "../types/chat";

export async function sendToBackend(payload: ChatRequestPayload): Promise<BackendHybridResponse> {
  try {
    const res = await fetch("http://localhost:8000/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
