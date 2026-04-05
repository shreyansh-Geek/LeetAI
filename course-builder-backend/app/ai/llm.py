# app/ai/llm.py
"""
Centralized LangChain LLM factory for LeetAI.

All GenAI model instances are created here so that the rest of the codebase
imports pre-configured objects instead of scattering SDK initialization.

Usage:
    from app.ai.llm import chat_llm, course_llm
"""

import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Chat LLM  (gemini-2.5-flash)
# Used by: /chat endpoint — conversational profile gathering
# ──────────────────────────────────────────────
chat_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.7,
    convert_system_message_to_human=False,
)

# ──────────────────────────────────────────────
# Course LLM  (gemini-2.5-flash)
# Used by: course_engine.py — skeleton planning & course finalization
# ──────────────────────────────────────────────
course_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.5,       # slightly lower for structured JSON output
    convert_system_message_to_human=False,
)

logger.info("LangChain LLM instances initialized (chat: gemini-2.5-flash, course: gemini-2.5-flash)")
