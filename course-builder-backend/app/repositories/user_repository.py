from app.db.database import get_db


class UserRepository:
    def __init__(self):
        self.db = get_db()

    async def get_by_email(self, email: str):
        return await self.db.users.find_one({"email": email})

    async def create_user(self, user_dict: dict):
        return await self.db.users.insert_one(user_dict)

    async def get_by_id(self, user_id: str):
        from bson import ObjectId
        return await self.db.users.find_one({"_id": ObjectId(user_id)})