from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.api.health import router as health_router
from app.api.course_build import router as course_build_router

app = FastAPI(title="LeetAI Backend")

# CORS for frontend communication (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health_router, prefix="/health")
app.include_router(chat_router, prefix="/chat")
app.include_router(course_build_router, prefix="/course-build")


@app.get("/")
def root():
    return {"message": "Backend is running!"}
