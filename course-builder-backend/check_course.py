import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import parse_qs, urlparse

COURSE_FILE = Path(__file__).with_name("sample_course.json")
YOUTUBE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")


def youtube_video_id(url):
    """Return a YouTube video ID from common URL formats, or None."""
    if not isinstance(url, str) or not url.strip():
        return None
    raw = url.strip()
    parsed = urlparse(raw if "://" in raw else f"https://{raw}")
    host = (parsed.hostname or "").lower()
    video_id = None

    if host == "youtu.be" or host == "www.youtu.be":
        video_id = parsed.path.strip("/").split("/")[0]
    elif host.endswith("youtube.com") or host.endswith("youtube-nocookie.com"):
        if parsed.path == "/watch":
            video_id = parse_qs(parsed.query).get("v", [None])[0]
        elif parsed.path.startswith(("/embed/", "/shorts/", "/live/")):
            parts = parsed.path.strip("/").split("/")
            if len(parts) >= 2:
                video_id = parts[1]

    return video_id if video_id and YOUTUBE_ID_RE.fullmatch(video_id) else None


def main():
    print("LeetAI local course check")
    print("----------------------------")

    if not COURSE_FILE.exists():
        print(f"FAIL: Could not find {COURSE_FILE.name} beside check_course.py.")
        return 1

    try:
        with COURSE_FILE.open("r", encoding="utf-8") as file:
            course = json.load(file)
    except json.JSONDecodeError as exc:
        print(f"FAIL: Invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}")
        return 1
    except OSError as exc:
        print(f"FAIL: Could not read {COURSE_FILE.name}: {exc}")
        return 1

    errors = []
    warnings = []

    if not isinstance(course, dict):
        print("FAIL: Course JSON must be an object.")
        return 1

    title = course.get("title")
    modules = course.get("modules")
    playlist = course.get("playlist")

    print(f"Course: {title.strip() if isinstance(title, str) and title.strip() else '(missing title)'}")

    if not isinstance(title, str) or not title.strip():
        errors.append("Course title is missing or empty.")
    if not isinstance(modules, list):
        errors.append("'modules' must be a list.")
        modules = []
    if not isinstance(playlist, list):
        errors.append("'playlist' must be a list.")
        playlist = []

    modules_with_videos = 0
    module_video_assignments = 0
    module_occurrences = defaultdict(list)
    module_video_ids = set()

    for module_index, module in enumerate(modules, start=1):
        if not isinstance(module, dict):
            errors.append(f"Module {module_index} must be an object.")
            continue

        module_title = module.get("title") or f"Module {module_index}"
        videos = module.get("videos", [])
        if not isinstance(videos, list):
            errors.append(f"{module_title}: 'videos' must be a list.")
            continue

        if videos:
            modules_with_videos += 1

        seen_in_module = set()
        for video_index, video in enumerate(videos, start=1):
            module_video_assignments += 1
            if not isinstance(video, dict):
                errors.append(f"{module_title}, video {video_index} must be an object.")
                continue

            video_id = youtube_video_id(video.get("url"))
            if not video_id:
                errors.append(
                    f"{module_title}, video {video_index} has an invalid or unsupported YouTube URL."
                )
                continue

            if video_id in seen_in_module:
                errors.append(f"{module_title} contains the same video more than once: {video_id}.")
            seen_in_module.add(video_id)
            module_occurrences[video_id].append(module_title)
            module_video_ids.add(video_id)

    for video_id, module_names in module_occurrences.items():
        unique_modules = list(dict.fromkeys(module_names))
        if len(unique_modules) > 1:
            warnings.append(
                f"Video {video_id} is assigned across multiple modules: "
                + ", ".join(unique_modules)
                + "."
            )

    playlist_seen = set()
    for item_index, item in enumerate(playlist, start=1):
        if not isinstance(item, dict):
            errors.append(f"Playlist item {item_index} must be an object.")
            continue

        video_id = youtube_video_id(item.get("url"))
        if not video_id:
            errors.append(
                f"Playlist item {item_index} has an invalid or unsupported YouTube URL."
            )
            continue

        if video_id in playlist_seen:
            errors.append(f"The global playlist contains duplicate video ID {video_id}.")
        playlist_seen.add(video_id)

    for video_id in sorted(module_video_ids - playlist_seen):
        errors.append(f"Module video {video_id} is missing from the global playlist.")
    for video_id in sorted(playlist_seen - module_video_ids):
        errors.append(f"Playlist video {video_id} does not appear in any module.")

    print(f"Modules: {len(modules)}")
    print(f"Modules with videos: {modules_with_videos}")
    print(f"Module video assignments: {module_video_assignments}")
    print(f"Unique module videos: {len(module_video_ids)}")
    print(f"Playlist items: {len(playlist)}")
    print(f"Unique playlist videos: {len(playlist_seen)}")

    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"FAIL: {error}")

    if errors:
        print(f"\nFAILED: {len(errors)} problem(s) found.")
        return 1
    if warnings:
        print(f"\nPASSED WITH WARNINGS: {len(warnings)} warning(s).")
    else:
        print("\nPASSED: Course structure and playlist consistency look good.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
