"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { BookOpen, Calendar, Clock, LayoutDashboard, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { CourseBuildResponse } from "../course/types/course";
import { useCourseBuildStore } from "../course/store/useCourseBuildStore";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export default function MyCoursesPage() {
  useRequireAuth();
  const router = useRouter();
  const { token } = useAuthStore();
  const setCourseState = useCourseBuildStore((s) => s.startBuild); // Wait, we just need to set the current course in store
  
  const [courses, setCourses] = useState<CourseBuildResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    fetch(`${BASE_URL}/course-build/my-courses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then((data) => {
        setCourses(data.courses || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const loadCourse = (course: CourseBuildResponse) => {
    // Manually set the store
    useCourseBuildStore.setState({
      status: "success",
      course: course,
      error: null
    });
    router.push("/course");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-[#24CFA6] selection:text-[#050505]">
      {/* Navbar */}
      <nav className="border-b border-neutral-800/50 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/chat" className="flex items-center gap-2">
            <span className="text-[#24CFA6] font-bold text-xl">Leet</span>
            <span className="text-white font-bold text-xl">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/chat" 
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              New Course
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-[#24CFA6]/10 rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-[#24CFA6]" />
          </div>
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#24CFA6] animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 border border-neutral-800/50 border-dashed rounded-2xl bg-neutral-900/20">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              You haven't generated any learning roadmaps yet. Go chat with our AI to build your first course!
            </p>
            <Link 
              href="/chat"
              className="inline-flex items-center justify-center bg-[#24CFA6] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#20ba95] transition-all"
            >
              Create Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id || Math.random().toString()}
                onClick={() => loadCourse(course)}
                className="group p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/50 hover:border-[#24CFA6]/50 cursor-pointer transition-all hover:bg-neutral-900/80 hover:shadow-2xl hover:shadow-[#24CFA6]/5"
              >
                <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-500">
                  <Calendar className="w-4 h-4" />
                  {course.created_at ? format(new Date(course.created_at), "MMM d, yyyy") : "Recently"}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#24CFA6] transition-colors">
                  {course.summary ? course.summary.substring(0, 70) + "..." : "Untitled Roadmap"}
                </h3>
                
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <BookOpen className="w-4 h-4 text-[#24CFA6]" />
                    {course.modules?.length || 0} Modules
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Clock className="w-4 h-4 text-[#24CFA6]" />
                    {course.metadata?.totalTime || "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
