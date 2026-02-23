"use client";

import { useLearnerDashboard } from "@/context/LearnerDashboardContext";

function getStatus(score: number): "On Track" | "Needs Attention" | "At Risk" {
  if (score < 50) return "At Risk";
  if (score < 75) return "Needs Attention";
  return "On Track";
}

export default function WelcomeCard() {
  const { data, loading } = useLearnerDashboard();
  const score = data?.readinessScore ?? 0;
  const status = getStatus(score);
  const userName = data?.userName ?? "there";

  const statusMessage =
    status === "On Track"
      ? "You're on track for your role"
      : status === "Needs Attention"
      ? "Focus on completing courses"
      : "Prioritize overdue courses and assignments";

  if (loading) {
    return (
      <div className="relative rounded-2xl card-gradient p-8 border border-teal-200/60 shadow-xl animate-pulse">
        <div className="h-20 bg-teal-200/30 rounded" />
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl card-gradient p-8 border border-teal-200/60 shadow-xl shadow-teal-900/10 overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-teal-900 mb-1 tracking-tight">
              Welcome back, {userName} 👋
            </h2>
            <p className="text-teal-800 mt-2 text-base">
              Your learning readiness is at <span className="font-semibold text-teal-900">{score}%</span> — {statusMessage}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-lg ${
              status === "On Track"
                ? "bg-teal-500/20 text-teal-800"
                : status === "Needs Attention"
                ? "bg-amber-500/20 text-amber-900"
                : "bg-red-500/20 text-red-800"
            }`}
          >
            <span className="text-sm font-semibold">{status}</span>
          </div>
        </div>
        <p className="text-sm text-teal-700/80 italic">
          Keep pushing — consistency beats intensity
        </p>
      </div>
    </div>
  );
}
