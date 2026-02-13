"use client";

import Link from "next/link";
import { useLearnerDashboard } from "@/context/LearnerDashboardContext";

export default function ContinueLearningSection() {
  const { data, loading } = useLearnerDashboard();
  const recent = data?.mostRecentCourse;
  const completed = data?.completedCourses ?? 0;
  const inProgress = Math.max(0, (data?.totalEnrolled ?? 0) - completed);

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 p-6 animate-pulse">
        <div className="h-24 bg-slate-100 rounded" />
      </div>
    );
  }

  if (!recent) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/30 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Continue Learning</h3>
            <p className="text-sm text-slate-500 mt-1">
              {completed} completed · {inProgress} in progress
            </p>
          </div>
          <Link
            href="/dashboard/learner/courses/available"
            className="inline-flex items-center justify-center bg-gradient-to-r from-teal-600 to-teal-700 text-white py-2.5 px-5 rounded-xl text-sm font-medium hover:from-teal-500 hover:to-teal-600 transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const resumeUrl = `/dashboard/learner/courses/${recent.pathSlug}/${recent.courseId}`;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/30 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-800">Continue Learning</h3>
          <p className="text-sm text-slate-500 mt-1">
            {completed} completed · {inProgress} in progress
          </p>
          <p className="text-slate-900 font-semibold mt-2 truncate">{recent.courseTitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[200px]">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${recent.progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600">{recent.progress}%</span>
          </div>
        </div>
        <Link
          href={resumeUrl}
          className="inline-flex items-center justify-center bg-gradient-to-r from-teal-600 to-teal-700 text-white py-2.5 px-5 rounded-xl text-sm font-medium hover:from-teal-500 hover:to-teal-600 transition-all duration-200 hover:shadow-lg hover:scale-105 shrink-0"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
