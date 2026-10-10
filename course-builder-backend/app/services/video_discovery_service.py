
import logging
from typing import Any

from app.schemas.course_build import CourseBuildRequest
from app.schemas.profile import Profile
from app.services.youtube_client import search_and_enrich_videos
from app.services.ranking import rank_videos

logger = logging.getLogger(__name__)


def _map_video_length_pref(video_length: str | None) -> str:
    """Map profile preference to the YouTube API duration filter."""
    if video_length == "short":
        return "short"
    if video_length == "long":
        return "long"
    return "any"


def _video_id(video: dict[str, Any]) -> str | None:
    """Extract a video ID from supported YouTube result formats."""
    value = video.get("id")

    if isinstance(value, dict):
        value = value.get("videoId")

    if not value:
        return None

    return str(value)


def _merge_video_metadata(
    existing: dict[str, Any],
    incoming: dict[str, Any],
) -> dict[str, Any]:
    """Preserve existing data while filling missing fields from duplicates."""
    merged = dict(existing)

    for section in ("snippet", "statistics", "contentDetails"):
        old_section = existing.get(section) or {}
        new_section = incoming.get(section) or {}

        merged_section = {**new_section, **old_section}

        for key, value in new_section.items():
            if merged_section.get(key) in (None, "", 0) and value not in (
                None, "", 0
            ):
                merged_section[key] = value

        merged[section] = merged_section

    return merged


def discover_videos_for_modules(
    req: CourseBuildRequest,
    skeleton: dict[str, Any],
) -> dict[str, list[dict[str, Any]]]:
    """Fetch, deduplicate and rank YouTube candidates for each module."""
    profile: Profile = req.profile
    modules = skeleton.get("modules", []) or []

    module_video_map: dict[str, list[dict[str, Any]]] = {}
    duration_filter = _map_video_length_pref(profile.videoLength)

    for module in modules:
        module_id = str(module.get("id") or "")
        search_plan = module.get("searchPlan", []) or []
        all_candidates: list[dict[str, Any]] = []
        query_by_video_id: dict[str, set[str]] = {}
        
        for plan in search_plan:
            query = str(plan.get("query") or "").strip()

            try:
                target_count = max(
                    1,
                    int(plan.get("targetCount", 8) or 8),
                )
            except (TypeError, ValueError):
                target_count = 8

            if not query:
                continue

            logger.info(
                "Fetching YouTube candidates | module=%s | query=%s",
                module_id,
                query,
            )

            try:
                videos = search_and_enrich_videos(
                    query=query,
                    max_results=target_count,
                    duration=duration_filter,
                    relevance_language="en",
                    region_code="IN",
                )

                for video in (videos or []):
                    if not isinstance(video, dict):
                        continue

                    all_candidates.append(video)

                    video_id = _video_id(video)
                    if video_id:
                        query_by_video_id.setdefault(video_id, set()).add(query)

            except Exception:
                logger.exception(
                    "YouTube fetch failed | module=%s | query=%s",
                    module_id,
                    query,
                )

        # Deduplicate while preserving first-seen order and richer metadata.
        index_by_id: dict[str, int] = {}
        deduped: list[dict[str, Any]] = []

        for video in all_candidates:
            video_id = _video_id(video)

            if not video_id:
                # Without an ID, duplicates cannot be identified reliably.
                deduped.append(video)
                continue

            if video_id in index_by_id:
                index = index_by_id[video_id]
                deduped[index] = _merge_video_metadata(
                    deduped[index],
                    video,
                )
            else:
                index_by_id[video_id] = len(deduped)
                deduped.append(video)

        # Attach every query that returned each video. Duplicate results retain
        # all their query provenance because it is tracked by video ID.
        for video in deduped:
            video_id = _video_id(video)
            video["_discovery_queries"] = (
                sorted(query_by_video_id.get(video_id, set()))
                if video_id
                else []
            )

        module_context = " ".join(
            [
                str(module.get("title") or ""),
                str(module.get("stageGoal") or ""),
                " ".join(module.get("keyTopics") or []),
                " ".join(module.get("learningOutcomes") or []),
                *[
                    str(plan.get("query") or "")
                    for plan in search_plan
                ],
            ]
        )

        ranked = rank_videos(
            profile,
            deduped,
            max_videos=5,
            module_context=module_context,
        )

        # Internal ranking metadata must not leak into course finalization.
        for video in ranked:
            video.pop("_discovery_queries", None)

        module_video_map[module_id] = ranked

        logger.info(
            "Video discovery completed | module=%s | candidates=%d | ranked=%d",
            module_id,
            len(deduped),
            len(ranked),
        )

    return module_video_map
