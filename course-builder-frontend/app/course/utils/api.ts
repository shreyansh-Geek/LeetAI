import { Profile } from "@/app/chat/types/profile";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
import { CourseBuildResponse } from "@/app/course/types/course";


export async function buildCourse(
  profile: Profile,
  summary?: string
): Promise<CourseBuildResponse> {

  const res = await fetch(`${BASE_URL}/course-build/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, userSummary: summary || "" }),
  });

  const text = await res.text();

  if (!res.ok) {
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      err = { detail: text };
    }
    throw new Error(err.detail || "Failed to create course");
  }

  return JSON.parse(text);
}
