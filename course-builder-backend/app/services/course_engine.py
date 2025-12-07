# app/services/course_engine.py

import json
import re
from typing import Dict, List

from google import genai

from app.core.config import settings
from app.schemas.course_build import CourseBuildRequest, CourseBuildResponse
from app.services.youtube_client import YouTubeClient
from app.services.ranking import rank_videos
from app.ai.course_builder_prompt import build_skeleton_prompt, build_finalize_prompt

client = genai.Client(api_key=settings.GEMINI_API_KEY)
yt_client = YouTubeClient()


def _map_video_resource_to_simple(video: Dict) -> Dict:
    """
    Convert a full YouTube API video resource into the compact structure
    we pass into the finalizer LLM.
    """
    snippet = video.get("snippet", {})
    content = video.get("contentDetails", {})
    stats = video.get("statistics", {})

    vid_id = video.get("id")

    return {
        "id": vid_id,
        "title": snippet.get("title"),
        "channel": snippet.get("channelTitle"),
        "url": f"https://www.youtube.com/watch?v={vid_id}",
        "durationIso": content.get("duration"),
        "viewCount": stats.get("viewCount"),
        "publishedAt": snippet.get("publishedAt"),
        "description": snippet.get("description"),
    }


def _extract_json_block(raw: str) -> Dict:
    """
    Try to parse JSON directly. If that fails, attempt to extract the first
    JSON object via regex and parse that.

    This is needed because the current google-genai SDK version you're using
    does NOT support forcing JSON-only output via response_mime_type, etc.
    """
    raw = (raw or "").strip()

    # 1) Direct attempt
    try:
        return json.loads(raw)
    except Exception:
        pass

    # 2) Fallback: grab the first {...} block
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        raise ValueError(f"LLM did not return parseable JSON. Raw was:\n{raw}")

    json_str = match.group(0)
    return json.loads(json_str)


def build_course(req: CourseBuildRequest) -> CourseBuildResponse:
    """
    High-level pipeline:

    1) Ask LLM to produce a module skeleton + searchPlan (no videos yet).
    2) For each module & search query:
       - call YouTube Search API
       - fetch details for those video IDs
       - rank videos with our personalization engine
    3) Call LLM again with:
       - user profile
       - skeleton
       - selected videos per module
       to produce the final CourseBuildResponse JSON.
    """

    # -------------------------------------------------
    # 1) Skeleton + search plan (planner LLM)
    # -------------------------------------------------
    skeleton_prompt = build_skeleton_prompt(req)

    skeleton_resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=skeleton_prompt,  # SAME style as your working /chat endpoint
    )

    skeleton_raw = (getattr(skeleton_resp, "text", "") or "").strip()

    print("\n===== RAW SKELETON LLM OUTPUT =====")
    print(skeleton_raw)
    print("===== END RAW SKELETON OUTPUT =====\n")

    skeleton = _extract_json_block(skeleton_raw)
    modules = skeleton.get("modules", []) or []

    module_videos_simple: Dict[str, List[Dict]] = {}

    # -------------------------------------------------
    # 2) For each module: search → details → rank
    # -------------------------------------------------
    for mod in modules:
        mod_id = mod.get("id")
        if not mod_id:
            continue

        search_plan = mod.get("searchPlan", []) or []
        candidates: List[Dict] = []

        for plan in search_plan:
            query = plan.get("query") or ""
            if not query:
                continue

            target_count = int(plan.get("targetCount", 8))

            # map profile.videoLength -> YouTube videoDuration
            pref = req.profile.videoLength
            if pref == "short":
                duration_filter = "short"
            elif pref == "long":
                duration_filter = "long"
            else:
                duration_filter = "any"

            search_items = yt_client.search_videos(
                query=query,
                max_results=target_count,
                duration=duration_filter,
                relevance_language=req.profile.language[:2]
                if req.profile.language
                else None,
            )

            video_ids = [
                item.get("id", {}).get("videoId")
                for item in search_items
                if item.get("id", {}).get("videoId")
            ]

            if not video_ids:
                continue

            detail_items = yt_client.fetch_video_details(video_ids)
            candidates.extend(detail_items)

        if not candidates:
            module_videos_simple[mod_id] = []
            continue

        ranked = rank_videos(req.profile, candidates, max_videos=5)
        module_videos_simple[mod_id] = [
            _map_video_resource_to_simple(v) for v in ranked
        ]

    # -------------------------------------------------
    # 3) Finalize course JSON via LLM
    # -------------------------------------------------
    finalize_prompt = build_finalize_prompt(
        req=req,
        skeleton=skeleton,
        module_videos=module_videos_simple,
    )

    final_resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=finalize_prompt,  # again, same style as /chat
    )

    final_raw = (getattr(final_resp, "text", "") or "").strip()

    print("\n===== RAW FINAL LLM OUTPUT =====")
    print(final_raw)
    print("===== END RAW FINAL OUTPUT =====\n")

    final_data = _extract_json_block(final_raw)

    # Pydantic validation will catch if the LLM response doesn't match schema
    return CourseBuildResponse(**final_data)
