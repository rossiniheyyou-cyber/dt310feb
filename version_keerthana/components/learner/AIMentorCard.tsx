"use client";

import { useState } from "react";
import Link from "next/link";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import AIMentorModal from "./AIMentorModal";

export default function AIMentorCard() {
  const { getReadinessScore, getMostRecentCourse } = useLearnerProgress();
  const { status } = getReadinessScore();
  const recent = getMostRecentCourse();
  const [showAIMentor, setShowAIMentor] = useState(false);

  const suggestion =
    status === "At Risk"
      ? "Complete courses and assignments to improve your readiness."
      : status === "Needs Attention"
      ? "Focus on pending assignments and quizzes to stay on track."
      : recent
      ? `Continue with ${recent.courseTitle} to maintain your progress.`
      : "Start a learning path to build job-ready skills.";

  return (
    <>
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-semibold mb-2">
          AI Mentor Suggestions
        </h3>

        <p className="text-slate-700 mb-4">{suggestion}</p>

        <div className="flex gap-3">
          <Link
            href="/dashboard/learner/courses"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
          >
            View Courses
          </Link>
          <button
            onClick={() => setShowAIMentor(true)}
            className="border border-teal-300 text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-100 transition"
          >
            Ask AI Mentor
          </button>
        </div>
      </div>

      <AIMentorModal
        isOpen={showAIMentor}
        onClose={() => setShowAIMentor(false)}
        courseId={recent ? parseInt(recent.courseId) : undefined}
        courseTitle={recent?.courseTitle}
      />
    </>
  );
}
