import logging
from typing import Dict, List, Any

from app.schemas.course_build import CourseBuildRequest
from app.schemas.profile import Profile
from app.services.youtube_client import search_and_enrich_videos
from app.services.ranking import rank_videos

logger = logging.getLogger(__name__)


def _map_video_length_pref(video_length: str | None) -> str:
    """
    Map profile preference to YouTube API duration filter.
    """
    if video_length == "short":
        return "short"
    if video_length == "long":
        return "long"
    return "any"


def discover_videos_for_modules(
    req: CourseBuildRequest,
    skeleton: dict,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Uses the skeleton searchPlan to fetch + rank videos for each module.
    Returns:
        {
            "m1": [video1, video2, ...],
            "m2": [video1, video2, ...]
        }
    """
    profile: Profile = req.profile
    modules = skeleton.get("modules", [])
    module_video_map: Dict[str, List[Dict[str, Any]]] = {}

    duration_filter = _map_video_length_pref(profile.videoLength)

    for module in modules:
        module_id = module.get("id", "")
        search_plan = module.get("searchPlan", [])

        all_candidates = []

        for plan in search_plan:
            query = plan.get("query", "").strip()
            target_count = int(plan.get("targetCount", 8) or 8)

            if not query:
                continue

            logger.info(f"Fetching YouTube candidates | module={module_id} | query={query}")

            try:
                videos = search_and_enrich_videos(
                    query=query,
                    max_results=target_count,
                    duration=duration_filter,
                    relevance_language="en",
                    region_code="IN",
                )
                all_candidates.extend(videos)
            except Exception:
                logger.exception(f"YouTube fetch failed for query: {query}")

        # Deduplicate by video ID
        seen_ids = set()
        deduped = []
        for video in all_candidates:
            vid = video.get("id")
            if vid and vid not in seen_ids:
                seen_ids.add(vid)
                deduped.append(video)

        ranked = rank_videos(profile, deduped, max_videos=5)
        module_video_map[module_id] = ranked

    return module_video_map