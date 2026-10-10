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

Rules:
- Make the module sequence logically progressive
- Respect learner goals, time, and skill level
- Keep modules concise and realistic
- Return ONLY valid JSON
- Do not include markdown
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
  "title": "A concise, topic-specific course title",
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
- Use ONLY the provided candidate videos. Never invent URLs, video titles, channels, or durations.
- Assign videos to the module whose learning objective they best support.
- Use the module skeleton's title, stageGoal, and searchPlan to determine relevance.
- Do not assign the same video more than once within a module.
- Prefer relevant videos over filling a module with unrelated videos.
- If a module has no relevant candidate videos, return an empty videos array for that module.
- Every module must contain a videos array, even if it is empty.
- Build the global playlist from the selected module videos only.
- Every playlist item must correspond to a video assigned to at least one module.
- Use the same video URL consistently in modules and the global playlist.
- Do not add videos to the global playlist that are absent from all module videos.
- Preserve the actual title, URL, channel, and duration of each selected candidate video.
- For each module video, explain whyChosen in terms of that module's learning objective and the user's goals.
- Generate a concise, meaningful, topic-specific course title as a non-empty string.
- Ensure difficultyCurve progresses logically from the user's current skill level toward their goal.
- Estimate totalTime realistically using the module durations and the user's hoursPerDay/daysPerWeek.
- Keep module descriptions and learning outcomes practical and concise.
- Return ONLY valid JSON.
- Do not include markdown.


""".strip()