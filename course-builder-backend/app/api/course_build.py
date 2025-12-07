# app/api/course_build.py
from fastapi import APIRouter, HTTPException
from app.schemas.course_build import CourseBuildRequest, CourseBuildResponse
from app.services.course_engine import build_course

router = APIRouter()

@router.post("/start", response_model=CourseBuildResponse)
async def start_build(req: CourseBuildRequest):
    try:
        result = build_course(req)
        return result
    except Exception as e:
        # For debugging you can log e / traceback
        raise HTTPException(status_code=500, detail=f"Course generation failed: {e}")
