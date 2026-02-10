"use client";

import Link from "next/link";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { getPathBySlug } from "@/data/learningPaths";
import { ChevronRight } from "lucide-react";

export default function LearningPathStepper() {
  const { state } = useLearnerProgress();
  const enrolledPaths = state.enrolledPathSlugs
    .map((slug) => getPathBySlug(slug))
    .filter(Boolean);

  if (enrolledPaths.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="text-slate-900 font-semibold mb-4">Active Learning Paths</h3>
        <p className="text-slate-600 text-sm mb-4">
          Enroll in a learning path to see your progress.
        </p>
        <Link
          href="/dashboard/learner/courses"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          View Learning Paths <ChevronRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h3 className="text-slate-900 font-semibold mb-4">Active Learning Paths</h3>
      <div className="space-y-4">
        {enrolledPaths.map((path) => {
          if (!path) return null;
          const totalCourses = path.phases.reduce(
            (acc, p) => acc + p.courses.length,
            0
          );
          const completedEntries = Object.values(state.courseProgress).filter(
            (e) =>
              e.pathSlug === path.slug &&
              e.courseCompleted
          );
          const completedCount = completedEntries.length;
          const progress =
            totalCourses > 0
              ? Math.round((completedCount / totalCourses) * 100)
              : 0;

          return (
            <div
              key={path.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-200 transition"
            >
              <p className="font-medium text-slate-900">{path.title}</p>
              <p className="text-sm text-slate-500 mt-1">
                {completedCount} of {totalCourses} courses completed
              </p>
              <div className="h-2 bg-slate-200 rounded-full mt-3 mb-4">
                <div
                  className="h-2 bg-teal-600 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <Link
                href={`/dashboard/learner/courses/${path.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                View Learning Path <ChevronRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
