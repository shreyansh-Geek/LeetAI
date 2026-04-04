from typing import List, Optional
from pydantic import BaseModel
from app.schemas.profile import Profile

class ModuleVideo(BaseModel):
    title: str
    url: str
    whyChosen: str

class CourseModule(BaseModel):
    title: str
    description: str
    duration: str
    outcomes: List[str]
    videos: List[ModuleVideo]

class PlaylistItem(BaseModel):
    title: str
    url: str
    channel: str
    duration: str

class CourseMetadata(BaseModel):
    totalTime: str
    difficultyCurve: str
    version: str = "v1"

class CourseBuildRequest(BaseModel):
    profile: Profile
    userSummary: Optional[str] = None

class CourseBuildResponse(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    created_at: Optional[str] = None
    summary: str
    modules: List[CourseModule]
    playlist: List[PlaylistItem]
    metadata: CourseMetadata
