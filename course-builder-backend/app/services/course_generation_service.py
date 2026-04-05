import logging

from app.schemas.course_build import CourseBuildRequest
from app.ai.llm import invoke_course_llm
from app.ai.parsers import extract_json_block
from app.ai.course_builder_prompt import (
    build_skeleton_prompt,
    build_finalize_prompt,
)

logger = logging.getLogger(__name__)


async def generate_course_skeleton(req: CourseBuildRequest) -> dict:
    """
    First LLM pass: generate staged module skeleton + search plans.
    """
    prompt = build_skeleton_prompt(req)
    response_text = await invoke_course_llm(prompt)
    parsed = extract_json_block(response_text)

    if "modules" not in parsed or not isinstance(parsed["modules"], list):
        raise ValueError("Invalid skeleton response: missing 'modules' list")

    return parsed


async def finalize_course(
    req: CourseBuildRequest,
    skeleton: dict,
    module_videos: dict,
) -> dict:
    """
    Final LLM pass: generate finalized course JSON using ranked videos.
    """
    prompt = build_finalize_prompt(req, skeleton, module_videos)
    response_text = await invoke_course_llm(prompt)
    parsed = extract_json_block(response_text)

    if "modules" not in parsed or not isinstance(parsed["modules"], list):
        raise ValueError("Invalid final course response: missing 'modules' list")

    return parsed