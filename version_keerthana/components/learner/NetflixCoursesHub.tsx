"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Play, BookOpen, Clock, Sparkles } from "lucide-react";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { syncCoursesFromBackend } from "@/lib/canonicalStore";
import { learningPaths } from "@/data/learningPaths";
import type { CanonicalCourse } from "@/data/canonicalCourses";

export default function NetflixCoursesHub() {
  const { state, getMostRecentCourse, refresh } = useLearnerProgress();
  const { getPublishedCoursesForPath, refresh: refreshCanonical } = useCanonicalStore();
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSyncing(true);
    syncCoursesFromBackend()
      .then(() => {
        refreshCanonical();
        refresh();
        setSyncing(false);
      })
      .catch(() => setSyncing(false));
  }, [refreshCanonical, refresh]);

  const enrolledPaths = state.enrolledPathSlugs || [];
  const recentCourse = getMostRecentCourse();

  const continueLearningItems = enrolledPaths.flatMap((pathSlug) => {
    const courses = getPublishedCoursesForPath(pathSlug);
    return courses.map((course) => {
      const entries = Object.values(state.courseProgress).filter(
        (e) => e.pathSlug === pathSlug && e.courseId === course.id
      );
      const completed = entries.reduce((a, e) => a + e.completedModuleIds.length, 0);
      const total = entries.reduce((a, e) => a + e.totalModules, 0);
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { course, pathSlug, progress };
    });
  }).filter((item) => item.progress > 0 || recentCourse?.courseId === item.course.id).sort((a, b) => b.progress - a.progress);

  const coursesByPath = learningPaths.map((path) => ({
    path,
    courses: getPublishedCoursesForPath(path.slug).sort((a, b) => a.courseOrder - b.courseOrder),
  })).filter((item) => item.courses.length > 0);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] bg-teal-950 flex items-center justify-center">
        <div className="animate-pulse text-teal-400/80">Loading courses…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-950 text-white -m-8">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-teal-900 via-teal-900/95 to-teal-950 pt-10 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Learn with DigitalT3
            </h1>
            {syncing && (
              <span className="text-teal-300/90 text-sm flex items-center gap-2">
                <Sparkles size={16} className="animate-pulse" />
                Syncing…
              </span>
            )}
          </div>
          <p className="text-teal-100/90 text-lg max-w-2xl mb-10">
            Build in-demand skills with courses designed for your role. Start learning or pick up where you left off.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/learner/courses/my-courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-500 transition"
            >
              My Courses
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/dashboard/learner/courses/available"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-teal-400/60 text-teal-100 font-medium hover:bg-teal-800/50 transition"
            >
              Browse All
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-10 pb-16 px-8">
        {/* Continue Learning */}
        {continueLearningItems.length > 0 && (
          <Row title="Continue Learning" seeAllHref="/dashboard/learner/courses/my-courses">
            {continueLearningItems.slice(0, 10).map(({ course, pathSlug, progress }) => (
              <CourseCard
                key={`${pathSlug}-${course.id}`}
                course={course}
                pathSlug={pathSlug}
                progress={progress}
                variant="poster"
              />
            ))}
          </Row>
        )}

        {/* By Learning Path */}
        {coursesByPath.map(({ path, courses }) => (
          <Row
            key={path.slug}
            title={path.title}
            seeAllHref={`/dashboard/learner/courses/available?path=${path.slug}`}
          >
            {courses.slice(0, 12).map((course) => {
              const entries = Object.values(state.courseProgress).filter(
                (e) => e.pathSlug === path.slug && e.courseId === course.id
              );
              const completed = entries.reduce((a, e) => a + e.completedModuleIds.length, 0);
              const total = entries.reduce((a, e) => a + e.totalModules, 0);
              const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  pathSlug={path.slug}
                  progress={progress}
                  variant="poster"
                />
              );
            })}
          </Row>
        ))}

        {coursesByPath.length === 0 && continueLearningItems.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <BookOpen className="w-16 h-16 text-teal-500/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-teal-100 mb-2">No courses yet</h2>
            <p className="text-teal-200/80 mb-6">
              Browse available courses to get started.
            </p>
            <Link
              href="/dashboard/learner/courses/available"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-500 transition"
            >
              Browse courses
              <ChevronRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  title,
  seeAllHref,
  children,
}: {
  title: string;
  seeAllHref: string;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <Link
          href={seeAllHref}
          className="text-sm font-medium text-teal-400 hover:text-teal-300 transition flex items-center gap-1"
        >
          See all
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="relative group/row">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {children}
        </div>
        {/* Fade edges - optional */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-16 bg-gradient-to-r from-teal-950 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-teal-950 to-transparent z-10" />
      </div>
    </section>
  );
}

function CourseCard({
  course,
  pathSlug,
  progress,
  variant,
}: {
  course: CanonicalCourse;
  pathSlug: string;
  progress: number;
  variant: "poster";
}) {
  const href = `/dashboard/learner/courses/${pathSlug}/${course.id}`;
  return (
    <Link
      href={href}
      className="flex-shrink-0 w-[280px] sm:w-[320px] group block rounded-xl overflow-hidden bg-teal-900/80 border border-teal-800/60 hover:border-teal-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-900/50"
    >
      {/* Poster area - gradient placeholder (no image for now) */}
      <div className="aspect-video bg-gradient-to-br from-teal-800 to-teal-900 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-teal-600/0 group-hover:bg-teal-600/20 transition-colors" />
        <div className="w-14 h-14 rounded-full bg-teal-600/90 flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
          <Play size={28} className="text-white ml-1" fill="currentColor" />
        </div>
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-950/80">
            <div
              className="h-full bg-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-teal-100 transition line-clamp-2 mb-1">
          {course.title}
        </h3>
        <p className="text-sm text-teal-200/80 line-clamp-2 mb-2">{course.description}</p>
        <div className="flex items-center gap-2 text-xs text-teal-300/90">
          <Clock size={12} />
          <span>{course.estimatedDuration}</span>
          {progress > 0 && (
            <span className="ml-auto font-medium text-teal-400">{progress}%</span>
          )}
        </div>
      </div>
    </Link>
  );
}
