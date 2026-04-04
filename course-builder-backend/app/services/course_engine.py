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
    Robustly extract the first complete JSON object from LLM output.

    Strategy:
    1) Try direct json.loads — works when the LLM returns clean JSON.
    2) Strip markdown code fences (```json ... ```) and retry.
    3) Use JSONDecoder.raw_decode() which correctly finds and parses the
       first balanced {…} object, ignoring any surrounding text. This is
       RFC-compliant and handles nested JSON without greedy regex issues.
    """
    raw = (raw or "").strip()

    # 1) Direct attempt
    try:
        return json.loads(raw)
    except Exception:
        pass

    # 2) Strip markdown code fences that Gemini sometimes adds
    stripped = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    stripped = re.sub(r"\s*```$", "", stripped).strip()
    try:
        return json.loads(stripped)
    except Exception:
        pass

    # 3) Find the start of the first '{' and use raw_decode which handles
    #    nested structures correctly without greedy matching.
    start = stripped.find("{")
    if start == -1:
        raise ValueError(f"LLM did not return parseable JSON. Raw was:\n{raw[:500]}")

    try:
        obj, _ = json.JSONDecoder().raw_decode(stripped, start)
        return obj
    except json.JSONDecodeError as e:
        raise ValueError(f"Could not parse JSON from LLM output: {e}\nRaw was:\n{raw[:500]}")


import asyncio

async def build_course_stream(req: CourseBuildRequest):
    """
    High-level pipeline via SSE chunks:
    1) Send "planning" status. Ask LLM to produce skeleton + searchPlan.
    2) Send "youtube" status. Fetch chunks.
    3) Send "ranking" status inside module looping.
    4) Send "finalizing" status before final output.
    5) Send "success" with valid course.
    """

    yield {"status": "planning"}
    # -------------------------------------------------
    # 1) Skeleton + search plan (planner LLM)
    # -------------------------------------------------
    skeleton_prompt = build_skeleton_prompt(req)

    skeleton_resp = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash-lite",
        contents=skeleton_prompt,
    )

    skeleton_raw = (getattr(skeleton_resp, "text", "") or "").strip()
    skeleton = _extract_json_block(skeleton_raw)
    modules = skeleton.get("modules", []) or []

    yield {"status": "youtube"}
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

            pref = req.profile.videoLength
            if pref == "short":
                duration_filter = "short"
            elif pref == "long":
                duration_filter = "long"
            else:
                duration_filter = "any"

            search_items = await asyncio.to_thread(
                yt_client.search_videos,
                query=query,
                max_results=target_count,
                duration=duration_filter,
                relevance_language=req.profile.language[:2] if req.profile.language else None,
            )

            video_ids = [
                item.get("id", {}).get("videoId")
                for item in search_items
                if item.get("id", {}).get("videoId")
            ]

            if not video_ids:
                continue

            detail_items = await asyncio.to_thread(yt_client.fetch_video_details, video_ids)
            candidates.extend(detail_items)

        if not candidates:
            module_videos_simple[mod_id] = []
            continue

        yield {"status": "ranking"}
        ranked = await asyncio.to_thread(rank_videos, req.profile, candidates, 5) # Passing 5 explicitly as kwargs issues may arise
        module_videos_simple[mod_id] = [
            _map_video_resource_to_simple(v) for v in ranked
        ]

    yield {"status": "finalizing"}
    # -------------------------------------------------
    # 3) Finalize course JSON via LLM
    # -------------------------------------------------
    finalize_prompt = build_finalize_prompt(
        req=req,
        skeleton=skeleton,
        module_videos=module_videos_simple,
    )

    final_resp = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash-lite",
        contents=finalize_prompt,
    )

    final_raw = (getattr(final_resp, "text", "") or "").strip()

    try:
        final_data = _extract_json_block(final_raw)
    except ValueError as e:
        yield {"status": "error", "message": f"LLM returned invalid JSON: {e}"}
        return

    # Validate output by instantiating Pydantic (v2: use model_dump, not dict)
    try:
        valid_course = CourseBuildResponse(**final_data).model_dump()
    except Exception as e:
        yield {"status": "error", "message": f"Course schema validation failed: {e}"}
        return

    yield {"status": "success", "course": valid_course}
