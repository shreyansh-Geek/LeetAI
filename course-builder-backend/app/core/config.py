import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY")
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-for-jwt")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")

    # CORS: comma-separated list of allowed origins
    # e.g. "http://localhost:3000,https://your-app.vercel.app"
    ALLOWED_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
        if o.strip()
    ]

settings = Settings()
