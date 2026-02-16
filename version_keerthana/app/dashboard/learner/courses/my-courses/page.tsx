"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, BookOpen, Clock } from "lucide-react";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { syncCoursesFromBackend } from "@/lib/canonicalStore";
import { getMyEnrollments } from "@/lib/api/enrollments";
import { isLocallyEnrolled } from "@/lib/localEnrollments";
import { learningPaths } from "@/data/learningPaths";

export default function MyCoursesPage() {
  const { state, refresh } = useLearnerProgress();
  const { getPublishedCoursesForPath, refresh: refreshCanonical } = useCanonicalStore();
  const [mounted, setMounted] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  // Sync courses from backend on mount
  useEffect(() => {
    setMounted(true);
    syncCoursesFromBackend()
      .then(() => refreshCanonical())
      .catch(console.error);
    getMyEnrollments()
      .then((res) => setEnrolledCourseIds(new Set((res.enrollments || []).map((e) => String(e.courseId)))))
      .catch(() => setEnrolledCourseIds(new Set()));
  }, [refreshCanonical]);

  const isEnrolledIn = (course: { id: string; backendId?: string | number }) =>
    enrolledCourseIds.has(String(course.id)) ||
    (course.backendId != null && enrolledCourseIds.has(String(course.backendId))) ||
    isLocallyEnrolled(course.id);

  // Get courses the learner is enrolled in (backend + local enrollments)
  const recentCourses = learningPaths.flatMap((path) => {
    const courses = getPublishedCoursesForPath(path.slug).filter((c) => isEnrolledIn(c));
    return courses.map((course) => ({
      course,
      pathSlug: path.slug,
      progress: getCourseProgress(course.id, path.slug),
    }));
  }).sort((a, b) => {
    // Sort by progress (in-progress first) then by last updated
    if (b.progress > 0 && a.progress === 0) return 1;
    if (a.progress > 0 && b.progress === 0) return -1;
    return new Date(b.course.lastUpdated).getTime() - new Date(a.course.lastUpdated).getTime();
  });

  function getCourseProgress(courseId: string, pathSlug: string): number {
    const entries = Object.values(state.courseProgress).filter(
      (e) => e.pathSlug === pathSlug && e.courseId === courseId
    );
    if (entries.length === 0) return 0;
    const total = entries.reduce((acc, e) => acc + e.totalModules, 0);
    const completed = entries.reduce(
      (acc, e) => acc + e.completedModuleIds.length,
      0
    );
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            My Courses
          </h1>
          <p className="text-slate-600 text-sm">
            Continue learning from your enrolled courses and track your progress.
          </p>
        </div>

        {recentCourses.length === 0 ? (
          <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No courses yet
            </h3>
            <p className="text-slate-600 mb-6">
              You haven't enrolled in any courses yet. Browse available courses to get started.
            </p>
            <Link
              href="/dashboard/learner/courses/available"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Browse Available Courses
              <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Recent & In Progress
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentCourses.map(({ course, pathSlug, progress }) => (
                <Link
                  key={course.id}
                  href={`/dashboard/learner/courses/${pathSlug}/${course.id}`}
                  className="group relative rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 block"
                >
                  {/* Progress indicator bar at top */}
                  {progress > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/0 group-hover:from-teal-50/50 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
                  
                  <div className="relative z-10 pt-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 ${
                        progress > 0 
                          ? "bg-gradient-to-br from-teal-100 to-teal-200" 
                          : "bg-gradient-to-br from-slate-100 to-slate-200"
                      }`}>
                        <BookOpen size={26} className={progress > 0 ? "text-teal-700" : "text-slate-600"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors duration-200 line-clamp-2 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                        <Clock size={14} className="text-teal-600" />
                        <span className="font-medium">{course.estimatedDuration}</span>
                      </div>
                      
                      {progress > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                            <span>Progress</span>
                            <span className="text-teal-700">{progress}%</span>
                          </div>
                          <div className="w-full progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
                        {progress > 0 ? "Continue Learning" : "Start Learning"}
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
