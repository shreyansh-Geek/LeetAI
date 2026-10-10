
from app.services.video_discovery_service import (
    _merge_video_metadata,
    _video_id,
)


def check(name, condition):
    if not condition:
        raise AssertionError(f"FAIL: {name}")

    print(f"PASS: {name}")


def main():
    # Two search results for the same video, with different metadata.
    sparse = {
        "id": "video-1",
        "snippet": {
            "title": "Java Tutorial",
        },
    }

    complete = {
        "id": "video-1",
        "snippet": {
            "title": "Java Tutorial",
            "description": "Learn Java fundamentals",
            "channelTitle": "Example Channel",
            "publishedAt": "2026-01-01T00:00:00Z",
        },
        "contentDetails": {
            "duration": "PT10M",
        },
        "statistics": {
            "viewCount": "1000",
        },
    }

    # Test 1: Extract a normal string ID.
    check(
        "String video ID is extracted",
        _video_id(sparse) == "video-1",
    )

    # Test 2: Extract an ID from a dictionary.
    nested_id_video = {
        "id": {"videoId": "video-2"},
    }
    check(
        "Nested video ID is extracted",
        _video_id(nested_id_video) == "video-2",
    )

    # Test 3: Missing IDs are handled safely.
    check(
        "Missing video ID returns None",
        _video_id({"snippet": {}}) is None,
    )

    # Test 4: Missing metadata is filled from the duplicate.
    merged = _merge_video_metadata(sparse, complete)
    check(
        "Missing description is preserved from duplicate",
        merged["snippet"]["description"]
        == "Learn Java fundamentals",
    )

    check(
        "Existing title is preserved",
        merged["snippet"]["title"] == "Java Tutorial",
    )

    check(
        "Duration metadata is preserved",
        merged["contentDetails"]["duration"] == "PT10M",
    )

    check(
        "Statistics metadata is preserved",
        merged["statistics"]["viewCount"] == "1000",
    )

    # Test 5: Existing empty values are filled.
    empty_metadata = {
        "id": "video-3",
        "snippet": {
            "title": "",
            "description": None,
        },
    }

    richer_metadata = {
        "id": "video-3",
        "snippet": {
            "title": "Spring Boot Tutorial",
            "description": "Build a REST API",
        },
    }

    merged = _merge_video_metadata(
        empty_metadata,
        richer_metadata,
    )

    check(
        "Empty title is filled",
        merged["snippet"]["title"] == "Spring Boot Tutorial",
    )

    check(
        "Missing description is filled",
        merged["snippet"]["description"] == "Build a REST API",
    )

    print("\nAll discovery checks passed. No external API calls were made.")


if __name__ == "__main__":
    main()
