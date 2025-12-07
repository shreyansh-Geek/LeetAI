from typing import Optional
from pydantic import BaseModel

class Profile(BaseModel):
    topic: Optional[str] = None
    skillLevel: Optional[str] = None
    goalType: Optional[str] = None
    goalDetail: str = ""
    hoursPerDay: Optional[int] = None
    daysPerWeek: Optional[int] = None
    durationPreference: str = ""
    learningStyle: Optional[str] = None
    videoLength: Optional[str] = None
    wantsQuizzes: Optional[bool] = None
    wantsProjects: Optional[bool] = None
    favoriteChannels: str = ""
    avoidChannels: str = ""
    language: str = "English"
    needsSubtitles: Optional[bool] = None
    hardwareConstraints: str = ""
    motivation: Optional[int] = None
    structurePreference: Optional[str] = None
