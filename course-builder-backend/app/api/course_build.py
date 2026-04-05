import json
import logging

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.schemas.course_build import CourseBuildRequest
from app.core.security import get_current_user
from app.services.course_persistence_service import CoursePersistenceService
from app.services.course_engine import build_course_stream

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/course-build", tags=["Course Build"])
course_persistence = CoursePersistenceService()


@router.post("/start")
async def start_build(
    req: CourseBuildRequest,
    current_user: dict = Depends(get_current_user)
):
    async def event_generator():
        try:
            async for chunk in build_course_stream(req):
                # Save final course when generation succeeds
                if chunk.get("status") == "success" and chunk.get("course"):
                    saved_course = await course_persistence.save_generated_course(
                        chunk["course"],
                        str(current_user["_id"])
                    )
                    chunk["course"] = saved_course

                yield f"data: {json.dumps(chunk)}\n\n"

        except Exception as e:
            logger.exception("Course build failed")
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/my-courses")
async def get_my_courses(current_user: dict = Depends(get_current_user)):
    courses = await course_persistence.get_user_courses(str(current_user["_id"]))
    return {"courses": courses}