from __future__ import annotations

import math
import re
from datetime import datetime, timezone
from typing import Any

import isodate

from app.schemas.profile import Profile

# Keep technology names such as C++, C#, .NET and Node.js recognizable.
_TOKEN_PATTERN = re.compile(r"[a-z0-9]+(?:[+#]+|\.[a-z0-9]+)?", re.IGNORECASE)
STOP_WORDS = {
    "the", "a", "an", "and", "or", "for", "to", "of", "in", "on",
    "with", "from", "by", "is", "are", "how", "what", "learn", "learning",
    "tutorial", "course", "best", "using", "beginner", "beginners", "complete",
    "introduction", "intro", "guide", "part", "full",
}


def parse_duration_seconds(iso_duration: str | None) -> int:
    """Return duration in seconds; 0 means the duration is unknown/invalid."""
    if not iso_duration:
        return 0
    try:
        seconds = int(isodate.parse_duration(iso_duration).total_seconds())
        return seconds if seconds > 0 else 0
    except (TypeError, ValueError, OverflowError):
        return 0


def _tokens(text: str) -> set[str]:
    return {
        token.lower()
        for token in _TOKEN_PATTERN.findall(text or "")
        if len(token) > 1 and token.lower() not in STOP_WORDS
    }


def _module_relevance(context: str, title: str, description: str) -> float:
    """Return a bounded relevance score in [0, 1], prioritizing title matches."""
    context_tokens = _tokens(context)
    if not context_tokens:
        return 0.0

    title_tokens = _tokens(title)
    description_tokens = _tokens(description)
    title_coverage = len(context_tokens & title_tokens) / len(context_tokens)
    description_coverage = len(context_tokens & description_tokens) / len(context_tokens)

    # Titles are stronger evidence than descriptions; cap the result at 1.
    return min(1.0, 0.75 * title_coverage + 0.25 * description_coverage)


def _channel_in_list(channel_title: str, blob: str) -> bool:
    """Match a channel against comma/newline/semicolon-separated preferences."""
    if not channel_title or not blob:
        return False
    preferred = {
        item.strip().casefold()
        for item in re.split(r"[,;\n]", blob)
        if item.strip()
    }
    return channel_title.strip().casefold() in preferred


def _freshness_score(published_at: str | None) -> float:
    if not published_at:
        return 0.0
    try:
        published = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        if published.tzinfo is None:
            published = published.replace(tzinfo=timezone.utc)
        age_days = max(0, (datetime.now(timezone.utc) - published.astimezone(timezone.utc)).days)
        return max(0.0, 1.0 - age_days / (3 * 365))
    except (TypeError, ValueError, OverflowError):
        return 0.0


def score_video(profile: Profile, video: dict[str, Any], module_context: str = "") -> float:
    """Score a video for a specific module and learner profile; higher is better."""
    snippet = video.get("snippet") or {}
    stats = video.get("statistics") or {}
    content = video.get("contentDetails") or {}

    title = str(snippet.get("title") or "")
    description = str(snippet.get("description") or "")
    channel_title = str(snippet.get("channelTitle") or "")

    try:
        view_count = max(0, int(stats.get("viewCount", 0) or 0))
    except (TypeError, ValueError):
        view_count = 0

    # Popularity is a weak quality signal, so cap its contribution at 2 points.
    popularity_score = min(2.0, math.log10(view_count + 1) / 3.0)

    # Unknown duration gets a neutral score rather than being treated as a short video.
    duration_seconds = parse_duration_seconds(content.get("duration"))
    if duration_seconds:
        preference = getattr(profile, "videoLength", "any")
        ideal_seconds = 7 * 60 if preference == "short" else 30 * 60 if preference == "long" else 15 * 60
        duration_score = max(0.0, 1.0 - abs(duration_seconds - ideal_seconds) / (40 * 60))
    else:
        duration_score = 0.5

    channel_bonus = 0.0
    if _channel_in_list(channel_title, getattr(profile, "favoriteChannels", "") or ""):
        channel_bonus += 2.0
    if _channel_in_list(channel_title, getattr(profile, "avoidChannels", "") or ""):
        channel_bonus -= 5.0

    # YouTube may omit caption metadata. Penalize only an explicit negative signal.
    caption_flag = content.get("caption")
    captions_penalty = -4.0 if getattr(profile, "needsSubtitles", False) and caption_flag == "false" else 0.0

    module_relevance = _module_relevance(module_context, title, description)
    profile_relevance = _module_relevance(
        str(getattr(profile, "topic", "") or ""), title, description
    )

    # Small bonus when the video also matches the specific query that found it.
    # This metadata is optional, so direct callers and existing tests still work.
    discovery_queries = video.get("_discovery_queries") or []
    query_relevance = max(
        (
            _module_relevance(str(query), title, description)
            for query in discovery_queries
            if str(query).strip()
        ),
        default=0.0,
    )

    # Module fit dominates overall-topic fit, then query fit, then popularity.
    return (
        module_relevance * 5.0
        + profile_relevance * 1.5
        + query_relevance * 1.0
        + duration_score * 1.5
        + popularity_score
        + channel_bonus
        + captions_penalty
        + _freshness_score(snippet.get("publishedAt")) * 0.5
    )


def _title_similarity(title_a: str, title_b: str) -> float:
    """Estimate topic overlap between two video titles."""
    tokens_a = _tokens(title_a)
    tokens_b = _tokens(title_b)

    if not tokens_a or not tokens_b:
        return 0.0

    return len(tokens_a & tokens_b) / len(tokens_a | tokens_b)


def _video_title(video: dict[str, Any]) -> str:
    snippet = video.get("snippet") or {}
    return str(snippet.get("title") or video.get("title") or "")


def rank_videos(
    profile: Profile,
    videos: list[dict[str, Any]],
    max_videos: int = 5,
    module_context: str = "",
) -> list[dict[str, Any]]:
    """Rank relevant candidates while reducing repetitive recommendations."""
    if max_videos <= 0 or not videos:
        return []

    candidates = []

    for index, video in enumerate(videos):
        score = score_video(profile, video, module_context)

        # When module context is available, filter out weak matches.
        relevance = _module_relevance(
            module_context,
            _video_title(video),
            str((video.get("snippet") or {}).get("description") or ""),
        )

        if module_context.strip() and relevance < 0.08:
            continue

        candidates.append({
            "index": index,
            "video": video,
            "score": score,
            "title": _video_title(video),
        })

    selected = []
    remaining = candidates.copy()

    while remaining and len(selected) < max_videos:
        best_candidate = None
        best_adjusted_score = float("-inf")

        for candidate in remaining:
            # Penalize overlap with videos already selected.
            max_similarity = max(
                (
                    _title_similarity(candidate["title"], item["title"])
                    for item in selected
                ),
                default=0.0,
            )

            adjusted_score = candidate["score"] - 1.5 * max_similarity

            if adjusted_score > best_adjusted_score:
                best_adjusted_score = adjusted_score
                best_candidate = candidate

        if best_candidate is None:
            break

        selected.append(best_candidate)
        remaining.remove(best_candidate)

    return [item["video"] for item in selected]
