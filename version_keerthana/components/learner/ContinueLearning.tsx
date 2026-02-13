"use client";

import Link from "next/link";
import { useLearnerDashboard } from "@/context/LearnerDashboardContext";

const SECTION_HEADING = "Pick up where you left off";

export default function ContinueLearning() {
  const { data, loading } = useLearnerDashboard();
  const recent = data?.mostRecentCourse;

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">{SECTION_HEADING}</h2>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-pulse">
          <div className="h-20 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (!recent) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">{SECTION_HEADING}</h2>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-slate-600 mb-4">
            Enroll in a course to see your progress here.
          </p>
          <Link
            href="/dashboard/learner/courses"
            className="inline-block bg-teal-600 text-white py-3 px-6 rounded-xl text-sm font-medium hover:bg-teal-700 transition"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const resumeUrl = `/dashboard/learner/courses/${recent.pathSlug}/${recent.courseId}`;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">{SECTION_HEADING}</h2>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft hover:shadow-medium transition-all duration-300 p-6">
        <p className="text-slate-900 font-bold text-xl mb-1">{recent.courseTitle}</p>
        <p className="text-xs text-slate-500 mb-3">
          {recent.completedLessons} of {recent.totalLessons} lessons completed
        </p>
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-3">
          <span>
            {recent.completedLessons} of {recent.totalLessons} lessons completed
          </span>
          <span className="text-teal-700">{recent.progress}%</span>
        </div>
        <div className="progress-bar mb-6">
          <div
            className="h-2 bg-teal-600 rounded-full transition-all"
            style={{ width: `${recent.progress}%` }}
          />
        </div>
        <Link
          href={resumeUrl}
          className="block w-full bg-teal-600 text-white py-3 rounded-xl text-center text-sm font-medium hover:bg-teal-700 transition"
        >
          Continue Learning
        </Link>
      </div>
    </div>
  );
}
