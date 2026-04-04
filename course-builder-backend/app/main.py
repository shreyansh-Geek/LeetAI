from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.api.health import router as health_router
from app.api.course_build import router as course_build_router
from app.api.auth import router as auth_router
from app.core.config import settings

app = FastAPI(title="LeetAI Backend")

# CORS — allow_origins=["*"] + allow_credentials=True is INVALID in browsers.
# Use explicit origins from the ALLOWED_ORIGINS env var.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health_router, prefix="/health")
app.include_router(auth_router, prefix="/auth")
app.include_router(chat_router, prefix="/chat")
app.include_router(course_build_router, prefix="/course-build")


@app.get("/")
def root():
    return {"message": "LeetAI Backend is running!"}
