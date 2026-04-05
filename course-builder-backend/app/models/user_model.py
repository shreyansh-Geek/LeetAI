from typing import TypedDict


class UserDocument(TypedDict, total=False):
    id: str
    email: str
    name: str
    password: str