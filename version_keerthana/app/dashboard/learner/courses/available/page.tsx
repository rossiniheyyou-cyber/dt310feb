"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, BookOpen, Clock, Sparkles } from "lucide-react";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { syncCoursesFromBackend } from "@/lib/canonicalStore";
import { learningPaths } from "@/data/learningPaths";
import { getMyEnrollments } from "@/lib/api/enrollments";
import { isLocallyEnrolled } from "@/lib/localEnrollments";
import { fullstackSortIndex, sortFullstackCourses } from "@/lib/fullstackCourseOrder";

export default function AvailableCoursesPage() {
  const { getPublishedCoursesForPath, refresh } = useCanonicalStore();
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  // Sync courses from backend on mount
  useEffect(() => {
    setMounted(true);
    setSyncing(true);
    syncCoursesFromBackend()
      .then(() => {
        refresh(); // Refresh canonical store state
        setSyncing(false);
      })
      .catch((err) => {
        console.error("Failed to sync courses:", err);
        setSyncing(false);
      });
    getMyEnrollments()
      .then((res) => {
        setEnrolledCourseIds(new Set((res.enrollments || []).map((e) => String(e.courseId))));
      })
      .catch(() => {});
  }, [refresh]);

  // Get all published courses grouped by learning path
  const coursesByPath = learningPaths.map((path) => {
    const courses = getPublishedCoursesForPath(path.slug);
    const sorted =
      path.slug === "fullstack"
        ? sortFullstackCourses(courses)
        : [...courses].sort((a, b) => a.courseOrder - b.courseOrder);
    return {
      path,
      courses: sorted,
    };
  }).filter((item) => item.courses.length > 0);

  const allCourses = coursesByPath.flatMap((item) =>
    item.courses.map((course) => ({ ...course, pathSlug: item.path.slug, pathTitle: item.path.title }))
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              Available Courses
            </h1>
            {syncing && (
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" />
                Syncing...
              </span>
            )}
          </div>
          <p className="text-slate-600 text-sm">
            Browse available courses. Click on a course to view details, outcomes, and total hours before enrolling.
          </p>
        </div>

        {allCourses.length === 0 ? (
          <div className="rounded-2xl card-gradient border border-slate-200 p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No courses available
            </h3>
            <p className="text-slate-600">
              There are no published courses available at the moment. Check back later or contact your instructor.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Group by Learning Path */}
            {coursesByPath.map(({ path, courses }) => (
              <section key={path.slug}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">
                    {path.title}
                  </h2>
                  <span className="text-sm text-slate-500">
                    ({courses.length} {courses.length === 1 ? "course" : "courses"})
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/dashboard/learner/courses/${path.slug}/${course.id}`}
                      className="group relative rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 block"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/0 group-hover:from-teal-50/50 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                            <BookOpen size={26} className="text-teal-700" />
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
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {course.roles.slice(0, 3).map((role) => (
                              <span
                                key={role}
                                className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-md"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock size={14} className="text-teal-600" />
                            <span className="font-medium">{course.estimatedDuration}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
                            View Course Details
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                          </span>
                          {(enrolledCourseIds.has(String(course.id)) || (course.backendId != null && enrolledCourseIds.has(String(course.backendId))) || isLocallyEnrolled(course.id)) && (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                              Enrolled
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}

            {/* Show all courses in a flat list if no path grouping */}
            {coursesByPath.length === 0 && allCourses.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  All Courses
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/dashboard/learner/courses/${course.pathSlug}/${course.id}`}
                      className="group rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 block"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <BookOpen size={24} className="text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-teal-700 transition line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                          <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                            {course.pathTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock size={14} />
                          <span>{course.estimatedDuration}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 group-hover:text-teal-700">
                        View Course
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
