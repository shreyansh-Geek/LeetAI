from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, chat, course_build, health, courses
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(title="LeetAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(course_build.router)
app.include_router(courses.router)
app.include_router(health.router)


@app.get("/")
async def root():
    return {"message": "LeetAI backend is running"}