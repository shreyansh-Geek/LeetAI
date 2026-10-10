from __future__ import annotations

from typing import Dict, List
from datetime import datetime, timezone
import math
import isodate

from app.schemas.profile import Profile


def parse_duration_seconds(iso_duration: str) -> int:
    try:
        return int(isodate.parse_duration(iso_duration).total_seconds())
    except Exception:
        return 0


def _channel_in_list(channel_title: str, blob: str) -> bool:
    if not channel_title or not blob:
        return False
    return channel_title.lower() in blob.lower()


import re

STOP_WORDS = {
    "the", "a", "an", "and", "or", "for", "to", "of", "in",
    "on", "with", "from", "by", "is", "are", "how", "what",
    "learn", "learning", "tutorial", "course", "best", "using",
}


def _module_relevance(
    context: str,
    title: str,
    description: str,
) -> float:
    """Score overlap between a module's learning context and a video."""
    tokens = {
        word
        for word in re.findall(r"[a-z0-9+#.]+", context.lower())
        if len(word) > 1 and word not in STOP_WORDS
    }

    if not tokens:
        return 0.0

    title_text = title.lower()
    description_text = description.lower()

    title_matches = sum(
        1 for word in tokens if word in title_text
    )
    description_matches = sum(
        1 for word in tokens if word in description_text
    )

    # Titles provide stronger evidence of relevance than descriptions.
    return (
        3.0 * title_matches + 0.5 * description_matches
    ) / len(tokens)

def score_video(
    profile: Profile,
    video: Dict,
    module_context: str = "",
) -> float:
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

    view_count = int(stats.get("viewCount", 0) or 0)

    # ---------- Base: popularity ----------
    base = math.log10(view_count + 1)

    # ---------- Duration preference ----------
    video_length_pref = profile.videoLength
    if video_length_pref == "short":
        ideal = 7 * 60
    elif video_length_pref == "long":
        ideal = 30 * 60
    else:
        ideal = 15 * 60

    diff = abs(duration_sec - ideal)
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

    # ---------- Captions ----------
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
            freshness = max(0.0, 1.0 - age_days / (3 * 365))
        except Exception:
            freshness = 0.0

    # ---------- Topic relevance ----------
    topic = (profile.topic or "").strip()

    profile_relevance = _module_relevance(
        topic,
        title,
        description,
    )

    module_relevance = _module_relevance(
        module_context,
        title,
        description,
    )

    topic_score = max(profile_relevance, module_relevance)

    score = (
        base * 1.0
        + duration_score * 2.0
        + channel_bonus
        + captions_penalty
        + freshness * 1.0
        + topic_score * 1.5
    )

    return score


def rank_videos(
    profile: Profile,
    videos: List[Dict],
    max_videos: int = 5,
    module_context: str = "",
) -> List[Dict]:
    scored = [
        (
            score_video(profile, video, module_context),
            video,
        )
        for video in videos
    ]

    scored.sort(key=lambda item: item[0], reverse=True)

    return [video for _, video in scored[:max_videos]]