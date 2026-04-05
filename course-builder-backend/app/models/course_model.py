from typing import TypedDict, List, Dict, Any


class CourseDocument(TypedDict, total=False):
    id: str
    user_id: str
    created_at: str
    title: str
    summary: str
    modules: List[Dict[str, Any]]
    playlist: List[Dict[str, Any]]
    metadata: Dict[str, Any]