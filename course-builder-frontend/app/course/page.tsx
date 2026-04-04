"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCourseBuildStore } from "./store/useCourseBuildStore";
import { CourseLayout } from "./components/CourseLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function CoursePage() {
  useRequireAuth();
  const router = useRouter();
  const { status } = useCourseBuildStore();

  useEffect(() => {
    // If nothing is happening (no build started), send them back to chat
    if (status === "idle") {
      router.replace("/chat");
    }
  }, [status, router]);

  if (status === "idle") {
    // brief blank while redirecting
    return null;
  }

  return <CourseLayout />;
}
