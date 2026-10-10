from app.schemas.course_build import CourseBuildRequest


def build_skeleton_prompt(req: CourseBuildRequest) -> str:
    p = req.profile
    summary = req.userSummary or ""

    return f"""
You are LeetAI, an AI course architect. Design a practical learning roadmap and a
high-precision YouTube discovery plan for every module.

USER PROFILE:
{p.model_dump_json(indent=2)}

USER SUMMARY:
{summary}

TASK:
Create a progressive course roadmap. For each module, define concrete learning
outcomes and search queries that retrieve videos teaching those outcomes.
Do NOT select or invent exact videos.

OUTPUT STRICT JSON:
{{
  "modules": [
    {{
      "id": "m1",
      "title": "Specific module title",
      "stageGoal": "A concrete, observable goal for this module",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedDuration": "e.g. 2 weeks",
      "keyTopics": ["specific concept", "specific concept"],
      "learningOutcomes": [
        "An observable skill the learner should gain",
        "Another observable skill"
      ],
      "searchPlan": [
        {{
          "query": "Specific YouTube search query",
          "targetCount": 8,
          "notes": "Which learning outcome or topic this query covers"
        }}
      ]
    }}
  ]
}}

ROADMAP RULES:
- Sequence modules from prerequisites to more advanced application.
- Adapt to the user's goal, current level, available time, and preferences.
- Avoid unnecessary modules, repeated topics, and vague filler modules.
- Give each module 3-6 specific keyTopics and 3-5 measurable learningOutcomes.
- Outcomes must describe skills or concepts, not generic statements such as
  "understand the topic".
- Keep module titles narrow enough that their relevance can be evaluated.


YOUTUBE SEARCH PLAN RULES:
- Create 2-4 distinct queries per module.
- Each query must target one specific key topic or learning outcome.
- Include the module's technology and the exact concept being taught.
- Prefer searchable phrases such as:
  "Spring Boot REST controller request body response status codes"
  "Spring Data JPA entity relationships and repository methods"
  "Java HashMap put get containsKey practical examples"
- Use different search intents where appropriate:
  1. Concept explanation
  2. Practical implementation
  3. Common problems or debugging
  4. A focused project, when relevant
- Do not repeat the same topic using superficial wording changes.
- Avoid broad queries that could return videos for the entire course.
- Each query's notes must identify the intended learning outcome
  and the evidence that would make a video relevant.
- Set targetCount to 6-8 for each query.
- Do not include channel names unless the user explicitly prefers them.
- Do not assume that a query will return relevant videos; candidates
  must still be evaluated using their titles and available metadata.
- Do not invent video details, availability, or quality claims.


Return ONLY valid JSON. Do not include markdown or extra commentary.
""".strip()


def build_finalize_prompt(
    req: CourseBuildRequest,
    skeleton: dict,
    module_videos: dict,
) -> str:
    """
    skeleton: module structure with learning outcomes and search plans
    module_videos: ranked candidate videos for each module
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
Finalize the course using the supplied module skeleton and candidate videos.

OUTPUT STRICT JSON with this exact top-level schema:
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

VIDEO RELEVANCE AND SELECTION:
- Treat each module's title, stageGoal, keyTopics, learningOutcomes, and searchPlan
  as the source of truth for what belongs in that module.
- Select only videos that directly teach at least one of that module's key topics
  or learning outcomes. Mentioning the broad course subject is not sufficient.
- Prefer videos with specific evidence of relevance in their titles and supplied
  metadata. Do not infer detailed coverage from a vague title.
- Select a complementary set: prefer resources that cover different aspects of
  the module rather than several videos that appear to teach the same thing.
- Prefer a focused, directly relevant set over filling every module with five
  videos. A module may contain fewer videos, or none, if candidates are weak.
- Do not assign the same video more than once within a module.
- Use ONLY supplied candidates. Never invent URLs, titles, channels, durations,
  views, captions, or other metadata.
- Preserve the actual title, URL, channel, and duration of every selected video.
- Explain whyChosen briefly and specifically, tying the video to a module outcome.
  Do not make unsupported claims about what the video contains.

COURSE AND PLAYLIST RULES:
- Keep the skeleton's module sequence and topic intent. You may improve wording,
  but do not silently change the module's scope.
- Use the skeleton's learningOutcomes as the basis for final module outcomes.
- Every module must contain a videos array, even when empty.
- Build the global playlist only from videos selected for modules.
- Every playlist item must correspond to a video assigned to at least one module.
- Use the same video URL consistently in modules and the global playlist.
- Do not add videos to the playlist that are absent from module videos.
- Generate a concise, meaningful, topic-specific course title.
- Make module descriptions and outcomes practical and concise.
- Ensure difficulty progresses logically from the user's current skill level.
- Estimate totalTime realistically using module durations and the user's schedule.

Return ONLY valid JSON. Do not include markdown or extra commentary.
""".strip()
