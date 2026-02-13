"use client";

import Link from "next/link";
import { useLearnerDashboard } from "@/context/LearnerDashboardContext";
import { ChevronRight, CheckCircle } from "lucide-react";

export default function AssignedCourses() {
  const { data, loading } = useLearnerDashboard();
  const courses = data?.enrollments ?? [];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
        <div className="h-24 bg-slate-100 rounded" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="text-slate-900 font-semibold mb-4">Assigned Courses</h3>
        <p className="text-slate-600 text-sm">
          No courses assigned yet. Browse courses to enroll.
        </p>
        <Link
          href="/dashboard/learner/courses"
          className="mt-3 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          Browse Courses →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h3 className="text-slate-900 font-semibold mb-4">Assigned Courses</h3>
      <div className="space-y-3">
        {courses.map((entry) => {
          const href = `/dashboard/learner/courses/${entry.pathSlug}/${entry.courseId}`;
          return (
            <Link
              key={entry.courseId}
              href={href}
              className={`flex justify-between items-center p-4 rounded-xl border transition group ${
                entry.courseCompleted
                  ? "bg-slate-50 border-slate-200"
                  : "bg-white border-slate-200 hover:border-teal-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {entry.courseCompleted && (
                  <CheckCircle size={20} className="text-teal-600 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-slate-900">{entry.courseTitle}</p>
                  <p className="text-sm text-slate-500">{entry.pathSlug}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${
                    entry.courseCompleted ? "text-teal-600" : "text-slate-500"
                  }`}
                >
                  {entry.courseCompleted ? "Completed" : `${entry.progress}%`}
                </span>
                {!entry.courseCompleted && (
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-600" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
