import asyncio
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

        resp = requests.get(f"{YOUTUBE_API_BASE}/search", params=params, timeout=15)
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

        resp = requests.get(f"{YOUTUBE_API_BASE}/videos", params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data.get("items", [])


youtube_client = YouTubeClient()


def normalize_youtube_video(video: Dict) -> Dict:
    snippet = video.get("snippet", {})
    content = video.get("contentDetails", {})
    stats = video.get("statistics", {})

    video_id = video.get("id")
    if isinstance(video_id, dict):
        video_id = video_id.get("videoId")

    return {
        "id": video_id,
        "title": snippet.get("title", ""),
        "url": f"https://www.youtube.com/watch?v={video_id}" if video_id else "",
        "channel": snippet.get("channelTitle", ""),
        "publishedAt": snippet.get("publishedAt", ""),
        "description": snippet.get("description", ""),
        "duration": content.get("duration", "PT0S"),
        "viewCount": int(stats.get("viewCount", 0) or 0),
        "likeCount": int(stats.get("likeCount", 0) or 0),
        "raw": video,
    }


def search_and_enrich_videos(
    query: str,
    max_results: int = 12,
    duration: VideoDurationFilter = "any",
    relevance_language: Optional[str] = None,
    region_code: Optional[str] = None,
) -> List[Dict]:
    """
    Search YouTube and enrich results with full details.
    """
    search_items = youtube_client.search_videos(
        query=query,
        max_results=max_results,
        duration=duration,
        relevance_language=relevance_language,
        region_code=region_code,
    )

    video_ids = [
        item.get("id", {}).get("videoId")
        for item in search_items
        if item.get("id", {}).get("videoId")
    ]

    detailed_items = youtube_client.fetch_video_details(video_ids)
    return detailed_items


async def search_and_enrich_videos_async(
    query: str,
    max_results: int = 12,
    duration: VideoDurationFilter = "any",
    relevance_language: Optional[str] = None,
    region_code: Optional[str] = None,
) -> List[Dict]:
    """
    Async wrapper around blocking requests-based YouTube fetch.
    """
    return await asyncio.to_thread(
        search_and_enrich_videos,
        query,
        max_results,
        duration,
        relevance_language,
        region_code,
    )