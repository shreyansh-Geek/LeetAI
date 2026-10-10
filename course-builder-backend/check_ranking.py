"""Quick offline checks for LeetAI video ranking.

Copy this file to course-builder-backend/check_ranking.py and run:
    python check_ranking.py

Uses synthetic video data only; no YouTube or Gemini API calls are made.
"""
from types import SimpleNamespace

from app.services.ranking import parse_duration_seconds, rank_videos


def profile(**overrides):
    values = {
        "topic": "Java backend development",
        "videoLength": "any",
        "favoriteChannels": "",
        "avoidChannels": "",
        "needsSubtitles": False,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def video(video_id, title, *, views=1000, channel="Example Channel", duration="PT15M", caption="true"):
    return {
        "id": video_id,
        "snippet": {
            "title": title,
            "description": "",
            "channelTitle": channel,
        },
        "statistics": {"viewCount": str(views)},
        "contentDetails": {"duration": duration, "caption": caption},
    }


def check(name, condition):
    if not condition:
        raise AssertionError(f"FAIL: {name}")
    print(f"PASS: {name}")


def main():
    learner = profile()
    module_context = "Java Collections HashMap and ArrayList"

    relevant = video("relevant", "Java Collections: HashMap and ArrayList", views=100)
    popular_but_irrelevant = video("popular", "Top 10 most watched gaming moments", views=1_000_000_000)
    ranked = rank_videos(learner, [popular_but_irrelevant, relevant], module_context=module_context)
    check("module relevance beats extreme popularity", ranked[0]["id"] == "relevant")

    preferred = video("preferred", "Java Collections tutorial", channel="Trusted Teacher")
    ordinary = video("ordinary", "Java Collections tutorial", channel="Other Teacher")
    ranked = rank_videos(profile(favoriteChannels="Trusted Teacher"), [ordinary, preferred], module_context=module_context)
    check("favorite channel gets a ranking boost", ranked[0]["id"] == "preferred")

    avoided = video("avoided", "Java Collections tutorial", channel="Avoid This Channel")
    good = video("good", "Java Collections tutorial", channel="Good Channel")
    ranked = rank_videos(profile(avoidChannels="Avoid This Channel"), [avoided, good], module_context=module_context)
    check("avoided channel is ranked lower", ranked[0]["id"] == "good")

    short_profile = profile(videoLength="short")
    unknown_duration = video("unknown", "Java Collections tutorial", duration="not-a-duration")
    actual_short = video("short", "Java Collections tutorial", duration="PT7M")
    ranked = rank_videos(short_profile, [unknown_duration, actual_short], module_context=module_context)
    check("known preferred duration beats unknown duration", ranked[0]["id"] == "short")
    check("invalid duration safely returns unknown", parse_duration_seconds("not-a-duration") == 0)

    ranked = rank_videos(learner, [relevant, popular_but_irrelevant], max_videos=1, module_context=module_context)
    check("result limit is respected", len(ranked) == 1)
    check("zero result limit returns empty list", rank_videos(learner, [relevant], max_videos=0) == [])

    
    # Module assignment: Spring Boot resources should rank above
    # unrelated Java Collections resources for a Spring Boot module.
    spring_profile = profile(topic="software development")

    spring_video = video(
        "spring",
        "Spring Boot REST API Tutorial: Controllers and Endpoints",
    )
    collections_video = video(
        "collections",
        "Java Collections Tutorial: HashMap and ArrayList",
    )

    ranked = rank_videos(
        spring_profile,
        [collections_video, spring_video],
        module_context="Spring Boot REST API controllers and endpoints",
    )
    check(
        "Spring Boot module prefers its relevant video",
        ranked[0]["id"] == "spring",
    )

    # Changing the module context should change the preferred resource.
    ranked = rank_videos(
        spring_profile,
        [spring_video, collections_video],
        module_context="Java Collections HashMap and ArrayList",
    )
    check(
        "Java Collections module prefers its relevant video",
        ranked[0]["id"] == "collections",
    )

    
    # Relevance check: REST videos should outrank unrelated JPA content.
    rest_context = (
        "Spring Boot REST API controllers HTTP methods status codes Postman"
    )
    rest_videos = [
        video("rest", "Spring Boot REST API Tutorial with Controllers"),
        video("postman", "Test REST APIs with Postman and HTTP Status Codes"),
        video("jpa", "Spring Data JPA Hibernate Entity Repository Tutorial"),
    ]

    ranked = rank_videos(
        learner, rest_videos, max_videos=3, module_context=rest_context
    )
    ranked_ids = [item["id"] for item in ranked]
    check(
        "REST-focused video is retained",
        "rest" in ranked_ids,
    )

    if "jpa" in ranked_ids:
        check(
            "REST video ranks above JPA content",
            ranked_ids.index("rest") < ranked_ids.index("jpa"),
        )
    else:
        print("INFO: Unrelated JPA video was filtered out")

    # Diversity check: a distinct REST topic should survive near-duplicates.
    diversity_videos = [
        video("rest1", "Spring Boot REST API Tutorial for Beginners"),
        video("rest2", "Spring Boot REST API Tutorial Complete Course"),
        video("status", "HTTP Status Codes Explained with REST API Examples"),
    ]

    ranked = rank_videos(
        learner, diversity_videos, max_videos=2, module_context=rest_context
    )
    ranked_ids = [item["id"] for item in ranked]
    check(
        "ranking includes a distinct REST topic when selecting two videos",
        "status" in ranked_ids,
    )


    print("\nAll quick ranking checks passed. No external API calls were made.")


if __name__ == "__main__":
    main()
