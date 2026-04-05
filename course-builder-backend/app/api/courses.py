from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.services.course_persistence_service import CoursePersistenceService

router = APIRouter(prefix="/courses", tags=["Courses"])
course_service = CoursePersistenceService()


@router.get("")
async def get_my_courses(current_user: dict = Depends(get_current_user)):
    courses = await course_service.get_user_courses(str(current_user["_id"]))
    return {"courses": courses}


@router.get("/{course_id}")
async def get_course_by_id(course_id: str, current_user: dict = Depends(get_current_user)):
    course = await course_service.get_user_course_by_id(course_id, str(current_user["_id"]))
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course