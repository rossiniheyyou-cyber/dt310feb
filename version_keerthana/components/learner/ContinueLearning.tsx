"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { getCurrentUser } from "@/lib/currentUser";

const SECTION_HEADING = "Pick up where you left off";

const DEFAULT_TITLE = "Associate Fullstack Developer";

export default function ContinueLearning() {
  const { getMostRecentCourse } = useLearnerProgress();
  const [recent, setRecent] = useState<ReturnType<typeof getMostRecentCourse> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [professionalTitle, setProfessionalTitle] = useState(DEFAULT_TITLE);

  // Only read from localStorage after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
    setRecent(getMostRecentCourse());
    const user = getCurrentUser();
    setProfessionalTitle(user?.professionalTitle ?? DEFAULT_TITLE);
  }, [getMostRecentCourse]);

  // Show loading state during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          {SECTION_HEADING}
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-slate-600 mb-4">
            Start a learning path to see your progress here.
          </p>
          <Link
            href="/dashboard/learner/courses"
            className="inline-block bg-teal-600 text-white py-3 px-6 rounded-xl text-sm font-medium hover:bg-teal-700 transition"
          >
            Browse Learning Paths
          </Link>
        </div>
      </div>
    );
  }

  if (!recent) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          {SECTION_HEADING}
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-slate-600 mb-4">
            Start a learning path to see your progress here.
          </p>
          <Link
            href="/dashboard/learner/courses"
            className="inline-block bg-teal-600 text-white py-3 px-6 rounded-xl text-sm font-medium hover:bg-teal-700 transition"
          >
            Browse Learning Paths
          </Link>
        </div>
      </div>
    );
  }

  const resumeUrl = `/dashboard/learner/courses/${recent.pathSlug}/${recent.courseId}`;
  const isSenior = professionalTitle === "Senior Fullstack Developer";
  
  // Transform display text: "Fullstack Developer" -> "Associate full stack developer"
  const displayTitle = professionalTitle === "Fullstack Developer" 
    ? "Associate Full-stack developer" 
    : professionalTitle;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">
        {SECTION_HEADING}
      </h2>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft hover:shadow-medium transition-all duration-300 p-6">
        <p className="text-slate-900 font-bold text-xl mb-1">
          {recent.courseTitle}
        </p>
        <p
          className={`mb-3 text-sm ${
            isSenior ? "text-teal-800 font-medium" : "text-slate-600"
          }`}
        >
          {displayTitle}
        </p>
        <p className="text-xs text-slate-500 mb-3">
          Current: {recent.currentModuleTitle}
        </p>
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-3">
          <span>
            {recent.completedCount} of {recent.totalModules} modules completed
          </span>
          <span className="text-teal-700">{Math.round((recent.completedCount / recent.totalModules) * 100)}%</span>
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
