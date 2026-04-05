import logging
from typing import AsyncGenerator

from app.schemas.course_build import CourseBuildRequest
from app.services.course_generation_service import (
    generate_course_skeleton,
    finalize_course,
)
from app.services.video_discovery_service import discover_videos_for_modules

logger = logging.getLogger(__name__)


async def build_course_stream(req: CourseBuildRequest) -> AsyncGenerator[dict, None]:
    """
    Main SSE orchestration flow for course generation.
    """
    try:
        yield {
            "status": "planning",
            "message": "Generating course skeleton..."
        }

        skeleton = await generate_course_skeleton(req)

        yield {
            "status": "planning_complete",
            "message": "Course skeleton ready",
            "skeleton": skeleton,
        }

        yield {
            "status": "youtube",
            "message": "Fetching and ranking YouTube resources..."
        }

        module_videos = discover_videos_for_modules(req, skeleton)

        yield {
            "status": "youtube_complete",
            "message": "YouTube resources fetched",
            "module_videos": module_videos,
        }

        yield {
            "status": "finalizing",
            "message": "Building final personalized course..."
        }

        final_course = await finalize_course(req, skeleton, module_videos)

        yield {
            "status": "success",
            "message": "Course generated successfully",
            "course": final_course,
        }

    except Exception as e:
        logger.exception("Course generation failed")
        yield {
            "status": "error",
            "message": str(e),
        }