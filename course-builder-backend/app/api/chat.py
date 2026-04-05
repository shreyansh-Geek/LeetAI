# app/api/chat.py
"""
Chat endpoint — conversational profile-gathering via LangChain + Gemini.

The LLM acts as a strict JSON-only state machine that:
1. Reads the current learner profile
2. Determines which UI card to show next
3. Returns { reply, uiCards, profileUpdates }
"""

import json
import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.llm import chat_llm
from app.ai.prompt_system import SYSTEM_PROMPT
from app.core.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


# -------------------------------------------
# Request / Response Models
# -------------------------------------------

class ChatHistoryItem(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]]   # raw list from frontend
    profile: Dict[str, Any]


class HybridResponse(BaseModel):
    reply: str
    uiCards: list | None = None
    profileUpdates: dict | None = None


# -------------------------------------------
# Prompt Builder
# -------------------------------------------

def _build_messages(
    history: List[Dict[str, Any]],
    profile: Dict[str, Any],
    user_message: str,
) -> list:
    """
    Build a LangChain message list for the chat LLM.

    - SystemMessage: contains the full system prompt + current profile JSON.
    - HumanMessage:  transcript of user messages + the latest message.
    """
    system_block = SYSTEM_PROMPT + f"""

CURRENT PROFILE STATE (machine-readable JSON strictly):
{json.dumps(profile, ensure_ascii=False)}
"""

    # Build user transcript (only user messages from history)
    transcript = ""
    for msg in history:
        if msg.get("role") == "user":
            transcript += f"User: {msg.get('text', '')}\n"

    # Add the latest user message
    transcript += f"User: {user_message}\n"

    return [
        SystemMessage(content=system_block),
        HumanMessage(content=transcript),
    ]


# -------------------------------------------
# Chat Endpoint
# -------------------------------------------

@router.post("/", response_model=HybridResponse)
def chat_endpoint(req: ChatRequest, current_user: dict = Depends(get_current_user)):

    messages = _build_messages(req.history, req.profile, req.message)

    logger.debug("Sending %d messages to chat LLM", len(messages))

    try:
        response = chat_llm.invoke(messages)
        raw = (response.content or "").strip()

        logger.debug("Raw LLM output: %s", raw[:500])

        # Strict JSON parse
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as err:
            logger.warning("JSON parse failed (%s), returning raw as reply", err)
            data = {
                "reply": raw,
                "uiCards": [],
                "profileUpdates": {},
            }

        return HybridResponse(
            reply=data.get("reply", ""),
            uiCards=data.get("uiCards", []) or [],
            profileUpdates=data.get("profileUpdates", {}) or {},
        )

    except Exception as e:
        logger.error("LLM processing failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="LLM processing failed")
