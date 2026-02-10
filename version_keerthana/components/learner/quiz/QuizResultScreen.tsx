"use client";

import Link from "next/link";
import { CheckCircle, XCircle, RotateCcw, BookOpen } from "lucide-react";
import type { QuizConfig } from "@/data/quizData";

type Props = {
  quiz: QuizConfig;
  score: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  canRetake: boolean;
};

export default function QuizResultScreen({
  quiz,
  score,
  correctCount,
  incorrectCount,
  unansweredCount,
  totalQuestions,
  canRetake,
}: Props) {
  const passed = score >= quiz.passingScore;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link
        href="/dashboard/learner/assignments"
        className="inline-flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700"
      >
        ← Back to Assignments
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-center mb-8">
          {passed ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-slate-800">
            {passed ? "Quiz Passed" : "Quiz Not Passed"}
          </h1>
          <p className="text-slate-500 mt-1">{quiz.title}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <p className="text-2xl font-bold text-teal-600">{score}%</p>
            <p className="text-sm text-slate-500">Score</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
            <p className="text-sm text-slate-500">Correct</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
            <p className="text-sm text-slate-500">Incorrect</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <p className="text-2xl font-bold text-slate-600">{unansweredCount}</p>
            <p className="text-sm text-slate-500">Unanswered</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href={`/dashboard/learner/quiz/${quiz.id}/review`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700"
          >
            <BookOpen className="h-4 w-4" />
            Review Answers
          </Link>
          {canRetake && (
            <Link
              href={`/dashboard/learner/quiz/${quiz.id}/take`}
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Link>
          )}
          <Link
            href={`/dashboard/learner/quiz/${quiz.id}/history`}
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
          >
            View History
          </Link>
          <Link
            href="/dashboard/learner/assignments"
            className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 font-medium hover:text-slate-800"
          >
            Back to Assignments
          </Link>
        </div>
      </div>
    </div>
  );
}
