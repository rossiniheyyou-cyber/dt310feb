"use client";

import { useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  TrendingUp,
  Award,
} from "lucide-react";
import { quizProgress } from "@/data/progressData";

function getStatusConfig(status: string) {
  switch (status) {
    case "passed":
      return {
        label: "Passed",
        icon: CheckCircle2,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
      };
    case "failed":
      return {
        label: "Failed",
        icon: XCircle,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      };
    case "attempted":
      return {
        label: "Attempted",
        icon: Clock,
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
      };
    case "pending":
    default:
      return {
        label: "Pending",
        icon: HelpCircle,
        bgColor: "bg-slate-50",
        textColor: "text-slate-600",
        borderColor: "border-slate-200",
      };
  }
}

function getScoreColor(score: number, passing: number) {
  if (score >= passing + 20) return "text-emerald-600";
  if (score >= passing) return "text-teal-600";
  return "text-red-600";
}

export default function QuizProgressSection() {
  const [filter, setFilter] = useState<string>("all");

  // Calculate stats
  const totalQuizzes = quizProgress.length;
  const passedQuizzes = quizProgress.filter((q) => q.status === "passed").length;
  const failedQuizzes = quizProgress.filter((q) => q.status === "failed").length;
  const pendingQuizzes = quizProgress.filter((q) => q.status === "pending").length;
  const attemptedWithScore = quizProgress.filter((q) => q.score !== undefined);
  const averageScore =
    attemptedWithScore.length > 0
      ? Math.round(
          attemptedWithScore.reduce((sum, q) => sum + (q.score || 0), 0) /
            attemptedWithScore.length
        )
      : 0;

  const filteredQuizzes = quizProgress.filter((q) => {
    if (filter === "all") return true;
    return q.status === filter;
  });

  const statusFilters = [
    { value: "all", label: "All", count: totalQuizzes },
    { value: "passed", label: "Passed", count: passedQuizzes },
    { value: "failed", label: "Failed", count: failedQuizzes },
    { value: "pending", label: "Pending", count: pendingQuizzes },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Quiz & Assessment Progress</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track your quiz attempts and scores
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-teal-600" />
            <span className="text-sm text-teal-700">Pass Rate</span>
          </div>
          <p className="text-2xl font-bold text-teal-800">
            {Math.round((passedQuizzes / (totalQuizzes - pendingQuizzes || 1)) * 100)}%
          </p>
          <p className="text-xs text-teal-600 mt-1">
            {passedQuizzes} of {totalQuizzes - pendingQuizzes} passed
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-700">Average Score</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">{averageScore}%</p>
          <p className="text-xs text-purple-600 mt-1">Across all quizzes</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-emerald-700">Completed</span>
          </div>
          <p className="text-2xl font-bold text-emerald-800">
            {totalQuizzes - pendingQuizzes}
          </p>
          <p className="text-xs text-emerald-600 mt-1">Quizzes attempted</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-amber-700">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-800">{pendingQuizzes}</p>
          <p className="text-xs text-amber-600 mt-1">Quizzes remaining</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              filter === f.value
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Quiz List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Quiz</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Course</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Score</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Passing</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Attempts</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Status</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700">Last Attempt</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuizzes.map((quiz) => {
              const statusConfig = getStatusConfig(quiz.status);
              const StatusIcon = statusConfig.icon;

              return (
                <tr
                  key={quiz.id}
                  className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition"
                >
                  <td className="py-3 px-2">
                    <p className="text-sm font-medium text-slate-800">{quiz.title}</p>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-sm text-slate-600">{quiz.courseName}</p>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {quiz.score !== undefined ? (
                      <span
                        className={`text-sm font-semibold ${getScoreColor(
                          quiz.score,
                          quiz.passingScore
                        )}`}
                      >
                        {quiz.score}%
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="text-sm text-slate-600">{quiz.passingScore}%</span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="text-sm text-slate-600">
                      {quiz.attempts} / {quiz.maxAttempts}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-sm text-slate-500">
                      {quiz.lastAttemptDate
                        ? new Date(quiz.lastAttemptDate).toLocaleDateString()
                        : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Retry Actions */}
      {failedQuizzes > 0 && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {failedQuizzes} quiz{failedQuizzes > 1 ? "zes" : ""} need{failedQuizzes === 1 ? "s" : ""} a retry
              </p>
              <p className="text-xs text-amber-600">
                Review the material and attempt again to improve your score
              </p>
            </div>
            <button className="ml-auto px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition">
              View Failed Quizzes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
