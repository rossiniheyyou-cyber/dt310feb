"use client";

import Link from "next/link";
import { CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react";
import { getQuizAttempts } from "@/data/quizData";
import type { QuizConfig } from "@/data/quizData";

type Props = {
  quiz: QuizConfig;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function QuizHistoryScreen({ quiz }: Props) {
  const attempts = getQuizAttempts(quiz.id);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link
        href={`/dashboard/learner/quiz/${quiz.id}`}
        className="inline-flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700"
      >
        ← Back to Quiz
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Attempt History</h1>
        <p className="text-slate-500 mt-1">{quiz.title}</p>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          <p>No attempts yet.</p>
          <Link
            href={`/dashboard/learner/quiz/${quiz.id}/take`}
            className="inline-block mt-4 text-teal-600 font-medium hover:text-teal-700"
          >
            Start your first attempt
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <Link
              key={attempt.id}
              href={`/dashboard/learner/quiz/${quiz.id}/review?attempt=${attempt.id}`}
              className="block bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:bg-teal-50/30 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {attempt.passed ? (
                    <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-slate-800">
                      Attempt {attempt.attemptNumber}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(attempt.completedAt)}
                      </span>
                      <span>{formatDuration(attempt.durationSeconds)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-teal-600">
                    {attempt.score}%
                  </p>
                  <p className="text-sm text-slate-500">
                    {attempt.correctCount}/{attempt.correctCount + attempt.incorrectCount + attempt.unansweredCount} correct
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
