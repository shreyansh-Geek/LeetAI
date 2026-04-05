from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)


class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    async def signup(self, user):
        existing_user = await self.user_repo.get_by_email(user.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        user_dict = user.model_dump()
        user_dict["password"] = get_password_hash(user.password)

        result = await self.user_repo.create_user(user_dict)

        return {
            "id": str(result.inserted_id),
            "email": user.email,
            "name": user.name,
        }

    async def login(self, email: str, password: str):
        user = await self.user_repo.get_by_email(email)

        if not user or not verify_password(password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token(data={"sub": user["email"]})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user.get("name"),
            }
        }