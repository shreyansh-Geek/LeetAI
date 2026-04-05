from app.repositories.course_repository import CourseRepository


class CoursePersistenceService:
    def __init__(self):
        self.course_repo = CourseRepository()

    async def save_generated_course(self, course_dict: dict, user_id: str):
        return await self.course_repo.create_course(course_dict, user_id)

    async def get_user_courses(self, user_id: str):
        return await self.course_repo.get_courses_by_user(user_id)

    async def get_user_course_by_id(self, course_id: str, user_id: str):
        return await self.course_repo.get_course_by_id(course_id, user_id)