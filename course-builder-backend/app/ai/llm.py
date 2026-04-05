"""
Centralized LangChain LLM factory for LeetAI.

All GenAI model instances are created here so that the rest of the codebase
imports pre-configured objects instead of scattering SDK initialization.
"""

import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Chat LLM  (used by /chat endpoint)
# ──────────────────────────────────────────────
chat_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.7,
    convert_system_message_to_human=False,
)

# ──────────────────────────────────────────────
# Course LLM  (used by course generation pipeline)
# ──────────────────────────────────────────────
course_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.5,
    convert_system_message_to_human=False,
)


async def invoke_course_llm(prompt: str) -> str:
    """
    Standard async helper for course generation prompts.
    Returns raw text content.
    """
    response = await course_llm.ainvoke(prompt)

    if hasattr(response, "content"):
        return response.content or ""

    return str(response)


async def invoke_chat_llm(prompt: str) -> str:
    """
    Standard async helper for chat/onboarding prompts.
    Returns raw text content.
    """
    response = await chat_llm.ainvoke(prompt)

    if hasattr(response, "content"):
        return response.content or ""

    return str(response)


logger.info(
    "LangChain LLM instances initialized "
    "(chat: gemini-2.5-flash, course: gemini-2.5-flash)"
)