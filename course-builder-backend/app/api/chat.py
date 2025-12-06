from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from app.core.config import settings
from app.ai.prompt_system import SYSTEM_PROMPT

router = APIRouter()

client = genai.Client(api_key=settings.GEMINI_API_KEY)

class ChatRequest(BaseModel):
    message: str

# store chat history
conversation_history = []

@router.post("/")
def chat_endpoint(req: ChatRequest):

    # Add the user's new message
    conversation_history.append({
        "role": "user",
        "parts": [{"text": req.message}]
    })

    # System prompt MUST be injected as a "user" message
    # because Gemini doesn't support "system" role
    messages = [
        {
            "role": "user",
            "parts": [{"text": SYSTEM_PROMPT}]
        }
    ] + conversation_history

    # Generate response from Gemini
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=messages
    )

    ai_text = response.text or "No response."

    # Save assistant (model) reply to memory
    conversation_history.append({
        "role": "model",
        "parts": [{"text": ai_text}]
    })

    return {"reply": ai_text}
