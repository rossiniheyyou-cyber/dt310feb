"use client";

import Link from "next/link";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { ChevronRight, AlertCircle } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDueDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `${diffDays} days`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function UpcomingTasks() {
  const { state } = useLearnerProgress();
  const pendingTasks = state.tasks
    .filter((t) => t.status === "pending" || t.status === "overdue")
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5);

  if (pendingTasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="text-slate-900 font-semibold mb-4">
          Upcoming Tasks & Deadlines
        </h3>
        <p className="text-slate-600 text-sm">
          No upcoming assignments, quizzes, or assessments.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h3 className="text-slate-900 font-semibold mb-4">
        Upcoming Tasks & Deadlines
      </h3>
      <div className="space-y-3">
        {pendingTasks.map((t) => {
          const dueStr = formatDueDate(t.dueDate);
          const isOverdue = dueStr === "Overdue";

          return (
            <Link
              key={t.id}
              href={`/dashboard/learner/courses/${t.pathSlug}/${t.courseId}`}
              className="flex justify-between items-center bg-slate-50 p-4 rounded-xl hover:bg-slate-100 transition group"
            >
              <div className="flex items-center gap-3">
                {isOverdue && (
                  <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
                )}
                <div>
                  <p className="text-slate-800 font-medium">{t.title}</p>
                  <p className="text-slate-500 text-sm">{t.courseTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    isOverdue ? "text-amber-600" : "text-slate-600"
                  }`}
                >
                  {dueStr}
                </span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-600" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
