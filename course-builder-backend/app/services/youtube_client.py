# app/services/youtube_client.py
import requests
from typing import List, Dict, Literal, Optional
from app.core.config import settings

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

VideoDurationFilter = Literal["any", "short", "medium", "long"]

class YouTubeClient:
    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or settings.YOUTUBE_API_KEY

    def search_videos(
        self,
        query: str,
        max_results: int = 12,
        duration: VideoDurationFilter = "any",
        relevance_language: Optional[str] = None,
        region_code: Optional[str] = None,
    ) -> List[Dict]:
        params: Dict[str, str] = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": str(max_results),
            "key": self.api_key,
            "videoDuration": duration,
            "videoEmbeddable": "true",
            "safeSearch": "moderate",
        }

        if relevance_language:
            params["relevanceLanguage"] = relevance_language
        if region_code:
            params["regionCode"] = region_code

        resp = requests.get(f"{YOUTUBE_API_BASE}/search", params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get("items", [])

    def fetch_video_details(self, video_ids: List[str]) -> List[Dict]:
        if not video_ids:
            return []

        params = {
            "part": "snippet,contentDetails,statistics",
            "id": ",".join(video_ids),
            "key": self.api_key,
        }

        resp = requests.get(f"{YOUTUBE_API_BASE}/videos", params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get("items", [])
