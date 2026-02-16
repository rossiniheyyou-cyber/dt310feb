"use client";

import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { BookOpen, Clock, CheckCircle, Zap } from "lucide-react";

export default function LearningStatsCards() {
  const { state, getDashboardStats } = useLearnerProgress();
  void state; // subscribe for realtime updates
  const stats = getDashboardStats();

  const items = [
    { label: "Enrolled", value: stats.enrolled, icon: BookOpen },
    { label: "In progress", value: stats.inProgress, icon: Clock },
    { label: "Completed", value: stats.completed, icon: CheckCircle },
    { label: "Total hours", value: `${stats.totalHours}h`, icon: Clock },
    { label: "Day streak", value: stats.streak, icon: Zap },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-teal-200 transition-all"
        >
          <div className="flex items-center gap-2 mb-1">
            <Icon size={18} className="text-teal-600 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      ))}
    </div>
  );
}
