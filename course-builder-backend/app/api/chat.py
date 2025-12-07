from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from app.core.config import settings
from app.ai.prompt_system import SYSTEM_PROMPT

import json
from typing import Any, List, Dict

router = APIRouter()

client = genai.Client(api_key=settings.GEMINI_API_KEY)


# -------------------------------------------
# Request / Response Models
# -------------------------------------------

class ChatHistoryItem(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]]  # raw list from frontend
    profile: Dict[str, Any]


class HybridResponse(BaseModel):
    reply: str
    uiCards: list | None = None
    profileUpdates: dict | None = None


# -------------------------------------------
# Prompt Builder
# -------------------------------------------

def build_llm_prompt(history: List[Dict[str, Any]], profile: Dict[str, Any], user_message: str) -> str:
    """
    Build a clean, non-repeating transcript for Gemini.

    - Assistant messages are ignored.
    - Only user messages are included.
    - Current profile JSON is appended once.
    """

    system_block = SYSTEM_PROMPT + f"""

CURRENT PROFILE STATE (machine-readable JSON strictly):
{json.dumps(profile, ensure_ascii=False)}
"""

    transcript = ""

    # Keep ONLY user messages from history
    for msg in history:
        if msg.get("role") == "user":
            transcript += f"User: {msg.get('text', '')}\n"

    # Add latest user message
    transcript += f"User: {user_message}\n"

    return system_block + "\n" + transcript


# -------------------------------------------
# Chat Endpoint
# -------------------------------------------

@router.post("/", response_model=HybridResponse)
def chat_endpoint(req: ChatRequest):

    prompt = build_llm_prompt(req.history, req.profile, req.message)

    print("\n===== SENDING TO GEMINI =====")
    print(prompt)
    print("===== END PROMPT =====\n")

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
        )

        raw = (getattr(response, "text", "") or "").strip()

        print("\n===== RAW LLM OUTPUT =====")
        print(raw)
        print("===== END RAW OUTPUT =====\n")

        # Strict JSON parse
        try:
            data = json.loads(raw)
        except Exception as err:
            print("\n!!! JSON PARSE FAILED !!!")
            print(err)
            print("Returning fallback.\n")

            data = {
                "reply": raw,
                "uiCards": [],
                "profileUpdates": {}
            }

        return HybridResponse(
            reply=data.get("reply", ""),
            uiCards=data.get("uiCards", []) or [],
            profileUpdates=data.get("profileUpdates", {}) or {}
        )

    except Exception as e:
        print("\n!!! LLM ERROR !!!")
        print(e)
        print("!!! END LLM ERROR !!!\n")
        raise HTTPException(status_code=500, detail="LLM processing failed")
