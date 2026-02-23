"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, ChevronRight, Loader2, Calendar, Award } from "lucide-react";
import { getAiQuizAttempts, type AiQuizAttemptSummary } from "@/lib/api/aiQuiz";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AiQuizAttemptsPage() {
  const [attempts, setAttempts] = useState<AiQuizAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAiQuizAttempts()
      .then((res) => {
        if (!cancelled) setAttempts(res.attempts || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message || "Failed to load attempts");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/30">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle size={28} className="text-teal-600" />
            AI Quiz Attempts
          </h1>
          <p className="text-slate-600 mt-1">
            View your quiz attempts by date. You can review any attempt or retake a quiz from a course.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-600 py-8">
            <Loader2 size={24} className="animate-spin" />
            Loading attempts…
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        ) : attempts.length === 0 ? (
          <div className="p-8 rounded-2xl card-gradient border border-slate-200 text-center text-slate-600 shadow-sm">
            <p className="mb-2">You haven&apos;t taken any AI quizzes yet.</p>
            <p className="text-sm">
              Go to a course and use &quot;Take AI Quiz&quot; to get started. All attempts will appear here.
            </p>
            <Link
              href="/dashboard/learner/courses/my-courses"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
            >
              My Courses
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {attempts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl card-gradient border border-slate-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {a.courseTitle}
                    {a.lessonTitle ? ` — ${a.lessonTitle}` : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(a.createdAt)}
                    </span>
                    <span className="capitalize">{a.difficulty}</span>
                    {a.status === "completed" && a.score !== null && (
                      <span className="flex items-center gap-1 font-medium text-teal-600">
                        <Award size={14} />
                        {a.score} / {a.totalQuestions}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/learner/ai-quiz/attempts/${a.id}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                  >
                    View
                  </Link>
                  <Link
                    href="/dashboard/learner/courses/my-courses"
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 flex items-center gap-1"
                  >
                    Retake
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
