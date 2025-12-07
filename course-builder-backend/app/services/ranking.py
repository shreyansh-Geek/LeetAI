# app/services/ranking.py
from __future__ import annotations

from typing import Dict, List
from datetime import datetime, timezone
import math
import isodate  # add to requirements.txt (for parsing ISO 8601 durations)

from app.schemas.profile import Profile


def parse_duration_seconds(iso_duration: str) -> int:
    try:
        return int(isodate.parse_duration(iso_duration).total_seconds())
    except Exception:
        return 0


def _channel_in_list(channel_title: str, blob: str) -> bool:
    # crude but works reasonably: case-insensitive contains
    if not channel_title or not blob:
        return False
    return channel_title.lower() in blob.lower()


def score_video(profile: Profile, video: Dict) -> float:
    """
    Compute a numeric score for a YouTube video given the user's profile.
    Higher = better.
    """
    snippet = video.get("snippet", {})
    stats = video.get("statistics", {})
    content = video.get("contentDetails", {})

    title = snippet.get("title", "")
    description = snippet.get("description", "")
    channel_title = snippet.get("channelTitle", "")
    published_at = snippet.get("publishedAt")

    duration_iso = content.get("duration", "PT0S")
    duration_sec = parse_duration_seconds(duration_iso)

    view_count = int(stats.get("viewCount", 0))

    # ---------- Base: popularity (log-scale) ----------
    base = math.log10(view_count + 1)

    # ---------- Duration preference ----------
    video_length_pref = profile.videoLength  # "short" | "long" | "mixed" | None
    duration_score = 1.0

    if video_length_pref == "short":
        # best around 5–10min
        ideal = 7 * 60
    elif video_length_pref == "long":
        # best around 25–40min
        ideal = 30 * 60
    else:  # "mixed" or None
        ideal = 15 * 60

    diff = abs(duration_sec - ideal)
    # 0–1: 1 is perfect, decays as we go further
    duration_score = max(0.0, 1.0 - diff / (40 * 60))

    # ---------- Channel preference ----------
    fav_blob = profile.favoriteChannels or ""
    avoid_blob = profile.avoidChannels or ""

    fav_match = 1.0 if _channel_in_list(channel_title, fav_blob) else 0.0
    avoid_match = 1.0 if _channel_in_list(channel_title, avoid_blob) else 0.0

    channel_bonus = 0.0
    if fav_match:
        channel_bonus += 3.0
    if avoid_match:
        channel_bonus -= 5.0

    # ---------- Captions / accessibility ----------
    caption_flag = content.get("caption")
    captions_ok = True
    if profile.needsSubtitles:
        captions_ok = caption_flag == "true"

    captions_penalty = 0.0 if captions_ok else -4.0

    # ---------- Freshness ----------
    freshness = 0.0
    if published_at:
        try:
            dt = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
            age_days = (datetime.now(timezone.utc) - dt).days
            # up to ~3 years gets some bonus
            freshness = max(0.0, 1.0 - age_days / (3 * 365))
        except Exception:
            freshness = 0.0

    # ---------- Simple topic relevance heuristic ----------
    topic = (profile.topic or "").lower()
    in_title = topic in title.lower()
    in_desc = topic in description.lower()
    topic_score = 1.5 if in_title else (0.8 if in_desc else 0.3)

    # ---------- Aggregate ----------
    score = (
        base * 1.0
        + duration_score * 2.0
        + channel_bonus
        + captions_penalty
        + freshness * 1.0
        + topic_score * 1.5
    )

    return score


def rank_videos(profile: Profile, videos: List[Dict], max_videos: int) -> List[Dict]:
    scored = [
        (score_video(profile, v), v)
        for v in videos
    ]
    scored.sort(key=lambda x: x[0], reverse=True)
    return [v for _, v in scored[:max_videos]]
