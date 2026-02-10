"use client";

import Link from "next/link";
import { ChevronLeft, Clock, HelpCircle, Target, RotateCcw } from "lucide-react";
import type { QuizConfig } from "@/data/quizData";

type Props = {
  quiz: QuizConfig;
  attemptCount: number;
  canRetake: boolean;
};

export default function QuizLandingScreen({
  quiz,
  attemptCount,
  canRetake,
}: Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link
        href="/dashboard/learner/assignments"
        className="inline-flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Assignments
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="flex items-start gap-4 mb-8">
          <div className="rounded-lg bg-teal-100 p-3 flex-shrink-0">
            <HelpCircle className="h-8 w-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{quiz.title}</h1>
            <p className="text-slate-500 mt-1">
              {quiz.course} • {quiz.module}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <HelpCircle className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">Questions</p>
              <p className="font-semibold text-slate-800">{quiz.questionCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <Clock className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">Time limit</p>
              <p className="font-semibold text-slate-800">{quiz.timeLimitMinutes} min</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <Target className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">Passing score</p>
              <p className="font-semibold text-slate-800">{quiz.passingScore}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <RotateCcw className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">Attempts</p>
              <p className="font-semibold text-slate-800">
                {attemptCount} / {quiz.attemptLimit}
              </p>
            </div>
          </div>
        </div>

        {quiz.instructions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Instructions</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
              {quiz.instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {canRetake ? (
            <Link
              href={`/dashboard/learner/quiz/${quiz.id}/take`}
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
            >
              Start Quiz
            </Link>
          ) : (
            <p className="text-slate-500 text-sm">
              You have reached the maximum number of attempts.
            </p>
          )}
          <Link
            href={`/dashboard/learner/quiz/${quiz.id}/history`}
            className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
          >
            View Attempt History
          </Link>
        </div>
      </div>
    </div>
  );
}
