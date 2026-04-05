from datetime import datetime, timezone
from bson import ObjectId
from app.db.database import get_db


class CourseRepository:
    def __init__(self):
        self.db = get_db()

    async def create_course(self, course_dict: dict, user_id: str):
        course_to_save = dict(course_dict)
        course_to_save["user_id"] = user_id
        course_to_save["created_at"] = datetime.now(timezone.utc).isoformat()

        result = await self.db.courses.insert_one(course_to_save)

        saved_course = await self.db.courses.find_one({"_id": result.inserted_id})
        return self._serialize_course(saved_course)

    async def get_courses_by_user(self, user_id: str, limit: int = 50):
        cursor = (
            self.db.courses
            .find({"user_id": user_id})
            .sort("created_at", -1)
        )
        courses = await cursor.to_list(length=limit)
        return [self._serialize_course(c) for c in courses]

    async def get_course_by_id(self, course_id: str, user_id: str):
        course = await self.db.courses.find_one({
            "_id": ObjectId(course_id),
            "user_id": user_id
        })
        return self._serialize_course(course) if course else None

    def _serialize_course(self, course: dict | None):
        if not course:
            return None

        course["id"] = str(course["_id"])
        course.pop("_id", None)
        return course