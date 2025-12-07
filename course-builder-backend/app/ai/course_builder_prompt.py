# app/ai/course_builder_prompt.py
from app.schemas.course_build import CourseBuildRequest

def build_skeleton_prompt(req: CourseBuildRequest) -> str:
    p = req.profile
    summary = req.userSummary or ""

    return f"""
You are LeetAI, an AI course architect.

USER PROFILE:
{p.model_dump_json(indent=2)}

USER SUMMARY:
{summary}

TASK:
Design a staged learning plan (modules) AND a YouTube search strategy,
but DO NOT pick exact videos yourself.

OUTPUT STRICT JSON:

{{
  "modules": [
    {{
      "id": "m1",
      "title": "Module title",
      "stageGoal": "Short goal sentence",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedDuration": "e.g. 2 weeks",
      "searchPlan": [
        {{
          "query": "search query string for YouTube",
          "targetCount": 8,
          "notes": "what kind of videos to look for (short, long, playlists, etc.)"
        }}
      ]
    }}
  ]
}}
""".strip()


def build_finalize_prompt(
    req: CourseBuildRequest,
    skeleton: dict,
    module_videos: dict,
) -> str:
    """
    skeleton: { "modules": [...] }
    module_videos: { "m1": [ {title, url, channel, duration, ...}, ... ], ... }
    """
    p = req.profile
    return f"""
You are LeetAI, an AI course architect.

USER PROFILE:
{p.model_dump_json(indent=2)}

MODULE SKELETON:
{skeleton}

CANDIDATE VIDEOS PER MODULE:
{module_videos}

TASK:
Convert this into a finalized course JSON with this EXACT schema:

{{
  "summary": "",
  "modules": [
    {{
      "title": "",
      "description": "",
      "duration": "",
      "outcomes": [],
      "videos": [
        {{
          "title": "",
          "url": "",
          "whyChosen": ""
        }}
      ]
    }}
  ],
  "playlist": [
    {{
      "title": "",
      "url": "",
      "channel": "",
      "duration": ""
    }}
  ],
  "metadata": {{
    "totalTime": "",
    "difficultyCurve": "",
    "version": "v1"
  }}
}}

Rules:
- Use ONLY the provided videos. Do not invent URLs.
- Explain "whyChosen" by linking the video to the user profile (goals, constraints).
- Ensure difficultyCurve is coherent from the user's skillLevel to their goal.
- Derive totalTime using the durations you see + profile.hoursPerDay/daysPerWeek.
Return ONLY JSON, no extra text.
""".strip()
