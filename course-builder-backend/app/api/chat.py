from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from app.core.config import settings

router = APIRouter()

# Explicitly pass the API key to the client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class ChatRequest(BaseModel):
    message: str

@router.post("/")
def chat_endpoint(req: ChatRequest):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=req.message
    )

    reply = response.text or "No response returned."

    return {"reply": reply}
