# app/api/course_build.py

from fastapi import APIRouter, HTTPException, Depends
import json
from datetime import datetime, timezone

from app.schemas.course_build import CourseBuildRequest, CourseBuildResponse
from app.db.database import get_db
from app.core.security import get_current_user

router = APIRouter()

from fastapi.responses import StreamingResponse
from app.services.course_engine import build_course_stream

# -----------------------------------------------------------
# 1. SSE Streaming endpoint
# -----------------------------------------------------------
@router.post("/start")
async def start_build(req: CourseBuildRequest, current_user: dict = Depends(get_current_user)):
    """
    Build the full course using Server-Sent Events stream.
    """
    async def event_generator():
        try:
            async for chunk in build_course_stream(req):
                # If we get "success", it has the course payload
                if chunk.get("status") == "success":
                    course_dict = chunk["course"]
                    
                    # Save to DB
                    db = get_db()
                    course_dict["user_id"] = str(current_user["_id"])
                    course_dict["created_at"] = datetime.now(timezone.utc).isoformat()
                    
                    inserted = await db.courses.insert_one(course_dict)
                    
                    course_dict["id"] = str(inserted.inserted_id)
                    
                    # Motor mutates course_dict by adding _id (an ObjectId), delete it before JSON serialization
                    if "_id" in course_dict:
                        del course_dict["_id"]
                        
                    chunk["course"] = course_dict
                    
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/my-courses")
async def get_my_courses(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.courses.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    courses = await cursor.to_list(length=50)
    
    # map _id to id so pydantic can parse if needed later, or return direct mapping
    course_list = []
    for c in courses:
        c["id"] = str(c["_id"])
        del c["_id"]
        course_list.append(c)
        
    return {"courses": course_list}
